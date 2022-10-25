let jugadores = {
  1: { icon: "cross", state: `` },
  2: { icon: "circle", state: `` },
};
let jugadorActivo = 1;
let tableroHTML = document.getElementById("tablero");
let win = 6;
let tablero;

resetearTablero();

function createTablero(rows, cells) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cells }, (_, i) => "")
  );
}
/*
    Todas las functiones de "esFinpor", se aplican 
    desde la posicion 0,0 del tablero y luego de 
    izquierda a derecha
  */

function esFinporVertical(y) {
  let fin = false;
  if (tablero[y].filter((f) => f === 1).length === win) {
    fin = true;
    jugadores[1].state = "ganas";
    jugadores[2].state = "pierdes";
  } else if (tablero[y].filter((f) => f === 2).length === win) {
    fin = true;
    jugadores[1].state = "pierdes";
    jugadores[2].state = "ganas";
  }
  return fin;
}

function esFinporHorizontal(x) {
  let fin = false;
  if (tablero.filter((e) => e[x] === 1).length == win) {
    fin = true;
    jugadores[1].state = "ganas";
    jugadores[2].state = "pierdes";
  } else if (tablero.filter((e) => e[x] === 2).length == win) {
    fin = true;
    jugadores[1].state = "pierdes";
    jugadores[2].state = "ganas";
  }
  return fin;
}

function esFinporDiagonalDescendente() {
  let fin = false;
  if (tablero.filter((_, j) => tablero[j][j] == 1).length == win) {
    fin = true;
    jugadores[1].state = "ganas";
    jugadores[2].state = "pierdes";
  } else if (tablero.filter((_, j) => tablero[j][j] == 2).length == win) {
    fin = true;
    jugadores[1].state = "pierdes";
    jugadores[2].state = "ganas";
  }
  return fin;
}

function esFinporDiagonalAscendente() {
  let fin = false;
  let last = tablero.length - 1;
  if (tablero.filter((_, i) => tablero[i][last - i] == 1).length == win) {
    fin = true;
    jugadores[1].state = "ganas";
    jugadores[2].state = "pierdes";
  } else if (
    tablero.filter((_, i) => tablero[i][last - i] == 2).length == win
  ) {
    fin = true;
    jugadores[1].state = "pierdes";
    jugadores[2].state = "ganas";
  }
  return fin;
}

function esFinporEmpate() {
  let fin = false;
  if (
    tablero.filter((e) => e.filter((f) => f > 0).length == win).length == win
  ) {
    fin = true;
    jugadores[1].state = "empate";
    jugadores[2].state = "empate";
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
    document.getElementById(
      y + "-" + x
    ).innerHTML = `<img src="${jugadores[jugadorActivo].icon}.svg" alt="Jugador ${jugadorActivo}">`;
    tablero[y][x] = jugadorActivo;

    if (
      esFinporVertical(y) ||
      esFinporHorizontal(x) ||
      esFinporDiagonalDescendente() ||
      esFinporDiagonalAscendente() ||
      esFinporEmpate()
    ) {
      document.getElementById(jugadorActivo).classList.remove("active");
      document.querySelector("div[id^='1'] .message").innerText =
        jugadores[1].state.toUpperCase();
      document.querySelector("div[id^='2'] .message").innerText =
        jugadores[2].state.toUpperCase();
      document.querySelector("div[id^='1']").classList.add(jugadores[1].state);
      document.querySelector("div[id^='2']").classList.add(jugadores[2].state);
      setTimeout(() => {
        document.querySelector("div[id^='1'] .message").innerText = "";
        document.querySelector("div[id^='2'] .message").innerText = "";
        document
          .querySelector("div[id^='1']")
          .classList.remove(jugadores[1].state);
        document
          .querySelector("div[id^='2']")
          .classList.remove(jugadores[2].state);
        canbiarTurno(2);
        resetearTablero();
        document.getElementById(jugadorActivo).classList.add("active");
      }, 2000);
    } else {
      document.getElementById(jugadorActivo).classList.remove("active");
      canbiarTurno();
      document.getElementById(jugadorActivo).classList.add("active");
    }
  }
}
