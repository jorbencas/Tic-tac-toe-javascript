const $ = (s) => document.querySelector(s);
const $id = (i) => document.getElementById(i);

let players;
let playState = { 
    numPlays: 3, 
    multiplayer: 1, 
    activePlayer: 1, 
    board: [], 
    userPiece: 'cross' 
};

function init() {
    players = {
        1: { icon: "cross", state: {}, name: "Jugador 1", wins: 0 },
        2: { icon: "circle", state: {}, name: "Bot Gemini", wins: 0 }
    };
    resetBoard();
}

function selectPiece(type, btn) {
    playState.userPiece = type;
    document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function changeMultiplayer(val) {
    playState.multiplayer = parseInt(val);
    $id("board").style.opacity = "0.2";
    if (playState.multiplayer === 2) {
        $id("options").innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px">
                <input type="text" id="n1" class="minimal-input" placeholder="Nombre Jugador 1" style="padding:12px; background:#1e1e1e; border:1px solid #333; color:white; border-radius:4px">
                <input type="text" id="n2" class="minimal-input" placeholder="Nombre Jugador 2" style="padding:12px; background:#1e1e1e; border:1px solid #333; color:white; border-radius:4px; margin-bottom:10px">
                <button class="start-btn" onclick="confirmStart()">CONFIRMAR NOMBRES</button>
            </div>`;
        $id("piece-selector").style.display = "none";
    } else {
        $id("options").innerHTML = `<button class="start-btn" onclick="confirmStart()">EMPEZAR JUEGO</button>`;
        $id("piece-selector").style.display = "block";
    }
}

function confirmStart() {
    players[1].name = $id("n1")?.value.trim() || "Jugador 1";
    players[2].name = $id("n2")?.value.trim() || (playState.multiplayer === 1 ? "Bot Gemini" : "Jugador 2");

    if (playState.multiplayer === 1) {
        players[1].icon = playState.userPiece;
        players[2].icon = playState.userPiece === 'cross' ? 'circle' : 'cross';
    } else {
        players[1].icon = 'cross';
        players[2].icon = 'circle';
    }

    $id("icon-1").src = `${players[1].icon}.svg`;
    $id("icon-2").src = `${players[2].icon}.svg`;
    startGame();
}

function startGame() {
    $id("setup-menu").style.display = "none";
    $id("options").innerHTML = `<p style="font-size:0.8rem; opacity:0.6; text-align:center; font-weight:bold; letter-spacing:1px">RONDA ${4 - playState.numPlays} / 3</p>`;
    $("#1 .player-name").innerText = players[1].name;
    $("#2 .player-name").innerText = players[2].name;
    $id("board").style.opacity = "1";
    $id("board").style.pointerEvents = "auto";
}

function resetBoard() {
    playState.board = Array.from({length: 3}, () => Array(3).fill(""));
    $id("board").innerHTML = playState.board.flatMap((row, y) => 
        row.map((_, x) => `<div class='cell' id='${y}-${x}' onclick='play(${x},${y})'></div>`)
    ).join("");
}

function play(x, y) {
    if (playState.board[y][x] !== "") return;
    playState.board[y][x] = playState.activePlayer;
    $id(`${y}-${x}`).innerHTML = `<img src="${players[playState.activePlayer].icon}.svg">`;

    if (checkWin(y, x)) { handleEnd("win"); }
    else if (playState.board.flat().every(c => c !== "")) { handleEnd("tie"); }
    else {
        toggleTurn();
        if (playState.multiplayer === 1 && playState.activePlayer === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(() => {
                const m = getSmartMove();
                $id("board").style.pointerEvents = "auto";
                if(m) play(m.x, m.y);
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
    const isW = (b[y].every(c=>c===p) || b.every(r=>r[x]===p) || (y===x && b.every((r,i)=>r[i]===p)) || (y+x===2 && b.every((r,i)=>r[2-i]===p)));
    if (isW) {
        const key = "play" + (4 - playState.numPlays);
        players[p].state[key] = {status: "ganas"};
        players[p === 1 ? 2 : 1].state[key] = {status: "pierdes"};
        return true;
    } return false;
}

function handleEnd(type) {
    const key = "play" + (4 - playState.numPlays);
    if (type === "tie") {
        players[1].state[key] = {status: "empate"};
        players[2].state[key] = {status: "empate"};
    }
    const p1Status = players[1].state[key].status;
    $id("announcement-text").innerText = p1Status === "ganas" ? "¡PUNTO PARA TI!" : (p1Status === "empate" ? "¡EMPATE!" : "PUNTO PARA RIVAL");
    $id("winner-display").innerText = p1Status === "ganas" ? players[1].name : (p1Status === "empate" ? "🤝" : players[2].name);
    $id("announcement").classList.add("show");

    setTimeout(() => {
        $id("announcement").classList.remove("show");
        if (players[1].state[key].status === "ganas") players[1].wins++;
        if (players[2].state[key].status === "ganas") players[2].wins++;
        $id("wins-1").innerText = players[1].wins;
        $id("wins-2").innerText = players[2].wins;
        playState.numPlays--;
        if (playState.numPlays === 0) renderSummary();
        else { resetBoard(); startGame(); playState.activePlayer = 1; $id("2").classList.remove("active"); $id("1").classList.add("active"); }
    }, 1800);
}

function renderSummary() {
    $id("game-container").style.display = "none";
    const final = $id("final-summary");
    final.style.display = "block";
    const getBadges = (p) => Object.values(p.state).map(s => {
        const l = s.status === 'ganas' ? 'G' : s.status === 'empate' ? 'E' : 'P';
        return `<div class="badge ${s.status}">${l}</div>`;
    }).join("");

    final.innerHTML = `
        <h2 style="letter-spacing:4px; margin-bottom:10px; font-weight:300">RESULTADO FINAL</h2>
        <div style="display:flex; justify-content:space-around; margin:40px 0; border-top:1px solid #222; padding-top:40px">
            <div><p style="opacity:0.5; font-size:0.8rem; margin-bottom:10px">${players[1].name}</p><h3 style="font-size:3rem">${players[1].wins}</h3><div class="badge-container">${getBadges(players[1])}</div></div>
            <div style="font-size:2rem; opacity:0.1; display:flex; align-items:center">VS</div>
            <div><p style="opacity:0.5; font-size:0.8rem; margin-bottom:10px">${players[2].name}</p><h3 style="font-size:3rem">${players[2].wins}</h3><div class="badge-container">${getBadges(players[2])}</div></div>
        </div>
        <button class="start-btn" style="background:transparent; color:white; border:1px solid white" onclick="location.reload()">VOLVER A JUGAR</button>
    `;
}

function getSmartMove() {
    const b = playState.board;
    const empty = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(b[y][x]==="") empty.push({y,x});
    const check = (p) => {
        for(let m of empty) {
            b[m.y][m.x] = p;
            let w = (b[m.y].every(c=>c===p) || b.every(r=>r[m.x]===p) || (m.y===m.x && b.every((r,i)=>r[i]===p)) || (m.y+m.x===2 && b.every((r,i)=>r[2-i]===p)));
            b[m.y][m.x] = ""; if(w) return m;
        } return null;
    };
    return check(2) || check(1) || (b[1][1]==="" ? {y:1,x:1} : empty[0]);
}

init();