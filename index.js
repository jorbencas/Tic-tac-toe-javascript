const $id = (id) => document.getElementById(id);
let game = {
    ronda: 1, modo: 1, pieza: 'cross', activo: 1, tablero: [],
    p: {
        1: { nombre: "J1", icono: "cross", wins: 0, log: [] },
        2: { nombre: "IA", icono: "circle", wins: 0, log: [] }
    }
};

function cambiarModo(v) {
    game.modo = parseInt(v);
    $id("name-inputs").style.display = game.modo === 2 ? "block" : "none";
    $id("piece-selector").style.display = game.modo === 1 ? "block" : "none";
}

function seleccionarPieza(tipo, elemento) {
    game.pieza = tipo;
    document.querySelectorAll('.piece-card').forEach(c => c.classList.remove('active'));
    elemento.classList.add('active');
}

function confirmarInicio() {
    game.p[1].nombre = $id("n1").value || "Jugador 1";
    game.p[2].nombre = game.modo === 2 ? ($id("n2").value || "Jugador 2") : "IA Gemini";

    if(game.modo === 1) {
        game.p[1].icono = game.pieza;
        game.p[2].icono = game.pieza === 'cross' ? 'circle' : 'cross';
    } else {
        game.p[1].icono = 'cross'; game.p[2].icono = 'circle';
    }

    $id("icon-1").src = `${game.p[1].icono}.svg`;
    $id("icon-2").src = `${game.p[2].icono}.svg`;
    $id("name-1").innerText = game.p[1].nombre;
    $id("name-2").innerText = game.p[2].nombre;
    $id("setup-panel").style.display = "none";
    $id("scoreboard").style.display = "block";
    nuevaRonda();
}

function nuevaRonda() {
    game.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    game.activo = 1;
    $id("round-info").innerText = `RONDA ${game.ronda} / 3`;
    $id("board").innerHTML = game.tablero.flatMap((f, y) => 
        f.map((_, x) => `<div class='cell' onclick='ejecutarMovimiento(${x},${y})' id='c-${y}-${x}'></div>`)
    ).join("");
    actualizarUI();
}

function ejecutarMovimiento(x, y) {
    if (game.tablero[y][x] !== "") return;
    game.tablero[y][x] = game.activo;
    $id(`c-${y}-${x}`).innerHTML = `<img src="${game.p[game.activo].icono}.svg">`;

    if (verificarGanador(y, x)) {
        gestionarFin("victoria");
    } else if (game.tablero.flat().every(c => c !== "")) {
        gestionarFin("empate");
    } else {
        game.activo = game.activo === 1 ? 2 : 1;
        actualizarUI();
        if(game.modo === 1 && game.activo === 2) {
            $id("board").style.pointerEvents = "none";
            setTimeout(iaPro, 600);
        }
    }
}

function actualizarUI() {
    $id("p1").classList.toggle("active", game.activo === 1);
    $id("p2").classList.toggle("active", game.activo === 2);
}

function gestionarFin(res) {
    if (res === "victoria") {
        game.p[game.activo].wins++;
        game.p[game.activo].log.push('G');
        game.p[game.activo === 1 ? 2 : 1].log.push('P');
        $id("toast-sub").innerText = "VICTORIA PARA";
        $id("toast-main").innerText = game.p[game.activo].nombre.toUpperCase();
    } else {
        game.p[1].log.push('E'); game.p[2].log.push('E');
        $id("toast-sub").innerText = "ESTA RONDA ES UN"; $id("toast-main").innerText = "EMPATE";
    }

    $id("wins-1").innerText = game.p[1].wins;
    $id("wins-2").innerText = game.p[2].wins;
    $id("toast").classList.add("show");

    setTimeout(() => {
        $id("toast").classList.remove("show");
        if (game.ronda < 3) {
            game.ronda++; nuevaRonda();
            $id("board").style.pointerEvents = "auto";
        } else {
            pantallaFinal();
        }
    }, 1500);
}

function pantallaFinal() {
    $id("game-container").style.display = "none";
    const fs = $id("final-summary");
    fs.style.display = "block";
    const renderLog = (jug) => jug.log.map(l => `<div class="res-circle ${l}">${l}</div>`).join("");

    fs.innerHTML = `
        <h2 style="letter-spacing:8px; font-weight:300; margin-bottom:60px">RESULTADOS DE LA SERIE</h2>
        <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:80px">
            <div>
                <p style="opacity:0.3; font-size:0.8rem; margin-bottom:20px">${game.p[1].nombre}</p>
                <h3 style="font-size:5rem; margin:0">${game.p[1].wins}</h3>
                <div style="margin-top:20px">${renderLog(game.p[1])}</div>
            </div>
            <div style="opacity:0.05; font-size:4rem; font-weight:900">VS</div>
            <div>
                <p style="opacity:0.3; font-size:0.8rem; margin-bottom:20px">${game.p[2].nombre}</p>
                <h3 style="font-size:5rem; margin:0">${game.p[2].wins}</h3>
                <div style="margin-top:20px">${renderLog(game.p[2])}</div>
            </div>
        </div>
        <button class="mega-btn" style="background:transparent; color:white; border:1px solid #333" onclick="location.reload()">VOLVER AL MENÚ</button>
    `;
}

function verificarGanador(y, x) {
    const a = game.activo; const t = game.tablero;
    return (t[y].every(c => c === a) || t.every(r => r[x] === a) || (y === x && t.every((r, i) => r[i] === a)) || (y + x === 2 && t.every((r, i) => r[2-i] === a)));
}

function iaPro() {
    const t = game.tablero; const v = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(t[y][x]==="") v.push({x,y});
    const test = (j) => { for(let s of v) { t[s.y][s.x] = j; let w = verificarGanador(s.y, s.x); t[s.y][s.x] = ""; if(w) return s; } return null; };
    const m = test(2) || test(1) || (t[1][1]==="" ? {x:1,y:1} : v[0]);
    $id("board").style.pointerEvents = "auto"; if(m) ejecutarMovimiento(m.x, m.y);
}