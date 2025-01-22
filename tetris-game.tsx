import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { RotateCw, Play, Square, Pause, ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' }
};

const TetrisGame = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextPiece, setNextPiece] = useState(null);

  const getRandomPiece = () => {
    const pieces = Object.keys(PIECES);
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return { type: piece, ...PIECES[piece] };
  };

  const isValidMove = (newX, newY, piece = currentPiece?.shape) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const hardDrop = () => {
    if (!currentPiece || gameOver || !isPlaying) return;
    
    let newY = position.y;
    while (isValidMove(position.x, newY + 1)) {
      newY++;
    }
    setPosition({ ...position, y: newY });
    // Here you would typically also trigger piece locking
    // and spawn a new piece
  };

  const movePiece = (dx, dy) => {
    if (!currentPiece || gameOver || !isPlaying) return;
    
    const newX = position.x + dx;
    const newY = position.y + dy;
    
    if (isValidMove(newX, newY)) {
      setPosition({ x: newX, y: newY });
      return true;
    }
    return false;
  };

  const rotatePiece = () => {
    if (!currentPiece || gameOver || !isPlaying) return;
    
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (isValidMove(position.x, position.y, rotated)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const handleKeyPress = (event) => {
    if (!isPlaying || gameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        event.preventDefault();
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        event.preventDefault();
        break;
      case 'ArrowUp':
        rotatePiece();
        event.preventDefault();
        break;
      case ' ':
        hardDrop();
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentPiece, position, isPlaying, gameOver]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
      <div className="flex gap-8">
        {/* Main game board */}
        <Card className="p-4 bg-gray-800">
          <div className="grid grid-cols-10 gap-px bg-gray-700 p-2">
            {board.map((row, y) => 
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-6 h-6 ${
                    cell ? 'bg-blue-500' : 'bg-gray-900'
                  } ${
                    currentPiece && 
                    y >= position.y && 
                    y < position.y + currentPiece.shape.length &&
                    x >= position.x && 
                    x < position.x + currentPiece.shape[0].length &&
                    currentPiece.shape[y - position.y][x - position.x] 
                      ? currentPiece.color 
                      : ''
                  }`}
                />
              ))
            )}
          </div>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {/* Next piece preview */}
          <Card className="p-4 bg-gray-800">
            <h3 className="text-white mb-2">Next Piece</h3>
            <div className="grid grid-cols-4 gap-px bg-gray-700 p-2">
              {nextPiece && Array(4).fill().map((_, y) => 
                Array(4).fill().map((_, x) => (
                  <div
                    key={`next-${x}-${y}`}
                    className={`w-6 h-6 ${
                      y < nextPiece.shape.length &&
                      x < nextPiece.shape[0].length &&
                      nextPiece.shape[y][x]
                        ? nextPiece.color
                        : 'bg-gray-900'
                    }`}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Score */}
          <Card className="p-4 bg-gray-800">
            <div className="text-white">Score: {score}</div>
          </Card>

          {/* Controls */}
          <Card className="p-4 bg-gray-800">
            <div className="flex flex-col gap-2">
              <button
                onClick={startGame}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                <Play size={16} /> New Game
              </button>
              <button
                onClick={pauseGame}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                disabled={gameOver || !currentPiece}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
            </div>
          </Card>

          {/* Keyboard Controls Guide */}
          <Card className="p-4 bg-gray-800 text-white">
            <h3 className="font-bold mb-2">Controls</h3>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <ArrowLeft size={16} /> Move Left
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight size={16} /> Move Right
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown size={16} /> Move Down
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp size={16} /> Rotate
              </div>
              <div className="flex items-center gap-2">
                <Square size={16} /> Hard Drop
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Game Over overlay */}
      {gameOver && (
        <Card className="mt-4 p-4 bg-red-600 text-white">
          <h2 className="text-xl font-bold">Game Over!</h2>
          <p>Final Score: {score}</p>
        </Card>
      )}
    </div>
  );
};

export default TetrisGame;
