const $ = (s) => document.querySelector(s);
const $id = (i) => document.getElementById(i);

let juego = {
    modo: 1, ronda: 1, piezaUser: 'cross', activo: 1, tablero: [],
    jugadores: {
        1: { nombre: "Jugador 1", icono: "cross", victorias: 0, historial: [] },
        2: { nombre: "IA", icono: "circle", victorias: 0, historial: [] }
    }
};

function cambiarModo(val) {
    juego.modo = parseInt(val);
    $id("name-inputs").style.display = juego.modo === 2 ? "block" : "none";
    $id("piece-selector").style.display = juego.modo === 1 ? "block" : "none";
}

function seleccionarPieza(tipo, btn) {
    juego.piezaUser = tipo;
    document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function confirmarInicio() {
    juego.jugadores[1].nombre = $id("n1")?.value.trim() || "Jugador 1";
    juego.jugadores[2].nombre = juego.modo === 2 ? ($id("n2")?.value.trim() || "Jugador 2") : "IA";

    if (juego.modo === 1) {
        juego.jugadores[1].icono = juego.piezaUser;
        juego.jugadores[2].icono = juego.piezaUser === 'cross' ? 'circle' : 'cross';
    } else {
        juego.jugadores[1].icono = 'cross'; juego.jugadores[2].icono = 'circle';
    }

    $id("icon-1").src = `${juego.jugadores[1].icono}.svg`;
    $id("icon-2").src = `${juego.jugadores[2].icono}.svg`;
    $id("name-1").innerText = juego.jugadores[1].nombre;
    $id("name-2").innerText = juego.jugadores[2].nombre;

    $id("setup-panel").style.display = "none";
    $id("scoreboard").style.display = "block";
    iniciarRonda();
}

function iniciarRonda() {
    juego.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    juego.activo = 1;
    $id("round-info").innerText = `RONDA ${juego.ronda} DE 3`;
    $id("board").innerHTML = juego.tablero.flatMap((f, y) => 
        f.map((_, x) => `<div class='cell' onclick='clicCelda(${x},${y})' id='c-${y}-${x}'></div>`)
    ).join("");
    toggleUIActive();
}

function clicCelda(x, y) {
    if (juego.tablero[y][x] !== "") return;
    juego.tablero[y][x] = juego.activo;
    $id(`c-${y}-${x}`).innerHTML = `<img src="${juego.jugadores[juego.activo].icono}.svg">`;

    if (verificarGanador(y, x)) {
        finalizarRonda("victoria");
    } else if (juego.tablero.flat().every(c => c !== "")) {
        finalizarRonda("empate");
    } else {
        juego.activo = juego.activo === 1 ? 2 : 1;
        toggleUIActive();
        if (juego.modo === 1 && juego.activo === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(turnoIA, 600);
        }
    }
}

function toggleUIActive() {
    $id("p1").classList.toggle("active", juego.activo === 1);
    $id("p2").classList.toggle("active", juego.activo === 2);
}

function finalizarRonda(tipo) {
    let t1, t2;
    if (tipo === "victoria") {
        juego.jugadores[juego.activo].victorias++;
        juego.jugadores[juego.activo].historial.push('G');
        juego.jugadores[juego.activo === 1 ? 2 : 1].historial.push('P');
        t1 = "RONDA GANADA POR";
        t2 = juego.jugadores[juego.activo].nombre.toUpperCase();
    } else {
        juego.jugadores[1].historial.push('E');
        juego.jugadores[2].historial.push('E');
        t1 = "RESULTADO"; t2 = "EMPATE";
    }

    $id("wins-1").innerText = juego.jugadores[1].victorias;
    $id("wins-2").innerText = juego.jugadores[2].victorias;
    $id("announcement-text").innerText = t1;
    $id("winner-display").innerText = t2;
    $id("announcement").classList.add("show");

    setTimeout(() => {
        $id("announcement").classList.remove("show");
        if (juego.ronda < 3) {
            juego.ronda++; iniciarRonda();
            $id("board").style.pointerEvents = "auto";
        } else { mostrarResumen(); }
    }, 1600);
}

function mostrarResumen() {
    $id("game-container").style.display = "none";
    const fs = $id("final-summary");
    fs.style.display = "block";

    const getH = (jug) => jug.historial.map(h => `<div class="badge ${h}">${h}</div>`).join("");

    fs.innerHTML = `
        <h2 style="letter-spacing:5px; font-weight:300; margin-bottom:40px">SERIE COMPLETADA</h2>
        <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:50px">
            <div>
                <p style="opacity:0.4; font-size:0.75rem">${juego.jugadores[1].nombre}</p>
                <h3 style="font-size:3.5rem; margin:10px 0">${juego.jugadores[1].victorias}</h3>
                <div class="badge-container">${getH(juego.jugadores[1])}</div>
            </div>
            <div style="opacity:0.1; font-size:2rem">VS</div>
            <div>
                <p style="opacity:0.4; font-size:0.75rem">${juego.jugadores[2].nombre}</p>
                <h3 style="font-size:3.5rem; margin:10px 0">${juego.jugadores[2].victorias}</h3>
                <div class="badge-container">${getH(juego.jugadores[2])}</div>
            </div>
        </div>
        <button class="start-btn" style="background:transparent; color:white; border:1px solid white" onclick="location.reload()">NUEVA SERIE</button>
    `;
}

function verificarGanador(y, x) {
    const act = juego.activo; const t = juego.tablero;
    return (t[y].every(c => c === act) || t.every(r => r[x] === act) || (y === x && t.every((r, i) => r[i] === act)) || (y + x === 2 && t.every((r, i) => r[2-i] === act)));
}

function turnoIA() {
    const t = juego.tablero; const vacias = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(t[y][x]==="") vacias.push({x,y});
    const test = (jug) => { for(let s of vacias) { t[s.y][s.x] = jug; let w = verificarGanador(s.y, s.x); t[s.y][s.x] = ""; if(w) return s; } return null; };
    const m = test(2) || test(1) || (t[1][1]==="" ? {x:1,y:1} : vacias[0]);
    $id("board").style.pointerEvents = "auto"; if(m) clicCelda(m.x, m.y);
}