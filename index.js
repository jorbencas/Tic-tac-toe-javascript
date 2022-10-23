let jugadores = { 1: "cross", 2: `circle` };
let jugadorActivo = 1;
let tableroHTML = document.getElementById("tablero");
let msg = "";

function createTablero() {
  return Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, i) => 0)
  );
}
let tablero = createTablero();
let p = "";
resetearTablero();

function isFinJuego(x, y) {
  let fin = false;
  //vertical
  if (tablero[y].filter((f) => f === 1).length === 3) {
    fin = true;
    msg = "ganas";
  }
  if (!fin) {
    if (tablero[y].filter((f) => f === 2).length === 3) {
      fin = true;
      msg = "pierdes";
    }
  }
  //horizontal
  if (!fin) {
    let xarr = [];
    let yarr = [];
    tablero.forEach((e) => {
      e.forEach((f, j) => {
        if (j === x && f === 1) {
          yarr.push(f);
        } else if (j === x && f === 2) {
          xarr.push(f);
        }
      });
    });

    if (xarr.length == tablero.length) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == tablero.length) {
      fin = true;
      msg = "pierdes";
    }
  }

  //todos
  if (
    !fin &&
    tablero.filter((e) => e.filter((f) => f > 0).length == tablero.length)
      .length == tablero.length
  ) {
    fin = true;
    msg = "empate";
  }

  // diagonal izquierda
  if (!fin) {
    let xarr = [];
    let yarr = [];

    tablero[0].forEach((f, j) => {
      if (j < tablero.length - 1 && f === tablero[j + 1][j + 1]) {
        if (f == 1 || tablero[j + 1][j + 1] == 1) {
          yarr.push(f);
        } else if (f == 2 || tablero[j + 1][j + 1] == 2) {
          xarr.push(f);
        }
      } else if (j === tablero.length - 1) {
        if (f == 1 || tablero[j][j] == 1) {
          yarr.push(f);
        } else if (f == 2 || tablero[j][j] == 2) {
          xarr.push(f);
        }
      }
    });

    if (xarr.length == tablero.length) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == tablero.length) {
      fin = true;
      msg = "pierdes";
    }
  }
  // diagonal derecha
  if (!fin) {
    let xarr = [];
    let yarr = [];
    tablero[0].reverse().forEach((f, j) => {
      if (j < tablero.length - 1 && j === tablero[j + 1][j + 1]) {
        if (f == 1 || tablero[j + 1][j + 1] == 1) {
          yarr.push(f);
        } else if (f == 2 || tablero[j + 1][j + 1] == 2) {
          xarr.push(f);
        }
      } else if (j === tablero[j][j]) {
        if (f == 1 || tablero[j][j] == 1) {
          yarr.push(f);
        } else if (f == 2 || tablero[j][j] == 2) {
          xarr.push(f);
        }
      }
    });

    if (xarr.length == tablero.length) {
      fin = true;
      msg = "ganas";
    } else if (yarr.length == tablero.length) {
      fin = true;
      msg = "pierdes";
    }
  }
  console.log(msg);
  return fin;
}

function resetearTablero(p = "") {
  tablero = createTablero();
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
    //   let x, y;
    //   do {
    //     x = getRandomInt(0, 3);
    //     y = getRandomInt(0, 3);
    //   } while (tablero[y][x] == 0);
    //   console.log("y" + y + "x" + x);
    //   jugar(x, y);
    // }

    if (isFinJuego(x, y)) {
      document.getElementById(
        "message"
      ).innerText = `<p>El jugador 1 ha ${msg}!!!</p>`;

      setTimeout(() => {
        document.getElementById(jugadorActivo).classList.remove("active");
        document.getElementById("message").innerText = ``;
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
