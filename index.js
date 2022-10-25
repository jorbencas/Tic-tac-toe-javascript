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
  /*
    Todas las functiones de "esFinpor", se aplican 
    desde la posicion 0,0 del tablero y luego de 
    izquierda a derecha
  */
  
function esFinporVertical(y) {
  let fin = false;
  if (tablero[y].filter((f) => f === 1).length === win) {
    fin = true;
    msg = "ganas";
  } else if (tablero[y].filter((f) => f === 2).length === win) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function esFinporHorizontal(x) {
  let fin = false;
  if (tablero.filter((e) => e[x] === 1).length == win) {
    fin = true;
    msg = "ganas";
  } else if (tablero.filter((e) => e[x] === 2).length == win) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function esFinporDiagonalDescendente() {
  let fin = false;
  if (tablero.filter((_, j) => tablero[j][j] == 1).length == win) {
    fin = true;
    msg = "ganas";
  } else if (
    tablero.filter((_, j) => tablero[j][j] == 2).length == win
  ) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function esFinporDiagonalAscendente() {
  let fin = false;
  let last = tablero.length - 1;
  if (
    tablero.filter((_, i) => tablero[i][last - i] == 1).length == win
  ) {
    fin = true;
    msg = "ganas";
  } else if (
    tablero.filter((_, i) => tablero[i][last - i] == 2).length == win
  ) {
    fin = true;
    msg = "pierdes";
  }
  return fin;
}

function esFinporEmpate() {
  let fin = false;
  if (
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
    document.getElementById(
      y + "-" + x
    ).innerHTML = `<img src="${jugadores[jugadorActivo]}.svg" alt="Jugador ${jugadorActivo}">`;
    tablero[y][x] = jugadorActivo;
   
    if (
    esFinporVertical(y) || esFinporHorizontal(x) || esFinporDiagonalDescendente() 
    || esFinporDiagonalAscendente() || esFinporEmpate()
    ) {
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
    } else {
      document.getElementById(jugadorActivo).classList.remove("active");
      canbiarTurno();
      document.getElementById(jugadorActivo).classList.add("active");
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
