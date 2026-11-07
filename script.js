(() => {
  "use strict";

  const STORAGE_KEY = "questar.local.v1";
  const AVATARS = ["🧙", "🧝", "🧑‍🚀", "🦊", "🐉", "🦉"];
  const CATEGORIES = ["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Decimals", "Mixed operations", "Real-life word problems"];
  const DEFAULT_SETTINGS = {
    rewards: { reading: 10, basaCorrect: 10, mathCorrect: 8, quest: 20, monster: 20, achievement: 15 },
    streakThreshold: 3,
    streakBonus: 10,
    animations: true,
    reducedMotion: false,
    largeText: false,
    soundEffects: true,
    backgroundMusic: true,
    audioMuted: false,
    masterVolume: 0.65,
    effectsVolume: 0.75,
    musicVolume: 0.3
  };
  const AUDIO_TRACKS = {
    menu: { tempo: 1900, notes: [196, 220, 174.61, 164.81], intervals: [1, 1.25, 1.5], melody: [392, 349.23, 293.66, 329.63] },
    exploration: { tempo: 2300, notes: [220, 261.63, 196, 174.61], intervals: [1, 1.5, 2], melody: [440, 392, 329.63, 349.23] },
    quiz: { tempo: 2500, notes: [220, 196, 246.94, 174.61], intervals: [1, 1.25, 1.5], melody: [392, 329.63, 349.23, 293.66] },
    battle: { tempo: 680, notes: [110, 123.47, 98, 130.81], intervals: [1, 1.5, 2], melody: [220, 246.94, 196, 261.63] },
    victory: { tempo: 900, notes: [261.63, 293.66, 329.63, 392], intervals: [1, 1.25, 1.5], melody: [523.25, 587.33, 659.25, 783.99] },
    defeat: { tempo: 2400, notes: [164.81, 146.83, 138.59, 130.81], intervals: [1, 1.2, 1.5], melody: [329.63, 293.66, 261.63, 246.94] }
  };
  const STORIES = [
    {
      id: "whispering-library",
      title: "The Whispering Library",
      theme: "Horror & mystery",
      monster: "The Ink Wisp",
      monsterIcon: "👻",
      passage: "The school library was supposed to close at five, but Mara stayed to finish her research. As rain tapped the windows, a book slid from the highest shelf and landed open beside her. Its pages were blank except for one sentence: “Return what the storm borrowed.”\n\nA faint blue light drifted between the shelves. Mara followed it to an old class photograph. One face had been scratched away. Behind the frame, she found a damp envelope addressed to a student named Lito, dated twenty years earlier. The note inside said he had hidden his poem in the library before transferring schools.\n\nMara searched the poetry shelf and found a folded page. When she placed it beneath the photograph, the missing face appeared again. The blue light became warm, and the library clock began ticking. At the door, Mara looked back. The open book now held a poem about a boy who wanted his words to be remembered.",
      questions: [
        { prompt: "Why did Mara stay in the library?", choices: ["To finish her research", "To wait for a friend", "To return a photograph", "To avoid the rain"], answer: 0, explanation: "The first paragraph says Mara stayed to finish her research." },
        { prompt: "What clue led Mara to Lito's story?", choices: ["A damp envelope behind the photograph", "A note on the library door", "A message on the clock", "A poem in her notebook"], answer: 0, explanation: "The envelope behind the class photograph was addressed to Lito." },
        { prompt: "What happened after Mara placed the poem under the photograph?", choices: ["The missing face appeared again", "The shelves disappeared", "The rain stopped at once", "The photograph caught fire"], answer: 0, explanation: "The passage directly says the missing face appeared again." }
      ]
    },
    {
      id: "last-jeepney",
      title: "The Last Jeepney Home",
      theme: "Hugot & heart",
      monster: "The Gloom Collector",
      monsterIcon: "🌑",
      passage: "After the recognition program, Nico waited alone beside the school gate. His best friend, Paolo, had promised to ride home with him, but Paolo left early with the honor students. Nico stared at the medal in his bag. He had worked hard, yet he felt invisible beside everyone else's applause.\n\nThe last jeepney was almost full when Aling Tess, their science teacher, stepped down and noticed him. She asked about the medal instead of his grades. Nico admitted that he wished Paolo had waited. Aling Tess listened, then reminded him that feeling disappointed did not erase his achievement.\n\nOn the ride, Nico sent Paolo a message: “I’m proud of us, but I missed you today.” Paolo replied with an apology and a photo of the class medal he had saved from an earlier project. By the time the jeepney reached Nico's street, his sadness had softened. The medal still mattered, but being honest mattered too.",
      questions: [
        { prompt: "Why was Nico waiting by the school gate?", choices: ["He hoped to ride home with Paolo", "He lost his science book", "He was waiting for a medal", "He had missed the recognition program"], answer: 0, explanation: "Nico expected Paolo to ride home with him." },
        { prompt: "What did Aling Tess ask Nico about?", choices: ["The medal in his bag", "His next exam", "The jeepney route", "Paolo's grades"], answer: 0, explanation: "She noticed the medal and asked about it rather than his grades." },
        { prompt: "What helped Nico feel better by the end?", choices: ["He shared his feelings and received an apology", "He won another medal", "He decided to stop talking to Paolo", "The jeepney reached school"], answer: 0, explanation: "Nico was honest with Paolo, who apologized and replied warmly." }
      ]
    },
    {
      id: "seat-by-window",
      title: "The Seat by the Window",
      theme: "School life",
      monster: "The Quiz Gremlin",
      monsterIcon: "👾",
      passage: "On Monday, Bea found a new student sitting in her usual seat by the classroom window. His name was Jun, and he spoke softly while arranging pencils by color. Bea wanted to ask him to move, but she noticed his hands shaking when the teacher announced a group activity.\n\nInstead, Bea invited Jun to join her team. Their task was to build a simple paper bridge that could hold a stack of books. Bea drew a plan, Jun measured the paper strips, and their classmate Rafi tested each fold. The first bridge sagged. Jun suggested adding triangle supports, something he had learned at his old school.\n\nTheir bridge held six books. During the presentation, Jun explained the supports while Bea described the design. After class, Bea offered him the window seat the next day. Jun smiled and said they could share it during group work. Bea realized a changed seat had made room for a new teammate.",
      questions: [
        { prompt: "Why did Bea invite Jun to her group?", choices: ["She noticed he seemed nervous", "He asked to leave class", "He had taken her books", "The teacher assigned them together"], answer: 0, explanation: "Bea saw Jun's hands shaking before the group activity." },
        { prompt: "What change helped the paper bridge hold more books?", choices: ["Adding triangle supports", "Using fewer paper strips", "Moving it to the window", "Removing the design"], answer: 0, explanation: "Jun suggested triangle supports, and the bridge held six books." },
        { prompt: "What is a fitting lesson from Bea's experience?", choices: ["A small welcome can create a new friendship", "Group tasks should be done alone", "Changing seats always causes problems", "Presentations matter more than teamwork"], answer: 0, explanation: "Bea's invitation helped Jun contribute and become a teammate." }
      ]
    },
    {
      id: "bell-after-dark",
      title: "The Bell After Dark",
      theme: "Horror & mystery",
      monster: "The Corridor Shade",
      monsterIcon: "🦇",
      passage: "Tomas returned to the school laboratory to collect his forgotten notebook. The corridors were empty, but a bell rang from the old science wing. He remembered that the wing had been locked since a storm damaged its wiring. A small silver moth fluttered near the doorway, then vanished through the gap beneath it.\n\nTomas used his phone light and saw no broken lock. On the floor lay a trail of wet footprints leading to a cabinet. Inside, he found a battery-powered desk bell and a leaking bottle of water. The moth was trapped behind a glass jar, beating its wings against the side.\n\nHe carefully opened the jar and carried the moth to a window. A janitor arrived and explained that the bell had been stored there for tomorrow's experiment. Tomas wrote a note about the leak so it could be repaired. The hallway grew quiet again, and the moth disappeared into the rainy garden.",
      questions: [
        { prompt: "What made Tomas investigate the old science wing?", choices: ["A bell rang from it", "His phone stopped working", "A teacher called him", "He saw a broken window"], answer: 0, explanation: "The bell from the locked wing caught Tomas's attention." },
        { prompt: "What caused the wet footprints?", choices: ["A leaking bottle of water", "The moth's wings", "The storm outside", "A janitor's shoes"], answer: 0, explanation: "Tomas found a leaking bottle inside the cabinet." },
        { prompt: "How did Tomas help the moth?", choices: ["He opened the jar and carried it to a window", "He left it in the cabinet", "He rang the bell again", "He brought it to the laboratory"], answer: 0, explanation: "He carefully released the moth through a window." }
      ]
    },
    {
      id: "unread-message",
      title: "The Unread Message",
      theme: "Hugot & heart",
      monster: "The Doubt Sprite",
      monsterIcon: "🧚",
      passage: "Lia practiced her class speech every evening, but she still froze when she saw the microphone. The day before her presentation, her cousin sent a message: “You don't have to sound perfect. Just tell them why the river clean-up matters to you.” Lia had helped collect plastic near their barangay bridge and remembered how the water looked afterward.\n\nAt school, her hands trembled as she placed her notes on the desk. She took one slow breath and began with a story about the river. She forgot one sentence, paused, and found her place again. Her classmates listened. When she finished, nobody laughed; one classmate asked how to join the next clean-up.\n\nLia read her cousin's message after class and sent a thank-you. She realized courage did not mean having no fear. It meant choosing to share something important even while her voice shook. The next presentation still made her nervous, but now she knew she could begin with one honest sentence.",
      questions: [
        { prompt: "What advice did Lia's cousin give?", choices: ["Explain why the river clean-up matters to her", "Memorize every word perfectly", "Avoid speaking in class", "Ask a classmate to present instead"], answer: 0, explanation: "The cousin encouraged Lia to speak about her personal reason." },
        { prompt: "What did Lia do when she forgot a sentence?", choices: ["She paused and found her place again", "She left the room", "She stopped the presentation", "She asked the teacher to read"], answer: 0, explanation: "The passage says she paused and found her place again." },
        { prompt: "Which idea best expresses the story's message?", choices: ["Courage can mean speaking while still feeling nervous", "People must never make mistakes", "Presentations are easy for everyone", "Helping others requires perfect confidence"], answer: 0, explanation: "Lia learned that courage can exist alongside fear." }
      ]
    },
    {
      id: "class-project",
      title: "The Paper Moon Project",
      theme: "School life",
      monster: "The Deadline Dragon",
      monsterIcon: "🐲",
      passage: "For the school fair, Amir's group planned a model of the moon's phases. On the first day, they argued about who would draw, cut, and explain. Their chart remained blank while the deadline came closer. Their adviser asked them to list the tasks before choosing roles.\n\nAmir wrote three jobs on scrap paper. Nessa volunteered to draw the phases, Carlo gathered black and yellow paper, and Amir prepared the explanation. They agreed to check in after lunch instead of waiting until the night before. When Carlo discovered they had no glue, Nessa suggested paper tabs that could hold the moon shapes in place.\n\nThe model was not perfect, but it clearly showed the changing phases. During the fair, each student explained one part. Another group asked how the paper tabs worked, and Carlo showed them. Amir realized their best idea was not the moon itself: it was making room for everyone's skills and solving small problems together.",
      questions: [
        { prompt: "Why did the group first make little progress?", choices: ["They argued about roles and left the chart blank", "They forgot the date of the fair", "Their adviser canceled the project", "They had already finished the model"], answer: 0, explanation: "The group argued about tasks and the chart stayed blank." },
        { prompt: "How did they solve the missing-glue problem?", choices: ["Nessa suggested paper tabs", "They canceled the presentation", "Amir bought a new chart", "Carlo used a moon-shaped box"], answer: 0, explanation: "Nessa's paper tabs held the moon shapes in place." },
        { prompt: "What helped the project succeed?", choices: ["Sharing tasks and combining everyone's skills", "One student doing all the work", "Making a perfect model immediately", "Avoiding check-ins"], answer: 0, explanation: "Each student took a role and worked together to solve problems." }
      ]
    }
  ];

  const root = document.getElementById("app-root");
  const topbarPlayer = document.getElementById("topbar-player");
  const soundToggle = document.querySelector(".sound-toggle");
  const state = loadDatabase();
  let game = null;
  let activeTimer = null;
  let toastTimer = null;
  let groupResult = "";
  let questChoice = "";
  let toastNode;
  let audioContext = null;
  let masterGain = null;
  let effectsGain = null;
  let musicGain = null;
  let musicTrackGain = null;
  let musicTimer = null;
  let musicBeat = 0;
  let activeMusicTrack = "";
  const recentSounds = new Map();

  if (state.currentId && state.profiles[state.currentId]) {
    game = state.profiles[state.currentId].activeGame || null;
  }
  let screen = game ? "battle" : (currentProfile() ? "menu" : "opening");

  function loadDatabase() {
    const defaults = { currentId: "", profiles: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.profiles || typeof parsed.profiles !== "object") return defaults;
      const profiles = {};
      Object.entries(parsed.profiles).forEach(([id, profile]) => {
        if (profile && typeof profile === "object" && profile.profile && typeof profile.profile.name === "string") {
          profiles[id] = normalizeProfile(profile);
        }
      });
      return { currentId: profiles[parsed.currentId] ? parsed.currentId : "", profiles };
    } catch (error) {
      console.warn("QUESTAR could not read saved progress; starting with a fresh local profile.", error);
      return defaults;
    }
  }

  function normalizeProfile(saved) {
    const fresh = createProfileData(saved.profile.name, saved.profile.avatar, saved.profile.grade, saved.profile.difficulty);
    const validArray = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
    return {
      ...fresh,
      ...saved,
      profile: { ...fresh.profile, ...saved.profile },
      coins: Number.isFinite(saved.coins) && saved.coins >= 0 ? Math.floor(saved.coins) : 0,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(saved.settings || {}),
        rewards: { ...DEFAULT_SETTINGS.rewards, ...((saved.settings || {}).rewards || {}) },
        masterVolume: clampVolume(saved.settings?.masterVolume, DEFAULT_SETTINGS.masterVolume),
        effectsVolume: clampVolume(saved.settings?.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
        musicVolume: clampVolume(saved.settings?.musicVolume, DEFAULT_SETTINGS.musicVolume),
        soundEffects: typeof saved.settings?.soundEffects === "boolean" ? saved.settings.soundEffects : DEFAULT_SETTINGS.soundEffects,
        backgroundMusic: typeof saved.settings?.backgroundMusic === "boolean" ? saved.settings.backgroundMusic : DEFAULT_SETTINGS.backgroundMusic,
        audioMuted: typeof saved.settings?.audioMuted === "boolean" ? saved.settings.audioMuted : DEFAULT_SETTINGS.audioMuted
      },
      completedStories: validArray(saved.completedStories),
      completedMath: validArray(saved.completedMath),
      completedQuests: validArray(saved.completedQuests),
      defeatedMonsters: validArray(saved.defeatedMonsters),
      defeatedMonsters: validArray(saved.defeatedMonsters),
      achievements: validArray(saved.achievements),
      claimedRewards: validArray(saved.claimedRewards),
      totalCorrect: nonNegativeInt(saved.totalCorrect),
      basaCorrect: nonNegativeInt(saved.basaCorrect),
      mathCorrect: nonNegativeInt(saved.mathCorrect),
      totalAnswers: nonNegativeInt(saved.totalAnswers),
      currentStreak: nonNegativeInt(saved.currentStreak),
      bestStreak: nonNegativeInt(saved.bestStreak),
      bestScore: nonNegativeInt(saved.bestScore),
      score: nonNegativeInt(saved.score),
      activeGame: isValidSavedGame(saved.activeGame) ? saved.activeGame : null
    };
  }

  function isValidSavedGame(value) {
    return Boolean(value && ["basa", "math"].includes(value.mode) && Array.isArray(value.questions) && Number.isInteger(value.questionIndex) && value.questionIndex >= 0 && value.questionIndex < value.questions.length);
  }

  function nonNegativeInt(value) {
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  }

  function createProfileData(name, avatar, grade, difficulty) {
    return {
      profile: { name, avatar, grade, difficulty },
      coins: 0,
      settings: structuredCloneSafe(DEFAULT_SETTINGS),
      completedStories: [],
      completedMath: [],
      completedQuests: [],
      defeatedMonsters: [],
      achievements: [],
      claimedRewards: [],
      totalCorrect: 0,
      basaCorrect: 0,
      mathCorrect: 0,
      totalAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestScore: 0,
      score: 0,
      activeGame: null
    };
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function currentProfile() {
    return state.currentId ? state.profiles[state.currentId] : null;
  }

  function clampVolume(value, fallback) {
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
  }

  function audioSettings() {
    return currentProfile()?.settings || DEFAULT_SETTINGS;
  }

  function ensureAudio() {
    if (audioContext) return true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    effectsGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    effectsGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
    applyAudioVolumes();
    return true;
  }

  function applyAudioVolumes() {
    if (!audioContext) return;
    const settings = audioSettings();
    const now = audioContext.currentTime;
    const ramp = (node, value) => {
      node.gain.cancelScheduledValues(now);
      node.gain.setValueAtTime(node.gain.value, now);
      node.gain.linearRampToValueAtTime(value, now + 0.12);
    };
    ramp(masterGain, settings.audioMuted ? 0 : settings.masterVolume);
    ramp(effectsGain, settings.soundEffects ? settings.effectsVolume : 0);
    ramp(musicGain, settings.backgroundMusic ? settings.musicVolume : 0);
  }

  function unlockAudio() {
    if (!ensureAudio()) return;
    if (audioContext.state === "suspended") {
      audioContext.resume()
        .then(() => {
          applyAudioVolumes();
          syncMusic(screen);
        })
        .catch((error) => console.warn("QUESTAR audio could not start.", error));
    }
    applyAudioVolumes();
    syncMusic(screen);
  }

  function playTone(frequency, duration, volume, waveform, destination, detune = 0) {
    if (!audioContext || !destination) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.detune.setValueAtTime(detune, now);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(Math.max(0.0001, volume), now + Math.min(0.035, duration * 0.2));
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function playSfx(name, rewardAmount = 0) {
    const settings = audioSettings();
    if (settings.audioMuted || !settings.soundEffects || !ensureAudio()) return;
    if (audioContext.state !== "running") {
      audioContext.resume()
        .then(() => playSfx(name, rewardAmount))
        .catch((error) => console.warn("QUESTAR audio could not start.", error));
      return;
    }
    const now = audioContext.currentTime;
    if ((recentSounds.get(name) || 0) > now) return;
    recentSounds.set(name, now + 0.09);
    const notes = (frequencies, duration, waveform = "sine", volume = 0.16, gap = 0.075) => {
      frequencies.forEach((frequency, index) => playTone(frequency, duration, volume, waveform, effectsGain, index % 2 ? 5 : -5));
      if (frequencies.length > 1 && gap > 0) {
        frequencies.slice(1).forEach((frequency, index) => {
          window.setTimeout(() => playTone(frequency, duration, volume * 0.72, waveform, effectsGain, 3), (index + 1) * gap * 1000);
        });
      }
    };
    if (name === "select") playTone(680, 0.075, 0.1, "sine", effectsGain);
    else if (name === "correct") notes([523.25, 659.25, 783.99], 0.32, "sine", 0.18, 0.085);
    else if (name === "wrong") notes([220, 196], 0.42, "triangle", 0.14, 0.1);
    else if (name === "next") notes([392, 523.25], 0.2, "sine", 0.12, 0.06);
    else if (name === "quest") notes([392, 523.25, 659.25, 783.99], 0.42, "triangle", 0.13, 0.09);
    else if (name === "coin") {
      const pitch = rewardAmount >= 20 ? [659.25, 783.99, 987.77, 1174.66] : [783.99, 987.77];
      notes(pitch, 0.24, "sine", rewardAmount >= 20 ? 0.16 : 0.11, 0.065);
    } else if (name === "achievement") notes([523.25, 659.25, 783.99, 1046.5], 0.48, "triangle", 0.16, 0.1);
    else if (name === "victory") notes([392, 493.88, 587.33, 783.99], 0.68, "triangle", 0.2, 0.12);
    else if (name === "defeat") notes([293.66, 246.94, 196], 0.48, "triangle", 0.14, 0.12);
    else if (name === "complete") notes([523.25, 659.25, 783.99], 0.48, "sine", 0.16, 0.12);
  }

  function musicTrackForScreen(nextScreen) {
    if (nextScreen === "battle") return "battle";
    if (nextScreen === "victory") return "victory";
    if (nextScreen === "defeat") return "defeat";
    if (["stories", "story-read", "quest", "categories", "difficulty", "completion"].includes(nextScreen)) return "exploration";
    if (["mode-select"].includes(nextScreen)) return "quiz";
    return "menu";
  }

  function stopMusicTrack() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
    if (musicTrackGain && audioContext) {
      const fadingTrack = musicTrackGain;
      const now = audioContext.currentTime;
      fadingTrack.gain.cancelScheduledValues(now);
      fadingTrack.gain.setValueAtTime(fadingTrack.gain.value, now);
      fadingTrack.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      window.setTimeout(() => fadingTrack.disconnect(), 900);
    }
    musicTrackGain = null;
    activeMusicTrack = "";
  }

  function playMusicBeat(trackName) {
    const track = AUDIO_TRACKS[trackName];
    if (!track || !musicTrackGain) return;
    const beat = musicBeat++;
    const rootNote = track.notes[Math.floor(beat / 4) % track.notes.length];
    const beatSeconds = track.tempo / 1000;
    playTone(rootNote, Math.min(beatSeconds * 1.85, 3.2), trackName === "battle" ? 0.055 : 0.035, "triangle", musicTrackGain);
    if (beat % 2 === 0) {
      const interval = track.intervals[Math.floor(beat / 4) % track.intervals.length];
      playTone(rootNote * interval, Math.min(beatSeconds * 1.7, 3.2), 0.025, "sine", musicTrackGain);
      playTone(track.melody[beat % track.melody.length], trackName === "battle" ? 0.38 : 0.72, 0.024, "sine", musicTrackGain);
    }
    if (trackName === "battle" && beat % 4 === 0) {
      const now = audioContext.currentTime;
      const drum = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      drum.type = "sine";
      drum.frequency.setValueAtTime(105, now);
      drum.frequency.exponentialRampToValueAtTime(42, now + 0.18);
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.linearRampToValueAtTime(0.075, now + 0.015);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      drum.connect(envelope);
      envelope.connect(musicTrackGain);
      drum.onended = () => { drum.disconnect(); envelope.disconnect(); };
      drum.start(now);
      drum.stop(now + 0.22);
    }
  }

  function syncMusic(nextScreen) {
    if (!audioContext) return;
    applyAudioVolumes();
    const settings = audioSettings();
    const targetTrack = !settings.audioMuted && settings.backgroundMusic ? musicTrackForScreen(nextScreen) : "";
    if (targetTrack === activeMusicTrack) return;
    stopMusicTrack();
    if (!targetTrack || audioContext.state !== "running") return;
    const track = AUDIO_TRACKS[targetTrack];
    musicTrackGain = audioContext.createGain();
    musicTrackGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    musicTrackGain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.8);
    musicTrackGain.connect(musicGain);
    activeMusicTrack = targetTrack;
    musicBeat = 0;
    playMusicBeat(targetTrack);
    musicTimer = window.setInterval(() => playMusicBeat(targetTrack), track.tempo);
  }

  function save() {
    const profile = currentProfile();
    if (profile) profile.activeGame = game && !game.terminal ? game : null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("QUESTAR could not save local progress.", error);
      showToast("Progress could not be saved. Check this browser's storage settings.");
    }
    updateHeader();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function updateHeader() {
    const profile = currentProfile();
    topbarPlayer.innerHTML = profile
      ? `<span>${escapeHtml(profile.profile.avatar)} <strong>${escapeHtml(profile.profile.name)}</strong> · 🪙 ${profile.coins}</span>`
      : "";
    document.querySelectorAll(".quick-nav [data-action]").forEach((button) => {
      button.disabled = !profile;
      button.title = profile ? button.title : "Create or choose a local profile first";
    });
    if (soundToggle) {
      const effectsEnabled = profile ? !profile.settings.audioMuted : true;
      soundToggle.disabled = !profile;
      soundToggle.textContent = effectsEnabled ? "🔊" : "🔇";
      soundToggle.setAttribute("aria-label", effectsEnabled ? "Mute all audio" : "Enable all audio");
      soundToggle.title = profile ? (effectsEnabled ? "Mute all audio" : "Enable all audio") : "Choose a profile to manage sound";
      soundToggle.setAttribute("aria-pressed", String(effectsEnabled));
    }
  }

  function showToast(message) {
    if (!toastNode) {
      toastNode = document.createElement("div");
      toastNode.className = "toast";
      toastNode.setAttribute("role", "status");
      document.body.append(toastNode);
    }
    toastNode.textContent = message;
    toastNode.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastNode.hidden = true; }, 3200);
  }

  function go(nextScreen) {
    clearTimer();
    screen = nextScreen;
    render();
    root.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: currentProfile()?.settings.reducedMotion ? "auto" : "smooth" });
  }

  function setDifficulty(value) {
    const profile = currentProfile();
    if (!profile || !["easy", "hard", "ultra"].includes(value)) return;
    profile.profile.difficulty = value;
    save();
  }

  function difficultyName(value) {
    return ({ easy: "Grade 7–8 · Easy", hard: "Grade 9–10 · Hard", ultra: "Grade 11–12 · Ultra" })[value] || "Grade 7–8 · Easy";
  }

  function render() {
    updateHeader();
    document.documentElement.classList.toggle("large-text", Boolean(currentProfile()?.settings.largeText));
    const renderer = {
      opening: renderOpening,
      entry: renderEntry,
      "create-profile": renderCreateProfile,
      menu: renderMenu,
      "mode-select": renderModeSelect,
      difficulty: renderDifficulty,
      stories: renderStories,
      "story-read": renderStoryRead,
      quest: renderQuest,
      categories: renderCategories,
      battle: renderBattle,
      victory: renderVictory,
      defeat: renderDefeat,
      completion: renderCompletion,
      dashboard: renderDashboard,
      profile: renderProfile,
      achievements: renderAchievements,
      settings: renderSettings,
      leaderboard: renderLeaderboard,
      barkada: renderBarkada,
      "group-result": renderGroupResult
    }[screen] || renderOpening;
    const settings = currentProfile()?.settings;
    document.documentElement.classList.toggle("no-animations", Boolean(settings && (!settings.animations || settings.reducedMotion)));
    root.innerHTML = renderer();
    if (screen === "battle") startTimer();
    syncMusic(screen);
  }

  function renderOpening() {
    const p = currentProfile();
    return `<section class="screen hero">
      <div class="hero-content">
        <div class="hero-emblem" aria-hidden="true">✦</div>
        <div class="eyebrow">A Filipino learning adventure</div>
        <h1>QUESTAR</h1>
        <p class="hero-subtitle">Follow the lantern through stories, solve the riddles of the realm, and discover that every brave answer moves you forward.</p>
        <div class="adventurer" aria-hidden="true"><span class="cloak"></span><span class="hood"></span><span class="lantern">🏮</span></div>
        <div class="actions">
          <button class="btn btn-primary" type="button" data-action="${p ? "resume" : "entry"}">${p ? "CONTINUE QUEST" : "START QUEST"} <span aria-hidden="true">→</span></button>
          ${p ? `<button class="btn" type="button" data-action="entry">Switch local profile</button>` : ""}
        </div>
        <p class="small muted" style="margin-top:16px">No account or internet required. Your progress is saved only in this browser.</p>
      </div>
    </section>
    <section class="panel panel-pad center" aria-labelledby="why-questar">
      <div class="eyebrow">Why this adventure exists</div>
      <h2 id="why-questar">Learning, without the fear of getting stuck</h2>
      <p class="muted">Project-provided research figures (not independently verified here): 62.4% of students struggle with long reading passages; 70.40% experience mind-blanking during learning or assessment; 65.6% experience anxiety. BASA offers short original stories, gentle feedback, and time to try again.</p>
    </section>`;
  }

  function renderEntry() {
    const profileEntries = Object.entries(state.profiles);
    return `<section class="screen panel panel-pad">
      <div class="eyebrow">Choose your path</div><h1 class="serif">Enter the Realm</h1>
      <p class="muted">Choose a saved local profile or enter as a guest. These are browser-local profiles, not secure accounts.</p>
      ${profileEntries.length ? `<h2 class="serif">Saved on this browser</h2><div class="grid grid-two">${profileEntries.map(([id, item]) =>
        `<button class="card tile" type="button" data-action="select-profile" data-id="${escapeHtml(id)}"><span class="card-icon">${escapeHtml(item.profile.avatar)}</span><h3>${escapeHtml(item.profile.name)}</h3><p>${escapeHtml(difficultyName(item.profile.difficulty))} · 🪙 ${item.coins} coins</p></button>`
      ).join("")}</div>` : ""}
      <div class="grid grid-two" style="margin-top:18px">
        <button class="card tile" type="button" data-action="new-profile"><span class="card-icon">🧭</span><h3>Create a local profile</h3><p>Choose a nickname, avatar, grade level, and preferred challenge.</p></button>
        <button class="card tile" type="button" data-action="guest"><span class="card-icon">🏕️</span><h3>Guest Login — No Internet</h3><p>Play both modes offline. Progress is saved locally as “Guest”.</p></button>
      </div>
      <div class="notice warm" style="margin-top:20px">No passwords are collected or stored. Local profiles do not verify identity, provide account recovery, or sync across devices.</div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="opening">Back</button></div>
    </section>`;
  }

  function renderCreateProfile() {
    return `<section class="screen panel panel-pad">
      <div class="eyebrow">A profile for this browser</div><h1 class="serif">Create Your Adventurer</h1>
      <form id="profile-form" class="stack">
        <div class="field"><label for="profile-name">Nickname</label><input id="profile-name" name="name" maxlength="24" minlength="1" autocomplete="nickname" required placeholder="e.g. Moon Scout"></div>
        <div class="field"><span class="field-help">Choose an avatar</span><div class="avatar-picker" role="group" aria-label="Choose an avatar">        ${AVATARS.map((avatar, index) => `<button class="avatar-option" type="button" data-action="avatar" data-avatar="${avatar}" aria-label="Avatar ${index + 1}" aria-pressed="${selectedAvatarForForm === avatar}">${avatar}</button>`).join("")}</div></div>
        <div class="field-grid">
          <div class="field"><label for="profile-grade">Grade level</label><select id="profile-grade" name="grade"><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
          <div class="field"><label for="profile-difficulty">Preferred challenge</label><select id="profile-difficulty" name="difficulty"><option value="easy">Grade 7–8 · Easy</option><option value="hard">Grade 9–10 · Hard</option><option value="ultra">Grade 11–12 · Ultra</option></select></div>
        </div>
        <p class="field-help">Use a nickname rather than sensitive personal information. This is not a secure account.</p>
        <div class="actions"><button class="btn btn-quiet" type="button" data-action="entry">Back</button><button class="btn btn-primary" type="submit">Create profile</button></div>
      </form>
    </section>`;
  }

  function renderMenu() {
    const p = currentProfile();
    if (!p) return renderOpening();
    return `<section class="screen">
      <div class="row spread"><div><div class="eyebrow">Welcome back, ${escapeHtml(p.profile.name)}</div><h1 class="serif">The Realm Awaits</h1></div><span class="badge">🪙 ${p.coins} shared coins</span></div>
      ${game ? `<div class="notice warm row spread"><span>Your ${game.mode === "basa" ? "BASA" : "MATH"} battle is saved and ready to resume.</span><button class="btn btn-small btn-primary" type="button" data-action="resume-battle">Resume battle</button></div>` : ""}
      <div class="grid grid-two" style="margin-top:18px">
        <button class="card tile" type="button" data-action="quest"><span class="card-icon">🕯️</span><h3>Enter the Story Quest</h3><p>Make choices in the old school and uncover a clue before your challenge.</p></button>
        <button class="card tile" type="button" data-action="mode-select"><span class="card-icon">🗺️</span><h3>Choose a Learning Mode</h3><p>Play a short reading adventure or a mathematics monster battle.</p></button>
        <button class="card tile" type="button" data-action="dashboard"><span class="card-icon">📜</span><h3>Progress Dashboard</h3><p>Review your learning journey, accuracy, scores, and streaks.</p></button>
        <button class="card tile" type="button" data-action="profile"><span class="card-icon">🧑‍🚀</span><h3>Adventurer Profile</h3><p>See your grade, shared wallet, and achievements.</p></button>
        <button class="card tile" type="button" data-action="achievements"><span class="card-icon">🏅</span><h3>Achievements</h3><p>Celebrate milestones earned through practice.</p></button>
        <button class="card tile" type="button" data-action="leaderboard"><span class="card-icon">🏆</span><h3>Leaderboard & Barkada</h3><p>Explore clearly labeled offline sample rankings and a local group challenge.</p></button>
      </div>
      <section class="panel panel-pad menu-audio" data-audio-controls aria-labelledby="menu-audio-title">
        <div class="row spread"><div><div class="eyebrow">Personalize your adventure</div><h2 id="menu-audio-title">Sound & Music</h2></div><button class="btn btn-small" type="button" data-action="toggle-sound" aria-label="${p.settings.audioMuted ? "Enable" : "Mute"} all audio">${p.settings.audioMuted ? "🔇 Muted" : "🔊 Sound on"}</button></div>
        <div class="row audio-toggles">
          <label class="check-line"><input type="checkbox" name="soundEffects" data-audio-preference ${p.settings.soundEffects ? "checked" : ""}> Sound effects</label>
          <label class="check-line"><input type="checkbox" name="backgroundMusic" data-audio-preference ${p.settings.backgroundMusic ? "checked" : ""}> Background music</label>
        </div>
        <div class="field-grid audio-volume-grid">
          ${volumeField("Master volume", "masterVolume", p.settings.masterVolume)}
          ${volumeField("Effects volume", "effectsVolume", p.settings.effectsVolume)}
          ${volumeField("Music volume", "musicVolume", p.settings.musicVolume)}
        </div>
      </section>
      <div class="actions"><button class="btn" type="button" data-action="settings">⚙ Settings</button><button class="btn btn-quiet" type="button" data-action="entry">Switch profile</button></div>
    </section>`;
  }

  function renderModeSelect() {
    return `<section class="screen">
      <div class="eyebrow">One realm, two ways to grow</div><h1 class="serif">Choose Your Learning Mode</h1>
      <div class="grid grid-two">
        <button class="card tile" type="button" data-action="choose-mode" data-mode="basa"><span class="card-icon">📖</span><h2>BASA Mode</h2><p>Read original short stories, find details, and face a monster with three lives. The passage stays available while you answer.</p><span class="badge" style="margin-top:16px">Story · Comprehension · Encouragement</span></button>
        <button class="card tile" type="button" data-action="choose-mode" data-mode="math"><span class="card-icon">🔢</span><h2>MATH Mode</h2><p>Practice eight math categories, explain your thinking, build a streak, and earn shared coins.</p><span class="badge" style="margin-top:16px">Practice · Battles · Streaks</span></button>
      </div>
      <section class="panel panel-pad" style="margin-top:18px"><h2 class="serif">Difficulty paths</h2><div class="grid grid-three">
        <div><h3>Grade 7–8 · Easy</h3><p class="muted small">Gentler questions and supportive Taglish prompts. No forced timer.</p></div>
        <div><h3>Grade 9–10 · Hard</h3><p class="muted small">More challenging questions with a 60-second timer per question.</p></div>
        <div><h3>Grade 11–12 · Ultra</h3><p class="muted small">Complex but answerable challenges with a 50-second timer per question.</p></div>
      </div></section>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  function renderDifficulty() {
    const mode = pendingMode || "basa";
    return `<section class="screen panel panel-pad">
      <div class="eyebrow">${mode === "basa" ? "BASA Mode" : "MATH Mode"}</div><h1 class="serif">Set Your Challenge</h1>
      <p class="muted">You can change this anytime. Easy mode has no forced timer; Hard uses 60 seconds; Ultra uses 50 seconds per question.</p>
      <div class="grid grid-three">
        ${[
          ["easy", "Grade 7–8 · Easy", "Clear prompts, simpler vocabulary, visual hints, and Taglish support where useful."],
          ["hard", "Grade 9–10 · Hard", "More challenging questions, full English, and a 60-second challenge timer."],
          ["ultra", "Grade 11–12 · Ultra", "Complex English, harder but answerable questions, and a 50-second timer."]
        ].map(([id, label, description]) => `<button class="card tile" type="button" data-action="set-difficulty" data-value="${id}" data-mode="${mode}"><h2>${label}</h2><p>${description}</p>${currentProfile().profile.difficulty === id ? `<span class="badge" style="margin-top:14px">Current choice</span>` : ""}</button>`).join("")}
      </div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="mode-select">Back</button></div>
    </section>`;
  }

  let pendingMode = "basa";

  function renderStories() {
    return `<section class="screen"><div class="eyebrow">BASA · Choose a tale</div><h1 class="serif">Stories of the Realm</h1>
      <p class="muted">Each passage is short, original, and stays available during the challenge. Completed stories can be replayed for practice; their protected completion rewards are one-time.</p>
      <div class="grid grid-two">${STORIES.map((story) => {
        const done = currentProfile().completedStories.includes(story.id);
        return `<button class="card tile" type="button" data-action="read-story" data-id="${story.id}"><span class="row spread"><span class="card-icon">${story.monsterIcon}</span>${done ? `<span class="badge">✓ Practiced</span>` : ""}</span><h2>${story.title}</h2><span class="eyebrow">${story.theme}</span><p>${story.passage.split("\n\n")[0]}</p></button>`;
      }).join("")}</div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="mode-select">Back to modes</button><button class="btn btn-quiet" type="button" data-action="menu">Menu</button></div>
    </section>`;
  }

  function getStory(id) {
    return STORIES.find((story) => story.id === id);
  }

  function renderStoryRead() {
    const story = getStory(selectedStoryId);
    if (!story) return renderStories();
    return `<section class="screen">
      <div class="row spread"><div><div class="eyebrow">${story.theme} · BASA quest</div><h1 class="serif">${story.title}</h1></div><span class="badge">🪙 ${currentProfile().coins}</span></div>
      <article class="panel panel-pad"><p class="story-text">${escapeHtml(story.passage)}</p><div class="notice warm">Mission: Read at your own pace, then answer clues to help the lantern-bearer face ${story.monster}. You may revisit the passage while answering.</div></article>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="stories">Choose another story</button><button class="btn btn-primary" type="button" data-action="start-basa" data-id="${story.id}">I’m ready · Start challenge</button></div>
    </section>`;
  }

  let selectedStoryId = STORIES[0].id;

  function renderQuest() {
    const response = questChoice ? questResponses[questChoice] : null;
    return `<section class="screen">
      <div class="eyebrow">Quest 01 · The Moonlit Classroom</div><h1 class="serif">A Clue in the Quiet School</h1>
      <div class="grid grid-two">
        <article class="panel panel-pad"><div class="card-icon">🏫</div><h2 class="serif">The bell rings after dusk</h2><p class="muted">A silver lantern has gone dark in the old classroom. The hooded adventurer hears a whisper from the hallway: “Find the story that remembers.” Three paths may reveal a clue.</p>
          ${response ? `<div class="notice support" aria-live="polite">${response}</div><div class="actions"><button class="btn btn-primary" type="button" data-action="quest-continue">Continue to a learning challenge →</button></div>` : ""}
        </article>
        <div class="panel panel-pad"><div class="eyebrow">Choose what to investigate</div><div class="stack" style="margin-top:14px">
          <button class="choice-button" type="button" data-action="quest-choice" data-choice="blackboard">🖍️ Check the blackboard for clues</button>
          <button class="choice-button" type="button" data-action="quest-choice" data-choice="cabinet">🗄️ Look inside a cabinet carefully</button>
          <button class="choice-button" type="button" data-action="quest-choice" data-choice="hallway">🚪 Leave the room to find the hallway</button>
        </div><p class="field-help" style="margin-top:14px">Every choice reveals a different clue. None can block your learning adventure.</p></div>
      </div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  const questResponses = {
    blackboard: "Beneath the chalk dust, you discover a poem with a missing final line. The rhythm points toward a story waiting to be read.",
    cabinet: "Inside the cabinet is a lantern-shaped bookmark and a note: “Look closely; the small detail opens the way.” Your next challenge will reward careful reading.",
    hallway: "The hallway's moonlight reveals three footprints leading to a book cart. A friendly wisp points you toward a tale—and leaves the classroom door open."
  };

  function renderCategories() {
    return `<section class="screen"><div class="eyebrow">MATH · Select a challenge</div><h1 class="serif">Choose a Skill to Practice</h1>
      <p class="muted">Questions are generated and checked before display. Answer options are shuffled as complete choices; one answer is correct.</p>
      <div class="grid grid-two">${CATEGORIES.map((category, index) => `<button class="card tile" type="button" data-action="start-math" data-category="${escapeHtml(category)}"><span class="card-icon">${["➕", "➖", "✖️", "➗", "🍰", "🔹", "🧩", "🛒"][index]}</span><h2>${category}</h2><p>${mathCategoryHint(category)}</p></button>`).join("")}</div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="mode-select">Back to modes</button><button class="btn btn-quiet" type="button" data-action="menu">Menu</button></div>
    </section>`;
  }

  function mathCategoryHint(category) {
    return ({
      Addition: "Combine quantities and check your sums.",
      Subtraction: "Compare amounts and find the difference.",
      Multiplication: "Use multiplication facts and larger products.",
      Division: "Share equally; division by zero is never used.",
      Fractions: "Compare and calculate with equivalent fractions.",
      Decimals: "Work with money-style decimal values.",
      "Mixed operations": "Apply the correct order of operations.",
      "Real-life word problems": "Use math to solve everyday situations."
    })[category];
  }

  function renderBattle() {
    if (!game || !game.questions.length) return `<section class="screen panel panel-pad"><h1>Challenge unavailable</h1><p class="muted">This saved challenge could not be restored.</p><button class="btn btn-primary" data-action="menu">Return to menu</button></section>`;
    const question = currentQuestion();
    if (!question) return `<section class="screen"><h1>Challenge complete</h1><button class="btn btn-primary" data-action="menu">Return to menu</button></section>`;
    const isBasa = game.mode === "basa";
    const story = isBasa ? getStory(game.storyId) : null;
    const healthPercent = Math.max(0, Math.round(game.health / game.maxHealth * 100));
    const timerLimit = timerForDifficulty(currentProfile().profile.difficulty);
    return `<section class="screen">
      <div class="row spread"><div><div class="eyebrow">${isBasa ? "BASA · Reading battle" : `MATH · ${escapeHtml(game.category)}`}</div><h1 class="serif">${isBasa ? escapeHtml(story?.title || "Story quest") : "The Challenge Arena"}</h1></div>
        <div class="row"><span class="badge">🪙 ${currentProfile().coins}</span>${isBasa ? `<span class="badge">💛 ${game.lives} ${game.lives === 1 ? "life" : "lives"}</span>` : `<span class="badge">🔥 Streak ${currentProfile().currentStreak}</span>`}</div>
      </div>
      <div class="panel panel-pad">
        <div class="row spread"><span class="badge">${difficultyName(currentProfile().profile.difficulty)}</span><span class="small muted">Question ${game.questionIndex + 1} · ${isBasa ? "Monster battle" : `Category: ${escapeHtml(game.category)}`}</span>${timerLimit ? `<span class="timer" id="timer-display" aria-live="polite">⏱ ${game.timeLeft ?? timerLimit}s</span>` : ""}</div>
        <div class="battle-arena">
          <div class="creature"><span class="creature-icon">${isBasa ? story?.monsterIcon : game.monsterIcon}</span><span class="creature-name">${isBasa ? escapeHtml(story?.monster || "Story wisp") : escapeHtml(game.monsterName)}</span></div>
          <div class="versus">✦ LANTERN DUEL ✦<div class="meter-label"><span>Monster energy</span><strong>${game.health} / ${game.maxHealth}</strong></div><div class="meter" role="progressbar" aria-label="Monster health" aria-valuenow="${game.health}" aria-valuemin="0" aria-valuemax="${game.maxHealth}"><span style="width:${healthPercent}%"></span></div></div>
          <div class="creature"><span class="creature-icon">🧙</span><span class="creature-name">${escapeHtml(currentProfile().profile.name)} · Lantern-bearer</span></div>
        </div>
        ${isBasa ? `<details class="panel panel-pad" style="padding:14px 18px;margin:12px 0"><summary class="gold" style="cursor:pointer">Revisit the story passage</summary><p class="story-text" style="margin:12px 0 0">${escapeHtml(story.passage)}</p></details>` : `<div class="row spread small muted"><span>Next streak bonus: ${Math.max(1, currentProfile().settings.streakThreshold - currentProfile().currentStreak % currentProfile().settings.streakThreshold)} correct</span><span>🎯 Best ${currentProfile().bestStreak}</span></div>`}
        <h2 class="question">${escapeHtml(question.prompt)}</h2>
        ${game.mode === "math" ? `<p class="muted center small">${currentProfile().profile.difficulty === "easy" ? "Hinga muna—basahin nang mabuti, piliin ang sagot. Kaya mo ’yan!" : "Choose the result that matches the question. Your answer is checked after submission."}</p>` : ""}
        <div class="choice-grid" role="group" aria-label="Answer choices">${question.choices.map((choice) => {
          const submitted = question.submitted;
          let stateClass = "";
          if (submitted && choice.id === question.correctId) stateClass = "correct";
          else if (submitted && choice.id === question.selectedId && !question.wasCorrect) stateClass = "incorrect";
          return `<button class="choice-button ${stateClass}" type="button" data-action="select-choice" data-id="${escapeHtml(choice.id)}" aria-pressed="${question.selectedId === choice.id}" ${submitted ? "disabled" : ""}>${escapeHtml(choice.label)}</button>`;
        }).join("")}</div>
        ${question.submitted ? `<div class="feedback ${question.wasCorrect ? "notice" : "notice support"}" role="status">${escapeHtml(question.feedback)}</div>${question.explanation ? `<p class="small muted" style="margin:10px 0 0">${escapeHtml(question.explanation)}</p>` : ""}
          <div class="actions"><button class="btn btn-primary" type="button" data-action="next-question">${game.terminal ? "See results →" : "Next question →"}</button></div>` :
          `<div class="actions"><button class="btn btn-primary" type="button" data-action="submit-answer" ${question.selectedId ? "" : "disabled"}>Submit answer</button><button class="btn btn-quiet" type="button" data-action="menu">Save & return to menu</button></div>`}
      </div>
      ${isBasa ? `<p class="small muted center" style="margin-top:12px">Mistakes never take away coins. Take your time—your passage is here whenever you need it.</p>` : ""}
    </section>`;
  }

  function renderVictory() {
    const entries = game?.earned || [];
    const total = entries.reduce((sum, item) => sum + item.amount, 0);
    return `<section class="screen panel panel-pad center victory-panel">
      <div class="hero-emblem" aria-hidden="true">✦</div><div class="eyebrow">QUESTAR • VICTORY!</div><h1 class="hero-glow">The lantern shines brighter</h1>
      <p class="muted">You defeated ${escapeHtml(game?.mode === "basa" ? getStory(game.storyId)?.monster || "the story monster" : game?.monsterName || "the challenge monster")} through practice and persistence.</p>
      <div class="grid grid-two" style="max-width:680px;margin:22px auto">
        <div class="stat-card"><strong>+${total} 🪙</strong><span>Actual coins earned this session</span></div>
        <div class="stat-card"><strong>${currentProfile().coins} 🪙</strong><span>Updated shared wallet balance</span></div>
        <div class="stat-card"><strong>${game?.correctCount || 0}</strong><span>Correct answers</span></div>
        <div class="stat-card"><strong>${game?.earned.filter((item) => item.label.includes("streak")).reduce((sum, item) => sum + item.amount, 0) || 0} 🪙</strong><span>Streak bonus earned</span></div>
        <div class="stat-card"><strong>25 × 4 = 100</strong><span>Illustrative math example only</span></div>
        <div class="stat-card"><strong>50 🪙</strong><span>Illustrative attack reward only</span></div>
        <div class="stat-card"><strong>170 🪙</strong><span>Illustrative sample total only</span></div>
      </div>
      <p class="small muted">The example values (50 attack coins; 25 × 4 = 100; 170 total) are illustrative only, not added to your wallet. Your actual rewards above follow your settings and protected reward history.</p>
      <div class="actions"><button class="btn btn-primary" type="button" data-action="continue-victory">CONTINUE</button><button class="btn" type="button" data-action="dashboard">View progress</button></div>
    </section>`;
  }

  function renderDefeat() {
    const isBasa = game?.mode === "basa";
    return `<section class="screen panel panel-pad center">
      <div class="hero-emblem" aria-hidden="true">🏮</div><div class="eyebrow">A pause in the adventure</div><h1 class="serif">The path is still yours</h1>
      <p class="muted">${isBasa ? "Your lantern needs a moment to recharge. Mistakes did not take any coins, and every answer helped you practice." : "This round is over, but each attempt builds your skill. Review the explanation and try again when you're ready."}</p>
      <div class="notice support">${isBasa ? `You used your three lives. Take a breath, revisit the story, and return whenever you're ready.` : "Your progress and shared wallet are safe. No correct-answer reward was granted for missed questions."}</div>
      <div class="actions"><button class="btn btn-primary" type="button" data-action="retry">Try this challenge again</button><button class="btn" type="button" data-action="${isBasa ? "stories" : "categories"}">Choose another ${isBasa ? "story" : "challenge"}</button><button class="btn btn-quiet" type="button" data-action="menu">Return to menu</button></div>
    </section>`;
  }

  function renderCompletion() {
    const profile = currentProfile();
    return `<section class="screen panel panel-pad center">
      <div class="eyebrow">Quest record updated</div><h1 class="serif">A Chapter Completed</h1>
      <p class="muted">Your practice is part of the journey. Protected completion rewards are granted once; question practice can continue on future visits.</p>
      <div class="stats-strip">
        <div class="stat-card"><strong>${profile.completedStories.length}/${STORIES.length}</strong><span>BASA stories practiced</span></div>
        <div class="stat-card"><strong>${profile.completedMath.length}</strong><span>MATH rounds completed</span></div>
        <div class="stat-card"><strong>${profile.coins}</strong><span>Shared coins</span></div>
      </div>
      <div class="actions"><button class="btn btn-primary" type="button" data-action="${completedMode === "basa" ? "stories" : "categories"}">Continue learning</button><button class="btn" type="button" data-action="dashboard">Progress dashboard</button><button class="btn btn-quiet" type="button" data-action="menu">Main menu</button></div>
    </section>`;
  }

  function renderDashboard() {
    const p = currentProfile();
    if (!p) return renderEntry();
    const totalBasa = p.completedStories.length;
    const mathRounds = p.completedMath.length;
    const accuracy = p.totalAnswers ? Math.round(p.totalCorrect / p.totalAnswers * 100) : 0;
    const completedAchievementCount = p.achievements.length;
    return `<section class="screen">
      <div class="row spread"><div><div class="eyebrow">Your learning journey</div><h1 class="serif">Progress Dashboard</h1></div><span class="badge">🪙 ${p.coins} shared coins</span></div>
      <div class="stats-strip">
        <div class="stat-card"><strong>${totalBasa}/${STORIES.length}</strong><span>BASA stories completed</span></div>
        <div class="stat-card"><strong>${mathRounds}</strong><span>MATH rounds completed</span></div>
        <div class="stat-card"><strong>${accuracy}%</strong><span>Overall accuracy</span></div>
      </div>
      <section class="panel panel-pad" style="margin-top:18px"><h2 class="serif">Skills practiced</h2>
        <div class="stack">
          ${progressRow("BASA stories", totalBasa, STORIES.length)}
          ${progressRow("Math questions", p.mathCorrect, Math.max(10, Math.ceil(p.mathCorrect / 10) * 10))}
          ${progressRow("Correct answers", p.totalCorrect, Math.max(10, Math.ceil(p.totalCorrect / 10) * 10))}
          ${progressRow("Achievements", completedAchievementCount, ACHIEVEMENTS.length)}
        </div>
      </section>
      <div class="grid grid-two" style="margin-top:18px">
        <article class="card"><h2>Reading</h2><p>${p.basaCorrect} correct comprehension answers · ${totalBasa} stories practiced.</p></article>
        <article class="card"><h2>Mathematics</h2><p>${p.mathCorrect} correct math answers · current streak ${p.currentStreak} · best streak ${p.bestStreak}.</p></article>
      </div>
      <div class="actions"><button class="btn btn-primary" type="button" data-action="mode-select">Keep learning</button><button class="btn" type="button" data-action="profile">View profile</button><button class="btn btn-quiet" type="button" data-action="menu">Menu</button></div>
    </section>`;
  }

  function progressRow(label, current, total) {
    const percent = total ? Math.min(100, Math.round(current / total * 100)) : 0;
    return `<div class="progress-row"><span>${label}</span><div class="progress-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current}"><span style="width:${percent}%"></span></div><strong>${percent}%</strong></div>`;
  }

  function renderProfile() {
    const p = currentProfile();
    if (!p) return renderEntry();
    const accuracy = p.totalAnswers ? Math.round(p.totalCorrect / p.totalAnswers * 100) : 0;
    return `<section class="screen"><div class="eyebrow">Local adventurer card</div><h1 class="serif">Player Profile</h1>
      <div class="panel panel-pad">
        <div class="row"><span style="font-size:3.5rem">${escapeHtml(p.profile.avatar)}</span><div><h2>${escapeHtml(p.profile.name)}</h2><p class="muted">${escapeHtml(p.profile.grade)} · ${difficultyName(p.profile.difficulty)}</p></div><span class="badge push">🪙 ${p.coins}</span></div>
        <div class="stats-strip">
          <div class="stat-card"><strong>${p.completedQuests.length}</strong><span>Quests completed</span></div>
          <div class="stat-card"><strong>${p.completedStories.length}</strong><span>BASA stories</span></div>
          <div class="stat-card"><strong>${p.completedMath.length}</strong><span>MATH rounds</span></div>
          <div class="stat-card"><strong>${p.totalCorrect}</strong><span>Correct answers</span></div>
          <div class="stat-card"><strong>${p.currentStreak} / ${p.bestStreak}</strong><span>Current / best streak</span></div>
          <div class="stat-card"><strong>${accuracy}%</strong><span>Answer accuracy</span></div>
        </div>
      </div>
      <form id="profile-preferences-form" class="panel panel-pad" style="margin-top:18px">
        <h2 class="serif">Update preferences</h2><div class="field-grid">
          <div class="field"><label for="edit-grade">Grade level</label><select id="edit-grade" name="grade">${Array.from({ length: 6 }, (_, index) => `Grade ${index + 7}`).map((grade) => `<option ${p.profile.grade === grade ? "selected" : ""}>${grade}</option>`).join("")}</select></div>
          <div class="field"><label for="edit-difficulty">Difficulty</label><select id="edit-difficulty" name="difficulty"><option value="easy" ${p.profile.difficulty === "easy" ? "selected" : ""}>Grade 7–8 · Easy</option><option value="hard" ${p.profile.difficulty === "hard" ? "selected" : ""}>Grade 9–10 · Hard</option><option value="ultra" ${p.profile.difficulty === "ultra" ? "selected" : ""}>Grade 11–12 · Ultra</option></select></div>
        </div><div class="actions"><button class="btn btn-primary" type="submit">Save preferences</button></div>
      </form>
      <p class="small muted" style="margin-top:14px">Local profiles are stored in this browser. They are not verified accounts and do not sync across browsers or devices.</p>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  const ACHIEVEMENTS = [
    { id: "first-steps", title: "First Steps", icon: "👣", description: "Complete your first learning activity.", test: (p) => p.completedStories.length + p.completedMath.length >= 1 },
    { id: "book-explorer", title: "Book Explorer", icon: "📚", description: "Practice three different BASA stories.", test: (p) => p.completedStories.length >= 3 },
    { id: "reading-champion", title: "Reading Champion", icon: "🔎", description: "Answer ten BASA questions correctly.", test: (p) => p.basaCorrect >= 10 },
    { id: "math-adventurer", title: "Math Adventurer", icon: "🧮", description: "Answer ten math questions correctly.", test: (p) => p.mathCorrect >= 10 },
    { id: "streak-master", title: "Streak Master", icon: "🔥", description: "Reach a best streak of five correct answers.", test: (p) => p.bestStreak >= 5 },
    { id: "monster-slayer", title: "Monster Slayer", icon: "🐉", description: "Defeat a challenge monster.", test: (p) => p.defeatedMonsters.length >= 1 },
    { id: "quest-champion", title: "Quest Champion", icon: "🏆", description: "Complete five learning rounds.", test: (p) => p.completedStories.length + p.completedMath.length >= 5 }
  ];

  function renderAchievements() {
    const p = currentProfile();
    return `<section class="screen"><div class="eyebrow">Every step counts</div><h1 class="serif">Achievements</h1><p class="muted">Unlocked achievements are saved once per local profile. Keep practicing at your own pace.</p>
      <div class="grid grid-two">${ACHIEVEMENTS.map((item) => {
        const unlocked = p.achievements.includes(item.id);
        return `<article class="card"><div class="row spread"><span class="card-icon">${item.icon}</span><span class="badge">${unlocked ? "✓ Unlocked" : "In progress"}</span></div><h2>${item.title}</h2><p>${item.description}</p></article>`;
      }).join("")}</div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  function renderSettings() {
    const p = currentProfile();
    if (!p) return renderEntry();
    const s = p.settings;
    return `<section class="screen"><div class="eyebrow">Make the realm comfortable</div><h1 class="serif">Settings</h1>
      <form id="settings-form" class="panel panel-pad stack">
        <h2>Sound & music</h2>
        <label class="check-line"><input type="checkbox" name="soundEffects" ${s.soundEffects ? "checked" : ""}> Sound effects</label>
        <label class="check-line"><input type="checkbox" name="backgroundMusic" ${s.backgroundMusic ? "checked" : ""}> Background music</label>
        <div class="field-grid audio-volume-grid">
          ${volumeField("Master volume", "masterVolume", s.masterVolume)}
          ${volumeField("Sound effects volume", "effectsVolume", s.effectsVolume)}
          ${volumeField("Music volume", "musicVolume", s.musicVolume)}
        </div>
        <p class="field-help">Original synthesized fantasy audio starts after your first interaction. Your sound preferences are saved with this local profile.</p>
        <div class="divider"></div>
        <h2>Accessibility & display</h2>
        <label class="check-line"><input type="checkbox" name="animations" ${s.animations ? "checked" : ""}> Enable subtle animations</label>
        <label class="check-line"><input type="checkbox" name="reducedMotion" ${s.reducedMotion ? "checked" : ""}> Prefer reduced motion</label>
        <label class="check-line"><input type="checkbox" name="largeText" ${s.largeText ? "checked" : ""}> Use larger text</label>
        <div class="divider"></div><h2>Reward rules</h2>
        <p class="field-help">These values affect future rewards. Wrong BASA answers never remove coins. Protected story, quest, and achievement rewards are one-time per profile; correct answer rewards are protected once per stable question ID.</p>
        <div class="field-grid">
          ${rewardField("Reading completion", "reading", s.rewards.reading)}
          ${rewardField("Correct BASA answer", "basaCorrect", s.rewards.basaCorrect)}
          ${rewardField("Correct MATH answer", "mathCorrect", s.rewards.mathCorrect)}
          ${rewardField("Quest completion", "quest", s.rewards.quest)}
          ${rewardField("Monster defeat", "monster", s.rewards.monster)}
          ${rewardField("Achievement unlock", "achievement", s.rewards.achievement)}
          <div class="field"><label for="streak-threshold">Streak bonus threshold</label><input id="streak-threshold" name="streakThreshold" type="number" min="2" max="20" value="${s.streakThreshold}" required></div>
          <div class="field"><label for="streak-bonus">Streak bonus coins</label><input id="streak-bonus" name="streakBonus" type="number" min="0" max="500" value="${s.streakBonus}" required></div>
        </div>
        <div class="actions"><button class="btn btn-primary" type="submit">Save settings</button></div>
      </form>
      <section class="panel panel-pad" style="margin-top:18px"><h2>Local progress and privacy</h2><p class="muted">Progress is stored in this browser's localStorage. Browser data can be cleared, and data does not sync across devices. This client-side prototype is not a secure account or production score validation system.</p><button class="btn btn-danger" type="button" data-action="reset">Reset this local profile's progress</button></section>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  function rewardField(label, name, value) {
    return `<div class="field"><label for="reward-${name}">${label} · coins</label><input id="reward-${name}" name="${name}" type="number" min="0" max="1000" value="${value}" required></div>`;
  }

  function volumeField(label, name, value) {
    const percent = Math.round(value * 100);
    return `<div class="field"><label for="${name}">${label} · <output id="${name}-value" for="${name}">${percent}%</output></label><input id="${name}" name="${name}" type="range" min="0" max="1" step="0.05" value="${value}"></div>`;
  }

  const DEMO_PLAYERS = [
    { name: "Sample player • Tala", avatar: "🌟", score: 920, progress: 82 },
    { name: "Sample player • Kiko", avatar: "🦊", score: 760, progress: 68 },
    { name: "Sample player • Amihan", avatar: "🦉", score: 610, progress: 54 }
  ];

  function renderLeaderboard() {
    const p = currentProfile();
    const players = [...DEMO_PLAYERS, { name: `${p.profile.name} · this browser`, avatar: p.profile.avatar, score: p.score, progress: Math.min(100, Math.round(p.totalCorrect / 20 * 100)) }].sort((a, b) => b.score - a.score);
    return `<section class="screen"><div class="eyebrow">Offline demonstration data</div><h1 class="serif">Weekly Leaderboard</h1>
      <div class="notice warm">These sample rankings are local prototype data, not a live or shared online leaderboard.</div>
      <div class="panel panel-pad" style="margin-top:16px"><h2>Sample weekly scores</h2>${players.map((player, index) => `<div class="list-row"><span class="rank">#${index + 1}</span><span>${player.avatar}</span><strong>${escapeHtml(player.name)}</strong><span class="push badge">${player.score} pts</span></div>`).join("")}</div>
      <div class="grid grid-two" style="margin-top:18px">
        <article class="card"><h2>My Barkada • Tutor Dashboard</h2><p>Example group members and progress, shown only on this device.</p><div class="list-row"><span>🦋</span><strong>Sample member • Nami</strong><span class="push">76%</span></div><div class="list-row"><span>🐢</span><strong>Sample member • Santi</strong><span class="push">61%</span></div><div class="list-row"><span>🌿</span><strong>You · ${escapeHtml(p.profile.name)}</strong><span class="push">${Math.min(100, Math.round(p.totalCorrect / 20 * 100))}%</span></div><button class="btn btn-primary" type="button" data-action="barkada" style="margin-top:14px">Open Barkada dashboard</button></article>
        <article class="card"><h2>Current local score</h2><p>Your score is stored only in this browser profile.</p><div class="stat-card"><strong>${p.score} points</strong><span>Best score: ${p.bestScore}</span></div><p class="small muted" style="margin-top:12px">Real shared rankings and group battles require a backend, secure authentication, server-side score validation, synchronization, and student privacy protections.</p></article>
      </div>
      <div class="actions"><button class="btn btn-quiet" type="button" data-action="menu">Back to menu</button></div>
    </section>`;
  }

  function renderBarkada() {
    const p = currentProfile();
    return `<section class="screen panel panel-pad">
      <div class="eyebrow">Local group dashboard</div><h1 class="serif">My Barkada • Tutor Dashboard</h1>
      <p class="muted">Sample classmates and percentages are demonstration data. This offline prototype does not connect to real classmates or a tutor.</p>
      ${[
        ["🌟", "Sample member • Tala", 82],
        ["🦊", "Sample member • Kiko", 68],
        ["🦉", "Sample member • Amihan", 54],
        [p.profile.avatar, `${p.profile.name} · this browser`, Math.min(100, Math.round(p.totalCorrect / 20 * 100))]
      ].map(([avatar, name, progress]) => `<div class="list-row"><span>${avatar}</span><strong>${escapeHtml(name)}</strong><div class="progress-track push" style="width:min(36%,220px)"><span style="width:${progress}%"></span></div><span>${progress}%</span></div>`).join("")}
      <div class="actions"><button class="btn btn-primary" type="button" data-action="group-battle">Start Group Battle</button><button class="btn btn-quiet" type="button" data-action="leaderboard">Back to leaderboard</button></div>
    </section>`;
  }

  function renderGroupResult() {
    return `<section class="screen panel panel-pad center"><div class="eyebrow">Local simulation complete</div><h1 class="serif">Barkada Battle</h1><p class="muted">${escapeHtml(groupResult)}</p><div class="notice warm">This simulated result uses sample local records only. No scores were sent online.</div><div class="actions"><button class="btn btn-primary" type="button" data-action="barkada">View group dashboard</button><button class="btn" type="button" data-action="leaderboard">Leaderboard</button></div></section>`;
  }

  function currentQuestion() {
    return game?.questions[game.questionIndex] || null;
  }

  function reportLearningActivity(type, values = {}) {
    window.dispatchEvent(new CustomEvent("questar:activity", {
      detail: {
        type,
        mode: Object.prototype.hasOwnProperty.call(values, "mode") ? values.mode : game?.mode || null,
        score: Number.isFinite(values.score) ? values.score : null,
        coins: Number.isInteger(values.coins) ? values.coins : null,
        durationSeconds: Number.isInteger(values.durationSeconds) ? values.durationSeconds : null,
        details: values.details || {}
      }
    }));
  }

  function shuffled(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function beginBasa(storyId) {
    const story = getStory(storyId);
    if (!story) return;
    selectedStoryId = storyId;
    const q = story.questions.map((item, index) => ({
      id: `${story.id}-q${index + 1}`,
      prompt: item.prompt,
      explanation: item.explanation,
      choices: shuffled(item.choices.map((label, choiceIndex) => ({ id: `${story.id}-q${index + 1}-c${choiceIndex}`, value: choiceIndex, label }))),
      correctId: `${story.id}-q${index + 1}-c${item.answer}`,
      selectedId: "",
      submitted: false,
      wasCorrect: false,
      feedback: ""
    }));
    game = { mode: "basa", storyId, questions: q, questionIndex: 0, health: 2, maxHealth: 2, lives: 3, earned: [], correctCount: 0, terminal: false, category: "", startedAt: Date.now() };
    reportLearningActivity("quiz_attempted", { mode: "basa" });
    playSfx("quest");
    const profile = currentProfile();
    claimReward(`read:${story.id}`, profile.settings.rewards.reading, "Reading completion", game);
    save();
    go("battle");
  }

  function beginMath(category) {
    if (!CATEGORIES.includes(category)) return;
    const questions = Array.from({ length: 6 }, (_, index) => generateMathQuestion(category, index));
    if (questions.some((question) => !validateMathQuestion(question))) {
      showToast("A challenge could not be validated. Please choose another category.");
      return;
    }
    game = { mode: "math", category, questions, questionIndex: 0, health: 3, maxHealth: 3, lives: null, monsterName: randomMonster(), monsterIcon: "🐲", earned: [], correctCount: 0, terminal: false, startedAt: Date.now() };
    reportLearningActivity("quiz_attempted", { mode: "math" });
    playSfx("quest");
    currentProfile().currentStreak = currentProfile().currentStreak || 0;
    save();
    go("battle");
  }

  function randomMonster() {
    return ["The Number Drake", "The Fraction Phantom", "The Riddle Golem", "The Decimal Imp"][Math.floor(Math.random() * 4)];
  }

  function timerForDifficulty(difficulty) {
    return difficulty === "hard" ? 60 : difficulty === "ultra" ? 50 : 0;
  }

  function startTimer() {
    clearTimer();
    if (!game || currentQuestion()?.submitted) return;
    const limit = timerForDifficulty(currentProfile().profile.difficulty);
    if (!limit) return;
    if (!Number.isInteger(game.timeLeft)) game.timeLeft = limit;
    activeTimer = window.setInterval(() => {
      if (!game || currentQuestion()?.submitted) return clearTimer();
      game.timeLeft = Math.max(0, game.timeLeft - 1);
      const display = document.getElementById("timer-display");
      if (display) display.textContent = `⏱ ${game.timeLeft}s`;
      if (game.timeLeft <= 0) {
        clearTimer();
        submitAnswer(null, true);
      }
    }, 1000);
  }

  function clearTimer() {
    if (activeTimer) window.clearInterval(activeTimer);
    activeTimer = null;
  }

  function selectAnswer(id) {
    const question = currentQuestion();
    if (!question || question.submitted || !question.choices.some((choice) => choice.id === id)) return;
    if (question.selectedId !== id) playSfx("select");
    question.selectedId = id;
    save();
    render();
  }

  function submitAnswer(choiceId, timedOut = false) {
    const question = currentQuestion();
    const profile = currentProfile();
    if (!question || question.submitted || game.terminal) return;
    if (!timedOut && !question.selectedId) return;
    if (choiceId && question.selectedId !== choiceId) question.selectedId = choiceId;
    clearTimer();
    question.submitted = true;
    question.wasCorrect = !timedOut && question.selectedId === question.correctId;
    playSfx(question.wasCorrect ? "correct" : "wrong");
    reportLearningActivity(question.wasCorrect ? "answer_correct" : "answer_incorrect", {
      score: question.wasCorrect ? currentProfile().score + 10 : currentProfile().score
    });
    profile.totalAnswers += 1;
    if (question.wasCorrect) {
      game.correctCount += 1;
      profile.totalCorrect += 1;
      profile.score += 10;
      profile.bestScore = Math.max(profile.bestScore, profile.score);
      game.health = Math.max(0, game.health - 1);
      if (game.mode === "basa") {
        profile.basaCorrect += 1;
        claimReward(`answer:${question.id}`, profile.settings.rewards.basaCorrect, "BASA answer", game);
        question.feedback = `Great detail-finding! ${game.lives} ${game.lives === 1 ? "life" : "lives"} remain.`;
      } else {
        profile.mathCorrect += 1;
        claimReward(`answer:${question.id}`, profile.settings.rewards.mathCorrect, "MATH answer", game);
        profile.currentStreak += 1;
        profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);
        const threshold = Math.max(2, profile.settings.streakThreshold);
        if (profile.currentStreak % threshold === 0) claimReward(`streak:${question.id}`, profile.settings.streakBonus, "streak bonus", game);
        question.feedback = "Correct! Your calculation damages the monster and moves your streak forward.";
      }
      question.explanation = question.explanation || question.mathExplanation;
      unlockAchievements();
      question.feedback += game.mode === "basa" ? " The story clue supports your answer." : "";
    } else {
      if (game.mode === "basa") {
        game.lives = Math.max(0, game.lives - 1);
        question.feedback = game.lives === 0
          ? "Take a breath. Your three lives are used for this round; you can revisit the passage and try again."
          : game.lives === 1 ? "You have 1 life left. You can still do this! Take a breath and look for the story detail."
            : `You have ${game.lives} lives left. You're learning—read the story clue again when you're ready.`;
      } else {
        profile.currentStreak = 0;
        const correct = question.choices.find((choice) => choice.id === question.correctId);
        question.feedback = timedOut ? `Time is up for this question. The answer was ${correct?.label}. A fresh challenge is ready when you are.` : `Good try. The answer is ${correct?.label}. Review the steps, then keep practicing.`;
        profile.score = Math.max(0, profile.score);
      }
      question.explanation = question.explanation || question.mathExplanation;
    }
    if ((game.mode === "basa" && game.lives <= 0) || game.health <= 0) {
      game.terminal = true;
      if (game.health <= 0) finishVictory();
      else finishDefeat();
    } else if (game.mode === "math" && game.questionIndex >= game.questions.length - 1 && !question.wasCorrect) {
      game.terminal = true;
      finishDefeat();
    }
    save();
    render();
  }

  function nextQuestion() {
    if (!game || !currentQuestion()?.submitted) return;
    if (game.terminal) {
      go(game.health <= 0 ? "victory" : "defeat");
      return;
    }
    if (game.questionIndex < game.questions.length - 1) game.questionIndex += 1;
    else if (game.mode === "basa") {
      const source = game.questions[game.questionIndex % 3];
      game.questions.push({
        ...source,
        choices: shuffled(source.choices),
        selectedId: "",
        submitted: false,
        wasCorrect: false,
        feedback: ""
      });
      game.questionIndex += 1;
    }
    else {
      game.terminal = true;
      finishDefeat();
      go("defeat");
      return;
    }
    playSfx("next");
    game.timeLeft = undefined;
    save();
    render();
  }

  function claimReward(id, amount, label, activeGame = game) {
    const profile = currentProfile();
    const reward = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    if (!profile || profile.claimedRewards.includes(id) || reward <= 0) return 0;
    profile.claimedRewards.push(id);
    profile.coins = Math.max(0, profile.coins + reward);
    if (activeGame) activeGame.earned.push({ id, amount: reward, label });
    reportLearningActivity("coins_earned", { coins: reward });
    playSfx("coin", reward);
    return reward;
  }

  function unlockAchievements() {
    const profile = currentProfile();
    for (const achievement of ACHIEVEMENTS) {
      if (!profile.achievements.includes(achievement.id) && achievement.test(profile)) {
        profile.achievements.push(achievement.id);
        claimReward(`achievement:${achievement.id}`, profile.settings.rewards.achievement, `achievement: ${achievement.title}`, game);
        reportLearningActivity("achievement_unlocked", { details: { achievement_id: achievement.id } });
        playSfx("achievement");
        showToast(`Achievement unlocked: ${achievement.title}`);
      }
    }
  }

  function finishVictory() {
    if (!game || game.victoryHandled) return;
    game.victoryHandled = true;
    playSfx("victory");
    const profile = currentProfile();
    const activityId = game.mode === "basa" ? game.storyId : game.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    profile.completedQuests = [...new Set([...profile.completedQuests, `${game.mode}:${activityId}`])];
    if (game.mode === "basa") profile.completedStories = [...new Set([...profile.completedStories, game.storyId])];
    if (game.mode === "math") profile.completedMath.push(`${activityId}:${Date.now()}`);
    profile.defeatedMonsters = [...new Set([...profile.defeatedMonsters, `${game.mode}:${activityId}`])];
    claimReward(`quest:${game.mode}:${activityId}`, profile.settings.rewards.quest, "quest completion", game);
    claimReward(`monster:${game.mode}:${activityId}`, profile.settings.rewards.monster, "monster defeat", game);
    unlockAchievements();
    profile.activeGame = null;
    const durationSeconds = Number.isFinite(game.startedAt)
      ? Math.max(0, Math.floor((Date.now() - game.startedAt) / 1000))
      : null;
    reportLearningActivity("quiz_completed", { score: game.correctCount, durationSeconds });
    reportLearningActivity(game.mode === "basa" ? "reading_completed" : "math_completed", { durationSeconds });
    reportLearningActivity("quest_completed", { durationSeconds, details: { activity_id: activityId } });
  }

  function finishDefeat() {
    if (game) {
      playSfx("defeat");
      currentProfile().activeGame = null;
    }
  }

  function continueVictory() {
    playSfx("complete");
    screen = "completion";
    const mode = game?.mode;
    game = null;
    save();
    screen = "completion";
    completedMode = mode || "basa";
    render();
  }

  let completedMode = "basa";

  function generateMathQuestion(category, index) {
    const difficulty = currentProfile().profile.difficulty;
    const scale = difficulty === "easy" ? 10 : difficulty === "hard" ? 30 : 80;
    const id = `math-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index}`;
    let prompt;
    let answer;
    let display;
    let distractors = [];
    let explanation;
    if (category === "Addition") {
      const a = rand(2, scale), b = rand(2, scale);
      prompt = `${a} + ${b} = ?`; answer = a + b; display = String(answer); distractors = [answer + 2, answer - 1, answer + 10]; explanation = `${a} + ${b} = ${answer}.`;
    } else if (category === "Subtraction") {
      const a = rand(scale, scale * 2), b = rand(1, a);
      prompt = `${a} − ${b} = ?`; answer = a - b; display = String(answer); distractors = [answer + 2, Math.max(0, answer - 3), answer + 10]; explanation = `${a} − ${b} = ${answer}.`;
    } else if (category === "Multiplication") {
      const max = difficulty === "easy" ? 12 : difficulty === "hard" ? 25 : 50;
      const a = rand(2, max), b = rand(2, difficulty === "easy" ? 12 : 20);
      prompt = `${a} × ${b} = ?`; answer = a * b; display = String(answer); distractors = [answer + a, answer - b, a + b]; explanation = `${a} × ${b} = ${answer}.`;
    } else if (category === "Division") {
      const divisor = rand(2, difficulty === "easy" ? 12 : 20);
      const quotient = rand(2, difficulty === "easy" ? 12 : 30);
      const dividend = divisor * quotient;
      prompt = `${dividend} ÷ ${divisor} = ?`; answer = quotient; display = String(answer); distractors = [answer + 2, Math.max(1, answer - 1), answer * 2]; explanation = `${dividend} ÷ ${divisor} = ${quotient}; the divisor is not zero.`;
    } else if (category === "Fractions") {
      const denominator = rand(3, 10);
      const first = rand(1, denominator - 1);
      const second = rand(1, denominator - first);
      const numerator = first + second;
      const gcdValue = gcd(numerator, denominator);
      const reduced = `${numerator / gcdValue}/${denominator / gcdValue}`;
      prompt = `What is ${first}/${denominator} + ${second}/${denominator}?`; answer = reduced; display = reduced;
      distractors = [`${Math.max(1, numerator - 1)}/${denominator}`, `${numerator}/${denominator + 1}`, `${Math.min(denominator, numerator + 1)}/${denominator}`];
      explanation = `${first}/${denominator} + ${second}/${denominator} = ${numerator}/${denominator}, which simplifies to ${reduced}.`;
    } else if (category === "Decimals") {
      const centsA = rand(25, 950), centsB = rand(10, 450);
      const cents = centsA + centsB;
      answer = cents / 100;
      display = answer.toFixed(2);
      prompt = `$${(centsA / 100).toFixed(2)} + $${(centsB / 100).toFixed(2)} = ?`;
      distractors = [((cents + 10) / 100).toFixed(2), (Math.max(0, cents - 25) / 100).toFixed(2), ((cents + 100) / 100).toFixed(2)];
      explanation = `Add the cents: $${(centsA / 100).toFixed(2)} + $${(centsB / 100).toFixed(2)} = $${display}.`;
    } else if (category === "Mixed operations") {
      const a = rand(2, 12), b = rand(2, 8), c = rand(1, 15);
      prompt = `${a} + ${b} × ${c} = ?`; answer = a + b * c; display = String(answer);
      distractors = [(a + b) * c, answer + b, Math.max(0, answer - c)];
      explanation = `Multiply first: ${b} × ${c} = ${b * c}; then add ${a} to get ${answer}.`;
    } else {
      const packs = rand(3, difficulty === "easy" ? 8 : 20);
      const pencilsPerPack = rand(4, difficulty === "easy" ? 12 : 24);
      const donated = rand(1, Math.max(1, Math.floor(packs * pencilsPerPack / 3)));
      answer = packs * pencilsPerPack - donated;
      display = String(answer);
      prompt = `A class has ${packs} packs of ${pencilsPerPack} pencils and donates ${donated}. How many remain?`;
      distractors = [answer + donated, packs + pencilsPerPack - donated, Math.max(0, answer - pencilsPerPack)];
      explanation = `${packs} × ${pencilsPerPack} = ${packs * pencilsPerPack}; subtract ${donated} to get ${answer}.`;
    }
    const formatter = (value) => {
      if (category === "Fractions") return String(value);
      if (category === "Decimals") return Number(value).toFixed(2);
      return String(Math.round(Number(value)));
    };
    const correctValue = formatter(answer);
    const distinct = [correctValue];
    const distinctKeys = new Set([mathValueKey(category, correctValue)]);
    distractors.map(formatter).forEach((value) => {
      const key = mathValueKey(category, value);
      if (!distinctKeys.has(key)) {
        distinct.push(value);
        distinctKeys.add(key);
      }
    });
    let bump = 1;
    while (distinct.length < 4) {
      const fractionParts = category === "Fractions" ? String(answer).split("/") : [];
      const fallback = category === "Fractions"
        ? `${Number(fractionParts[0]) + bump}/${fractionParts[1]}`
        : formatter(Number(answer) + (category === "Decimals" ? bump / 100 : bump));
      const key = mathValueKey(category, fallback);
      if (!distinctKeys.has(key)) {
        distinct.push(fallback);
        distinctKeys.add(key);
      }
      bump += 1;
    }
    const choiceObjects = shuffled(distinct.slice(0, 4).map((value, choiceIndex) => ({
      id: `${id}-choice-${choiceIndex}`,
      value,
      label: category === "Decimals" ? `$${Number(value).toFixed(2)}` : String(value)
    })));
    const answerChoice = choiceObjects.find((choice) => mathValueKey(category, choice.value) === mathValueKey(category, correctValue));
    return { id, prompt, choices: choiceObjects, correctId: answerChoice?.id || "", expectedValue: correctValue, selectedId: "", submitted: false, wasCorrect: false, feedback: "", mathExplanation: explanation, category };
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function gcd(a, b) {
    return b ? gcd(b, a % b) : Math.abs(a);
  }

  function mathValueKey(category, value) {
    if (category === "Decimals") return Number(value).toFixed(2);
    if (category === "Fractions") {
      const [numerator, denominator] = String(value).split("/").map(Number);
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return String(value);
      const divisor = gcd(numerator, denominator);
      return `${numerator / divisor}/${denominator / divisor}`;
    }
    return String(Number(value));
  }

  function validateMathQuestion(question) {
    if (!question || !question.prompt || !Array.isArray(question.choices) || question.choices.length !== 4) return false;
    const ids = question.choices.map((choice) => choice.id);
    const values = question.choices.map((choice) => mathValueKey(question.category, choice.value));
    if (new Set(ids).size !== 4 || new Set(values).size !== 4) return false;
    if (!question.choices.some((choice) => choice.id === question.correctId)) return false;
    if (question.category === "Division" && /÷\s*0(?:\s|=)/.test(question.prompt)) return false;
    const correct = question.choices.find((choice) => choice.id === question.correctId);
    if (!correct || mathValueKey(question.category, correct.value) !== mathValueKey(question.category, question.expectedValue)) return false;
    if (question.choices.filter((choice) => mathValueKey(question.category, choice.value) === mathValueKey(question.category, question.expectedValue)).length !== 1) return false;
    if (question.category === "Decimals" && !Number.isFinite(Number(correct.value))) return false;
    if (question.category === "Fractions") {
      const [n, d] = String(correct.value).split("/").map(Number);
      if (!Number.isInteger(n) || !Number.isInteger(d) || d <= 0) return false;
    }
    return true;
  }

  let selectedAvatarForForm = AVATARS[0];

  document.addEventListener("pointerdown", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    unlockAudio();
    const action = target.dataset.action;
    if (action === "toggle-sound") {
      const profile = currentProfile();
      if (!profile) return;
      profile.settings.audioMuted = !profile.settings.audioMuted;
      save();
      applyAudioVolumes();
      if (!profile.settings.audioMuted) playSfx("select");
      return;
    }
    if (!["select-choice", "submit-answer", "next-question", "start-basa", "start-math", "retry", "continue-victory"].includes(action)) {
      playSfx("select");
    }
    if (action === "home" || action === "opening") go("opening");
    else if (action === "entry") go("entry");
    else if (action === "new-profile") { selectedAvatarForForm = AVATARS[0]; go("create-profile"); }
    else if (action === "avatar") { selectedAvatarForForm = target.dataset.avatar; render(); }
    else if (action === "guest") enterGuest();
    else if (action === "select-profile") selectProfile(target.dataset.id);
    else if (action === "resume" || action === "menu") go(currentProfile() ? "menu" : "opening");
    else if (action === "resume-battle") { if (game) go("battle"); else go("mode-select"); }
    else if (action === "quest") { questChoice = ""; go("quest"); }
    else if (action === "quest-choice") { questChoice = target.dataset.choice; render(); }
    else if (action === "quest-continue") { currentProfile().completedQuests = [...new Set([...currentProfile().completedQuests, "quest:moonlit-classroom"] )]; reportLearningActivity("quest_completed", { mode: null, details: { activity_id: "moonlit-classroom" } }); save(); go("mode-select"); }
    else if (action === "mode-select") go("mode-select");
    else if (action === "choose-mode") { pendingMode = target.dataset.mode; go("difficulty"); }
    else if (action === "set-difficulty") {
      const mode = target.dataset.mode;
      setDifficulty(target.dataset.value);
      if (mode === "math") go("categories"); else go("stories");
    }
    else if (action === "stories") go("stories");
    else if (action === "read-story") { selectedStoryId = target.dataset.id; go("story-read"); }
    else if (action === "start-basa") beginBasa(target.dataset.id);
    else if (action === "categories") go("categories");
    else if (action === "start-math") beginMath(target.dataset.category);
    else if (action === "select-choice") selectAnswer(target.dataset.id);
    else if (action === "submit-answer") submitAnswer();
    else if (action === "next-question") nextQuestion();
    else if (action === "retry") {
      if (game?.mode === "basa") beginBasa(game.storyId);
      else beginMath(game?.category || "Addition");
    }
    else if (action === "continue-victory") continueVictory();
    else if (action === "dashboard" || action === "nav-dashboard") go(currentProfile() ? "dashboard" : "entry");
    else if (action === "profile") go("profile");
    else if (action === "achievements") go("achievements");
    else if (action === "settings" || action === "nav-settings") go(currentProfile() ? "settings" : "entry");
    else if (action === "leaderboard") go("leaderboard");
    else if (action === "barkada") go("barkada");
    else if (action === "group-battle") startGroupBattle();
    else if (action === "reset") resetProgress();
  });

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !["masterVolume", "effectsVolume", "musicVolume"].includes(input.name)) return;
    const output = document.getElementById(`${input.name}-value`);
    if (output) output.value = `${Math.round(Number(input.value) * 100)}%`;
    if (input.closest("[data-audio-controls]")) saveMenuAudioPreference(input);
  });

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.hasAttribute("data-audio-preference")) saveMenuAudioPreference(input);
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "profile-form") createProfile(event.target);
    else if (event.target.id === "profile-preferences-form") savePreferences(event.target);
    else if (event.target.id === "settings-form") saveSettings(event.target);
  });

  function enterGuest() {
    const guestId = "guest";
    if (!state.profiles[guestId]) state.profiles[guestId] = createProfileData("Guest", "🧭", "Grade 7", "easy");
    state.currentId = guestId;
    game = state.profiles[guestId].activeGame || null;
    save();
    go(game ? "battle" : "menu");
  }

  function createProfile(form) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim().replace(/\s+/g, " ");
    if (!name || name.length > 24) {
      showToast("Please choose a nickname between 1 and 24 characters.");
      return;
    }
    const id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    state.profiles[id] = createProfileData(name, selectedAvatarForForm, String(data.get("grade")), String(data.get("difficulty")));
    state.currentId = id;
    game = null;
    save();
    go("menu");
  }

  function selectProfile(id) {
    if (!state.profiles[id]) return showToast("That local profile could not be found.");
    state.currentId = id;
    game = state.profiles[id].activeGame || null;
    save();
    go(game ? "battle" : "menu");
  }

  function savePreferences(form) {
    const data = new FormData(form);
    currentProfile().profile.grade = String(data.get("grade"));
    currentProfile().profile.difficulty = String(data.get("difficulty"));
    save();
    showToast("Profile preferences saved.");
    render();
  }

  function saveSettings(form) {
    const data = new FormData(form);
    const p = currentProfile();
    const numberField = (name, min, max) => Math.min(max, Math.max(min, Math.floor(Number(data.get(name)) || 0)));
    const volumeFieldValue = (name, fallback) => clampVolume(Number(data.get(name)), fallback);
    p.settings.rewards = {
      reading: numberField("reading", 0, 1000),
      basaCorrect: numberField("basaCorrect", 0, 1000),
      mathCorrect: numberField("mathCorrect", 0, 1000),
      quest: numberField("quest", 0, 1000),
      monster: numberField("monster", 0, 1000),
      achievement: numberField("achievement", 0, 1000)
    };
    p.settings.streakThreshold = numberField("streakThreshold", 2, 20);
    p.settings.streakBonus = numberField("streakBonus", 0, 500);
    p.settings.animations = data.has("animations");
    p.settings.reducedMotion = data.has("reducedMotion");
    p.settings.largeText = data.has("largeText");
    p.settings.soundEffects = data.has("soundEffects");
    p.settings.backgroundMusic = data.has("backgroundMusic");
    p.settings.masterVolume = volumeFieldValue("masterVolume", DEFAULT_SETTINGS.masterVolume);
    p.settings.effectsVolume = volumeFieldValue("effectsVolume", DEFAULT_SETTINGS.effectsVolume);
    p.settings.musicVolume = volumeFieldValue("musicVolume", DEFAULT_SETTINGS.musicVolume);
    save();
    applyAudioVolumes();
    syncMusic(screen);
    showToast("Settings saved and applied.");
    render();
  }

  function saveMenuAudioPreference(input) {
    const profile = currentProfile();
    if (!profile) return;
    if (input.name === "soundEffects" || input.name === "backgroundMusic") {
      profile.settings[input.name] = input.checked;
    } else if (["masterVolume", "effectsVolume", "musicVolume"].includes(input.name)) {
      profile.settings[input.name] = clampVolume(Number(input.value), DEFAULT_SETTINGS[input.name]);
    } else {
      return;
    }
    save();
    applyAudioVolumes();
    syncMusic(screen);
  }

  function resetProgress() {
    const p = currentProfile();
    const name = p.profile.name;
    if (!window.confirm(`Reset all saved progress for ${name} in this browser? This cannot be undone.`)) return;
    const id = state.currentId;
    state.profiles[id] = createProfileData(name, p.profile.avatar, p.profile.grade, p.profile.difficulty);
    game = null;
    save();
    go("menu");
    showToast("This local profile's progress has been reset.");
  }

  function startGroupBattle() {
    const playerScore = currentProfile().score;
    const opponent = DEMO_PLAYERS[Math.floor(Math.random() * DEMO_PLAYERS.length)];
    const result = playerScore >= opponent.score ? "Your current local score is ahead of the selected sample opponent." : "The sample opponent is ahead today. A few more practice rounds can change your local score.";
    groupResult = `${result} You: ${playerScore} points · ${opponent.name}: ${opponent.score} points.`;
    go("group-result");
  }

  updateHeader();
  render();
})();
