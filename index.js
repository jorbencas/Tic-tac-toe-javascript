const $ = (selector) => document.querySelector(selector);
const $id = (selector) => document.getElementById(selector);
const tableroHTML = $id("board");
const win = 3;
let players = {
  1: { icon: "cross", state: ``, name: "", moves: 0, numWins: 0, numLost: 0 },
  2: { icon: "circle", state: ``, name: "", moves: 0, numWins: 0, numLost: 0 },
};
let playState = {
  numPlays: 3,
  multiplayer: 1,
  activePlayer: 1,
  board: [],
};

function changeMultiplayer(e) {
  if(playState.numPlays === 3){
    dispatch('CHANGE_MULTIPLAYER',parseInt(e.currentTarget.value));
    if (playState.multiplayer == 2) {
      $id("options").innerHTML = `
      <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,1)' id="nombreJugador" value=''>
        <label for="nombreJugador">Nombre del jugador 1</label>
        
        <input type="text" onchange='changeNameMultiPlayer(event.currentTarget.value,2)' id="nombreJugador" value=''>
        <label for="nombreJugador">Nombre del jugador 3</label>
        `;
    } else {
      $id("options").innerHTML = "";
      changeNameMultiPlayer('',1);
      changeNameMultiPlayer('',2);
    }
  }
}

function changeNameMultiPlayer(namePlayer = "", player) {
  dispatch('SET_NAME_PLAYER', namePlayer,player);
}

function nextPlay(){
  let position = {
    cell:0,
    row:0
  }
  playState.board.forEach((e,i) => {
    e.forEach((c,j) => {
      if(c > 0){
        position.row = i;
        position.cell = j;
      }
    })
  })
  return position;
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
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (playState.board[y].filter((f) => f === 2).length === win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByHorizontal(x) {
  let end = false;
  if (playState.board.filter((e) => e[x] === 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (playState.board.filter((e) => e[x] === 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByDiagonalFalling() {
  let end = false;
  if (playState.board.filter((_, j) => playState.board[j][j] == 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (playState.board.filter((_, j) => playState.board[j][j] == 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByDiagonalUpward() {
  let end = false;
  let last = playState.board.length - 1;
  if (playState.board.filter((_, i) => playState.board[i][last - i] == 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (playState.board.filter((_, i) => playState.board[i][last - i] == 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByTie() {
  let end = false;
  if (playState.board.filter((e) => e.filter((f) => f > 0).length == win).length == win) {
    end = true;
    players[1].state = "empate";
    players[2].state = "empate";
  }
  return end;
}

function resetBoard() {
  dispatch('CREATE_BOARD', {rows:win, cells:win});
  tableroHTML.innerHTML = playState.board.map((e, y) => {
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

function play(x, y) {
  if (playState.board[y][x] == 0 && playState.numPlays > 0) {
    $id(
      y + "-" + x
    ).innerHTML = `<img src="${players[playState.activePlayer].icon}.svg" alt="Jugador ${activePlayer}">`;
    playState.board[y][x] = playState.activePlayer;

    if (
      isEndByVertical(y) ||
      isEndByHorizontal(x) ||
      isEndByDiagonalFalling() ||
      isEndByDiagonalUpward() ||
      isEndByTie()
    ) {
      if(playState.multiplayer == 2){
        dispatch('ADD_NUM_WINS');
        let numPlayer = players[1].state == "ganas" ? 2 : 1;
        dispatch('ADD_NUM_LOSTS','',numPlayer);
      }
      $id(playState.activePlayer).classList.remove("active");
      $("div[id^='1'] .message").innerText = players[1].state.toUpperCase();
      $("div[id^='2'] .message").innerText = players[2].state.toUpperCase();
      $("div[id^='1']").classList.add(players[1].state);
      $("div[id^='2']").classList.add(players[2].state);
      setTimeout(() => {
        $("div[id^='1'] .message").innerText = "";
        $("div[id^='2'] .message").innerText = "";
        $("div[id^='1']").classList.remove(players[1].state);
        $("div[id^='2']").classList.remove(players[2].state);
        dispatch('CHANGE_TURN',2);
        resetBoard();
        dispatch('RESET_PLAYSTATE');
        $id(playState.activePlayer).classList.add("active");
      }, 2000);
    } else {
      $("div[id^='" + playState.activePlayer + "'] .message").innerText =
        players[playState.activePlayer].name;
      $id(playState.activePlayer).classList.remove("active");
      if (playState.multiplayer == 2) {
        dispatch('ADD_NUM_MOVES');
      } else if(playState.multiplayer == 1){
        const {row, cell} = nextPlay();
        play(row, cell);
      }
      dispatch('CHANGE_TURN');
      $id(playState.activePlayer).classList.add("active");
    }
  }
}

function dispatch(action, value = '', player = playState.activePlayer){
  if(action == 'ADD_NUM_WINS'){
    players[player].numWins++;
  } else if(action == 'ADD_NUM_LOSTS'){
    players[player].numLost++;
  } else if(action == 'ADD_NUM_MOVES'){
    players[player].moves++;
  } else if(action == 'DESINCREMENT_NUM_PLAYS'){
    playState.numPlays--;
  } else if(action == 'SET_NAME_PLAYER'){
    players[player].name = value;
  } else if(action == 'RESET_PLAYSTATE'){
    players = {
      1: { icon: "cross", state: ``, name: "", moves: 0, numWins: 0, numLost: 0 },
      2: { icon: "circle", state: ``, name: "", moves: 0, numWins: 0, numLost: 0 },
    }
  } else if(action == 'CHANGE_MULTIPLAYER'){
    playState.multiplayer = value;
  } else if(action == 'CHANGE_TURN'){
    playState.activePlayer = value === 1 ? 2 : 1;
  } else if (action == 'CREATE_BOARD'){
    const {rows, cells} = value;
    playState.board = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cells }, (_, i) => "")
  );
  }
}




resetBoard();