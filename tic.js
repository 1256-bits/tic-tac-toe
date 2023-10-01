"use strict";

function result(valid, status, player) {
  const isValid = () => valid;
  const getStatus = () => status;
  const getMarker = () => player;
  return { isValid, getStatus, getMarker };
}

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
    for (let i = 0; i < 3; i++) {
      const colResult = field[0][i] + field[1][i] + field[2][i];
      const rowResult = field[i].join("");
      if (isCombo(colResult)) {
        return result(true, "win", colResult[0]);
      }
      if (isCombo(rowResult)) {
        return result(true, "win", rowResult[0]);
      }
    }

    const leftDiag = field[0][0] + field[1][1] + field[2][2];
    const rightDiag = field[0][2] + field[1][1] + field[2][0];
    if (isCombo(leftDiag)) {
      return result(true, "win", leftDiag[0]);
    } else if (isCombo(rightDiag)) {
      return result(true, "win", rightDiag[0]);
    } else if (noMoreMoves()) {
      return result(true, "draw");
    }
    return result(true);
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
      return result(false);
    }
    field[row][col] = player;
    return checkWin();
  };

  const getBoard = () => field;

  const resetBoard = () => {
    for (let row of field) {
      for (let i in row) {
        row[i] = "";
      }
    }
  };

  return { getBoard, makeMove, resetBoard };
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
    if (result.isValid()) {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    return result;
  };

  const getBoard = () =>
    field.getBoard().reduce((total, row) => total.concat(row));

  const reset = () => {
    field.resetBoard();
    activePlayer = players[0];
  };

  return { playRound, getBoard, reset };
}

function uiController() {
  const cells = document.querySelectorAll(".cell");
  const players = document.querySelectorAll(".player");
  const dialog = document.querySelector("#game-over");
  const closeButton = dialog.lastElementChild;
  const dialogText = dialog.firstElementChild;

  const cellClick = (e) => {
    const index = e.target.dataset.index;
    const row = Math.trunc(index / 3);
    const col = index % 3;
    const result = game.playRound(row, col);
    if (!result.isValid()) {
      return;
    }
    updateBoard();
    if (result.getStatus() === "draw") {
      dialog.showModal();
      dialogText.innerText = "It's a draw";
    }
    if (result.getStatus() === "win") {
      dialog.showModal();
      dialogText.innerText = `${result.getMarker()} has won`;
    } else {
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

  const restartGame = () => {
    dialog.close();
    game.reset();
    updateBoard();
  };

  cells.forEach((cell) => cell.addEventListener("click", cellClick));
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  closeButton.addEventListener("click", restartGame);
  players[0].classList.add("active");
  players[1].classList.add("idle");
}

const game = gameController();
const ui = uiController();
