// --- HELPERS DE SELECCIÓN ---
const $ = (selector) => document.querySelector(selector);
const $id = (id) => document.getElementById(id);

let players;
let playState = { numPlays: 3, multiplayer: 1, activePlayer: 1, board: [] };

// Inicializar juego al cargar
dispatch("RESET_PLAYSTATE");
resetBoard();

// --- SISTEMA DE ESTADO (DISPATCHER) ---
function dispatch(action, value = "", player = playState.activePlayer) {
    const playKey = "play" + playState.numPlays;
    switch(action) {
        case "RESET_PLAYSTATE":
            players = {
                1: { icon: "cross", state: {}, name: "Jugador 1", wins: 0 },
                2: { icon: "circle", state: {}, name: "Jugador Bot", wins: 0 }
            };
            break;
        case "CHANGE_TURN":
            playState.activePlayer = playState.activePlayer === 1 ? 2 : 1;
            // Inicializar el estado de la jugada si no existe
            if (!players[playState.activePlayer].state[playKey]) {
                players[playState.activePlayer].state[playKey] = { name: "", moves: 0 };
            }
            break;
        case "SET_WIN_NAME":
            players[player].state[playKey].name = value;
            break;
        case "ADD_NUM_WINS":
            if (players[1].state[playKey]?.name === "ganas") players[1].wins++;
            if (players[2].state[playKey]?.name === "ganas") players[2].wins++;
            break;
        case "CREATE_BOARD":
            playState.board = Array.from({length: 3}, () => Array(3).fill(""));
            break;
        case "SET_NAME_PLAYER":
            players[player].name = value;
            break;
    }
}

// --- FLUJO DE INTERFAZ ---
function changeMultiplayer(val) {
    playState.multiplayer = parseInt(val);
    $id("board").style.opacity = "0.2";
    $id("board").style.pointerEvents = "none";

    if (playState.multiplayer == 2) {
        $id("options").innerHTML = `
            <div class="setup-container">
                <input type="text" id="n1" placeholder="Nombre Jugador 1" oninput="checkNames()">
                <input type="text" id="n2" placeholder="Nombre Jugador 2" oninput="checkNames()">
                <button id="btnStart" class="start-btn" onclick="startGame()">¡EMPEZAR!</button>
            </div>`;
    } else {
        players[2].name = "Jugador Bot";
        $id("options").innerHTML = `<button class="start-btn visible" onclick="startGame()">JUGAR CONTRA IA</button>`;
    }
}

function checkNames() {
    const n1 = $id("n1").value.trim();
    const n2 = $id("n2").value.trim();
    if (n1.length > 1 && n2.length > 1) {
        $id("btnStart").classList.add("visible");
        dispatch("SET_NAME_PLAYER", n1, 1);
        dispatch("SET_NAME_PLAYER", n2, 2);
    } else {
        $id("btnStart").classList.remove("visible");
    }
}

function startGame() {
    $id("board").style.opacity = "1";
    $id("board").style.pointerEvents = "auto";
    $id("multiplayer").style.display = "none";
    $id("options").innerHTML = `<div style="color:var(--accent); font-weight:bold;">Ronda ${4 - playState.numPlays} de 3</div>`;
    
    // Actualizar nombres en la UI usando el helper $
    $("#1 .message").innerText = players[1].name;
    $("#2 .message").innerText = players[2].name;
}

// --- LÓGICA DEL JUEGO ---
function resetBoard() {
    dispatch("CREATE_BOARD");
    $id("board").innerHTML = playState.board.flatMap((row, y) => 
        row.map((_, x) => `<div class='cell' id='${y}-${x}' onclick='play(${x},${y})'></div>`)
    ).join("");
}

function play(x, y) {
    if (playState.board[y][x] !== "") return;

    // Pintar movimiento
    $id(`${y}-${x}`).innerHTML = `<img src="${players[playState.activePlayer].icon}.svg">`;
    playState.board[y][x] = playState.activePlayer;

    if (checkWin(y, x)) {
        handleEnd("win");
    } else if (playState.board.flat().every(c => c !== "")) {
        handleEnd("tie");
    } else {
        // Cambio de turno visual
        $id(playState.activePlayer.toString()).classList.remove("active");
        dispatch("CHANGE_TURN");
        $id(playState.activePlayer.toString()).classList.add("active");

        // Turno de la IA
        if (playState.multiplayer === 1 && playState.activePlayer === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(() => {
                const move = getBestMove();
                $id("board").style.pointerEvents = "auto";
                if(move) play(move.x, move.y);
            }, 600);
        }
    }
}

function checkWin(y, x) {
    const p = playState.activePlayer;
    const b = playState.board;
    const isWin = (b[y].every(c => c === p) || 
                  b.every(r => r[x] === p) ||
                  (y === x && b.every((r, i) => r[i] === p)) ||
                  (y + x === 2 && b.every((r, i) => r[2-i] === p)));
    
    if (isWin) {
        dispatch("SET_WIN_NAME", "ganas", p);
        dispatch("SET_WIN_NAME", "pierdes", p === 1 ? 2 : 1);
        return true;
    }
    return false;
}

function handleEnd(type) {
    $id("board").style.pointerEvents = "none";
    if (type === "tie") {
        dispatch("SET_WIN_NAME", "empate", 1);
        dispatch("SET_WIN_NAME", "empate", 2);
    }

    const pKey = "play" + playState.numPlays;
    const p1Res = players[1].state[pKey].name;
    const msg = p1Res === "ganas" ? "¡VICTORIA!" : (p1Res === "empate" ? "¡EMPATE!" : "¡DERROTA!");
    const winnerName = p1Res === "ganas" ? players[1].name : (p1Res === "empate" ? "🤝" : players[2].name);

    // Mostrar Anuncio
    $id("announcement-text").innerText = msg;
    $id("winner-name").innerText = winnerName;
    $id("announcement").classList.add("show");

    setTimeout(() => {
        $id("announcement").classList.remove("show");
        dispatch("ADD_NUM_WINS");
        playState.numPlays--;

        if (playState.numPlays === 0) {
            showFinalSummary();
        } else {
            resetBoard();
            $id("board").style.pointerEvents = "auto";
            startGame();
            // Reiniciar turno al jugador 1 para la nueva ronda
            $id("2").classList.remove("active");
            $id("1").classList.add("active");
            playState.activePlayer = 1;
        }
    }, 2000);
}

// --- INTELIGENCIA ARTIFICIAL ---
function getBestMove() {
    const b = playState.board;
    const empty = [];
    for(let y=0; y<3; y++) {
        for(let x=0; x<3; x++) {
            if(b[y][x] === "") empty.push({y, x});
        }
    }

    if (empty.length === 0) return null;

    // Función interna para simular
    const test = (player) => {
        for(let m of empty) {
            b[m.y][m.x] = player;
            let win = (b[m.y].every(c => c === player) || 
                      b.every(r => r[m.x] === player) || 
                      (m.y === m.x && b.every((r, i) => r[i] === player)) || 
                      (m.y + m.x === 2 && b.every((r, i) => r[2-i] === player)));
            b[m.y][m.x] = "";
            if(win) return m;
        }
        return null;
    };

    // 1. Intentar ganar | 2. Bloquear jugador | 3. Centro | 4. Azar
    return test(2) || test(1) || (b[1][1] === "" ? {y:1, x:1} : empty[Math.floor(Math.random() * empty.length)]);
}

// --- RESUMEN FINAL ---
function showFinalSummary() {
    $id("board").style.display = "none";
    $id("info").style.display = "none";
    
    const getBadge = (s) => `<span class="badge ${s}">${s === 'ganas' ? '🏆' : s === 'empate' ? '🤝' : '❌'}</span>`;
    
    $id("options").innerHTML = `
        <div class="final-screen">
            <h2>RESULTADOS FINALES</h2>
            <div class="stat-card">
                <div class="player-stat">
                    <p><b>${players[1].name}</b></p>
                    <p>${players[1].wins} Victorias</p>
                    <div>${Object.values(players[1].state).map(s => getBadge(s.name)).join("")}</div>
                </div>
                <hr style="opacity:0.1; margin: 15px 0;">
                <div class="player-stat">
                    <p><b>${players[2].name}</b></p>
                    <p>${players[2].wins} Victorias</p>
                    <div>${Object.values(players[2].state).map(s => getBadge(s.name)).join("")}</div>
                </div>
            </div>
            <button class="reset-btn" onclick="location.reload()">REINICIAR TODO</button>
        </div>`;
}