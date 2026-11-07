const config = window.QUESTAR_SUPABASE_CONFIG || {};
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url || "") &&
  typeof config.anonKey === "string" && config.anonKey.length > 20;
const accountLink = document.querySelector(".account-link");
let supabase;
let sessionId;
let heartbeatTimer;
let currentUser;
let notice;
let createClient;

function showNotice(message, error = false) {
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "account-notice";
    notice.setAttribute("role", "status");
    document.body.append(notice);
  }
  notice.classList.toggle("error", error);
  notice.textContent = message;
  notice.hidden = false;
}

function clearPresenceTimer() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

async function heartbeat() {
  if (!currentUser || !sessionId) return;
  const { error } = await supabase.rpc("heartbeat_session", { p_session_id: sessionId });
  if (error) {
    console.error("QUESTAR could not update account presence.", error);
    if (/Active authenticated account required/i.test(error.message)) {
      showNotice("This account is suspended or disabled. Sign in with an active account to continue.", true);
      clearPresenceTimer();
      await supabase.auth.signOut();
    }
  }
}

function startPresence(user) {
  currentUser = user;
  sessionId = crypto.randomUUID();
  heartbeat();
  clearPresenceTimer();
  heartbeatTimer = window.setInterval(heartbeat, 30000);
  if (accountLink) {
    accountLink.title = `Signed in: ${user.email || "student account"}`;
    accountLink.setAttribute("aria-label", "Manage student account");
  }
}

function sendLearningEvent(detail) {
  if (!currentUser || !detail || typeof detail.type !== "string") return;
  const allowed = new Set([
    "quiz_attempted", "quiz_completed", "answer_correct", "answer_incorrect",
    "reading_completed", "math_completed", "quest_completed", "coins_earned",
    "level_achieved", "achievement_unlocked"
  ]);
  if (!allowed.has(detail.type)) return;
  supabase.rpc("record_learning_event", {
    p_event_type: detail.type,
    p_mode: ["basa", "math"].includes(detail.mode) ? detail.mode : null,
    p_score: Number.isFinite(detail.score) ? detail.score : null,
    p_coins: Number.isInteger(detail.coins) && detail.coins >= 0 ? detail.coins : null,
    p_duration_seconds: Number.isInteger(detail.durationSeconds) && detail.durationSeconds >= 0
      ? detail.durationSeconds : null,
    p_details: detail.details && typeof detail.details === "object" ? detail.details : {}
  }).then(({ error }) => {
    if (error) {
      console.error("QUESTAR could not record learning activity.", error);
      showNotice("Learning activity could not be synced to your account.", true);
    }
  });
}

if (configured) {
  ({ createClient } = await import("https://esm.sh/@supabase/supabase-js@2"));
  supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage }
  });
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error("QUESTAR account session could not be restored.", error);
  if (data?.session) startPresence(data.session.user);
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      clearPresenceTimer();
      currentUser = null;
      sessionId = null;
      if (accountLink) accountLink.title = "Student account";
    } else if (event === "SIGNED_IN" && session?.user && currentUser?.id !== session.user.id) {
      window.setTimeout(() => startPresence(session.user), 0);
    }
  });
  window.addEventListener("questar:activity", (event) => sendLearningEvent(event.detail));
  window.addEventListener("pagehide", () => {
    if (sessionId) supabase.rpc("end_session", { p_session_id: sessionId });
  }, { once: true });
}
