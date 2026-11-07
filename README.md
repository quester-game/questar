# QUESTAR — Learning Adventure

QUESTAR is a fantasy-themed educational web app for reading comprehension and mathematics. It combines original short stories, monster battles, supportive feedback, configurable rewards, achievements, and a shared local coin wallet. Guest gameplay is static and offline-friendly; optional Supabase accounts and the restricted admin console require an online deployment and project configuration.

The project is a static website made with HTML, CSS, and vanilla JavaScript. Core gameplay has no required backend, package installation, externally hosted image, or internet connection. The optional account and admin features use Supabase Auth/Postgres and the Supabase JavaScript client loaded from a CDN.

## Educational purpose

BASA Mode is designed to offer manageable reading passages and low-pressure comprehension practice for students who may struggle with long reading passages, mind-blanking during learning or assessment, and anxiety. Incorrect answers use encouraging feedback; they do not deduct coins.

The following figures were supplied in the project brief and are presented as project-provided research figures, not independently verified statistics:

- 62.4% of students struggle with long reading passages.
- 70.40% experience mind-blanking during learning or assessment.
- 65.6% experience anxiety.

## The six reference-screen concepts

1. **Opening screen:** cinematic mountain silhouettes, lantern-bearing adventurer, QUESTAR title, and START QUEST.
2. **Story and mission selection:** a mysterious school scene with three choices that reveal different clues without blocking progress.
3. **Victory and rewards:** actual session rewards and current wallet, alongside clearly labeled illustrative values from the brief.
4. **Mathematics battle:** monster health, shuffled answer choices, timer where appropriate, streak, and shared coins.
5. **Mode and difficulty selection:** BASA and MATH paths with Easy, Hard, and Ultra settings.
6. **Leaderboard and group dashboard:** local sample rankings, Barkada progress, and a group-battle simulation clearly marked as offline demonstration data.

## Features

- **BASA Mode:** six original short stories across horror/mystery, hugot/emotional, and school-life themes. Stories remain available during questions. Correct answers damage the monster; every battle starts with three lives. Mistakes remove exactly one life, never coins.
- **MATH Mode:** addition, subtraction, multiplication, division, fractions, decimals, mixed operations, and real-life word problems. Questions are generated locally, answer choices are unique and shuffled as complete objects, and a validation check runs before display.
- **Difficulty:** Grade 7–8 Easy (no forced timer), Grade 9–10 Hard (60 seconds), and Grade 11–12 Ultra (50 seconds).
- **Shared rewards:** one local wallet across both modes; configurable reading, answer, quest, monster, achievement, and streak rewards. Story/quest/achievement rewards and stable BASA question rewards are protected against repeat claims. Newly generated MATH questions can earn their configured answer reward.
- **Progress:** local profiles and guest play, resumable in-progress battles, dashboard, scores, accuracy, achievements, streaks, profile preferences, story history, and settings.
- **Accessibility:** semantic page structure, keyboard-operable controls, visible focus states, responsive layouts, readable passages, reduced-motion support, and a larger-text option.
- **Narrative:** the blackboard, cabinet, and hallway choices each reveal a unique clue. All three keep the learning modes available.
- **Offline group demo:** sample leaderboard players and a simulated group battle. No network request or real opponent is involved.

## Technology and folder structure

```text
questar-educational-game/
├── index.html / style.css / script.js        # Offline-capable game
├── account.html / account.js                 # Student Supabase Auth
├── student-session.js                         # Session heartbeat and activity events
├── admin.html / admin.css / admin.js          # Restricted admin console
├── reset-password.html / reset-password.js    # Auth recovery flow
├── supabase-config.js                         # Public project URL and anon key only
├── supabase/migrations/                       # RLS schema and protected RPCs
├── supabase/functions/                        # Server-side account management
└── README.md                                  # Setup, privacy, and limitations
```

`index.html` links the game stylesheet and classic script and loads the optional student-session module. All static pages and their assets belong together in the repository root.

## Local setup

1. Keep the repository files in the same folder structure.
2. Open `index.html` in a current desktop or mobile browser for offline guest play, or serve the folder over HTTP locally.
3. Choose **Create a local profile** or **Guest Login — No Internet**.
4. Open **Choose a Learning Mode**, choose BASA or MATH, then select a difficulty.

No dependencies need to be installed. If a browser restricts local storage for a directly opened file, use a simple local development server instead. For example, with Python installed, open a terminal in the project folder and run:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`. Python is only needed for this optional local server, not by the game itself. Supabase sign-in requires a hosted HTTP(S) origin listed in the project's Auth redirect allowlist; a directly opened `file://` page cannot provide it.

### Troubleshooting

- If the page has no styling, confirm the CSS filename is exactly `style.css` and sits beside `index.html`.
- If buttons do not work, confirm `script.js` is beside `index.html`, the script tag uses `defer`, and the browser console has no load or syntax errors.
- If saved progress seems missing, reopen the same browser and site address. Local storage is separate for different browsers, devices, and origins.
- If data is damaged or unavailable, the app recovers with a fresh local state. The browser console reports an unreadable saved record.

## How to play

### BASA Mode

1. Choose BASA Mode and a difficulty.
2. Select a story and read the complete passage.
3. Start the challenge. The reading-completion reward is protected and can be claimed only once per story/profile.
4. Select one of four shuffled answers and submit it. The passage can be reopened while answering.
5. Correct answers damage the monster, show a passage-based explanation, and may earn a protected question reward. Wrong answers remove one of three lives, award no answer coins, and show supportive feedback.
6. Defeat the monster to record story completion and unlock applicable rewards. At zero lives, retry or choose another story.

### MATH Mode

1. Choose MATH Mode, a difficulty, and one of the eight categories.
2. Solve the question and select one of four answer choices.
3. Submit once. Correct answers damage the monster, add to the score and streak, show an explanation, and may award coins. The configured streak milestone can add a bonus.
4. An incorrect answer shows the solution and resets the current streak. Continue through the round or start another challenge.

### Coins, rewards, and streaks

The wallet is shared by BASA and MATH. Settings control coin values and the MATH streak threshold/bonus. Normal MATH answer rewards can be earned for newly generated questions. BASA answer rewards are protected by stable story-question IDs, while story completion, quest, monster, and achievement rewards are protected against repeat claims. Practice remains available after a reward has been claimed. Wrong BASA answers never deduct coins.

## Local profiles, guest play, and saved data

Guest play works offline and saves progress as a browser-local Guest profile. A named profile is also stored only in the current browser. No password is requested or stored. These profiles are not authenticated accounts; they do not provide identity verification, password recovery, or cross-device synchronization.

The app stores profile preferences, active challenge state, wallet, scores, achievements, reward claims, completed activities, and streak information in the browser's `localStorage`. Refreshing the same site in the same browser normally preserves that data. Browser cleanup, private browsing, a different browser/device, or a different site origin may remove or isolate it. **Reset this local profile's progress** in Settings asks for confirmation before deleting that profile's saved progress.

## Uploading to GitHub

Beginner-friendly upload using the GitHub website:

1. Sign in to GitHub and create a repository named `questar-educational-game`. Choose public or private visibility as appropriate.
2. Open the repository and select **Add file → Create new file**.
3. Name the file `index.html`, paste only the HTML source, and commit it.
4. Repeat for `style.css`, `script.js`, and `README.md`, pasting each file's own source.
5. Confirm all four exact filenames appear together at the repository root. The CSS and JavaScript paths in the HTML are relative, so avoid placing them in different folders unless you also update those links.
6. Open `index.html` in the repository to confirm its source is present.

## Publishing with GitHub Pages

1. Open the repository and choose **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch** if available.
3. Select the `main` branch and the root folder (`/`), then save.
4. Wait for the Pages deployment to finish. Check the repository's **Actions** tab or the Pages deployment status if it fails.
5. Open the URL GitHub provides. Test navigation, styles, gameplay, and local saving on desktop and mobile.

Each visitor's progress is saved separately in that visitor's browser. GitHub Pages does not provide a shared account, database, or leaderboard.

## Testing checklist and prototype status

No separate automated test framework is included. In-browser smoke checks were run against the local files: the opening screen loaded; guest entry and the BASA story flow worked; a wrong BASA answer reduced lives from three to two without changing the wallet; correct answers damaged and defeated the monster; the actual reward total matched the wallet change; all eight MATH categories opened with exactly four answer choices; an active challenge resumed after reload; and desktop, tablet, and mobile viewport checks showed no horizontal overflow. A real browser should still be used to verify the visual layout and exact behavior in the target environment.

- [x] Opening screen, guest entry, and BASA flow.
- [ ] Create-profile form and all three quest-choice consequences.
- [x] BASA incorrect-answer life loss, unchanged wallet, supportive feedback, correct damage, victory, and actual reward total.
- [ ] BASA defeat, retry, and repeated-reward protection.
- [x] All eight MATH categories opened with four choices each.
- [ ] Full MATH reward, streak, timer, and round-completion sequence.
- [ ] Dashboard, profile, achievements, settings, and confirmed progress reset.
- [x] Active challenge resumed after reload in the same browser.
- [ ] Leaderboard and group-battle interactions.
- [x] Desktop/tablet/mobile viewport checks reported no horizontal overflow.
- [ ] Keyboard-only pass, manual visual review, and browser-console review.

## Supabase accounts and secure admin console

The static game remains playable offline with browser-local profiles. For real accounts and monitoring, this repository now includes a separate Supabase-backed account flow and restricted admin console:

- `account.html` creates or signs into email/password student accounts. It never accepts a role field; all new accounts are students.
- `admin.html` is not linked from the student navigation. Visiting it directly does not grant access: the database checks the administrator grant on every privileged RPC, and non-admin users are signed out and redirected.
- `supabase/migrations/20261107000100_admin_monitoring.sql` defines protected profiles, explicit administrator grants, expiring heartbeat sessions, activity events, audit logs, RLS, and admin-only RPCs.
- `supabase/functions/admin-account-action/` performs password reset, account deletion, and Auth bans server-side. The service-role key is only available to the Edge Function and must never be copied into browser files.
- Authenticated students' game sessions send activity events to the database. Session presence expires after two minutes without a heartbeat and is not inferred from past logins.

### Configure a Supabase project

1. Create a Supabase project and enable email/password authentication. Configure email confirmation, a strong password policy, and Auth rate limits appropriate for students.
2. In Authentication → URL Configuration, set the site URL and allow the deployed URLs for `account.html`, `reset-password.html`, and the account confirmation callback.
3. Apply the migration using the Supabase CLI (`supabase link --project-ref YOUR_PROJECT_REF`, then `supabase db push`) or run the migration SQL in the Supabase SQL Editor.
4. Copy only the project URL and **public anon/publishable key** into `supabase-config.js`. This key is designed for browser use; database access remains restricted by RLS. Never place a service-role key, database password, or private API key in this file.
5. Register your first account at `account.html`, confirm its email, then grant it administrator status from the trusted Supabase SQL Editor. Replace the email with the exact verified account email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where lower(email) = lower('admin@example.org')
   on conflict (user_id) do nothing;
   ```

   Only a trusted project owner should run this bootstrap query. Adding or removing admins is deliberately not available to students or through the dashboard. Additional admin grants should be reviewed and performed through the protected database console.
6. Deploy `supabase/functions/admin-account-action/` with JWT verification enabled. Set the Edge Function secrets `ADMIN_ALLOWED_ORIGINS` (comma-separated exact trusted site origins, such as `https://example.org`) and `APP_SITE_URL` (the site origin). Supabase supplies its project URL and keys to Edge Functions; verify the service-role secret exists only in the Edge Function environment.
7. Open `admin.html`, sign in with the granted account, and verify a regular student account is redirected without returning admin data. Test suspension, reactivation, password-reset email, and deletion only with test accounts.

The migration deliberately grants no browser access to the administrator-grant, session, activity, or audit tables. Use only the protected RPCs and Edge Function. Password reset uses Supabase's configured email provider and the `reset-password.html` recovery page.

### Monitoring scope and data integrity

- Online status means an authenticated account has an unexpired heartbeat session (two-minute expiry); the student app refreshes it every 30 seconds. Closing a tab may take up to two minutes to show offline.
- Supabase account details, email, account status, admin role, and auth sign-in time come from the database/Auth provider. The console never displays passwords, hashes, or tokens.
- Learning events are recorded against the currently signed-in Supabase account, but the existing game still keeps its wallet, answers, and local profiles in `localStorage`. Learning events, scores, coins, and level reports are therefore **client-reported monitoring data**, not tamper-proof grades or authoritative balances. A production grading/rewards system must move scoring and rewards to server-validated game APIs before using these figures for decisions.
- Local profiles created before Supabase setup are not automatically migrated or linked to an email account. A student must create/sign into a Supabase account to have future authenticated session and game activity events associated with it.
- Failed sign-in attempts and suspicious Auth events remain in Supabase Auth's security logs; the app dashboard does not claim to expose those provider logs. Review them in the Supabase project console.
- Admin role grants are provisioned by a trusted project owner. Student-controlled metadata cannot grant administrator access. Admin account status changes, profile edits, resets, deletions, and role grants have protected audit records.
- Supabase is an internet service, so these account and admin features require a network connection. Guest gameplay remains local and offline.

## Known limitations and production requirements

- Guest mode and core gameplay work offline, but browser storage is not a backup and may be cleared.
- Local profiles are prototypes, not secure accounts. Do not store passwords in `localStorage`.
- Local browser profiles are not authenticated accounts and do not provide identity verification, password recovery, or cross-device synchronization. Supabase email/password auth is available only after project setup above.
- The leaderboard and group battle use sample records and a local simulation only.
- Local JavaScript checks improve prototype behavior but can be modified by a user; they are not production security. A competitive or shared release must validate scores, question submissions, reward claims, and balances server-side.
- Student data collection and retention must be reviewed for applicable school, guardian-consent, and privacy requirements before deployment.
- Core guest gameplay needs no internet service; configured Supabase accounts and administrator monitoring do.
