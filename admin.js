const config = window.QUESTAR_SUPABASE_CONFIG || {};
const stateNode = document.getElementById("admin-state");
const configReady = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url || "") &&
  typeof config.anonKey === "string" && config.anonKey.length > 20;
const routes = [
  ["overview", "Dashboard Overview"],
  ["users", "All Users"],
  ["online", "Online Users"],
  ["offline", "Offline Users"],
  ["profiles", "Student Profiles"],
  ["activity", "User Activity"],
  ["analytics", "Learning Analytics"],
  ["management", "Account Management"],
  ["audit", "Admin Audit Logs"],
  ["settings", "Admin Settings"]
];
let supabase;
let adminUser;
let sessionId;
let heartbeatTimer;
let users = [];
let currentFilter = "all";
let currentSearch = "";
let createClient;
let activePage = "overview";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showState(title, message, includeHome = false) {
  stateNode.innerHTML = `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${includeHome ? '<a class="button" href="index.html">Return to QUESTAR</a>' : ""}`;
}

function showError(error) {
  console.error("QUESTAR Admin Console:", error);
  const message = error?.message || "The requested operation could not be completed.";
  const notice = document.getElementById("admin-error");
  if (notice) {
    notice.hidden = false;
    notice.textContent = message;
  } else {
    stateNode.insertAdjacentHTML("beforeend", `<p class="error">${escapeHtml(message)}</p>`);
  }
}

function dateTime(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function shortId(value) {
  return value ? `${value.slice(0, 8)}…` : "—";
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function navMarkup(active) {
  return routes.map(([id, title]) =>
    `<button type="button" class="nav-link ${id === active ? "active" : ""}" data-page="${id}">${escapeHtml(title)}</button>`
  ).join("");
}

function shell(page, body) {
  stateNode.className = "admin-layout";
  stateNode.innerHTML = `
    <aside class="sidebar">
      <a class="admin-brand" href="index.html"><span class="brand-mark">✦</span><span>QUESTAR<small>ADMIN CONSOLE</small></span></a>
      <nav aria-label="Admin navigation">${navMarkup(page)}</nav>
      <button class="nav-link logout-link" type="button" data-action="logout">Sign out</button>
    </aside>
    <section class="admin-main">
      <header class="admin-header"><div><p class="eyebrow">Restricted administration</p><h1>${escapeHtml(routes.find(([id]) => id === page)?.[1] || "Admin")}</h1></div>
        <div class="admin-identity"><span class="online-dot"></span>${escapeHtml(adminUser?.email || "Administrator")}</div>
      </header>
      <div id="admin-error" class="error-banner" role="alert" hidden></div>
      <main class="page-content">${body}</main>
      <footer>Admin access is verified by Supabase policies for every data request.</footer>
    </section>`;
}

function tableMarkup(rows, allowActions = false) {
  if (!rows.length) return '<div class="empty-state">No accounts match this search.</div>';
  return `<div class="table-wrap"><table><thead><tr>
    <th>Account</th><th>Email</th><th>Registered</th><th>Last login</th><th>Status</th><th>Role</th><th>Session</th><th>${allowActions ? "Actions" : ""}</th>
  </tr></thead><tbody>${rows.map((row) => `<tr>
    <td><button class="text-button" type="button" data-profile="${escapeHtml(row.user_id)}">${escapeHtml(row.full_name || row.username || "Unnamed account")}</button><small>${escapeHtml(row.username || shortId(row.user_id))}</small></td>
    <td>${escapeHtml(row.email)}</td><td>${escapeHtml(dateTime(row.registered_at))}</td>
    <td>${escapeHtml(dateTime(row.last_login_at))}</td><td><span class="status ${escapeHtml(row.account_status)}">${escapeHtml(row.account_status)}</span></td>
    <td>${escapeHtml(row.account_role)}</td><td><span class="presence ${row.is_online ? "online" : "offline"}">${row.is_online ? "Online" : "Offline"}</span><small>${escapeHtml(dateTime(row.last_active_at))}</small></td>
    <td class="action-cell"><button class="button button-small" type="button" data-profile="${escapeHtml(row.user_id)}">View</button>
      ${allowActions && row.account_role !== "admin" ? `<button class="button button-small" type="button" data-user-action="${row.account_status === "active" ? "suspend" : "reactivate"}" data-user-id="${escapeHtml(row.user_id)}">${row.account_status === "active" ? "Suspend" : "Reactivate"}</button>
        <button class="button button-small" type="button" data-user-action="disable" data-user-id="${escapeHtml(row.user_id)}">Disable</button>
        <button class="button button-small" type="button" data-user-action="reset_password" data-user-id="${escapeHtml(row.user_id)}">Reset password</button>
        <button class="button button-small button-danger" type="button" data-user-action="delete" data-user-id="${escapeHtml(row.user_id)}">Delete</button>` : ""}
    </td>
  </tr>`).join("")}</tbody></table></div>`;
}

async function rpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

async function loadUsers(filter = currentFilter, search = currentSearch) {
  currentFilter = filter;
  currentSearch = search;
  users = await rpc("admin_list_users", {
    p_search: search.trim(),
    p_status: filter,
    p_limit: 100,
    p_offset: 0
  });
  return users;
}

function statCard(label, value, note = "") {
  return `<article class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

async function renderOverview() {
  const summary = await rpc("admin_dashboard_summary");
  shell("overview", `
    <div class="stats-grid">
      ${statCard("Registered accounts", summary.total_users)}
      ${statCard("Student profiles", summary.students)}
      ${statCard("Active accounts", summary.active_accounts)}
      ${statCard("Currently online", summary.online_users, "Active sessions, heartbeat expires after 2 minutes")}
      ${statCard("Currently offline", summary.offline_users)}
      ${statCard("Active in past 24 hours", summary.active_today)}
      ${statCard("New today", summary.new_today)}
      ${statCard("New this month", summary.new_this_month)}
      ${statCard("Suspended", summary.suspended_users)}
      ${statCard("Disabled", summary.disabled_users)}
    </div>
    <section class="panel"><div class="section-heading"><div><p class="eyebrow">Recent account events</p><h2>Notifications</h2></div><button class="button" data-page="activity">View activity</button></div>
      <div id="recent-notifications" class="timeline">Loading notifications…</div></section>
    <section class="panel"><div class="section-heading"><div><p class="eyebrow">Latest registrations</p><h2>All users</h2></div><button class="button" data-page="users">Manage users</button></div>
      <div id="recent-users">Loading accounts…</div></section>`);
  const [notifications, recentUsers] = await Promise.all([
    rpc("admin_notifications", { p_limit: 8 }),
    rpc("admin_list_users", { p_search: "", p_status: "all", p_limit: 8, p_offset: 0 })
  ]);
  const notificationsNode = document.getElementById("recent-notifications");
  const usersNode = document.getElementById("recent-users");
  if (notificationsNode) notificationsNode.innerHTML = timelineMarkup(notifications);
  if (usersNode) usersNode.innerHTML = tableMarkup(recentUsers);
}

async function renderUserList(page) {
  const filter = page === "online" ? "online" : page === "offline" ? "offline" :
    page === "profiles" ? "student" : currentFilter;
  shell(page, `<section class="panel">
    <div class="toolbar">
      <label class="search-field">Search accounts<input id="user-search" type="search" value="${escapeHtml(currentSearch)}" placeholder="Name, username, or email"></label>
      <label>Status filter<select id="status-filter">
        ${["all", "active", "suspended", "disabled", "online", "offline", "student", "admin"].map((item) => `<option value="${item}" ${currentFilter === item ? "selected" : ""}>${item === "all" ? "All accounts" : item}</option>`).join("")}
      </select></label>
      <button class="button" type="button" data-action="refresh-users">Refresh</button>
    </div><div id="users-table">${tableMarkup(await loadUsers(filter, currentSearch))}</div>
  </section>`);
}

function timelineMarkup(events) {
  if (!events?.length) return '<p class="muted">No account activity recorded.</p>';
  return events.map((event) => `<article class="timeline-item">
    <span class="timeline-marker"></span><div><strong>${escapeHtml(event.event_type?.replaceAll("_", " ") || event.action)}</strong>
    <p>${escapeHtml(event.full_name || event.admin_email || event.user_id || "Account event")} · ${escapeHtml(dateTime(event.created_at))}</p></div>
  </article>`).join("");
}

async function renderActivity(page = "activity") {
  const events = await rpc("admin_list_activity", {
    p_user_id: null, p_event_type: null, p_since: new Date(Date.now() - 30 * 86400000).toISOString(), p_limit: 300
  });
  shell(page, `<section class="panel"><div class="toolbar"><div><p class="eyebrow">Past 30 days</p><h2>Chronological learning activity</h2></div>
    <select id="activity-type"><option value="">All activity</option>${["registration", "login", "logout", "quiz_attempted", "quiz_completed", "answer_correct", "answer_incorrect", "reading_completed", "math_completed", "coins_earned", "achievement_unlocked", "account_suspended", "account_reactivated", "account_disabled"].map((type) => `<option value="${type}">${type.replaceAll("_", " ")}</option>`).join("")}</select></div>
    <div id="activity-timeline" class="timeline">${timelineMarkup(events)}</div></section>`);
  const filter = document.getElementById("activity-type");
  filter.addEventListener("change", async () => {
    try {
      const selected = filter.value;
      const filtered = await rpc("admin_list_activity", {
        p_user_id: null, p_event_type: selected || null,
        p_since: new Date(Date.now() - 30 * 86400000).toISOString(), p_limit: 300
      });
      document.getElementById("activity-timeline").innerHTML = timelineMarkup(filtered);
    } catch (error) { showError(error); }
  });
}

function chartMarkup(title, points, labelKey = "day", valueKey = "count") {
  const max = Math.max(1, ...points.map((point) => Number(point[valueKey]) || 0));
  return `<section class="chart-card"><h3>${escapeHtml(title)}</h3>${points.length ? points.map((point) => {
    const value = Number(point[valueKey]) || 0;
    return `<div class="bar-row"><span>${escapeHtml(point[labelKey])}</span><div class="bar-track"><i style="width:${Math.max(1, value / max * 100)}%"></i></div><strong>${value}</strong></div>`;
  }).join("") : '<p class="muted">No data for this period.</p>'}</section>`;
}

async function renderAnalytics() {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const data = await rpc("admin_analytics", { p_since: since });
  shell("analytics", `<section class="panel"><p class="eyebrow">Date range</p><label>Show activity since <input id="analytics-since" type="date" value="${new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)}"></label>
    <p>Average recorded quiz score: <strong>${data.average_score == null ? "—" : Number(data.average_score).toFixed(1)}</strong></p></section>
    <div id="analytics-charts" class="chart-grid">
      ${chartMarkup("Registrations", data.registrations)}
      ${chartMarkup("Daily active users", data.daily_active)}
      ${chartMarkup("Monthly active users", data.monthly_active, "month", "count")}
      ${chartMarkup("Most active students", data.most_active, "full_name", "events")}
      ${chartMarkup("Most completed quizzes", data.top_quizzes, "full_name", "completed")}
      ${chartMarkup("Learning event types", data.learning, "event_type", "count")}
    </div>`);
  document.getElementById("analytics-since").addEventListener("change", async (event) => {
    try {
      const next = new Date(`${event.target.value}T00:00:00`).toISOString();
      const fresh = await rpc("admin_analytics", { p_since: next });
      document.getElementById("analytics-charts").innerHTML = [
        chartMarkup("Registrations", fresh.registrations),
        chartMarkup("Daily active users", fresh.daily_active),
        chartMarkup("Monthly active users", fresh.monthly_active, "month", "count"),
        chartMarkup("Most active students", fresh.most_active, "full_name", "events"),
        chartMarkup("Most completed quizzes", fresh.top_quizzes, "full_name", "completed"),
        chartMarkup("Learning event types", fresh.learning, "event_type", "count")
      ].join("");
    } catch (error) { showError(error); }
  });
}

async function renderAudit() {
  const logs = await rpc("admin_list_audit_logs", {
    p_since: new Date(Date.now() - 90 * 86400000).toISOString(), p_limit: 300
  });
  shell("audit", `<section class="panel"><p class="eyebrow">Tamper-protected database log</p><h2>Administrator actions · past 90 days</h2>
    <div class="table-wrap"><table><thead><tr><th>Administrator</th><th>Action</th><th>Affected account</th><th>Previous values</th><th>Updated values</th><th>Date</th></tr></thead>
    <tbody>${logs.length ? logs.map((log) => `<tr><td>${escapeHtml(log.admin_email || shortId(log.admin_id))}</td>
      <td>${escapeHtml(log.action)}</td><td>${escapeHtml(shortId(log.affected_user_id))}</td>
      <td><code>${escapeHtml(JSON.stringify(log.previous_values || {}))}</code></td>
      <td><code>${escapeHtml(JSON.stringify(log.updated_values || {}))}</code></td><td>${escapeHtml(dateTime(log.created_at))}</td></tr>`).join("") : '<tr><td colspan="6">No audit records.</td></tr>'}</tbody></table></div></section>`);
}

async function renderSettings() {
  shell("settings", `<section class="panel"><p class="eyebrow">Privileged actions</p><h2>Administrator settings</h2>
    <p>Admin roles are never assignable in this dashboard or from user profile metadata. Bootstrap or revoke an administrator only through the trusted Supabase SQL editor using the setup procedure in README.</p>
    <p>Account status changes and profile edits are checked by database functions. Password reset and account deletion are handled by a Supabase Edge Function using its server-only service role secret.</p>
    <div class="notice">Failed sign-in attempts are not included in this app's reports. Review Supabase Auth logs for authentication-security events. Learning events are client-reported and are not authoritative scores.</div>
    <p>Signed in as <strong>${escapeHtml(adminUser?.email)}</strong>. No service-role key or auth token is displayed.</p>
    <button class="button button-danger" data-action="logout">Sign out</button></section>`);
}

async function renderManagement() {
  const rows = await loadUsers("all", currentSearch);
  shell("management", `<section class="panel"><p class="eyebrow">Authorized user administration</p><h2>Account Management</h2>
    <div class="toolbar"><label class="search-field">Find an account<input id="user-search" type="search" value="${escapeHtml(currentSearch)}" placeholder="Name, username, or email"></label>
      <button class="button" data-action="refresh-users">Refresh</button></div>
    <div id="users-table">${tableMarkup(rows, true)}</div>
    <p class="muted">Actions are confirmed, performed server-side, and written to the audit log. Admin accounts cannot be suspended or deleted by this tool.</p></section>`);
}

async function renderProfile(userId) {
  const data = await rpc("admin_user_profile", { p_user_id: userId });
  if (!data?.user) throw new Error("The requested account was not found.");
  const user = data.user;
  const metrics = data.metrics || {};
  const events = data.activity || [];
  const avatarUrl = safeImageUrl(user.avatar_url);
  shell("profiles", `<button class="button" data-page="profiles">← Back to accounts</button>
    <section class="panel profile-header"><div class="avatar">${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="">` : "◈"}</div><div>
      <p class="eyebrow">Student profile · ${escapeHtml(user.role)}</p><h2>${escapeHtml(user.full_name || user.username || "Unnamed account")}</h2>
      <p>${escapeHtml(user.email)} · ${escapeHtml(user.username || "No username")} · ${escapeHtml(user.grade || "Grade not set")}</p>
      <p>Registered ${escapeHtml(dateTime(user.created_at))} · Last login ${escapeHtml(dateTime(user.last_sign_in_at))}</p></div>
      <span class="status ${escapeHtml(user.account_status)}">${escapeHtml(user.account_status)}</span></section>
    <section class="stats-grid">
      ${statCard("Coins earned", metrics.coins_earned || 0)}
      ${statCard("Current level", metrics.current_level || 1)}
      ${statCard("Answers correct", metrics.correct_answers || 0)}
      ${statCard("Answers incorrect", metrics.incorrect_answers || 0)}
      ${statCard("Quizzes attempted", metrics.quizzes_attempted || 0)}
      ${statCard("Quizzes completed", metrics.quizzes_completed || 0)}
      ${statCard("Completed quests", metrics.quests_completed || 0)}
      ${statCard("Average quiz score", metrics.average_score == null ? "—" : Number(metrics.average_score).toFixed(1))}
      ${statCard("BASA events", metrics.basa_events || 0)}
      ${statCard("MATH events", metrics.math_events || 0)}
      ${statCard("Achievements", metrics.achievements || 0)}
      ${statCard("Learning time", `${Math.round((metrics.learning_seconds || 0) / 60)} min`)}
    </section>
    <section class="panel"><h2>Permitted profile edits</h2><form id="profile-edit" class="edit-grid">
      <input type="hidden" name="user_id" value="${escapeHtml(user.id)}">
      <label>Full name<input name="full_name" maxlength="120" value="${escapeHtml(user.full_name)}" required></label>
      <label>Username<input name="username" maxlength="32" value="${escapeHtml(user.username)}"></label>
      <label>Profile image URL<input name="avatar_url" maxlength="2048" type="url" value="${escapeHtml(user.avatar_url)}"></label>
      <label>Grade<select name="grade"><option value="">Not set</option>${["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map((grade) => `<option ${user.grade === grade ? "selected" : ""}>${grade}</option>`).join("")}</select></label>
      <button class="button" type="submit">Save profile changes</button></form></section>
    <section class="panel"><h2>Learning activity timeline</h2><div class="timeline">${timelineMarkup(events)}</div></section>
    <section class="panel"><h2>Session history</h2><div class="table-wrap"><table><thead><tr><th>Started</th><th>Last active</th><th>Expires</th><th>Session</th></tr></thead><tbody>
      ${(data.sessions || []).map((session) => `<tr><td>${escapeHtml(dateTime(session.started_at))}</td><td>${escapeHtml(dateTime(session.last_seen_at))}</td><td>${escapeHtml(dateTime(session.expires_at))}</td><td><span class="presence ${new Date(session.expires_at) > new Date() && !session.ended_at ? "online" : "offline"}">${new Date(session.expires_at) > new Date() && !session.ended_at ? "Active" : session.ended_at ? "Ended" : "Expired"}</span></td></tr>`).join("") || '<tr><td colspan="4">No sessions recorded.</td></tr>'}
    </tbody></table></div></section>`);
}

async function loadPage(page) {
  try {
    activePage = page;
    document.querySelectorAll(".nav-link[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
    if (page === "overview") return await renderOverview();
    if (["users", "online", "offline", "profiles"].includes(page)) return await renderUserList(page);
    if (page === "activity") return await renderActivity();
    if (page === "analytics") return await renderAnalytics();
    if (page === "management") return await renderManagement();
    if (page === "audit") return await renderAudit();
    if (page === "settings") return await renderSettings();
  } catch (error) {
    showError(error);
  }
}

async function refreshUserTable() {
  try {
    const filter = stateNode.querySelector("#status-filter")?.value || currentFilter;
    const search = stateNode.querySelector("#user-search")?.value ?? currentSearch;
    const page = stateNode.querySelector(".nav-link.active")?.dataset.page || "users";
    const effectiveFilter = page === "online" ? "online" : page === "offline" ? "offline" :
      page === "profiles" ? "student" : page === "management" ? "all" : filter;
    const rows = await loadUsers(effectiveFilter, search);
    const table = document.getElementById("users-table");
    if (table) table.innerHTML = tableMarkup(rows, page === "management");
  } catch (error) { showError(error); }
}

async function accountAction(action, userId) {
  const labels = {
    suspend: "Suspend this account?",
    reactivate: "Reactivate this account?",
    disable: "Disable this account?",
    reset_password: "Send a password reset email to this account?",
    delete: "Permanently delete this account and its profile data? This cannot be undone."
  };
  if (!window.confirm(labels[action] || "Perform this account action?")) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("admin-account-action", {
      body: { action, user_id: userId },
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    await loadPage(stateNode.querySelector(".nav-link.active")?.dataset.page || "management");
  } catch (error) { showError(error); }
}

async function signOut() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer);
  if (sessionId) {
    const { error } = await supabase.rpc("end_session", { p_session_id: sessionId });
    if (error) console.error("QUESTAR could not close the admin session.", error);
  }
  await supabase.auth.signOut();
  window.location.replace("index.html");
}

function startHeartbeat() {
  sessionId = crypto.randomUUID();
  const heartbeat = async () => {
    const { error } = await supabase.rpc("heartbeat_session", { p_session_id: sessionId });
    if (error) showError(error);
  };
  heartbeat();
  heartbeatTimer = window.setInterval(heartbeat, 30000);
  window.addEventListener("pagehide", () => {
    if (sessionId) supabase.rpc("end_session", { p_session_id: sessionId });
  }, { once: true });
}

async function verifyAdministrator(user) {
  if (!user) {
    renderLogin();
    return;
  }
  adminUser = user;
  try {
    await rpc("admin_dashboard_summary");
    startHeartbeat();
    await loadPage("overview");
  } catch (error) {
    if (/administrator access required|not authorized/i.test(error?.message || "")) {
      await supabase.auth.signOut();
      showState("Access denied", "This account is not authorized to use the administrator console.", true);
      window.setTimeout(() => window.location.replace("index.html"), 1800);
    } else {
      showState("Admin service unavailable", error?.message || "The secure admin service could not be reached.", true);
    }
  }
}

function renderLogin(errorMessage = "") {
  stateNode.className = "state-card login-card";
  stateNode.innerHTML = `<a class="back-link" href="index.html">← QUESTAR</a><p class="eyebrow">Restricted area</p><h1>Administrator sign in</h1>
    <p>Use an authorized administrator account. Student accounts are redirected away.</p>
    ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}
    <form id="admin-login"><label>Email<input name="email" type="email" autocomplete="username" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="button button-primary" type="submit">Sign in securely</button></form>`;
}

if (!configReady) {
  showState("Admin setup required", "Set the Supabase project URL and public anon key in supabase-config.js, apply the database migration, and provision an administrator. No account data is available until the backend is configured.", true);
} else {
  ({ createClient } = await import("https://esm.sh/@supabase/supabase-js@2"));
  const { url, anonKey } = config;
  supabase = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const { data: initialSession, error } = await supabase.auth.getSession();
  if (error) showError(error);
  if (initialSession?.session) await verifyAdministrator(initialSession.session.user);
  else renderLogin();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      if (heartbeatTimer) window.clearInterval(heartbeatTimer);
      adminUser = null;
      if (stateNode.isConnected) renderLogin();
    } else if (event === "SIGNED_IN" && session?.user && !adminUser) {
      window.setTimeout(() => verifyAdministrator(session.user), 0);
    }
  });
  window.setInterval(() => {
    if (["online", "offline"].includes(activePage)) refreshUserTable();
  }, 30000);
}

stateNode.addEventListener("click", async (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    await loadPage(pageButton.dataset.page);
    return;
  }
  const profileButton = event.target.closest("[data-profile]");
  if (profileButton) {
    try { await renderProfile(profileButton.dataset.profile); } catch (error) { showError(error); }
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    const accountButton = event.target.closest("[data-user-action]");
    if (accountButton) await accountAction(accountButton.dataset.userAction, accountButton.dataset.userId);
    return;
  }
  if (actionButton.dataset.action === "logout") return signOut();
  if (actionButton.dataset.action === "refresh-users") return refreshUserTable();
});

stateNode.addEventListener("input", (event) => {
  if (event.target.id === "user-search") {
    currentSearch = event.target.value;
    window.clearTimeout(event.target.searchTimer);
    event.target.searchTimer = window.setTimeout(refreshUserTable, 250);
  }
});

stateNode.addEventListener("change", (event) => {
  if (event.target.id === "status-filter") refreshUserTable();
});

stateNode.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.target.id === "admin-login") {
    const form = new FormData(event.target);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password"))
    });
    if (error) return renderLogin(error.message);
    return;
  }
  if (event.target.id === "profile-edit") {
    const form = new FormData(event.target);
    try {
      await rpc("admin_update_profile", {
        p_user_id: form.get("user_id"),
        p_full_name: form.get("full_name"),
        p_username: form.get("username"),
        p_avatar_url: form.get("avatar_url") || null,
        p_grade: form.get("grade") || null
      });
      await renderProfile(String(form.get("user_id")));
    } catch (error) { showError(error); }
  }
});
