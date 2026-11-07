import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = (origin: string | null) => {
  const allowed = (Deno.env.get("ADMIN_ALLOWED_ORIGINS") || "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
};

function response(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request.headers.get("origin"));
  if (!headers) return new Response("Origin is not allowed.", { status: 403 });
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405, headers);

  const authorization = request.headers.get("Authorization") || "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return response({ error: "Authentication required." }, 401, headers);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = Deno.env.get("APP_SITE_URL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !siteUrl) {
    console.error("Required admin-account-action environment variables are missing.");
    return response({ error: "Account management is not configured." }, 503, headers);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${tokenMatch[1]}` } }
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: authData, error: authError } = await callerClient.auth.getUser(tokenMatch[1]);
  const adminUser = authData.user;
  if (authError || !adminUser) return response({ error: "Authentication required." }, 401, headers);

  const { data: grant, error: grantError } = await serviceClient
    .from("admin_users").select("user_id").eq("user_id", adminUser.id).maybeSingle();
  if (grantError) {
    console.error("Admin grant lookup failed.", grantError);
    return response({ error: "Administrator authorization could not be verified." }, 500, headers);
  }
  const { data: callerProfile, error: profileError } = await serviceClient
    .from("profiles").select("account_status").eq("id", adminUser.id).maybeSingle();
  if (profileError) {
    console.error("Admin account status lookup failed.", profileError);
    return response({ error: "Administrator account status could not be verified." }, 500, headers);
  }
  if (!grant || callerProfile?.account_status !== "active") {
    return response({ error: "Administrator access required." }, 403, headers);
  }

  let payload: { action?: string; user_id?: string };
  try {
    payload = await request.json();
  } catch {
    return response({ error: "Invalid request body." }, 400, headers);
  }
  const action = payload.action;
  const userId = payload.user_id;
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return response({ error: "A valid account ID is required." }, 400, headers);
  }

  const { data: targetRole, error: roleError } = await serviceClient
    .from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (roleError) {
    console.error("Target role lookup failed.", roleError);
    return response({ error: "Account role could not be verified." }, 500, headers);
  }
  if (targetRole) return response({ error: "Administrator accounts cannot be changed by this action." }, 403, headers);

  if (["suspend", "reactivate", "disable"].includes(action || "")) {
    const status = action === "suspend" ? "suspended" : action === "disable" ? "disabled" : "active";
    const { error } = await callerClient.rpc("admin_set_account_status", {
      p_user_id: userId, p_status: status
    });
    if (error) return response({ error: error.message }, 400, headers);
    const { error: banError } = await serviceClient.auth.admin.updateUserById(userId, {
      ban_duration: status === "active" ? "none" : "876000h"
    });
    if (banError) {
      console.error("Account status changed in the database, but the Auth ban could not be updated.", banError);
      return response({ error: "Account data access was updated, but Auth login restrictions need administrator review." }, 500, headers);
    }
    if (status !== "active") {
      const { error: sessionError } = await serviceClient.from("user_sessions")
        .update({ ended_at: new Date().toISOString(), expires_at: new Date().toISOString() })
        .eq("user_id", userId).is("ended_at", null);
      if (sessionError) {
        console.error("Account status changed, but active sessions could not be expired.", sessionError);
        return response({ error: "Account status changed, but session cleanup needs administrator review." }, 500, headers);
      }
    }
    return response({ ok: true }, 200, headers);
  }

  if (action === "reset_password") {
    const { data: target, error: targetError } = await serviceClient.auth.admin.getUserById(userId);
    if (targetError || !target.user?.email) {
      return response({ error: "A password reset could not be initiated for this account." }, 400, headers);
    }
    const redirectTo = new URL("/reset-password.html", siteUrl).toString();
    const { error: resetError } = await callerClient.auth.resetPasswordForEmail(target.user.email, { redirectTo });
    if (resetError) return response({ error: "The password reset email could not be sent." }, 400, headers);
    const { error: auditError } = await serviceClient.from("admin_audit_logs").insert({
      admin_id: adminUser.id, affected_user_id: userId, action: "password_reset_requested",
      previous_values: null, updated_values: { method: "email" }
    });
    if (auditError) {
      console.error("Password reset was sent but its audit record failed.", auditError);
      return response({ error: "Reset email was sent, but the audit record failed. Review server logs." }, 500, headers);
    }
    const { error: eventError } = await serviceClient.from("activity_events").insert({
      user_id: userId, event_type: "password_reset_requested"
    });
    if (eventError) {
      console.error("Password reset was sent but its activity record failed.", eventError);
      return response({ error: "Reset email was sent, but activity recording failed." }, 500, headers);
    }
    return response({ ok: true }, 200, headers);
  }

  if (action === "delete") {
    const { data: audit, error: auditStartError } = await serviceClient
      .from("admin_audit_logs")
      .insert({
        admin_id: adminUser.id, affected_user_id: userId, action: "account_delete_requested",
        updated_values: { state: "pending" }
      })
      .select("id").single();
    if (auditStartError) {
      console.error("Could not begin the account deletion audit record.", auditStartError);
      return response({ error: "Account deletion could not be safely recorded." }, 500, headers);
    }
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      const { error: failedAuditError } = await serviceClient.from("admin_audit_logs").update({
        action: "account_delete_failed", updated_values: { state: "failed" }
      }).eq("id", audit.id);
      if (failedAuditError) {
        console.error("Deletion failed and its audit record could not be finalized.", failedAuditError);
        return response({ error: "Account deletion failed and audit finalization needs administrator review." }, 500, headers);
      }
      return response({ error: "Account deletion failed." }, 400, headers);
    }
    const { error: finishAuditError } = await serviceClient.from("admin_audit_logs").update({
      action: "account_deleted", updated_values: { state: "completed" }
    }).eq("id", audit.id);
    if (finishAuditError) {
      console.error("Account was deleted but the audit record could not be finalized.", finishAuditError);
      return response({ error: "Account was deleted, but audit finalization needs administrator review." }, 500, headers);
    }
    return response({ ok: true }, 200, headers);
  }

  return response({ error: "Unsupported account action." }, 400, headers);
});
