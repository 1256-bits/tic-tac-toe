"use strict";

function playField() {
  const createField = () => {
    const field = [];
    for (let i = 0; i <= 2; i++) {
      field[i] = ["", "", ""];
    }
    return field;
  };

  const field = createField();

  const checkWin = () => {
    const result = { status: "", player: "" };
    for (let i = 0; i < 3; i++) {
      const colResult = field[0][i] + field[1][i] + field[2][i];
      const rowResult = field[i].join("");
      if (isCombo(colResult)) {
        result.player = colResult[0];
        result.status = "win";
        break;
      }
      if (isCombo(rowResult)) {
        result.player = rowResult[0];
        result.status = "win";
        break;
      }
    }
    if (result.status) {
      return result;
    }

    const leftDiag = field[0][0] + field[1][1] + field[2][2];
    const rightDiag = field[0][2] + field[1][1] + field[2][0];
    if (isCombo(leftDiag)) {
      result.player = leftDiag[0];
      result.status = "win";
    } else if (isCombo(rightDiag)) {
      result.player = rightDiag[0];
      result.status = "win";
    } else if (noMoreMoves()) {
      result.status = "draw";
    } else {
      result.status = "valid";
    }
    return result;
  };

  const noMoreMoves = () =>
    field.filter((row) => row.indexOf("") !== -1).length === 0;

  const isCombo = (str) => {
    if (str.length != 3) return false;
    const uniqChars = new Set([...str]).size;
    if (uniqChars != 1) return false;
    return true;
  };

  const makeMove = (player, row, col) => {
    if (field[row][col]) {
      return { status: "illegal" };
    }
    field[row][col] = player;
    const result = checkWin();
    return result;
  };

  const getBoard = () => field;

  return { getBoard, makeMove };
}

function Player(marker) {
  if (!Boolean(marker)) throw TypeError;
  const plMarker = String(marker[0]);
  const getMarker = () => plMarker;
  return { getMarker };
}

function gameController() {
  const players = [Player("X"), Player("O")];
  const field = playField();
  let activePlayer = players[0];

  const playRound = (row, col) => {
    const result = field.makeMove(activePlayer.getMarker(), row, col);
    if (result.status === "valid") {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    return result;
  };

  const getBoard = () =>
    field.getBoard().reduce((total, row) => total.concat(row));

  return { playRound, getBoard };
}

function uiController() {
  const cells = document.querySelectorAll(".cell");
  const players = document.querySelectorAll(".player");

  const cellClick = (e) => {
    const index = e.target.dataset.index;
    const row = Math.trunc(index / 3);
    const col = index % 3;
    const result = game.playRound(row, col);
    if (result.status !== "illegal") {
      updateBoard();
      players.forEach((player) => {
        player.classList.toggle("active");
        player.classList.toggle("idle");
      });
    }
  };

  const updateBoard = () => {
    const board = game.getBoard();
    cells.forEach(
      (cell) =>
        (cell.style.backgroundImage = `url(${board[
          cell.dataset.index
        ].toLowerCase()}.svg)`),
    );
  };

  cells.forEach((cell) => cell.addEventListener("click", cellClick));
  players[0].classList.add("active");
  players[1].classList.add("idle");
}

const game = gameController();
const ui = uiController();
