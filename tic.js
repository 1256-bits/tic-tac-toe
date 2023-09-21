"use strict";
const playField = (() => {
    const field = new Array(9).fill("");
    const clearField = () => {
        field.fill("");
    };
    const checkWin = () => {
        for (let i = 0; i < 3; i++) {
            const result = field[i] + field[i + 3] + field[i + 6];
            if (isCombo(result)) {
                endGame(result[0]);
            }
        }
        const leftDiag = field[0] + field[4] + field[8];
        const rightDiag = field[2] + field[4] + field[6];
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
    return { makeMove };
})();

//function Player (marker) {
//}
