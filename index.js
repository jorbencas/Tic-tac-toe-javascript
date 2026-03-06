const $id = (id) => document.getElementById(id);

let state = {
    ronda: 1, modo: 1, pieza: 'cross', activo: 1, tablero: [],
    p: {
        1: { nombre: "J1", icono: "cross", wins: 0, log: [] },
        2: { nombre: "IA", icono: "circle", wins: 0, log: [] }
    }
};

// Función de carga inicial para evitar errores visuales
window.onload = () => {
    state.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    $id("board").innerHTML = state.tablero.flatMap((f, y) => 
        f.map((_, x) => `<div class='cell' id='c-${y}-${x}'></div>`)
    ).join("");
};

function cambiarModo(v) {
    state.modo = parseInt(v);
    $id("name-inputs").style.display = state.modo === 2 ? "block" : "none";
    $id("piece-selector").style.display = state.modo === 1 ? "block" : "none";
}

function seleccionarPieza(tipo, el) {
    state.pieza = tipo;
    document.querySelectorAll('.piece-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function confirmarInicio() {
    state.p[1].nombre = $id("n1").value || "Jugador 1";
    state.p[2].nombre = state.modo === 2 ? ($id("n2").value || "Jugador 2") : "IA Gemini";

    if(state.modo === 1) {
        state.p[1].icono = state.pieza;
        state.p[2].icono = state.pieza === 'cross' ? 'circle' : 'cross';
    } else {
        state.p[1].icono = 'cross'; state.p[2].icono = 'circle';
    }

    $id("icon-1").src = `${state.p[1].icono}.svg`;
    $id("icon-2").src = `${state.p[2].icono}.svg`;
    $id("name-1").innerText = state.p[1].nombre;
    $id("name-2").innerText = state.p[2].nombre;
    
    $id("setup-panel").style.display = "none";
    $id("scoreboard").style.display = "block";
    iniciarSerie();
}

function iniciarSerie() {
    state.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    state.activo = 1;
    $id("round-info").innerText = `RONDA ${state.ronda} DE 3`;
    $id("board").innerHTML = state.tablero.flatMap((f, y) => 
        f.map((_, x) => `<div class='cell' onclick='jugar(${x},${y})' id='c-${y}-${x}'></div>`)
    ).join("");
    updateUI();
}

function jugar(x, y) {
    if (state.tablero[y][x] !== "") return;
    state.tablero[y][x] = state.activo;
    $id(`c-${y}-${x}`).innerHTML = `<img src="${state.p[state.activo].icono}.svg">`;

    if (verificar(y, x)) {
        finalizar("victoria");
    } else if (state.tablero.flat().every(c => c !== "")) {
        finalizar("empate");
    } else {
        state.activo = state.activo === 1 ? 2 : 1;
        updateUI();
        if(state.modo === 1 && state.activo === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(iaMove, 600);
        }
    }
}

function updateUI() {
    $id("p1").classList.toggle("active", state.activo === 1);
    $id("p2").classList.toggle("active", state.activo === 2);
}

function finalizar(res) {
    if (res === "victoria") {
        state.p[state.activo].wins++;
        state.p[state.activo].log.push('G');
        state.p[state.activo === 1 ? 2 : 1].log.push('P');
        $id("toast-sub").innerText = "PUNTO PARA";
        $id("toast-main").innerText = state.p[state.activo].nombre;
    } else {
        state.p[1].log.push('E'); state.p[2].log.push('E');
        $id("toast-sub").innerText = "RESULTADO"; $id("toast-main").innerText = "EMPATE";
    }

    $id("wins-1").innerText = state.p[1].wins;
    $id("wins-2").innerText = state.p[2].wins;
    $id("toast").classList.add("show");

    setTimeout(() => {
        $id("toast").classList.remove("show");
        if (state.ronda < 3) {
            state.ronda++; iniciarSerie();
            $id("board").style.pointerEvents = "auto";
        } else {
            renderFinal();
        }
    }, 1500);
}

function renderFinal() {
    $id("game-container").style.display = "none";
    const fs = $id("final-summary");
    fs.style.display = "block";
    const drawLog = (j) => j.log.map(l => `<div class="res-dot ${l}">${l}</div>`).join("");

    fs.innerHTML = `
        <h1 style="letter-spacing:10px; font-weight:300; margin-bottom:60px">SERIE FINALIZADA</h1>
        <div style="display:flex; justify-content:space-around; align-items:center; width: 100%">
            <div class="final-card">
                <p style="opacity:0.3; font-size:0.8rem">${state.p[1].nombre}</p>
                <h2 style="font-size:6rem; margin:10px 0">${state.p[1].wins}</h2>
                <div>${drawLog(state.p[1])}</div>
            </div>
            <div style="font-size:3rem; opacity:0.1">VS</div>
            <div class="final-card">
                <p style="opacity:0.3; font-size:0.8rem">${state.p[2].nombre}</p>
                <h2 style="font-size:6rem; margin:10px 0">${state.p[2].wins}</h2>
                <div>${drawLog(state.p[2])}</div>
            </div>
        </div>
        <button class="mega-btn" style="width:300px; background:transparent; color:white; border:1px solid #333; margin-top:80px" onclick="location.reload()">REINICIAR TODO</button>
    `;
}

function verificar(y, x) {
    const a = state.activo; const t = state.tablero;
    return (t[y].every(c => c === a) || t.every(r => r[x] === a) || (y === x && t.every((r, i) => r[i] === a)) || (y + x === 2 && t.every((r, i) => r[2-i] === a)));
}

function iaMove() {
    const t = state.tablero; const v = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(t[y][x]==="") v.push({x,y});
    const test = (j) => { for(let s of v) { t[s.y][s.x] = j; let w = verificar(s.y, s.x); t[s.y][s.x] = ""; if(w) return s; } return null; };
    const m = test(2) || test(1) || (t[1][1]==="" ? {x:1,y:1} : v[0]);
    $id("board").style.pointerEvents = "auto"; if(m) jugar(m.x, m.y);
}