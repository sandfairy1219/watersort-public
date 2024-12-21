"use client";
import { useEffect, useState } from 'react';

const difficulties = {
  easy: { colors: ['red', 'blue', 'green', 'yellow'], bottles: 4, emptyBottles: 1 },
  medium: { colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], bottles: 6, emptyBottles: 2 },
  hard: { colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'lightblue', 'pink'], bottles: 8, emptyBottles: 2 }
};

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [bottles, setBottles] = useState([]);
  const [selectedBottle, setSelectedBottle] = useState(null);

  useEffect(() => {
    const handleDifficultyClick = (event) => {
      document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('toggled'));
      event.target.classList.toggle('toggled');
      setSelectedDifficulty(event.target.id);
    };

    document.querySelectorAll('.difficulty-button').forEach(button => {
      button.addEventListener('click', handleDifficultyClick);
    });

    return () => {
      document.querySelectorAll('.difficulty-button').forEach(button => {
        button.removeEventListener('click', handleDifficultyClick);
      });
    };
  }, []);

  const startGame = (difficulty) => {
    if (!difficulty) {
      alert('난이도를 선택해주세요.');
      return;
    }

    console.log('game loaded');
    const colors = [...difficulty.colors];
    const newBottles = [];

    const colorPool = [];
    colors.forEach(color => {
      for (let i = 0; i < 4; i++) {
        colorPool.push(color);
      }
    });

    for (let i = colorPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
    }

    for (let i = 0; i < difficulty.bottles; i++) {
      const bottleColors = colorPool.splice(0, 4);
      newBottles.push(bottleColors);
    }

    for (let i = 0; i < difficulty.emptyBottles; i++) {
      newBottles.push([]);
    }

    setBottles(newBottles);
    setMoveHistory([]);
  };

  const selectBottle = (bottleIndex) => {
    if (selectedBottle !== null) {
      if (selectedBottle === bottleIndex) {
        setSelectedBottle(null);
      } else {
        moveColor(selectedBottle, bottleIndex);
        setSelectedBottle(null);
      }
    } else {
      setSelectedBottle(bottleIndex);
    }
  };

  const moveColor = (fromIndex, toIndex) => {
    const newBottles = [...bottles];
    const fromBottle = newBottles[fromIndex];
    const toBottle = newBottles[toIndex];

    if (fromBottle.length === 0 || toBottle.length >= 4) return;

    const colorToMove = fromBottle[fromBottle.length - 1];

    if (toBottle.length === 0 || toBottle[toBottle.length - 1] === colorToMove) {
      let moveCount = 0;
      for (let i = fromBottle.length - 1; i >= 0; i--) {
        if (fromBottle[i] === colorToMove) {
          moveCount++;
        } else {
          break;
        }
      }

      const move = {
        fromIndex,
        toIndex,
        colors: []
      };

      for (let i = 0; i < moveCount; i++) {
        if (toBottle.length >= 4) break;
        move.colors.push(fromBottle.pop());
        toBottle.push(colorToMove);
      }

      setMoveHistory([...moveHistory, move]);
      setBottles(newBottles);
    }
  };

  const undoMove = () => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    const { fromIndex, toIndex, colors } = lastMove;

    const newBottles = [...bottles];
    const fromBottle = newBottles[fromIndex];
    const toBottle = newBottles[toIndex];

    colors.reverse().forEach(() => {
      fromBottle.push(toBottle.pop());
    });

    setMoveHistory([...moveHistory]);
    setBottles(newBottles);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-16 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" id='bod'>
      <p className="text-center" id='title'>Water Sort Game</p>
      <div id="game-board">
        {bottles.map((bottleColors, index) => (
          <div key={index} className={`bottle ${selectedBottle === index ? 'selected' : ''}`} onClick={() => selectBottle(index)}>
            {bottleColors.map((color, colorIndex) => (
              <div key={colorIndex} className="color" style={{ backgroundColor: color, bottom: `${colorIndex * 25}%` }}></div>
            ))}
          </div>
        ))}
      </div>
      <div id="btncontainer">
        <button className="difficulty-button btn btn-success" id="easy">Easy</button>
        <button className="difficulty-button btn btn-warning" id="medium">Medium</button>
        <button  className="difficulty-button btn btn-danger" id='hard'>Hard</button>
        <button id="start" onClick={() => {
          if (!selectedDifficulty) {
            alert('난이도를 선택해주세요.');
            return;
          }
          startGame(difficulties[selectedDifficulty]);
        }}>Start</button>
        <button id="undo" onClick={undoMove}>Undo</button>
      </div>
    </div>
  );
}
