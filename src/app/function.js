const difficulties = {
    easy: { colors: ['red', 'blue', 'green', 'yellow'], bottles: 4, emptyBottles: 1},
    medium: { colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], bottles: 6, emptyBottles: 2 },
    hard: { colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'lightblue', 'pink'], bottles: 8, emptyBottles: 2}
};

let selectedDifficulty = null;
let selectedBottle = null;
let moveHistory = [];

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('toggled'));
        button.classList.toggle('toggled');
        
        selectedDifficulty = button.id;
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('start').addEventListener('click', () => {
        if (!selectedDifficulty) {
            alert('Please select a difficulty level.');
            return;
        }
        startGame(difficulties[selectedDifficulty]);
    });

    document.getElementById('undo').addEventListener('click', undoMove);
});

function startGame(difficulty) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    const colors = [...difficulty.colors];
    const bottles = [];
    gameBoard.style.display = 'flex';

    // Create an array with each color appearing exactly 4 times
    const colorPool = [];
    colors.forEach(color => {
        for (let i = 0; i < 4; i++) {
            colorPool.push(color);
        }
    });

    // Shuffle the color pool
    for (let i = colorPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
    }

    // Distribute colors into bottles
    for (let i = 0; i < difficulty.bottles; i++) {
        const bottleColors = colorPool.splice(0, 4);
        bottles.push(bottleColors);
    }

    // Add empty bottles
    for (let i = 0; i < difficulty.emptyBottles; i++) {
        bottles.push([]);
    }

    bottles.forEach(bottleColors => {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');
        bottle.addEventListener('click', () => selectBottle(bottle, bottleColors));
        bottleColors.forEach((color, index) => {
            const colorDiv = document.createElement('div');
            colorDiv.classList.add('color');
            colorDiv.style.backgroundColor = color;
            colorDiv.style.bottom = `${index * 25}%`;
            bottle.appendChild(colorDiv);
        });
        gameBoard.appendChild(bottle);
    });

    moveHistory = []; // 게임 시작 시 이동 기록 초기화
    checkGameClear();
}

function selectBottle(bottle, bottleColors) {
    if (selectedBottle) {
        if (selectedBottle === bottle) {
            selectedBottle.classList.remove('selected');
            selectedBottle = null;
        } else {
            moveColor(selectedBottle, bottle);
            selectedBottle.classList.remove('selected');
            selectedBottle = null;
        }
    } else {
        selectedBottle = bottle;
        bottle.classList.add('selected');
    }
}

function moveColor(fromBottle, toBottle) {
    const fromColors = Array.from(fromBottle.children).map(child => child.style.backgroundColor);
    const toColors = Array.from(toBottle.children).map(child => child.style.backgroundColor);

    if (fromColors.length === 0 || toColors.length >= 4) return;

    const colorToMove = fromColors[fromColors.length - 1];

    if (toColors.length === 0 || toColors[toColors.length - 1] === colorToMove) {
        let moveCount = 0;
        for (let i = fromColors.length - 1; i >= 0; i--) {
            if (fromColors[i] === colorToMove) {
                moveCount++;
            } else {
                break;
            }
        }

        const move = {
            fromBottle,
            toBottle,
            colors: []
        };

        for (let i = 0; i < moveCount; i++) {
            if (toColors.length + i >= 4) break; // 병이 가득 차면 중지
            const colorDiv = fromBottle.removeChild(fromBottle.lastChild);
            move.colors.push(colorDiv);
            toBottle.appendChild(colorDiv);
            colorDiv.style.bottom = `${(toColors.length + i) * 25}%`;
        }

        moveHistory.push(move); // 이동 기록 저장
    }
    fromBottle.classList.remove('selected');
        toBottle.classList.remove('selected');
        selectedBottle = null;
}

function undoMove() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    const { fromBottle, toBottle, colors } = lastMove;

    colors.reverse().forEach(colorDiv => {
        toBottle.removeChild(colorDiv);
        fromBottle.appendChild(colorDiv);
        colorDiv.style.bottom = `${(fromBottle.children.length - 1) * 25}%`;
    });
}

