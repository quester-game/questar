const config = window.QUESTAR_SUPABASE_CONFIG || {};
const app = document.getElementById("reset-app");
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url || "") &&
  typeof config.anonKey === "string" && config.anonKey.length > 20;

if (!configured) {
  app.innerHTML = '<a class="back-link" href="index.html">← QUESTAR</a><h1>Reset unavailable</h1><p>Supabase is not configured.</p>';
} else {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.sessionStorage }
  });
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    console.error("QUESTAR password reset link is invalid or expired.", error);
    app.innerHTML = '<a class="back-link" href="account.html">← Student account</a><h1>Reset link unavailable</h1><p>This link may have expired or already been used. Request a new reset email.</p>';
  } else {
    app.innerHTML = `<a class="back-link" href="index.html">← QUESTAR</a><p class="eyebrow">Verified reset link</p>
      <h1>Choose a new password</h1><div id="reset-message" hidden></div>
      <form id="reset-form"><label>New password<input name="password" type="password" minlength="12" autocomplete="new-password" required></label>
      <label>Confirm password<input name="confirm" type="password" minlength="12" autocomplete="new-password" required></label>
      <button class="button button-primary" type="submit">Update password</button></form>`;
    document.getElementById("reset-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      const password = String(form.get("password"));
      if (password !== String(form.get("confirm"))) {
        const notice = document.getElementById("reset-message");
        notice.hidden = false;
        notice.className = "error";
        notice.textContent = "The passwords do not match.";
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        const notice = document.getElementById("reset-message");
        notice.hidden = false;
        notice.className = "error";
        notice.textContent = updateError.message;
        return;
      }
      await supabase.auth.signOut();
      app.innerHTML = '<a class="back-link" href="account.html">← Student account</a><h1>Password updated</h1><p>Your password has been changed. Sign in with the new password.</p><a class="button" href="account.html">Sign in</a>';
    });
  }
}
