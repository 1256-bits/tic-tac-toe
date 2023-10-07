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

  const evaluate = () => {
    for (let i = 0; i < 3; i++) {
      if (
        field[0][i] === field[1][i] &&
        field[1][i] === field[2][i] &&
        field[0][i] !== ""
      ) {
        return result(true, "win", field[0][i]);
      }
      if (
        field[i][0] === field[i][1] &&
        field[i][1] === field[i][2] &&
        field[i][0] !== ""
      ) {
        return result(true, "win", field[i][0]);
      }
    }

    if (
      field[0][0] === field[1][1] &&
      field[1][1] === field[2][2] &&
      field[0][0] !== ""
    ) {
      return result(true, "win", field[0][0]);
    }
    if (
      field[0][2] === field[1][1] &&
      field[1][1] === field[2][0] &&
      field[0][2] !== ""
    ) {
      return result(true, "win", field[0][2]);
    }
    return noMovesLeft() ? result(true, "draw") : result(true);
  };

  const noMovesLeft = () =>
    field.filter((row) => row.indexOf("") !== -1).length === 0;

  const makeMove = (player, row, col) => {
    if (field[row][col]) {
      return result(false);
    }
    field[row][col] = player;
    return evaluate();
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

function Player(marker, botLevel) {
  if (!Boolean(marker)) throw TypeError;
  const plMarker = String(marker[0]);
  const getMarker = () => plMarker;
  const getBotLevel = () => parseInt(botLevel);
  return { getMarker, getBotLevel };
}

function gameController(pl) {
  const players = pl;
  const field = playField();
  let activePlayer = players[0];

  const playRound = (r, c) => {
    const [row, col] =
      activePlayer.getBotLevel() === 0
        ? [r, c]
        : generateMove(activePlayer.getBotLevel());
    const result = field.makeMove(activePlayer.getMarker(), row, col);
    if (result.isValid()) {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    return result;
  };

  const generateMove = () => {
    while (true) {
      const row = Math.floor(Math.random() * 3);
      const col = Math.floor(Math.random() * 3);
      const board = field.getBoard();
      const hasFreeCells =
        board.filter((row) => row.indexOf("") !== -1).length !== 0;
      if (board[row][col] === "" && hasFreeCells) {
        return [row, col];
      }
      if (!hasFreeCells) return;
    }
  };

  const getBoard = () =>
    field.getBoard().reduce((total, row) => total.concat(row));

  const reset = () => {
    field.resetBoard();
    activePlayer = players[0];
  };

  const getActivePlayer = () => activePlayer;

  return { playRound, getBoard, reset, getActivePlayer };
}

function uiController() {
  let game;
  let toCleared = true;
  const cells = document.querySelectorAll(".cell");
  const players = document.querySelectorAll(".player");
  const endDialog = document.querySelector("#game-over");
  const resetButton = endDialog.querySelector("button");
  const endText = endDialog.querySelector("#end-header");
  const startDialog = document.querySelector("#game-start");
  const difButtons = [
    startDialog.querySelectorAll("#player1 > .difficulty"),
    startDialog.querySelectorAll("#player2 > .difficulty"),
  ];
  const startButton = startDialog.querySelector(".start-button");

  const cellClick = (e) => {
    if (!toCleared) return;
    const index = e.target.dataset.index;
    const row = Math.trunc(index / 3);
    const col = index % 3;
    const result = game.playRound(row, col);
    if (!result.isValid()) {
      return;
    }
    updateBoard();
    const status = statusCheck(result);
    // Active player already changed by game.playRound
    if (game.getActivePlayer().getBotLevel() !== 0 && status === 1) {
      botAction();
    }
  };

  const statusCheck = (result) => {
    if (result.getStatus() === "draw") {
      endDialog.showModal();
      endText.innerText = "It's a draw";
    } else if (result.getStatus() === "win") {
      endDialog.showModal();
      endText.innerText = `${result.getMarker()} has won`;
    } else {
      players.forEach((player) => {
        player.classList.toggle("active");
        player.classList.toggle("idle");
      });
      return 1;
    }
  };

  const botAction = () => {
    toCleared = false;
    setTimeout(() => {
      const result = game.playRound();
      updateBoard();
      toCleared = true;
      const status = statusCheck(result);
      if (status === 1 && game.getActivePlayer().getBotLevel() !== 0) {
        botAction();
      }
    }, 100);
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
    endDialog.close();
    game.reset();
    updateBoard();
    startDialog.showModal();
  };

  cells.forEach((cell) => cell.addEventListener("click", cellClick));
  endDialog.addEventListener("cancel", (e) => e.preventDefault());
  resetButton.addEventListener("click", restartGame);
  players[0].classList.add("active");
  players[1].classList.add("idle");
  difButtons.forEach((buttons) =>
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const buttons = difButtons[e.target.dataset.player];
        buttons.forEach((button) => button.classList.remove("button-selected"));
        e.target.classList.add("button-selected");
      });
    }),
  );
  startButton.addEventListener("click", () => {
    const diffs = document.querySelectorAll(".button-selected");
    if (diffs.length < 2) {
      return;
    }
    game = gameController([
      Player("X", diffs[0].dataset.diff),
      Player("O", diffs[1].dataset.diff),
    ]);
    startDialog.close();
    if (game.getActivePlayer().getBotLevel() !== 0) {
      botAction();
    }
  });
  startDialog.showModal();
}

const ui = uiController();
