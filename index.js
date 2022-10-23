let jugadores = { 1: "cross", 2: `circle` };
let jugadorActivo = 1;
let tableroHTML = document.getElementById("tablero");
let msg = "";
let win = 3;
function createTablero(rows, cells) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cells }, (_, i) => 0)
  );
}
let tablero = createTablero(3, 3);
let p = "";
resetearTablero();

function isFinJuego(x, y) {
  let fin = false;
  //vertical
  if (tablero[y].filter((f) => f === 1).length === win) {
    fin = true;
    msg = "ganas";
  }
  if (!fin) {
    if (tablero[y].filter((f) => f === 2).length === win) {
      fin = true;
      msg = "pierdes";
    }
  }
  //horizontal
  if (!fin) {
    let xarr = [];
    let yarr = [];
    tablero.forEach((e) => {
      if (e[x] === 1) {
        xarr.push(e[x]);
      } else if (e[x] === 2) {
        yarr.push(e[x]);
      }
    });

    if (xarr.length == win) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == win) {
      fin = true;
      msg = "pierdes";
    }
  }

  //todos
  if (
    !fin &&
    tablero.filter((e) => e.filter((f) => f > 0).length == win).length == win
  ) {
    fin = true;
    msg = "empate";
  }

  // diagonal izquierda
  if (!fin) {
    let xarr = [];
    let yarr = [];
    tablero[0].forEach((f, j) => {
      if (tablero[j][j] == 1) {
        xarr.push(f);
      } else if (tablero[j][j] == 2) {
        yarr.push(f);
      }
    });
    if (xarr.length == win) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == win) {
      fin = true;
      msg = "pierdes";
    }
  }
  // diagonal derecha
  if (!fin) {
    let xarr = [];
    let yarr = [];
    tablero[tablero.length - 1].forEach((f, j) => {
      let last = j < tablero.length - 1 ? tablero.length - 1 : 0;
      if (tablero[last][last] == 1) {
        xarr.push(f);
      } else if (tablero[last][last] == 2) {
        yarr.push(f);
      }
    });

    if (xarr.length == win) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == win) {
      fin = true;
      msg = "pierdes";
    }
  }
  return fin;
}

function resetearTablero(p = "") {
  tablero = createTablero(3, 3);
  tablero.forEach((e, y) => {
    p += ` 
    <div class='row'>`;
    e.forEach((f, x) => {
      let content =
        f > 0
          ? `<img src="${jugadores[jugadorActivo]}.svg" alt="Jugador ${jugadorActivo}">`
          : f;
      p += `
      <div class='cell' id='${y}-${x}' onclick='jugar(${x},${y})'>${content}</div>`;
    });
    p += `</div>`;
  });

  tableroHTML.innerHTML = p;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
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
    // if (jugadorActivo == 2) {
    //   do {
    //     x = getRandomInt(0, 3);
    //     y = getRandomInt(0, 3);
    //   } while (tablero[y][x] == 0);
    //   console.log("y" + y + "x" + x);
    //   jugar(x, y);
    // }

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

function canbiarTurno(h = jugadorActivo) {
  jugadorActivo = h === 1 ? 2 : 1;
}
