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
        for (let i = 0; i < 3; i++) {
            const colResult = field[0][i] + field[1][i] + field[2][i];
            const rowResult = field[i].join("");
            if (isCombo(colResult)) {
                endGame(colResult[0]);
                return;
            }
            if (isCombo(rowResult)) {
                endGame(rowResult[0]);
                return;
            }
        }
        const leftDiag = field[0][0] + field[1][1] + field[2][2];
        const rightDiag = field[0][2] + field[1][1] + field[2][0];
        if (isCombo(leftDiag)) {
            endGame(leftDiag[0]);
            return;
        } else if (isCombo(rightDiag)) {
            endGame(rightDiag[0]);
            return;
        } else if (noMoreMoves()) {
            endGame("");
        }
    };

    const noMoreMoves = () =>
        field.filter((row) => row.indexOf("") !== -1).length === 0;

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
    };

    const makeMove = (player, row, col) => {
        if (field[row][col]) return false;
        field[row][col] = player;
        checkWin();
        return true;
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
        const validMove = field.makeMove(activePlayer.getMarker(), row, col);
        if (validMove) {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
            return true;
        }
        return false;
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
        const roundEnded = game.playRound(row, col);
        if (roundEnded) {
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
