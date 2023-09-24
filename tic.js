"use strict";

function playField() {
  const field = new Array(3).fill(["", "", ""]);
  const clearField = () => {
    field.fill(["", "", ""]);
  };

  const checkWin = () => {
    for (let i = 0; i < 3; i++) {
      const colResult = field[0][i] + field[1][i] + field[2][i];
      const rowResult = field[i].join("");
      if (isCombo(colResult) || isCombo(rowResult)) {
        endGame(result[0]);
      }
    }

    const leftDiag = field[0][0] + field[1][1] + field[2][2];
    const rightDiag = field[0][2] + field[1][1] + field[2][0];
    if (isCombo(leftDiag) || isCombo(rightDiag)) {
      endGame(leftDiag[0]);
      return;
    } else if (field.indexOf("") === -1) {
      endGame("");
    }
  };

  const isCombo = (str) => {
    if (str.length != 3) return false;
    const uniqChars = new Set([...str]).size;
    if (uniqChars != 1) return false;
    return true;
  };

  const endGame = (result) => {
    if (result === "") {
      console.log("It's a draw");
    } else {
      console.log(`${result} is the winner`);
    }
    clearField();
  };

  const makeMove = (player, position) => {
    if (field[position] === "") {
      field[position] = player;
      checkWin();
    }
  };

  const getBoard = () => field;
  
  const printBoard = () => console.log(field);

  return { getBoard, makeMove, printBoard };
}

function Player(marker) {
  if (!Boolean(marker)) throw TypeError;
  const marker = String(marker[0]);
  const move = () => playField.makeMove(marker);
  return { move };
}

const player1 = Player("X");
const player2 = Player("O");
