const config = window.QUESTAR_SUPABASE_CONFIG || {};
const app = document.getElementById("account-app");
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url || "") &&
  typeof config.anonKey === "string" && config.anonKey.length > 20;
let createClient;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderMessage(message, error = false) {
  const node = document.getElementById("account-message");
  if (!node) return;
  node.hidden = false;
  node.className = error ? "error" : "notice";
  node.textContent = message;
}

function renderForm() {
  app.innerHTML = `<a class="back-link" href="index.html">← QUESTAR</a>
    <p class="eyebrow">Secure student account</p><h1>Join the Realm</h1>
    <p>Your account lets the school dashboard report account activity. You can still play offline with a local profile.</p>
    <div id="account-message" hidden></div>
    <form id="account-signup" class="account-form">
      <h2>Create a student account</h2>
      <label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>Full name<input name="full_name" type="text" autocomplete="name" maxlength="120" required></label>
      <label>Username<input name="username" type="text" autocomplete="username" minlength="3" maxlength="32" pattern="[A-Za-z0-9_]+" required></label>
      <label>Grade level<select name="grade"><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label>
      <label>Password<input name="password" type="password" autocomplete="new-password" minlength="12" required><small>Use at least 12 characters.</small></label>
      <button class="button button-primary" type="submit">Create student account</button>
    </form>
    <form id="account-signin" class="account-form">
      <h2>Sign in</h2>
      <label>Email address<input name="email" type="email" autocomplete="username" maxlength="254" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="button" type="submit">Sign in to QUESTAR</button>
    </form>
    <p class="muted">Passwords are handled by Supabase Auth and are never shown to administrators. Do not use a school or personal password you use elsewhere.</p>`;
}

if (!configured) {
  app.innerHTML = `<a class="back-link" href="index.html">← QUESTAR</a><p class="eyebrow">Setup required</p>
    <h1>Account service unavailable</h1>
    <p>Configure the Supabase project URL and public anon key in supabase-config.js, then apply the database migration.</p>`;
} else {
  ({ createClient } = await import("https://esm.sh/@supabase/supabase-js@2"));
  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage }
  });
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error("QUESTAR account session could not be restored.", error);
  if (data?.session) {
    app.innerHTML = `<a class="back-link" href="index.html">← Continue to QUESTAR</a><p class="eyebrow">Signed in</p>
      <h1>Student account</h1><p>${escapeHtml(data.session.user.email)}</p>
      <button id="account-signout" class="button" type="button">Sign out</button>`;
    document.getElementById("account-signout").addEventListener("click", async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) renderMessage(signOutError.message, true);
      else window.location.reload();
    });
  } else {
    renderForm();
    document.getElementById("account-signup").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const button = event.submitter;
      button.disabled = true;
      try {
        const email = String(data.get("email")).trim();
        const password = String(data.get("password"));
        const { data: result, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: String(data.get("full_name")).trim(),
              username: String(data.get("username")).trim().toLowerCase(),
              grade: String(data.get("grade"))
            },
            emailRedirectTo: new URL("account.html", window.location.href).toString()
          }
        });
        if (signupError) throw signupError;
        if (result.session) window.location.replace("index.html");
        else renderMessage("Account created. Check your email to confirm the address, then sign in.");
      } catch (submitError) {
        renderMessage(submitError.message || "Account request failed.", true);
      } finally {
        button.disabled = false;
      }
    });
    document.getElementById("account-signin").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const button = event.submitter;
      button.disabled = true;
      try {
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email: String(data.get("email")).trim(),
          password: String(data.get("password"))
        });
        if (signinError) throw signinError;
        window.location.replace("index.html");
      } catch (submitError) {
        renderMessage(submitError.message || "Sign in failed.", true);
      } finally {
        button.disabled = false;
      }
    });
  }
}
