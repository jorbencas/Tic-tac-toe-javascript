let jugadores = { 1: "cross", 2: `circle` };
let jugadorActivo = 1;
let tableroHTML = document.getElementById("tablero");
let msg = "";
let win = 3;
let tablero;

resetearTablero();

function createTablero(rows, cells) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cells }, (_, i) => "")
  );
}

function isFinJuego(x, y) {
  /*Todas las functiones de validar, 
  se aplican desde la posicion 0,0 
  del tablero*/
  let fin = false;
  fin = ganaVertical(false, y);
  fin = ganaHorizontal(false, x);
  fin = ganaDiagonalPrincipioaUltimo(false);
  fin = ganaDiagonalUltimoaPrincipio(false);
  fin = empate(false);
  return fin;
}

function ganaVertical(fin, y) {
  if (tablero[y].filter((f) => f === 1).length === win) {
    fin = true;
    msg = "ganas";
  } else if (tablero[y].filter((f) => f === 2).length === win) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function ganaHorizontal(fin, x) {
  if (!fin && tablero.filter((e) => e[x] === 1).length == win) {
    fin = true;
    msg = "ganas";
  } else if (!fin && tablero.filter((e) => e[x] === 2).length == win) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function ganaDiagonalPrincipioaUltimo(fin) {
  if (!fin && tablero.filter((_, j) => tablero[j][j] == 1).length == win) {
    fin = true;
    msg = "ganas";
  } else if (
    !fin &&
    tablero.filter((_, j) => tablero[j][j] == 2).length == win
  ) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function ganaDiagonalUltimoaPrincipio(fin) {
  let last = tablero.length - 1;
  if (
    !fin &&
    tablero.filter((_, i) => tablero[i][last - i] == 1).length == win
  ) {
    fin = true;
    msg = "ganas";
  } else if (
    !fin &&
    tablero.filter((_, i) => tablero[i][last - i] == 2).length == win
  ) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function empate(fin) {
  if (
    !fin &&
    tablero.filter((e) => e.filter((f) => f > 0).length == win).length == win
  ) {
    fin = true;
    msg = "empate";
  }
  return fin;
}

function resetearTablero() {
  tablero = createTablero(win, win);
  tableroHTML.innerHTML = tablero
    .map((e, y) => {
      return (
        `<div class='row'>` +
        e
          .map((f, x) => {
            return `
      <div class='cell' id='${y}-${x}' onclick='jugar(${x},${y})'>${f}</div>`;
          })
          .join("") +
        `</div>`
      );
    })
    .join("");
}

function canbiarTurno(h = jugadorActivo) {
  jugadorActivo = h === 1 ? 2 : 1;
}

function jugar(x, y) {
  if (tablero[y][x] == 0) {
    document.getElementById(jugadorActivo).classList.remove("active");
    document.getElementById(
      y + "-" + x
    ).innerHTML = `<img src="${jugadores[jugadorActivo]}.svg" alt="Jugador ${jugadorActivo}">`;
    tablero[y][x] = jugadorActivo;
    canbiarTurno();
    document.getElementById(jugadorActivo).classList.add("active");
    if (isFinJuego(x, y)) {
      document.getElementById("message").innerText = `${msg}!!!`;
      document.getElementById("message").classList.add(msg);

      setTimeout(() => {
        document.getElementById(jugadorActivo).classList.remove("active");
        document.getElementById("message").innerText = ``;
        document.getElementById("message").classList.remove(msg);
        canbiarTurno(2);
        resetearTablero();
        document.getElementById(jugadorActivo).classList.add("active");
      }, 2000);
    }
  }
}

// function selectTablero(i) {
//   tableroHTML.setAttribute("display", "flex");
//   document.getElementById("message").setAttribute("display", "block");
//   document.getElementById("info").setAttribute("display", "flex");
//   document.getElementById("select").setAttribute("display", "none");
//   win = i;
//   //resetearTablero();
// }

// function hideTablero() {
//   tableroHTML.setAttribute("display", "none");
//   document.getElementById("message").setAttribute("display", "none");
//   document.getElementById("info").setAttribute("display", "none");
//   document.getElementById("select").setAttribute("display", "block");
// }
