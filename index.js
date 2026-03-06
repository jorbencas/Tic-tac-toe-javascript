const $ = (s) => document.querySelector(s);
const $id = (i) => document.getElementById(i);

let players;
let playState = { numPlays: 3, multiplayer: 1, activePlayer: 1, board: [] };

let p = {
  numRondas: 3,
  rondaActual: 1,
  modo: 1,
  piezaUser: "cross",
  activo: 1,
  tablero: [],
  j: {
    1: { nombre: "Jugador 1", icono: "cross", victorias: 0, historial: [] },
    2: { nombre: "IA", icono: "circle", victorias: 0, historial: [] },
  },
};

// Inicialización
function init() {
  players = {
    1: { icon: "cross", state: {}, name: "Jugador 1", wins: 0 },
    2: { icon: "circle", state: {}, name: "Bot Gemini", wins: 0 },
  };
  resetBoard();
}

init();

function changeMultiplayer(val) {
  playState.multiplayer = parseInt(val);
  $id("board").style.opacity = "0.2";

  if (playState.multiplayer === 2) {
    $id("options").innerHTML = `
            <div class="setup-container">
                <input type="text" id="n1" class="minimal-input" placeholder="Nombre Jugador 1" style="margin-bottom:8px">
                <input type="text" id="n2" class="minimal-input" placeholder="Nombre Jugador 2" style="margin-bottom:8px">
                <button class="start-btn" onclick="confirmStart()">CONFIRMAR</button>
            </div>`;
  } else {
    $id(
      "options"
    ).innerHTML = `<button class="start-btn" onclick="confirmStart()">INICIAR VS IA</button>`;
  }
}

function selectPiece(tipo, btn) {
  p.piezaUser = tipo;
  document
    .querySelectorAll(".piece-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function confirmStart() {
  const name1 = $id("n1")?.value.trim() || "Jugador 1";
  const name2 =
    $id("n2")?.value.trim() ||
    (playState.multiplayer === 1 ? "Bot Gemini" : "Jugador 2");

  players[1].name = name1;
  players[2].name = name2;

  startGame();
}

function startGame() {
  $id("board").style.opacity = "1";
  $id("board").style.pointerEvents = "auto";
  $id("multiplayer-select").style.display = "none";
  $id("options").innerHTML = `<p style="font-size:0.7rem; opacity:0.5">RONDA ${
    4 - playState.numPlays
  } DE 3</p>`;

  $("#1 .player-name").innerText = players[1].name;
  $("#2 .player-name").innerText = players[2].name;
}

function resetBoard() {
  playState.board = Array.from({ length: 3 }, () => Array(3).fill(""));
  $id("board").innerHTML = playState.board
    .flatMap((row, y) =>
      row.map(
        (_, x) =>
          `<div class='cell' id='${y}-${x}' onclick='play(${x},${y})'></div>`
      )
    )
    .join("");
}

function play(x, y) {
  if (playState.board[y][x] !== "") return;

  playState.board[y][x] = playState.activePlayer;
  $id(`${y}-${x}`).innerHTML = `<img src="${
    players[playState.activePlayer].icon
  }.svg">`;

  if (checkWin(y, x)) {
    handleEnd("win");
  } else if (playState.board.flat().every((c) => c !== "")) {
    handleEnd("tie");
  } else {
    toggleTurn();
    if (playState.multiplayer === 1 && playState.activePlayer === 2) {
      $id("board").style.pointerEvents = "none";
      setTimeout(() => {
        const m = getSmartMove();
        $id("board").style.pointerEvents = "auto";
        if (m) play(m.x, m.y);
      }, 600);
    }
  }
}

function toggleTurn() {
  $id(playState.activePlayer.toString()).classList.remove("active");
  playState.activePlayer = playState.activePlayer === 1 ? 2 : 1;
  $id(playState.activePlayer.toString()).classList.add("active");
}

function checkWin(y, x) {
  const p = playState.activePlayer;
  const b = playState.board;
  const isW =
    b[y].every((c) => c === p) ||
    b.every((r) => r[x] === p) ||
    (y === x && b.every((r, i) => r[i] === p)) ||
    (y + x === 2 && b.every((r, i) => r[2 - i] === p));

  if (isW) {
    const key = "play" + (4 - playState.numPlays);
    players[p].state[key] = { status: "ganas" };
    players[p === 1 ? 2 : 1].state[key] = { status: "pierdes" };
    return true;
  }
  return false;
}

function handleEnd(type) {
  const key = "play" + (4 - playState.numPlays);
  if (type === "tie") {
    players[1].state[key] = { status: "empate" };
    players[2].state[key] = { status: "empate" };
  }

  const p1Status = players[1].state[key].status;
  $id("announcement-text").innerText =
    p1Status === "ganas"
      ? "RONDA GANADA"
      : p1Status === "empate"
      ? "EMPATE"
      : "RONDA PERDIDA";
  $id("winner-display").innerText =
    p1Status === "ganas"
      ? players[1].name
      : p1Status === "empate"
      ? "—"
      : players[2].name;
  $id("announcement").classList.add("show");

  setTimeout(() => {
    $id("announcement").classList.remove("show");
    if (players[1].state[key].status === "ganas") players[1].wins++;
    if (players[2].state[key].status === "ganas") players[2].wins++;
    $id("wins-1").innerText = players[1].wins;
    $id("wins-2").innerText = players[2].wins;

    playState.numPlays--;
    if (playState.numPlays === 0) renderSummary();
    else {
      resetBoard();
      startGame();
      playState.activePlayer = 1;
      $id("2").classList.remove("active");
      $id("1").classList.add("active");
    }
  }, 1500);
}

function renderSummary() {
  $id("game-container").style.display = "none";
  const final = $id("final-summary");
  final.style.display = "block";

  const getHistorial = (jug) =>
    jug.historial
      .map((h) => {
        const c = h === "G" ? "ganas" : h === "E" ? "empate" : "pierdes";
        return `<div class="badge ${c}">${h}</div>`;
      })
      .join("");

  f.innerHTML = `
        <h2 style="font-weight:300; letter-spacing:5px; margin-bottom:40px">SERIE FINALIZADA</h2>
        <div style="display:flex; justify-content:space-around; align-items:center;">
            <div><p style="opacity:0.4; font-size:0.7rem">${
              p.j[1].nombre
            }</p><h3 style="font-size:3rem">${
    p.j[1].victorias
  }</h3><div style="display:flex; gap:5px">${getHistorial(p.j[1])}</div></div>
            <div style="opacity:0.1; font-size:2rem">VS</div>
            <div><p style="opacity:0.4; font-size:0.7rem">${
              p.j[2].nombre
            }</p><h3 style="font-size:3rem">${
    p.j[2].victorias
  }</h3><div style="display:flex; gap:5px">${getHistorial(p.j[2])}</div></div>
        </div>
        <button class="start-btn" style="background:transparent; color:white; border:1px solid white; margin-top:50px" onclick="location.reload()">REPETIR JUEGO</button>
    `;
}

function getSmartMove() {
  const b = playState.board;
  const empty = [];
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 3; x++) if (b[y][x] === "") empty.push({ y, x });
  const check = (p) => {
    for (let m of empty) {
      b[m.y][m.x] = p;
      let w =
        b[m.y].every((c) => c === p) ||
        b.every((r) => r[m.x] === p) ||
        (m.y === m.x && b.every((r, i) => r[i] === p)) ||
        (m.y + m.x === 2 && b.every((r, i) => r[2 - i] === p));
      b[m.y][m.x] = "";
      if (w) return m;
    }
    return null;
  };
  return check(2) || check(1) || (b[1][1] === "" ? { y: 1, x: 1 } : empty[0]);
}
