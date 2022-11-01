const $ = (selector) => document.querySelector(selector);
const $id = (selector) => document.getElementById(selector);
const win = 3;
let players;
let playState = {
  numPlays: 3,
  multiplayer: 1,
  activePlayer: 1,
  board: [],
};
dispatch("RESET_PLAYSTATE");
resetBoard();

function changeMultiplayer(e) {
  dispatch("CHANGE_MULTIPLAYER", parseInt(e));
  if (playState.multiplayer == 2) {
    $id("options").innerHTML = `
      <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,1)' id="nombreJugador" value=''>
        <label for="nombreJugador">Nombre del jugador 1</label>
        
        <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,2)' id="nombreJugador" value=''>
        <label for="nombreJugador">Nombre del jugador 3</label>
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

function resetPlayState() {
  if (playState.multiplayer == 2) {
    let numPlays = { 1: "utltima", 2: "segunda", 3: "primera" };

    let num1 = "";
    for (const key in players[1].state) {
      if (Object.hasOwnProperty.call(players[1].state, key)) {
        const element = players[1].state[key];
        if (element.name === "ganas") {
          num1 += `<td> ${numPlays[key.replace("play", "")]} partida : ${
            element.moves
          } movimientos</td>`;
        }
      }
    }
    let num2 = "";
    for (const key in players[2].state) {
      if (Object.hasOwnProperty.call(players[2].state, key)) {
        const element = players[2].state[key];
        if (element.name === "ganas") {
          num2 += `<td> ${numPlays[key.replace("play", "")]} partida : ${
            element.moves
          } movimientos</td>`;
        }
      }
    }
    let colspan = num1.length > 0 && num2.length > 0 ? 2 : 2;
    $id("options").innerHTML = `<table border='1'>
    <thead>
      <th>Jugadores</th>
      <th>Victorias</th>
      <th colspan='${colspan}'>Movimientos por partidas</th>
    </thead>
      <tbody>
        <tr>
          <td>${players[1].name}</td>
          <td>${players[1].numWins}</td>
          ${num1}
        </tr>
        <tr>
          <td>${players[2].name}</td>
          <td>${players[2].numWins}</td>
          ${num2}
        </tr>
      </tbody>
    </table>`;
  }
  dispatch("CHANGE_MULTIPLAYER", 1);
  dispatch("RESET_NUM_PLAYS");
  $id("multiplayer").setAttribute("display", "block");
  dispatch("RESET_PLAYSTATE");
}

/*
    Todas las functiones de "isEndBy", se aplican 
    desde la posicion 0,0 del tablero y luego de 
    izquierda a derecha
  */

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
  $id("board").innerHTML = playState.board
    .map((e, y) => {
      return (
        `<div class='row'>` +
        e
          .map((f, x) => {
            return `
      <div class='cell' id='${y}-${x}' onclick='play(${x},${y})'>${f}</div>`;
          })
          .join("") +
        `</div>`
      );
    })
    .join("");
}

function nextPlay(y, x) {
  let position = {
    cell: -1,
    row: -1,
  };
  let last = playState.board.length - 1;
  //una ficha
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
    playState.multiplayer == 2 &&
    players[1].name.length == 0 &&
    players[2].name.length == 0
  ) {
    return;
  }

  if (playState.numPlays == 3) {
    $id("multiplayer").setAttribute("display", "none");
    $id("options").innerHTML = "";
  }

  if (playState.board[y][x] == "") {
    $id(y + "-" + x).innerHTML = `<img src="${
      players[playState.activePlayer].icon
    }.svg" alt="Jugador ${playState.activePlayer}">`;
    playState.board[y][x] = playState.activePlayer;

    if (
      isEndByVertical(y) ||
      isEndByHorizontal(x) ||
      isEndByDiagonalFalling() ||
      isEndByDiagonalUpward() ||
      isEndByTie()
    ) {
      $id(playState.activePlayer).classList.remove("active");
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
        $id(playState.activePlayer).classList.remove("active");
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
      $id(playState.activePlayer).classList.remove("active");
      dispatch("CHANGE_TURN");
      if (playState.multiplayer == 2) {
        dispatch("ADD_NUM_MOVES");
      } else if (playState.multiplayer == 1 && playState.activePlayer == 2) {
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
      players[player].numWins++;
    }
  } else if (action == "ADD_NUM_MOVES") {
    if (!players[player].state["play" + playState.numPlays]) {
      players[player].state["play" + playState.numPlays] = {
        name: "",
        moves: 1,
      };
    }
    players[player].state["play" + playState.numPlays].moves++;
  } else if (action == "SET_WIN_NAME") {
    players[player].state["play" + playState.numPlays].name = value;
  } else if (action == "DESINCREMENT_NUM_PLAYS") {
    playState.numPlays--;
  } else if (action == "SET_NAME_PLAYER") {
    players[player].name = value;
  } else if (action == "RESET_PLAYSTATE") {
    players = {
      1: {
        icon: "cross",
        state: {},
        name: "",
        numWins: 0,
      },
      2: {
        icon: "circle",
        state: {},
        name: "",
        numWins: 0,
      },
    };
  } else if (action == "CHANGE_MULTIPLAYER") {
    playState.multiplayer = value;
  } else if (action == "CHANGE_TURN") {
    playState.activePlayer = player === 1 ? 2 : 1;
    if (!players[player].state["play" + playState.numPlays]) {
      players[player].state["play" + playState.numPlays] = {
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
