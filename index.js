const $ = (selector) => document.querySelector(selector);
const $id = (selector) => document.getElementById(selector);
const tableroHTML = $id("board");
const win = 3;
let players = {
  1: { icon: "cross", state: `` },
  2: { icon: "circle", state: `` },
};
let activePlayer = 1;
let board;

function createBoard(rows, cells) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cells }, (_, i) => "")
  );
}
/*
    Todas las functiones de "isEndBy", se aplican 
    desde la posicion 0,0 del tablero y luego de 
    izquierda a derecha
  */

function isEndByVertical(y) {
  let end = false;
  if (board[y].filter((f) => f === 1).length === win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (board[y].filter((f) => f === 2).length === win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByHorizontal(x) {
  let end = false;
  if (board.filter((e) => e[x] === 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (board.filter((e) => e[x] === 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByDiagonalFalling() {
  let end = false;
  if (board.filter((_, j) => board[j][j] == 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (board.filter((_, j) => board[j][j] == 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByDiagonalUpward() {
  let end = false;
  let last = board.length - 1;
  if (board.filter((_, i) => board[i][last - i] == 1).length == win) {
    end = true;
    players[1].state = "ganas";
    players[2].state = "pierdes";
  } else if (board.filter((_, i) => board[i][last - i] == 2).length == win) {
    end = true;
    players[1].state = "pierdes";
    players[2].state = "ganas";
  }
  return end;
}

function isEndByTie() {
  let end = false;
  if (board.filter((e) => e.filter((f) => f > 0).length == win).length == win) {
    end = true;
    players[1].state = "empate";
    players[2].state = "empate";
  }
  return end;
}

function resetBoard() {
  board = createBoard(win, win);
  tableroHTML.innerHTML = board
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

function changeTurn(h = activePlayer) {
  activePlayer = h === 1 ? 2 : 1;
}

function play(x, y) {
  if (board[y][x] == 0) {
    $id(
      y + "-" + x
    ).innerHTML = `<img src="${players[activePlayer].icon}.svg" alt="Jugador ${activePlayer}">`;
    board[y][x] = activePlayer;

    if (
      isEndByVertical(y) ||
      isEndByHorizontal(x) ||
      isEndByDiagonalFalling() ||
      isEndByDiagonalUpward() ||
      isEndByTie()
    ) {
      $id(activePlayer).classList.remove("active");
      $("div[id^='1'] .message").innerText = players[1].state.toUpperCase();
      $("div[id^='2'] .message").innerText = players[2].state.toUpperCase();
      $("div[id^='1']").classList.add(players[1].state);
      $("div[id^='2']").classList.add(players[2].state);
      setTimeout(() => {
        $("div[id^='1'] .message").innerText = "";
        $("div[id^='2'] .message").innerText = "";
        $("div[id^='1']").classList.remove(players[1].state);
        $("div[id^='2']").classList.remove(players[2].state);
        changeTurn(2);
        resetBoard();
        $id(activePlayer).classList.add("active");
      }, 2000);
    } else {
      $id(activePlayer).classList.remove("active");
      changeTurn();
      $id(activePlayer).classList.add("active");
    }
  }
}

resetBoard();
