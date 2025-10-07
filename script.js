// ---- DATA ----

import { words } from "./words.js";
let data = words;
// Pick today's word by day index
// Launch date: 1st November 2025 (midnight UTC)
const launchDate = new Date("2025-11-01T00:00:00Z");

// Today (UTC at midnight)
const today = new Date();
const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

const dayIndex = Math.floor((todayUTC - launchDate.getTime()) / (1000 * 60 * 60 * 24));

if (dayIndex < 0) {
  // Not started yet → show countdown
  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginTop = "50px";
container.innerHTML = `
  <h1>Disnerdle</h1>
  <p>The game begins on <strong>1st November 2025</strong>.</p>
  <p id="countdown"></p>
  <div id="progressOuter">
    <div id="progressInner"></div>
  </div>
`;

  document.body.innerHTML = "";
  document.body.appendChild(container);

function updateCountdown() {
  const now = new Date();
  const diff = launchDate.getTime() - now.getTime();
  if (diff <= 0) {
    location.reload(); // start the game when countdown expires
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("countdown").textContent =
    `Starts in ${days}d ${hours}h ${mins}m ${secs}s`;

  // Progress bar %
  const totalTime = launchDate.getTime() - Date.UTC(2025, 10, 1, 0, 0, 0); // start of launch day
  const elapsed = now.getTime() - Date.UTC(2025, 0, 1, 0, 0, 0); // example baseline
  const progress = Math.min(
    100,
    ((launchDate.getTime() - diff) / launchDate.getTime()) * 100
  );
  document.getElementById("progressInner").style.width = progress + "%";
}


  updateCountdown();
  setInterval(updateCountdown, 1000);

  throw new Error("Game not started yet");
}


// Safe to proceed
let todayIndex = dayIndex % data.length;
let current = data[todayIndex];

let maxAttempts = 8;
let attempts = 0;
let gameOver = false; 
let resultsGrid = [];
let currentRow = 0;
let previousGuesses = [];
let victory = false;

// ---- STATS ----
let stats = JSON.parse(localStorage.getItem("stats") ||
  '{"played":0,"wins":0,"streak":0,"bestStreak":0,"distribution":{}}');

if (!stats.distribution) stats.distribution = {};
for (let i=1; i<=8; i++) {
  if (!(i in stats.distribution)) stats.distribution[i] = 0;
}

const gameNumber = dayIndex + 1; // Word 1 = 1st Nov 2025

let progressKey = "progress_" + gameNumber;

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify({
    guesses: previousGuesses, // array of raw guess strings like ["R2D2", "C3PO"]
    attempts,
    finished: gameOver,
    win: gameOver && victory
  }));
}


function loadProgress() {
  const p = localStorage.getItem(progressKey);
  if (!p) return;
  const prog = JSON.parse(p);

  previousGuesses = prog.guesses || [];
  attempts = prog.attempts || 0;
  gameOver = prog.finished || false;
  victory = prog.win || false;
  currentRow = previousGuesses.length;

  // Replay guesses into the board
  previousGuesses.forEach(g => {
    replayGuess(g);
  });

  if (gameOver) {
    showPopup(victory);
  }
}

function replayGuess(guessStr) {
  const cleanAnswer = current.answer.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const { tileIdx, ansChars } = getCleanAnswerMapping();
  const guess = guessStr.toUpperCase().split("");
  const colors = new Array(ansChars.length).fill("absent");

  // Count letters in answer
  const counts = {};
  for (const c of ansChars) counts[c] = (counts[c] || 0) + 1;

  // Pass 1: correct
  for (let i=0;i<ansChars.length;i++) {
    if (guess[i] === ansChars[i]) {
      colors[i] = "correct";
      counts[guess[i]]--;
    }
  }
  // Pass 2: present
  for (let i=0;i<ansChars.length;i++) {
    if (colors[i] !== "correct") {
      const g = guess[i];
      if (counts[g] > 0) {
        colors[i] = "present";
        counts[g]--;
      }
    }
  }

  // Paint this guess into the correct row
  const row = board.children[previousGuesses.indexOf(guessStr)];
  for (let i=0;i<ansChars.length;i++) {
    const tile = row.children[tileIdx[i]];
    tile.textContent = guess[i];
    tile.className = "tile " + colors[i];
  }

  // Update keyboard state
  for (let i=0;i<guess.length;i++) {
    setKeyState(guess[i], colors[i]);
  }

  // Save grid for sharing
  const rowResult = colors.map(c => (c==="correct"?"🟩":c==="present"?"🟨":"⬛")).join("");
  resultsGrid.push(rowResult);
}


function saveStats() { localStorage.setItem("stats", JSON.stringify(stats)); }

// ---- BOARD ----
const board = document.getElementById("board");
function renderBoard() {
  board.innerHTML = "";
  let cleanLength = current.answer.replace(/[^a-z0-9]/gi,"").length;
console.log(current.answer);
  for (let row = 0; row < maxAttempts; row++) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    for (let i = 0; i < current.answer.length; i++) {
      let ch = current.answer[i];
      let div = document.createElement("div");
      div.classList.add("tile");

      if (!/[a-z0-9]/i.test(ch)) {
        div.textContent = ch;       // special characters fixed
        div.classList.add("fixed");
      }
      rowDiv.appendChild(div);
    }
    board.appendChild(rowDiv);
  }
}

// ---- KEYBOARD ----
const keyboardLayout = [
  "1234567890",
  "QWERTYUIOP",
  "ASDFGHJKL",
  ["ENTER","Z","X","C","V","B","N","M","DEL"] // bottom row with enter+del  
];


const keyboard = document.getElementById("keyboard");

function renderKeyboard() {
  keyboard.innerHTML = "";

  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("kb-row");

    const keys = Array.isArray(row) ? row : row.split("");

    keys.forEach(ch => {
      const key = document.createElement("div");
      key.classList.add("key");

      if (ch === "ENTER" || ch === "DEL") {
        key.classList.add("wide");
      }

      key.textContent = ch;
      key.onclick = () => {
        if (ch === "ENTER") submitGuess();
        else if (ch === "DEL") deleteKey();
        else pressKey(ch);
      };

      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });
}


// ---- INPUT ----
let currentGuess = "";
function pressKey(ch) {
  if (gameOver) return;
  let cleanAnswer = current.answer.replace(/[^a-z0-9]/gi,"");
  if (currentGuess.length < cleanAnswer.length) {
    currentGuess += ch;
    updateBoardTiles();
  }
}
function deleteKey() {
  if (gameOver) return;
  currentGuess = currentGuess.slice(0, -1);
  updateBoardTiles();
}

function updateBoardTiles() {
  let row = board.children[currentRow];
  let cleanAnswer = current.answer.replace(/[^a-z0-9]/gi,"");
  let idx = 0;

  for (let i=0;i<current.answer.length;i++) {
    let ch = current.answer[i];
    if (!/[a-z0-9]/i.test(ch)) continue;
    let tile = row.children[i];
    tile.textContent = currentGuess[idx] || "";
    idx++;
  }
}

// ---- GUESS ----
function submitGuess() {
  if (gameOver) return;

  const cleanAnswer = current.answer.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (currentGuess.length !== cleanAnswer.length) return;

  attempts++;

  const { tileIdx, ansChars } = getCleanAnswerMapping();  // clean letters & where to paint them
  const guess = currentGuess.toUpperCase().split("");     // clean guess letters (same length as ansChars)
  const colors = new Array(ansChars.length).fill("absent");

  // Count letters in the answer
  const counts = {};
  for (const c of ansChars) counts[c] = (counts[c] || 0) + 1;

  // Pass 1: exact matches (correct/green)
  for (let i = 0; i < ansChars.length; i++) {
    if (guess[i] === ansChars[i]) {
      colors[i] = "correct";
      counts[guess[i]]--; // consume one occurrence
    }
  }

  // Pass 2: presents (yellow) vs absents (gray)
  for (let i = 0; i < ansChars.length; i++) {
    if (colors[i] !== "correct") {
      const g = guess[i];
      if (counts[g] > 0) {
        colors[i] = "present";
        counts[g]--;
      } else {
        colors[i] = "absent";
      }
    }
  }

  previousGuesses.push(currentGuess.toUpperCase());
  saveProgress();

  // Paint tiles for the current row (respect special characters)
  const row = board.children[currentRow];
  for (let i = 0; i < ansChars.length; i++) {
    const tile = row.children[tileIdx[i]];
    tile.textContent = guess[i];
  
    setTimeout(() => {
    tile.classList.add("flip");          // trigger animation
    setTimeout(() => {
      tile.className = "tile " + colors[i]; // apply final colour after half flip
    }, 300); // halfway (0.6s total)
  }, i * 300); // stagger tiles by 0.3s each

  tile.addEventListener("animationend", () => {
  tile.classList.remove("flip");
}, { once: true });


  }

  // Build share row and update keyboard with upgrade rules
  const rowResult = colors.map(c => (c === "correct" ? "🟩" : c === "present" ? "🟨" : "⬛")).join("");
  resultsGrid.push(rowResult);
  for (let i = 0; i < guess.length; i++) setKeyState(guess[i], colors[i]);

  // Win/Lose/Next row
  if (colors.every(c => c === "correct")) {
    winGame();
  } else if (attempts >= maxAttempts) {
    loseGame();
  } else {
    currentRow++;
    currentGuess = "";
  }
}


function updateKeyboardColors(guess, answer) {
  let keys = document.querySelectorAll(".key");
  guess.forEach(ch => {
    let key = Array.from(keys).find(k => k.textContent === ch);
    if (!key) return;
    if (answer.includes(ch)) {
      key.classList.add("present");
    } else {
      key.classList.add("absent");
    }
  });
}

// ---- END GAME ----
function winGame() {
  gameOver = true;
  stats.played++;
  stats.wins++;
  stats.streak++;
  if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
  stats.distribution[attempts]++;
  victory = true;
  saveStats();
  saveProgress();  
  updateStatsDisplay();
  showPopup(true);
}

function loseGame() {
  gameOver = true;
  stats.played++;
  stats.streak = 0;
  saveStats();
  saveProgress();  
  updateStatsDisplay();
  showPopup(false);
}


// ---- SHARE ----
function shareResult() {
  const gameNumber = todayIndex + 1;
  const outcome = victory ? attempts : "X";
  let header = `Disnerdle ${dayIndex + 1} ${outcome}/${maxAttempts}`;

  const grid = resultsGrid.join("\n");
  const text = `${header}\n\n${grid}`;

  if (navigator.share) {
    navigator.share({ title: "Disnerdle", text })
      .catch(err => console.warn("Share cancelled/failed:", err));
  } else if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert("Result copied to clipboard!"))
      .catch(() => alert("Couldn’t copy. Long-press to copy manually."));
  } else {
    // super-old fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); alert("Result copied to clipboard!"); }
    catch { alert("Couldn’t copy. Long-press to copy manually."); }
    finally { document.body.removeChild(ta); }
  }
}



// Build mapping of alphanumeric letters in the answer to their tile indices
function getCleanAnswerMapping() {
  const tileIdx = [];     // index in the row's tiles
  const ansChars = [];    // corresponding A-Z/0-9 letters for those tiles
  for (let i = 0; i < current.answer.length; i++) {
    const ch = current.answer[i];
    if (/[a-z0-9]/i.test(ch)) {
      tileIdx.push(i);
      ansChars.push(ch.toUpperCase());
    }
  }
  return { tileIdx, ansChars };
}

// Keyboard state upgrade helper
const KEY_RANK = { absent: 0, present: 1, correct: 2 };
function setKeyState(ch, state) {
  const keyEl = Array.from(document.querySelectorAll(".key"))
    .find(k => k.textContent === ch);
  if (!keyEl) return;

  const current = keyEl.dataset.state || "none";
  const currentRank = current in KEY_RANK ? KEY_RANK[current] : -1;
  if (KEY_RANK[state] > currentRank) {
    keyEl.classList.remove("absent", "present", "correct");
    keyEl.classList.add(state);
    keyEl.dataset.state = state;
  }
}

function showPopup(win) {
  const popup = document.getElementById("popup");
  popup.className = win ? "success" : "fail";
  document.getElementById("popupTitle").textContent = win ? "You Win!" : "Game Over";
  document.getElementById("popupAnswer").textContent = "Answer: " + current.answer;
  document.getElementById("popupHint").textContent = current.hint;

  // Stats
  document.getElementById("statPlayed").textContent = stats.played;
  let winRate = stats.played>0 ? Math.round(stats.wins/stats.played*100) : 0;
  document.getElementById("statWinRate").textContent = winRate;
  document.getElementById("statStreak").textContent = stats.streak;
  document.getElementById("statBest").textContent = stats.bestStreak;

  // Distribution
  const distDiv = document.getElementById("distribution");
  distDiv.innerHTML = "";
  for (let i=1; i<=8; i++) {
    const bar = document.createElement("div");
    bar.classList.add("dist-bar");
    if (win && i === attempts) bar.classList.add("correct");
    bar.style.width = (stats.distribution[i]*20+20) + "px";
    bar.textContent = i + ": " + stats.distribution[i];
    distDiv.appendChild(bar);
  }

  popup.style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function searchAnswer() {
  const answer = current.answer;
  const hint = current.hint;
  const searchQuery = encodeURIComponent(`${answer} ${hint}`);
  const googleUrl = `https://www.google.com/search?q=${searchQuery}`;
  window.open(googleUrl, '_blank');
}

function updateStatsDisplay() {
  
  let winRate = stats.played > 0 ? Math.round(stats.wins / stats.played * 100) : 0;
  // --- NEW: update top line stats ---
  document.getElementById("gameNum").textContent = dayIndex + 1;
  document.getElementById("maxGames").textContent = data.length;
  document.getElementById("curStreak").textContent = stats.streak;
  document.getElementById("bestStreakTop").textContent = stats.bestStreak;

  document.getElementById("playedTop").textContent = stats.played;
  document.getElementById("winsTop").textContent = stats.wins;
  document.getElementById("winRateTop").textContent = winRate;
}

document.getElementById("closeBtn").addEventListener("click", closePopup);
document.getElementById("shareBtn").addEventListener("click", shareResult);


// ---- INIT ----
renderBoard();
renderKeyboard();
loadProgress()
loadProgress(); // reapply saved guesses
updateStatsDisplay();
