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

    const makeMove = (player, row, col) => {
        if (field[row][col]) {
            return false;
        }
        field[row][col] = player;
        return true;
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
        const validMove = field.makeMove(activePlayer.getMarker(), row, col);
        if (validMove) {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
            return evaluate(field.getBoard());
        }
        return result(false);
    };

    const generateMove = () => {
        const rng = Math.random();
        if (
            (rng >= 0.5 && activePlayer.getBotLevel() === 1) ||
            (rng >= 0.25 && activePlayer.getBotLevel() === 2) ||
            (rng >= 0.15 && activePlayer.getBotLevel() === 3)
        ) {
            return findBestMove(field.getBoard());
        }
        while (true) {
            const row = Math.floor(Math.random() * 3);
            const col = Math.floor(Math.random() * 3);
            const board = field.getBoard();
            const hasFreeCells =
                board.filter((row) => row.indexOf("") !== -1).length !== 0;
            if (board[row][col] === "") {
                return [row, col];
            }
            if (!hasFreeCells) return;
        }
    };

    const findBestMove = (board) => {
        let currentBest = -1000;
        let bestMove = [-1, -1];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== "") continue;
                board[i][j] = activePlayer.getMarker();
                const score = minmax(board, false, 0);
                board[i][j] = "";
                if (score > currentBest) {
                    currentBest = score;
                    bestMove = [i, j];
                }
            }
        }
        return bestMove;
    };

    const minmax = (board, isMax, depth) => {
        const result = evaluate(board);
        if (result.getStatus() == "win")
            return result.getMarker() === activePlayer.getMarker()
                ? 10 - depth
                : -10 - depth;
        if (result.getStatus() == "draw") return 0;
        if (isMax) {
            let best = -1000;
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j] !== "") continue;
                    board[i][j] = activePlayer.getMarker();
                    const score = minmax(board, !isMax, depth + 1);
                    best = score > best ? score : best;
                    board[i][j] = "";
                }
            }
            return best;
        } else {
            const opponent = activePlayer === players[0] ? players[1] : players[0];
            let best = 1000;
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j] !== "") continue;
                    board[i][j] = opponent.getMarker();
                    const score = minmax(board, !isMax, depth + 1);
                    best = score < best ? score : best;
                    board[i][j] = "";
                }
            }
            return best;
        }
    };

    const evaluate = (board) => {
        for (let i = 0; i < 3; i++) {
            if (
                board[0][i] === board[1][i] &&
                board[1][i] === board[2][i] &&
                board[0][i] !== ""
            ) {
                return result(true, "win", board[0][i]);
            }
            if (
                board[i][0] === board[i][1] &&
                board[i][1] === board[i][2] &&
                board[i][0] !== ""
            ) {
                return result(true, "win", board[i][0]);
            }
        }

        if (
            board[0][0] === board[1][1] &&
            board[1][1] === board[2][2] &&
            board[0][0] !== ""
        ) {
            return result(true, "win", board[0][0]);
        }
        if (
            board[0][2] === board[1][1] &&
            board[1][1] === board[2][0] &&
            board[0][2] !== ""
        ) {
            return result(true, "win", board[0][2]);
        }
        return noMovesLeft(board) ? result(true, "draw") : result(true);
    };

    const noMovesLeft = (board) =>
        board.filter((row) => row.indexOf("") !== -1).length === 0;

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
