const $ = (selector) => document.querySelector(selector);
const $id = (selector) => document.getElementById(selector);
const win = 3;
let players;
let playState = { numPlays: 3, multiplayer: 1, activePlayer: 1, board: [] };
dispatch("RESET_PLAYSTATE");
resetBoard();

function changeMultiplayer(e) {
  dispatch("CHANGE_MULTIPLAYER", parseInt(e));
  if (playState.multiplayer == 2) {
    $id("options").innerHTML = `
      <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,1)' id="nombreJugador1" value=''>
        <label for="nombreJugador1">Nombre del jugador 1</label>
        
        <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,2)' id="nombreJugador2" value=''>
        <label for="nombreJugador2">Nombre del jugador 2</label>
        `;
  } else {
    $id("options").innerHTML = "";
    changeNameMultiPlayer("", 1);
    changeNameMultiPlayer("", 2);
  }
}

function changeNameMultiPlayer(namePlayer = "", player) {
  dispatch("SET_NAME_PLAYER", namePlayer, player);
  $("div[id^='" + player + "'] .message").innerText = namePlayer;
}

function resetBtnGame() {
  dispatch("CHANGE_MULTIPLAYER", 1);
  dispatch("RESET_NUM_PLAYS");
  dispatch("RESET_PLAYSTATE");
  $id("multiplayer").setAttribute("style", "display:block;");
  $id("info").setAttribute("style", "display:flex;");
  $id("options").innerHTML = "";
  resetBoard();
}

function resetPlayState() {
 const isMulti = playState.multiplayer == 2;
  const p1 = players[1];
  const p2 = players[2];

  // Construir filas de movimientos
  const getMovesHtml = (p) => {
    return Object.keys(p.state).map(key => {
      const play = p.state[key];
      const icon = play.name === "ganas" ? "🏆" : play.name === "empate" ? "🤝" : "❌";
      return `<span>${icon} ${play.moves} movs.</span>`;
    }).join(" | ");
  };

  $id("options").innerHTML = `
    <div style="text-align:center; animation: appear 0.5s ease;">
      <h2 style="color: #00d2ff;">RESUMEN DE BATALLA</h2>
      <table>
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Wins</th>
            <th>Historial de Partidas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${p1.name || "Jugador 1"}</td>
            <td><b style="font-size: 1.5rem; color: #2ecc71;">${p1.wins}</b></td>
            <td style="font-size: 0.8rem;">${getMovesHtml(p1)}</td>
          </tr>
          ${isMulti ? `
          <tr>
            <td>${p2.name || "Jugador 2"}</td>
            <td><b style="font-size: 1.5rem; color: #2ecc71;">${p2.wins}</b></td>
            <td style="font-size: 0.8rem;">${getMovesHtml(p2)}</td>
          </tr>` : ""}
        </tbody>
      </table>
      <button class="reset-btn" onclick="resetBtnGame()">Nueva Partida</button>
    </div>
  `;
  
  $id("board").style.display = "none";
  $id("info").style.display = "none";
}

function isEndByVertical(y) {
  let end = false;
  if (playState.board[y].filter((f) => f === 1).length === win) {
    end = true;
    dispatch("SET_WIN_NAME", "ganas", 1);
    dispatch("SET_WIN_NAME", "pierdes", 2);
  } else if (playState.board[y].filter((f) => f === 2).length === win) {
    end = true;
    dispatch("SET_WIN_NAME", "pierdes", 1);
    dispatch("SET_WIN_NAME", "ganas", 2);
  }
  return end;
}

function isEndByHorizontal(x) {
  let end = false;
  if (playState.board.filter((e) => e[x] === 1).length == win) {
    end = true;
    dispatch("SET_WIN_NAME", "ganas", 1);
    dispatch("SET_WIN_NAME", "pierdes", 2);
  } else if (playState.board.filter((e) => e[x] === 2).length == win) {
    end = true;
    dispatch("SET_WIN_NAME", "pierdes", 1);
    dispatch("SET_WIN_NAME", "ganas", 2);
  }
  return end;
}

function isEndByDiagonalFalling() {
  let end = false;
  if (
    playState.board.filter((_, j) => playState.board[j][j] == 1).length == win
  ) {
    end = true;
    dispatch("SET_WIN_NAME", "ganas", 1);
    dispatch("SET_WIN_NAME", "pierdes", 2);
  } else if (
    playState.board.filter((_, j) => playState.board[j][j] == 2).length == win
  ) {
    end = true;
    dispatch("SET_WIN_NAME", "pierdes", 1);
    dispatch("SET_WIN_NAME", "ganas", 2);
  }
  return end;
}

function isEndByDiagonalUpward() {
  let end = false;
  let last = playState.board.length - 1;
  if (
    playState.board.filter((_, i) => playState.board[i][last - i] == 1)
      .length == win
  ) {
    end = true;
    dispatch("SET_WIN_NAME", "ganas", 1);
    dispatch("SET_WIN_NAME", "pierdes", 2);
  } else if (
    playState.board.filter((_, i) => playState.board[i][last - i] == 2)
      .length == win
  ) {
    end = true;
    dispatch("SET_WIN_NAME", "pierdes", 1);
    dispatch("SET_WIN_NAME", "ganas", 2);
  }
  return end;
}

function isEndByTie() {
  let end = false;
  if (
    playState.board.filter((e) => e.filter((f) => f > 0).length == win)
      .length == win
  ) {
    end = true;
    dispatch("SET_WIN_NAME", "empate", 1);
    dispatch("SET_WIN_NAME", "empate", 2);
  }
  return end;
}

function resetBoard() {
  dispatch("CREATE_BOARD", { rows: win, cells: win });
  // Eliminamos el div 'row' para que todas las celdas sean hijos directos de .board
  $id("board").innerHTML = playState.board
    .flatMap((row, y) => 
      row.map((f, x) => `
        <div class='cell' id='${y}-${x}' onclick='play(${x},${y})'>
          ${f !== "" ? `<img src="${players[f].icon}.svg">` : ""}
        </div>`
      )
    ).join("");
}

function nextPlay(y, x) {
  let position = {
    cell: -1,
    row: -1,
  };
  let last = playState.board.length - 1;

  //DiagonalFalling
  if (
    playState.board[last][last] == 1 &&
    playState.board[last - 1][last - 1] == 1
  ) {
    position.row = 0;
    position.cell = 0;
  }
  if (playState.board[0][0] == 1 && playState.board[last - 1][last - 1] == 1) {
    position.row = last;
    position.cell = last;
  }
  if (playState.board[0][0] == 1 && playState.board[last][last] == 1) {
    position.row = last - 1;
    position.cell = last - 1;
  }

  if (
    playState.board[last][0] == 1 &&
    playState.board[last - 1][last - 1] == 1
  ) {
    //DiagonalUpward
    position.row = 0;
    position.cell = last;
  }
  if (
    playState.board[0][last] == 1 &&
    playState.board[last - 1][last - 1] == 1
  ) {
    position.row = last;
    position.cell = 0;
  }
  if (playState.board[last][0] == 1 && playState.board[0][last] == 1) {
    position.row = last - 1;
    position.cell = last - 1;
  }

  if (playState.board[y][0] == 1 && playState.board[y][last - 1] == 1) {
    //Vertical
    position.row = y;
    position.cell = last;
  }
  if (playState.board[y][last] == 1 && playState.board[y][last - 1] == 1) {
    position.row = y;
    position.cell = 0;
  }
  if (playState.board[y][last] == 1 && playState.board[y][0] == 1) {
    position.row = y;
    position.cell = last - 1;
  }

  if (playState.board[0][x] == 1 && playState.board[last - 1][x] == 1) {
    //horizontal
    position.row = last;
    position.cell = x;
  }
  if (playState.board[last][x] == 1 && playState.board[last - 1][x] == 1) {
    position.row = 0;
    position.cell = x;
  }

  if (playState.board[last][x] == 1 && playState.board[0][x] == 1) {
    position.row = last - 1;
    position.cell = x;
  }

  //una ficha
  if (position.row == -1 && position.cell == -1) {
    if (playState.board[0][0] === playState.board[y][x]) {
      position.row = last - 1;
      position.cell = last;
    }
    if (playState.board[last][last - 1] === playState.board[y][x]) {
      position.row = 0;
      position.cell = last - 1;
    }
    if (playState.board[last - 1][0] === playState.board[y][x]) {
      position.row = last;
      position.cell = last;
    }
    if (playState.board[last][last] === playState.board[y][x]) {
      position.row = last;
      position.cell = 0;
    }
    if (playState.board[0][last] === playState.board[y][x]) {
      position.row = 0;
      position.cell = last - 1;
    }
    if (playState.board[last][0] === playState.board[y][x]) {
      position.row = last - 1;
      position.cell = last - 1;
    }
    if (playState.board[last - 1][last - 1] === playState.board[y][x]) {
      position.row = last - 1;
      position.cell = 0;
    }
    if (playState.board[0][last - 1] === playState.board[y][x]) {
      position.row = last;
      position.cell = 0;
    }
    if (playState.board[last - 1][last] === playState.board[y][x]) {
      position.row = 0;
      position.cell = 0;
    }
  } else if (playState.board[position.row][position.cell] == 2) {
    playState.board.forEach((e, i) => {
      e.forEach((c, j) => {
        if (playState.board[i][j] == 0) {
          position.row = i;
          position.cell = j;
        }
      });
    });
  }

  return position;
}

function play(x, y) {
  if (
    playState.board[y][x] == "" &&
    (playState.multiplayer == 1 ||
      (playState.multiplayer == 2 &&
        players[1].name.length > 0 &&
        players[2].name.length > 0))
  ) {
    if (playState.numPlays == 3) {
      $id("multiplayer").setAttribute("style", "display:none;");
      $id("options").innerHTML = playState.numPlays + "partidas";
    }

    $id(y + "-" + x).innerHTML = `<img src="${
      players[playState.activePlayer].icon
    }.svg" alt="Jugador ${playState.activePlayer}">`;
    playState.board[y][x] = playState.activePlayer;
    $id(playState.activePlayer).classList.remove("active");

    if (
      isEndByVertical(y) ||
      isEndByHorizontal(x) ||
      isEndByDiagonalFalling() ||
      isEndByDiagonalUpward() ||
      isEndByTie()
    ) {
      const winnerCells = []; // Opcional: podrías calcular qué celdas ganaron
      
      // Añade una clase de "congelado" al tablero para que no se pueda seguir pulsando
      $id("board").style.pointerEvents = "none";
      
      // Al terminar el setTimeout de 2 seg, recuerda devolver los eventos
      setTimeout(() => {
          $id("board").style.pointerEvents = "auto";
          // ... resto de tu código de reset ...
      }, 2000);
      $("div[id^='1'] .message").innerText =
        players[1].state["play" + playState.numPlays].name.toUpperCase();
      $("div[id^='2'] .message").innerText =
        players[2].state["play" + playState.numPlays].name.toUpperCase();
      $("div[id^='1']").classList.add(
        players[1].state["play" + playState.numPlays].name
      );
      $("div[id^='2']").classList.add(
        players[2].state["play" + playState.numPlays].name
      );
      setTimeout(() => {
        $("div[id^='1'] .message").innerText = players[1].name;
        $("div[id^='2'] .message").innerText = players[2].name;
        $("div[id^='1']").classList.remove(
          players[1].state["play" + playState.numPlays].name
        );
        $("div[id^='2']").classList.remove(
          players[2].state["play" + playState.numPlays].name
        );
        dispatch("ADD_NUM_WINS");
        dispatch("CHANGE_TURN", "", 2);
        resetBoard();
        dispatch("DESINCREMENT_NUM_PLAYS");
        $id(playState.activePlayer).classList.add("active");
        if (playState.numPlays == 0) {
          resetPlayState();
        } else {
          $id("options").innerHTML = playState.numPlays + "partidas";
        }
      }, 2000);
    } else {
      dispatch("CHANGE_TURN");
      if (playState.multiplayer == 2) {
        dispatch("ADD_NUM_MOVES");
      } else if (playState.activePlayer == 2) {
        const { row, cell } = nextPlay(y, x);
        play(cell, row);
      }
      if (
        players[playState.activePlayer].state["play" + playState.numPlays].name
          .length === 0
      ) {
        $id(playState.activePlayer).classList.add("active");
      }
    }
  }
}

function dispatch(action, value = "", player = playState.activePlayer) {
  if (action == "ADD_NUM_WINS") {
    if (players[player].state["play" + playState.numPlays].name == "ganas") {
      players[player].wins++;
    }
  } else if (action == "ADD_NUM_MOVES") {
    players[player].state["play" + playState.numPlays].moves++;
  } else if (action == "SET_WIN_NAME") {
    players[player].state["play" + playState.numPlays].name = value;
  } else if (action == "DESINCREMENT_NUM_PLAYS") {
    playState.numPlays--;
  } else if (action == "SET_NAME_PLAYER") {
    players[player].name = value;
  } else if (action == "RESET_PLAYSTATE") {
    players = {
      1: { icon: "cross", state: {}, name: "", wins: 0 },
      2: { icon: "circle", state: {}, name: "", wins: 0 },
    };
  } else if (action == "CHANGE_MULTIPLAYER") {
    playState.multiplayer = value;
  } else if (action == "CHANGE_TURN") {
    playState.activePlayer = player === 1 ? 2 : 1;
    if (!players[playState.activePlayer].state["play" + playState.numPlays]) {
      players[playState.activePlayer].state["play" + playState.numPlays] = {
        name: "",
        moves: 1,
      };
    }
  } else if (action == "CREATE_BOARD") {
    const { rows, cells } = value;
    playState.board = Array.from({ length: rows }, (_, _i) =>
      Array.from({ length: cells }, (_, _i) => "")
    );
  } else if (action == "RESET_NUM_PLAYS") {
    playState.numPlays = 3;
  }
}
