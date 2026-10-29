# QUESTAR — Learning Adventure

QUESTAR is a self-contained, fantasy-themed educational web app for reading comprehension and mathematics. It combines original short stories, monster battles, supportive feedback, configurable rewards, achievements, and a shared local coin wallet in one application.

The project is a static website made with HTML, CSS, and vanilla JavaScript. Core gameplay has no backend, package installation, external API, externally hosted image, or required internet connection. It is suitable for local play and GitHub Pages.

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
├── index.html    # App shell and references the stylesheet and script
├── style.css     # Responsive visual design and accessibility states
├── script.js     # Screens, game rules, questions, rewards, and local saving
└── README.md     # Setup, usage, publishing, and prototype limitations
```

`index.html` links `style.css` with a relative stylesheet link and loads `script.js` using `defer`. The JavaScript renders the single-page application inside `#app-root`. All four files belong together in the same folder and repository root.

## Local setup

1. Create a folder named `questar-educational-game`.
2. Create these four files inside it: `index.html`, `style.css`, `script.js`, and `README.md`.
3. Put each corresponding source file's content in its own file. Do not paste the contents of one file into another.
4. Save all four files, then open `index.html` in a current desktop or mobile browser.
5. Choose **Create a local profile** or **Guest Login — No Internet**.
6. Open **Choose a Learning Mode**, choose BASA or MATH, then select a difficulty.

No dependencies need to be installed. If a browser restricts local storage for a directly opened file, use a simple local development server instead. For example, with Python installed, open a terminal in the project folder and run:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`. Python is only needed for this optional local server, not by the website itself.

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

## Known limitations and production requirements

- Guest mode and core gameplay work offline, but browser storage is not a backup and may be cleared.
- Local profiles are prototypes, not secure accounts. Do not store passwords in `localStorage`.
- There is no real login, identity verification, account recovery, cross-device synchronization, live leaderboard, shared classroom data, tutor connection, or online multiplayer.
- The leaderboard and group battle use sample records and a local simulation only.
- Local JavaScript checks improve prototype behavior but can be modified by a user; they are not production security. A competitive or shared release must validate scores, question submissions, reward claims, and balances server-side.
- Production authentication requires an appropriate authentication service or backend. Any student data collection or sharing must be minimized and designed with appropriate privacy protections.
- No internet-hosted image, font, API, or service is required for core gameplay.
