const STORAGE_KEY = "forge_state_v7"; // New save version

const defaultState = {
  math: { level: 1, xp: 0, streak: 0, wrongStreak: 0 },
  german: { level: 1, xp: 0, streak: 0, wrongStreak: 0 },
  hero: { name: "Sir Bumble", strength: 1, dexterity: 1, intellect: 1 },
  discreet: false,
  sound: true,
  vibration: true,
  tutorialSeen: false,
  dungeon: { currentEnemy: 0 }
};

let state = JSON.parse(JSON.stringify(defaultState));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch (e) { console.log("Storage error", e); }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ SOUND & HAPTICS ============
let audioCtx = null;

function playBeep(type) {
  if (!state.sound) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) { console.log("Audio blocked by browser"); }
}

function vibrate(type) {
  if (!state.vibration || !navigator.vibrate) return;
  if (type === "success") navigator.vibrate(50);
  else navigator.vibrate([50, 50, 50]);
}

// ============ HERO STAT LOGIC ============
const MAX_STAT = 50; 

function modifyStat(statKey, amount, mode) {
  const oldVal = state.hero[statKey];
  let newVal = oldVal + amount;
  
  if (newVal > MAX_STAT) newVal = MAX_STAT;
  if (newVal < 1) newVal = 1;

  if (oldVal !== newVal) {
    state.hero[statKey] = newVal;
    saveState();
  }
  
  updateHeroUI(mode);
  return { oldVal, newVal, changed: oldVal !== newVal };
}

function updateHeroUI(mode) {
  // Update the name on both screens
  document.getElementById("mathHeroName").textContent = state.hero.name;
  document.getElementById("germanHeroName").textContent = state.hero.name;
  
  const ids = mode === "math" ? ["mathHeroStr", "mathHeroDex", "mathHeroInt"] : ["germanHeroStr", "germanHeroDex", "germanHeroInt"];
  document.getElementById(ids[0]).textContent = state.hero.strength;
  document.getElementById(ids[1]).textContent = state.hero.dexterity;
  document.getElementById(ids[2]).textContent = state.hero.intellect;
}

function highlightStat(mode, statKey, color) {
  let el;
  const prefix = mode === "math" ? "mathHero" : "germanHero";
  if (statKey === "strength") el = document.getElementById(prefix + "Str");
  if (statKey === "dexterity") el = document.getElementById(prefix + "Dex");
  if (statKey === "intellect") el = document.getElementById(prefix + "Int");
  
  if (el) {
    el.style.transition = "all 0.3s";
    el.style.transform = "scale(1.5)";
    el.style.color = color;
    el.style.textShadow = `0 0 10px ${color}`;
    setTimeout(() => {
      el.style.transform = "scale(1)"; el.style.color = "#e5e5e5"; el.style.textShadow = "none";
    }, 1500);
  }
}

function animateHero(mode, isSuccess) {
  const sprite = document.getElementById(mode + "HeroSprite");
  if (!sprite) return;
  if (isSuccess) { sprite.classList.add("hero-level-up"); setTimeout(() => sprite.classList.remove("hero-level-up"), 500); }
  else { sprite.classList.add("hero-damage"); setTimeout(() => sprite.classList.remove("hero-damage"), 400); }
}

function showRollText(mode, text) {
  const el = document.getElementById(mode + "RollText");
  if (el) el.textContent = text;
  setTimeout(() => { if (el) el.textContent = ""; }, 3800);
}

function handleCorrect(mode, statKey) {
  const result = modifyStat(statKey, 1, mode);
  playBeep("success");
  vibrate("success");
  
  if (result.newVal === MAX_STAT && result.oldVal === MAX_STAT) {
    showRollText(mode, `🏆 ${statKey.toUpperCase()} is already PERFECT (${MAX_STAT})!`);
    animateHero(mode, true);
    return;
  }
  
  if (result.changed) {
    showRollText(mode, `✅ ${statKey.toUpperCase()} increased! ${result.oldVal} → ${result.newVal}`);
    highlightStat(mode, statKey, "#4ade80");
    animateHero(mode, true);
    if (result.newVal === MAX_STAT) {
      setTimeout(() => alert(`🎉 PERFECT ${statKey.toUpperCase()}! You reached the max stat!`), 400);
    }
  }
}

function handleWrong(mode, statKey) {
  playBeep("error");
  vibrate("error");
  
  if (state.hero[statKey] <= 5) {
    showRollText(mode, `💥 Wrong! ${statKey.toUpperCase()} is too low to drop further.`);
    highlightStat(mode, statKey, "#ef4444");
    animateHero(mode, false);
    return;
  }
  
  const result = modifyStat(statKey, -1, mode);
  showRollText(mode, `💥 Wrong! ${statKey.toUpperCase()} decreased: ${result.oldVal} → ${result.newVal}`);
  highlightStat(mode, statKey, "#ef4444");
  animateHero(mode, false);
}

// ============ MATH LOGIC ============
let currentMath = null;
function newMathQuestion() {
  const qEl = document.getElementById("mathQuestion");
  if (!qEl) return;
  const level = state.math.level;
  let a, b, op, answer;
  const effectiveLevel = Math.max(1, level - state.math.wrongStreak);

  if (effectiveLevel <= 2) { a = rand(1, 9); b = rand(1, 9); op = "+"; answer = a + b; }
  else if (effectiveLevel <= 4) {
    if (Math.random() < 0.5) { a = rand(10, 49); b = rand(10, 49); op = "+"; answer = a + b; } 
    else { a = rand(10, 20); b = rand(1, a); op = "−"; answer = a - b; }
  } else if (effectiveLevel <= 6) { a = rand(2, 10); b = rand(2, 10); op = "×"; answer = a * b; }
  else { a = rand(20, 99); b = rand(1, 30); op = "−"; answer = a - b; }

  currentMath = { a, b, op, answer };
  qEl.textContent = `${a} ${op} ${b} = ?`;
  document.getElementById("mathAnswer").value = "";
  document.getElementById("mathFeedback").textContent = "";
}

function updateMathUI() {
  document.getElementById("mathLevel").textContent = state.math.level;
  document.getElementById("mathStreak").textContent = state.math.streak;
  document.getElementById("mathXp").textContent = state.math.xp;
  document.getElementById("mathXpFill").style.width = (state.math.xp * 10) + "%";
}

// ============ GERMAN LOGIC ============
let currentGerman = null;
let recentGermanPrompts = []; 
function pickFresh(array, prompt) {
  if (!recentGermanPrompts.includes(prompt)) recentGermanPrompts.push(prompt);
  if (recentGermanPrompts.length > 10) recentGermanPrompts.shift();
  let available = array.filter(item => !recentGermanPrompts.includes(item.prompt));
  if (available.length === 0) available = array;
  return available[Math.floor(Math.random() * available.length)];
}

function newGermanQuestion() {
  const promptEl = document.getElementById("germanPrompt");
  const optsEl = document.getElementById("germanOptions");
  if (!promptEl || !optsEl) return;

  document.getElementById("germanFeedback").textContent = "";
  optsEl.innerHTML = "";
  const level = state.german.level;

  let type = "word";
  if (level >= 5 && Math.random() < 0.4) type = "translate"; 
  else if (level >= 3 && Math.random() < 0.5) type = "fill";

  if (type === "word") {
    const poolSize = Math.min(GERMAN_WORDS.length, 15 + level * 8);
    const availableWords = GERMAN_WORDS.slice(0, poolSize).map(w => ({ prompt: w[0], answer: w[1] }));
    const chosen = pickFresh(availableWords, "word");
    const isDeToEn = Math.random() < 0.5;
    const prompt = isDeToEn ? chosen.prompt : chosen.answer;
    const correct = isDeToEn ? chosen.answer : chosen.prompt;
    const distractors = [];
    while (distractors.length < 3) {
      const other = availableWords[Math.floor(Math.random() * availableWords.length)];
      const candidate = isDeToEn ? other.answer : other.prompt;
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }
    currentGerman = { correct };
    promptEl.textContent = prompt;
    renderGermanOptions([correct, ...distractors]);
  } else if (type === "fill") {
    const fills = GERMAN_SENTENCES.filter(s => s.type === "fill").map(s => ({ prompt: s.de, answer: s.blank, en: s.en }));
    const chosen = pickFresh(fills, "fill");
    promptEl.innerHTML = `<div style="font-size:16px; color:#888; margin-bottom:8px;">${chosen.en}</div><div style="font-size:26px;">${chosen.prompt}</div>`;
    const correct = chosen.answer;
    const distractors = [];
    while (distractors.length < 3) {
      const other = GERMAN_WORDS[Math.floor(Math.random() * GERMAN_WORDS.length)][0];
      const cleanWord = other.replace(/^(der|die|das)\s/, '');
      if (cleanWord !== correct && !distractors.includes(cleanWord)) distractors.push(cleanWord);
    }
    currentGerman = { correct };
    renderGermanOptions([correct, ...distractors]);
  } else if (type === "translate") {
    const translates = GERMAN_SENTENCES.filter(s => s.type === "translate").map(s => ({ prompt: s.de, answer: s.en, promptEn: s.en, answerDe: s.de }));
    const chosen = pickFresh(translates, "translate");
    const isDeToEn = Math.random() < 0.5;
    const prompt = isDeToEn ? chosen.prompt : chosen.promptEn;
    const correct = isDeToEn ? chosen.answer : chosen.answerDe;
    const distractors = [];
    while (distractors.length < 3) {
      const other = translates[Math.floor(Math.random() * translates.length)];
      const candidate = isDeToEn ? other.answer : other.answerDe;
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }
    currentGerman = { correct };
    promptEl.textContent = prompt;
    renderGermanOptions([correct, ...distractors]);
  }
}

function renderGermanOptions(options) {
  const optsEl = document.getElementById("germanOptions");
  const correct = currentGerman.correct;
  const shuffled = shuffle(options);

  shuffled.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    if (opt.length > 20) btn.style.fontSize = "15px";
    btn.textContent = opt;
    
    btn.onclick = () => {
      document.querySelectorAll("#germanOptions .option-btn").forEach(b => b.disabled = true);
      const fb = document.getElementById("germanFeedback");
      const statToTrain = document.querySelector('input[name="statSelect"]:checked').value;

      if (opt === correct) {
        btn.classList.add("correct");
        fb.textContent = `✅ Correct!`; fb.className = "feedback good";
        handleCorrect("german", statToTrain);
        state.german.streak++; state.german.wrongStreak = 0; state.german.xp++;
        if (state.german.xp >= 10) { state.german.xp = 0; state.german.level++; setTimeout(() => alert(`🎉 German Level ${state.german.level}!`), 300); }
      } else {
        btn.classList.add("wrong");
        document.querySelectorAll("#germanOptions .option-btn").forEach(b => { if (b.textContent === correct) b.classList.add("correct"); });
        fb.textContent = `❌ Wrong! The answer was: ${correct}`; fb.className = "feedback bad";
        handleWrong("german", statToTrain);
        state.german.streak = 0; state.german.wrongStreak++;
      }
      saveState(); updateGermanUI();
      setTimeout(newGermanQuestion, 3800);
    };
    optsEl.appendChild(btn);
  });
}

function updateGermanUI() {
  document.getElementById("germanLevel").textContent = state.german.level;
  document.getElementById("germanStreak").textContent = state.german.streak;
  document.getElementById("germanXp").textContent = state.german.xp;
  document.getElementById("germanXpFill").style.width = (state.german.xp * 10) + "%";
}

// ============ DUNGEON COMBAT ============
const ENEMIES = [
  { id: "rat", name: "Giant Rat", hp: 30, dmg: 5, sprite: "rat" },
  { id: "wolf", name: "Dire Wolf", hp: 60, dmg: 8, sprite: "wolf" },
  { id: "zombie", name: "Zombie Knight", hp: 100, dmg: 12, sprite: "zombie" },
  { id: "dragon", name: "Ancient Dragon", hp: 200, dmg: 15, sprite: "dragon" }
];

let currentCombat = { active: false, action: null, enemy: null, heroHp: 100, enemyHp: 0 };

function checkDungeonUnlock() {
  const mathLvl = state.math.level;
  const germanLvl = state.german.level;
  const str = state.hero.strength; const dex = state.hero.dexterity; const int = state.hero.intellect;
  
  const statsOk = str >= 5 && dex >= 5 && int >= 5;
  const unlocked = mathLvl >= 2 && germanLvl >= 2 && statsOk;

  if (unlocked) {
    document.getElementById("dungeonLocked").classList.add("hidden");
    document.getElementById("dungeonArena").classList.remove("hidden");
    loadEnemy();
  } else {
    document.getElementById("dungeonLocked").classList.remove("hidden");
    document.getElementById("dungeonArena").classList.add("hidden");
    document.getElementById("reqMath").textContent = `Math Level 2 (you have: ${mathLvl})`;
    document.getElementById("reqGerman").textContent = `German Level 2 (you have: ${germanLvl})`;
    document.getElementById("reqStats").textContent = `All stats at Level 5 or better (you have: ${str}, ${dex}, ${int})`;
  }
}

function loadEnemy() {
  const enemy = ENEMIES[state.dungeon.currentEnemy] || ENEMIES[ENEMIES.length - 1];
  currentCombat.enemy = enemy;
  currentCombat.enemyHp = enemy.hp;
  currentCombat.heroHp = 100; 
  
  document.getElementById("battleEnemy").className = "pixel-enemy " + enemy.sprite;
  document.getElementById("enemyHpText").textContent = `${currentCombat.enemyHp}/${enemy.hp}`;
  document.getElementById("enemyHpFill").style.width = "100%";
  document.getElementById("heroHpText").textContent = `${currentCombat.heroHp}/100`;
  document.getElementById("heroHpFill").style.width = "100%";
  
  document.getElementById("combatLog").textContent = `A ${enemy.name} blocks your path!`;
  document.querySelectorAll(".action-btn").forEach(b => b.disabled = false);
}

function startCombatTurn(action) {
  if (currentCombat.heroHp <= 0 || currentCombat.enemyHp <= 0) return;
  currentCombat.action = action;
  document.querySelectorAll(".action-btn").forEach(b => b.disabled = true);
  
  document.getElementById("combatModal").classList.remove("hidden");
  const title = document.getElementById("combatModalTitle");
  const qText = document.getElementById("combatQuestionText");
  const optsDiv = document.getElementById("combatOptions");
  const input = document.getElementById("combatInput");
  const submitBtn = document.getElementById("combatSubmit");
  
  optsDiv.innerHTML = ""; optsDiv.classList.add("hidden"); input.style.display = "none"; submitBtn.style.display = "none";

  if (action === "attack") {
    title.textContent = "Attack! (German)";
    const word = GERMAN_WORDS[Math.floor(Math.random() * GERMAN_WORDS.length)];
    qText.textContent = `Translate: ${word[0]}`;
    const correct = word[1];
    const options = [correct];
    while(options.length < 4) {
      const w = GERMAN_WORDS[Math.floor(Math.random() * GERMAN_WORDS.length)][1];
      if(!options.includes(w)) options.push(w);
    }
    shuffle(options).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn"; btn.textContent = opt; btn.onclick = () => resolveCombat(opt === correct);
      optsDiv.appendChild(btn);
    });
    optsDiv.classList.remove("hidden");
  } 
  else if (action === "defend") {
    title.textContent = "Defend! (German)";
    const fill = GERMAN_SENTENCES.find(s => s.type === "fill");
    qText.innerHTML = `<div style="font-size:16px; color:#888;">${fill.en}</div><div style="font-size:24px;">${fill.de}</div>`;
    const correct = fill.blank;
    const options = [correct];
    while(options.length < 4) {
      const w = GERMAN_WORDS[Math.floor(Math.random() * GERMAN_WORDS.length)][0].replace(/^(der|die|das)\s/, '');
      if(!options.includes(w)) options.push(w);
    }
    shuffle(options).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn"; btn.textContent = opt; btn.onclick = () => resolveCombat(opt === correct);
      optsDiv.appendChild(btn);
    });
    optsDiv.classList.remove("hidden");
  } 
  else if (action === "cast") {
    title.textContent = "Cast Spell! (Math)";
    const a = rand(5, 20), b = rand(2, 10);
    qText.textContent = `${a} × ${b} = ?`;
    const correct = a * b;
    input.style.display = "block"; input.value = ""; submitBtn.style.display = "block";
    submitBtn.onclick = () => resolveCombat(parseInt(input.value) === correct);
  }
}

function resolveCombat(isCorrect) {
  document.getElementById("combatModal").classList.add("hidden");
  const action = currentCombat.action;
  const enemy = currentCombat.enemy;
  let log = "";

  if (isCorrect) { playBeep("success"); vibrate("success"); }
  else { playBeep("error"); vibrate("error"); }

  if (action === "attack") {
    const statLvl = state.hero.strength;
    if (isCorrect) {
      const dmg = statLvl * 2;
      currentCombat.enemyHp -= dmg;
      log = `⚔️ ${state.hero.name} hits the ${enemy.name} for ${dmg} damage! (STR ${statLvl})`;
    } else {
      log = `⚔️ ${state.hero.name} missed the ${enemy.name}!`;
    }
  } 
  else if (action === "defend") {
    if (isCorrect) {
      log = `🛡️ ${state.hero.name} successfully dodged the ${enemy.name}'s attack!`;
    } else {
      log = `🛡️ ${state.hero.name} failed to dodge!`;
    }
  } 
  else if (action === "cast") {
    const statLvl = state.hero.intellect;
    if (isCorrect) {
      const dmg = statLvl * 3;
      currentCombat.enemyHp -= dmg;
      log = `✨ ${state.hero.name} cast a spell for ${dmg} damage! (INT ${statLvl})`;
    } else {
      log = `✨ ${state.hero.name}'s spell fizzled!`;
    }
  }

  if (currentCombat.enemyHp > 0) {
    if (action !== "defend" || !isCorrect) {
      const enemyDmg = enemy.dmg;
      currentCombat.heroHp -= enemyDmg;
      log += ` The ${enemy.name} hits ${state.hero.name} for ${enemyDmg} damage!`;
    } else {
      log += ` The ${enemy.name} attacks but ${state.hero.name} dodges!`;
    }
  }

  if (currentCombat.enemyHp <= 0) {
    log += ` 🎉 ${state.hero.name} defeated the ${enemy.name}!`;
    state.dungeon.currentEnemy++;
    saveState();
    setTimeout(() => {
      if (state.dungeon.currentEnemy >= ENEMIES.length) {
        alert(`🏆 YOU BEAT THE GAME! ${state.hero.name} has slain the Dragon!`);
        state.dungeon.currentEnemy = 0;
        saveState();
      }
      loadEnemy();
    }, 2000);
  } else if (currentCombat.heroHp <= 0) {
    log += ` 💀 ${state.hero.name} died! All stats downgrade by 1.`;
    ["strength", "dexterity", "intellect"].forEach(s => modifyStat(s, -1, "dungeon"));
    saveState();
    setTimeout(() => { loadEnemy(); }, 3000);
  }

  document.getElementById("combatLog").textContent = log;
  document.getElementById("enemyHpText").textContent = `${Math.max(0, currentCombat.enemyHp)}/${enemy.hp}`;
  document.getElementById("enemyHpFill").style.width = (Math.max(0, currentCombat.enemyHp) / enemy.hp * 100) + "%";
  document.getElementById("heroHpText").textContent = `${Math.max(0, currentCombat.heroHp)}/100`;
  document.getElementById("heroHpFill").style.width = (Math.max(0, currentCombat.heroHp) / 100 * 100) + "%";

  setTimeout(() => {
    if (currentCombat.heroHp > 0 && currentCombat.enemyHp > 0) {
      document.querySelectorAll(".action-btn").forEach(b => b.disabled = false);
    }
  }, 1500);
}

// ============ INITIALIZE ON LOAD ============
window.onload = function() {
  loadState();
  
  if (!state.tutorialSeen) document.getElementById("tutorialModal").classList.remove("hidden");
  else document.getElementById("tutorialModal").classList.add("hidden");

  document.getElementById("startTutorialBtn").onclick = () => {
    const name = document.getElementById("heroNameInput").value || "Sir Bumble";
    state.hero.name = name;
    state.tutorialSeen = true;
    saveState();
    document.getElementById("tutorialModal").classList.add("hidden");
    updateHeroUI("math");
    updateHeroUI("german");
  };

  document.getElementById("modeSelect").onchange = function(e) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById(e.target.value + "Panel").classList.add("active");
    if (e.target.value === "math") newMathQuestion();
    else if (e.target.value === "german") newGermanQuestion();
  };

  document.getElementById("dungeonBtn").onclick = function() {
    const dungeonPanel = document.getElementById("dungeonPanel");
    if (dungeonPanel.classList.contains("active")) {
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      document.getElementById("mathPanel").classList.add("active");
      document.getElementById("modeSelect").value = "math";
      newMathQuestion();
    } else {
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      dungeonPanel.classList.add("active");
      checkDungeonUnlock();
    }
  };

  document.getElementById("returnToTrainingBtn").onclick = function() {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById("mathPanel").classList.add("active");
    document.getElementById("modeSelect").value = "math";
    newMathQuestion();
  };

  document.getElementById("mathSubmit").onclick = function() {
    const input = document.getElementById("mathAnswer");
    const val = parseInt(input.value, 10);
    if (isNaN(val) || !currentMath) return;
    
    const fb = document.getElementById("mathFeedback");
    if (val === currentMath.answer) {
      fb.textContent = "✅ Correct!"; fb.className = "feedback good";
      handleCorrect("math", "intellect");
      state.math.streak++; state.math.xp++; state.math.wrongStreak = 0;
      if (state.math.xp >= 10) { state.math.xp = 0; state.math.level++; }
    } else {
      fb.textContent = `❌ Answer was ${currentMath.answer}`; fb.className = "feedback bad";
      handleWrong("math", "intellect");
      state.math.streak = 0; state.math.wrongStreak++;
    }
    saveState(); updateMathUI();
    setTimeout(newMathQuestion, 3800);
  };

  document.getElementById("mathAnswer").onkeydown = function(e) {
    if (e.key === "Enter") document.getElementById("mathSubmit").click();
  };

  document.getElementById("settingsBtn").onclick = () => document.getElementById("settingsModal").classList.remove("hidden");
  document.getElementById("closeSettings").onclick = () => document.getElementById("settingsModal").classList.add("hidden");
  
  document.getElementById("howToBtn").onclick = () => {
    document.getElementById("settingsModal").classList.add("hidden");
    document.getElementById("tutorialModal").classList.remove("hidden");
  };
  
  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset ALL progress? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };

  document.getElementById("renameBtn").onclick = () => {
    const newName = prompt("Enter a new name for your Hero:", state.hero.name);
    if (newName && newName.trim() !== "") {
      state.hero.name = newName.trim().substring(0, 15);
      saveState();
      updateHeroUI("math");
      updateHeroUI("german");
    }
  };
  
  document.getElementById("discreetToggle").checked = state.discreet;
  document.body.classList.toggle("discreet", state.discreet);
  document.getElementById("discreetToggle").onchange = (e) => {
    state.discreet = e.target.checked;
    document.body.classList.toggle("discreet", state.discreet);
    saveState();
  };

  document.getElementById("soundToggle").checked = state.sound !== false;
  document.getElementById("soundToggle").onchange = (e) => {
    state.sound = e.target.checked;
    saveState();
  };

  document.getElementById("vibrationToggle").checked = state.vibration !== false;
  document.getElementById("vibrationToggle").onchange = (e) => {
    state.vibration = e.target.checked;
    saveState();
  };

  updateMathUI(); updateGermanUI(); updateHeroUI("math"); updateHeroUI("german");
  newMathQuestion(); newGermanQuestion();
};

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW failed:", err));
  });
}
