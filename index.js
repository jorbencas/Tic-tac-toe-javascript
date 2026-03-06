const $ = (s) => document.querySelector(s);
const $id = (i) => document.getElementById(i);

let datos = {
    rondasMax: 3,
    rondaActual: 1,
    modo: 1, // 1: IA, 2: Multi
    piezaJugador: 'cross',
    jugadorActivo: 1,
    tablero: [],
    jugadores: {
        1: { nombre: "Jugador 1", icono: "cross", victorias: 0, historial: [] },
        2: { nombre: "Bot Gemini", icono: "circle", victorias: 0, historial: [] }
    }
};

function cambiarModo(val) {
    datos.modo = parseInt(val);
    $id("area-nombres").style.display = datos.modo === 2 ? "block" : "none";
    $id("selector-pieza").style.display = datos.modo === 1 ? "block" : "none";
}

function elegirPieza(tipo, elemento) {
    datos.piezaJugador = tipo;
    document.querySelectorAll('.pieza-btn').forEach(b => b.classList.remove('activa'));
    elemento.classList.add('activa');
}

function confirmarInicio() {
    // Configurar nombres
    datos.jugadores[1].nombre = $id("nombre-j1").value.trim() || "Jugador 1";
    datos.jugadores[2].nombre = datos.modo === 2 ? ($id("nombre-j2").value.trim() || "Jugador 2") : "Bot Gemini";

    // Configurar iconos
    if (datos.modo === 1) {
        datos.jugadores[1].icono = datos.piezaJugador;
        datos.jugadores[2].icono = datos.piezaJugador === 'cross' ? 'circle' : 'cross';
    } else {
        datos.jugadores[1].icono = 'cross';
        datos.jugadores[2].icono = 'circle';
    }

    // Actualizar UI
    $id("img-p1").src = `${datos.jugadores[1].icono}.svg`;
    $id("img-p2").src = `${datos.jugadores[2].icono}.svg`;
    $id("txt-p1").innerText = datos.jugadores[1].nombre;
    $id("txt-p2").innerText = datos.jugadores[2].nombre;

    $id("menu-configuracion").style.display = "none";
    $id("marcador").style.display = "block";
    
    iniciarRonda();
}

function iniciarRonda() {
    datos.tablero = Array.from({length: 3}, () => Array(3).fill(""));
    datos.jugadorActivo = 1;
    $id("info-ronda").innerText = `RONDA ${datos.rondaActual} DE 3`;
    $id("tablero").innerHTML = datos.tablero.flatMap((fila, y) => 
        fila.map((_, x) => `<div class='celda' onclick='marcar(${x},${y})' id='c-${y}-${x}'></div>`)
    ).join("");
    $id("p2").classList.remove("activa");
    $id("p1").classList.add("activa");
}

function marcar(x, y) {
    if (datos.tablero[y][x] !== "") return;
    
    datos.tablero[y][x] = datos.jugadorActivo;
    $id(`c-${y}-${x}`).innerHTML = `<img src="${datos.jugadores[datos.jugadorActivo].icono}.svg">`;

    if (comprobarGanador(y, x)) {
        finalizarTurno("victoria");
    } else if (datos.tablero.flat().every(c => c !== "")) {
        finalizarTurno("empate");
    } else {
        cambiarTurno();
    }
}

function cambiarTurno() {
    $id(`p${datos.jugadorActivo}`).classList.remove("activa");
    datos.jugadorActivo = datos.jugadorActivo === 1 ? 2 : 1;
    $id(`p${datos.jugadorActivo}`).classList.add("activa");

    if (datos.modo === 1 && datos.jugadorActivo === 2) {
        $id("tablero").style.pointerEvents = "none";
        setTimeout(movimientoIA, 600);
    }
}

function finalizarTurno(resultado) {
    let texto, ganador;
    if (resultado === "victoria") {
        ganador = datos.jugadores[datos.jugadorActivo].nombre;
        texto = `¡PUNTO PARA ${ganador.toUpperCase()}!`;
        datos.jugadores[datos.jugadorActivo].victorias++;
        datos.jugadores[datos.jugadorActivo].historial.push('G');
        datos.jugadores[datos.jugadorActivo === 1 ? 2 : 1].historial.push('P');
    } else {
        texto = "¡EMPATE EN ESTA RONDA!";
        ganador = "🤝";
        datos.jugadores[1].historial.push('E');
        datos.jugadores[2].historial.push('E');
    }

    $id("puntos-1").innerText = datos.jugadores[1].victorias;
    $id("puntos-2").innerText = datos.jugadores[2].victorias;

    $id("anuncio-texto").innerText = texto;
    $id("anuncio-ganador").innerText = ganador;
    $id("anuncio").classList.add("show");

    setTimeout(() => {
        $id("anuncio").classList.remove("show");
        if (datos.rondaActual < 3) {
            datos.rondaActual++;
            iniciarRonda();
            $id("tablero").style.pointerEvents = "auto";
        } else {
            mostrarResumenFinal();
        }
    }, 1800);
}

function mostrarResumenFinal() {
    $id("contenedor-juego").style.display = "none";
    const final = $id("resumen-final");
    final.style.display = "block";

    const generarLog = (jugador) => jugador.historial.map(h => {
        const clase = h === 'G' ? 'ganado' : h === 'E' ? 'empate' : 'perdido';
        return `<div class="circulo-estado ${clase}">${h}</div>`;
    }).join("");

    final.innerHTML = `
        <h2 style="font-weight:300; letter-spacing:5px;">RESULTADOS FINALES</h2>
        <div style="display:flex; justify-content:space-around; margin:50px 0;">
            <div>
                <p style="opacity:0.4; font-size:0.8rem">${datos.jugadores[1].nombre}</p>
                <h3 style="font-size:3.5rem">${datos.jugadores[1].victorias}</h3>
                <div>${generarLog(datos.jugadores[1])}</div>
            </div>
            <div>
                <p style="opacity:0.4; font-size:0.8rem">${datos.jugadores[2].nombre}</p>
                <h3 style="font-size:3.5rem">${datos.jugadores[2].victorias}</h3>
                <div>${generarLog(datos.jugadores[2])}</div>
            </div>
        </div>
        <button class="btn-inicio" onclick="location.reload()">VOLVER A EMPEZAR</button>
    `;
}

// Lógica de juego estándar
function comprobarGanador(y, x) {
    const p = datos.jugadorActivo;
    const t = datos.tablero;
    return (t[y].every(c => c === p) || t.every(r => r[x] === p) || 
           (y === x && t.every((r, i) => r[i] === p)) || 
           (y + x === 2 && t.every((r, i) => r[2-i] === p)));
}

function movimientoIA() {
    const t = datos.tablero;
    const vacias = [];
    for(let y=0; y<3; y++) for(let x=0; x<3; x++) if(t[y][x]==="") vacias.push({x,y});
    
    const test = (p) => {
        for(let v of vacias) {
            t[v.y][v.x] = p;
            let win = comprobarGanador(v.y, v.x);
            t[v.y][v.x] = ""; if(win) return v;
        } return null;
    };
    
    const mov = test(2) || test(1) || (t[1][1]==="" ? {x:1,y:1} : vacias[0]);
    $id("tablero").style.pointerEvents = "auto";
    if(mov) marcar(mov.x, mov.y);
}