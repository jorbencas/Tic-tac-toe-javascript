const $ = (s) => document.querySelector(s);
const $id = (i) => document.getElementById(i);

let p = {
    numRondas: 3, rondaActual: 1, modo: 1, piezaUser: 'cross', activo: 1, tablero: [],
    j: {
        1: { nombre: "Jugador 1", icono: "cross", victorias: 0, historial: [] },
        2: { nombre: "Bot Gemini", icono: "circle", victorias: 0, historial: [] }
    }
};

function changeMultiplayer(val) {
    p.modo = parseInt(val);
    $id("name-inputs").style.display = p.modo === 2 ? "block" : "none";
    $id("piece-selector").style.display = p.modo === 1 ? "block" : "none";
}

function selectPiece(tipo, btn) {
    p.piezaUser = tipo;
    document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function confirmStart() {
    p.j[1].nombre = $id("n1")?.value.trim() || "Jugador 1";
    p.j[2].nombre = p.modo === 2 ? ($id("n2")?.value.trim() || "Jugador 2") : "Bot Gemini";

    if (p.modo === 1) {
        p.j[1].icono = p.piezaUser;
        p.j[2].icono = p.piezaUser === 'cross' ? 'circle' : 'cross';
    } else {
        p.j[1].icono = 'cross'; p.j[2].icono = 'circle';
    }

    $id("icon-1").src = `${p.j[1].icono}.svg`;
    $id("icon-2").src = `${p.j[2].icono}.svg`;
    $id("txt-p1", "#1 .player-name").innerText = p.j[1].nombre;
    $id("txt-p2", "#2 .player-name").innerText = p.j[2].nombre;

    $id("setup-panel").style.display = "none";
    $id("info").style.display = "block";
    iniciarRonda();
}

function iniciarRonda() {
    p.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    p.activo = 1;
    $id("round-indicator").innerText = `RONDA ${p.rondaActual} DE 3`;
    $id("board").innerHTML = p.tablero.flatMap((f, y) => 
        f.map((_, x) => `<div class='cell' onclick='jugar(${x},${y})' id='c-${y}-${x}'></div>`)
    ).join("");
    $id("2").classList.remove("active");
    $id("1").classList.add("active");
}

function jugar(x, y) {
    if (p.tablero[y][x] !== "") return;
    p.tablero[y][x] = p.activo;
    $id(`c-${y}-${x}`).innerHTML = `<img src="${p.j[p.activo].icono}.svg">`;

    if (checkGanador(y, x)) {
        finalizarTurno("victoria");
    } else if (p.tablero.flat().every(c => c !== "")) {
        finalizarTurno("empate");
    } else {
        $id(p.activo.toString()).classList.remove("active");
        p.activo = p.activo === 1 ? 2 : 1;
        $id(p.activo.toString()).classList.add("active");

        if (p.modo === 1 && p.activo === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(iaMove, 600);
        }
    }
}

function finalizarTurno(tipo) {
    if (tipo === "victoria") {
        p.j[p.activo].victorias++;
        p.j[p.activo].historial.push('G');
        p.j[p.activo === 1 ? 2 : 1].historial.push('P');
        $id("announcement-text").innerText = "PUNTO PARA";
        $id("winner-display").innerText = p.j[p.activo].nombre.toUpperCase();
    } else {
        p.j[1].historial.push('E'); p.j[2].historial.push('E');
        $id("announcement-text").innerText = "RESULTADO";
        $id("winner-display").innerText = "EMPATE";
    }

    $id("wins-1").innerText = p.j[1].victorias;
    $id("wins-2").innerText = p.j[2].victorias;
    $id("announcement").classList.add("show");

    setTimeout(() => {
        $id("announcement").classList.remove("show");
        if (p.rondaActual < 3) {
            p.rondaActual++; iniciarRonda();
            $id("board").style.pointerEvents = "auto";
        } else {
            renderFinal();
        }
    }, 1500);
}

function renderFinal() {
    $id("game-container").style.display = "none";
    const f = $id("final-summary");
    f.style.display = "block";

    const getHistorial = (jug) => jug.historial.map(h => {
        const c = h === 'G' ? 'ganas' : h === 'E' ? 'empate' : 'pierdes';
        return `<div class="badge ${c}">${h}</div>`;
    }).join("");

    f.innerHTML = `
        <h2 style="font-weight:300; letter-spacing:5px; margin-bottom:40px">SERIE FINALIZADA</h2>
        <div style="display:flex; justify-content:space-around; align-items:center;">
            <div><p style="opacity:0.4; font-size:0.7rem">${p.j[1].nombre}</p><h3 style="font-size:3rem">${p.j[1].victorias}</h3><div style="display:flex; gap:5px">${getHistorial(p.j[1])}</div></div>
            <div style="opacity:0.1; font-size:2rem">VS</div>
            <div><p style="opacity:0.4; font-size:0.7rem">${p.j[2].nombre}</p><h3 style="font-size:3rem">${p.j[2].victorias}</h3><div style="display:flex; gap:5px">${getHistorial(p.j[2])}</div></div>
        </div>
        <button class="start-btn" style="background:transparent; color:white; border:1px solid white; margin-top:50px" onclick="location.reload()">REPETIR SERIE</button>
    `;
}

// Lógica técnica (checkGanador y iaMove) se mantiene igual...
function checkGanador(y, x) {
    const act = p.activo; const t = p.tablero;
    return (t[y].every(c => c === act) || t.every(r => r[x] === act) || (y === x && t.every((r, i) => r[i] === act)) || (y + x === 2 && t.every((r, i) => r[2-i] === act)));
}
function iaMove() {
    const t = p.tablero; const v = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(t[y][x]==="") v.push({x,y});
    const test = (jug) => { for(let s of v) { t[s.y][s.x] = jug; let w = checkGanador(s.y, s.x); t[s.y][s.x] = ""; if(w) return s; } return null; };
    const m = test(2) || test(1) || (t[1][1]==="" ? {x:1,y:1} : v[0]);
    $id("board").style.pointerEvents = "auto"; if(m) jugar(m.x, m.y);
}