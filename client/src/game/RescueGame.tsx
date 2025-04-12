import React, { useState, useEffect, useCallback } from 'react';
import { useRescueGame } from '../lib/stores/useRescueGame';
import { useAudio } from '../lib/stores/useAudio';
import { Volume2, VolumeX } from 'lucide-react';
import { Confetti } from '../components/game/Confetti';
import fireTruckSvg from './assets/fire-truck.svg';
import fireSvg from './assets/fire.svg';
import obstacleSvg from './assets/obstacle.svg';

const RescueGame: React.FC = () => {
  const {
    gridSize,
    obstacleCount,
    gameState,
    fireTruckPosition,
    firePosition,
    obstacles,
    moveTruck,
    checkWinCondition,
    startGame,
    stopGame,
    resetGame,
    setGridSize,
    setObstacleCount
  } = useRescueGame();

  const { toggleMute, isMuted, playHit, playSuccess, playClapping, backgroundMusic } = useAudio();

  // Local state for input values
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.x);
  const [obstacleCountInput, setObstacleCountInput] = useState(obstacleCount);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moveTruck(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moveTruck(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        moveTruck(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moveTruck(1, 0);
        break;
      default:
        return;
    }

    // Check if the truck has reached the fire
    checkWinCondition();
  }, [gameState, moveTruck, checkWinCondition]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update game settings when inputs change
  useEffect(() => {
    setGridSize(gridSizeInput, gridSizeInput);
  }, [gridSizeInput, setGridSize]);
  
  useEffect(() => {
    setObstacleCount(obstacleCountInput);
  }, [obstacleCountInput, setObstacleCount]);

  // Play background music when game starts
  useEffect(() => {
    if (gameState === "playing" && backgroundMusic && !isMuted) {
      backgroundMusic.play();
    } else if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }, [gameState, backgroundMusic, isMuted]);

  // Handle winning effects (confetti and clapping sound)
  useEffect(() => {
    if (gameState === "won") {
      // Play clapping sound when the player wins
      playClapping();
      // Play success sound as well
      playSuccess();
    }
  }, [gameState, playClapping, playSuccess]);
  
  // Calculate cell size to fit grid in the container width
  const cellSize = Math.floor((window.innerWidth * 0.85 - 40) / gridSize.x); // 40px accounts for padding

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      fontFamily: "'Inter', sans-serif",
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '10px',
      overflow: 'auto',
      height: '100vh',
      backgroundColor: '#e63946', // Red background as requested
      position: 'relative'
    }}>
      {/* Confetti effect when player wins */}
      <Confetti active={gameState === "won"} duration={5000} />
      {/* Game title */}
      <div style={{
        textAlign: "center",
        marginBottom: "20px",
        color: "black",
        fontWeight: "bold",
        fontSize: "36px",
      }}>
        {gameState === "won" ? "You Win! 🎉" : "🚒 Rescue Adventure 🚒"}
      </div>
      
      {/* Game controls panel */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "15px",
        width: "100%",
        marginBottom: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "black"
      }}>
        
        {/* Grid size control */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="gridSize">Size of grid:</label>
          <input
            id="gridSize"
            type="range"
            min="3"
            max="10"
            value={gridSizeInput}
            onChange={(e) => setGridSizeInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{gridSizeInput} x {gridSizeInput}</span>
        </div>
        
        {/* Obstacle count control */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="obstacles">Number of obstacles:</label>
          <input
            id="obstacles"
            type="range"
            min="0"
            max={Math.min(10, Math.floor(gridSizeInput * gridSizeInput / 3))}
            value={obstacleCountInput}
            onChange={(e) => setObstacleCountInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{obstacleCountInput}</span>
        </div>
      </div>
      
      {/* Sound toggle button in upper right corner */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100
      }}>
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={24} color="#e63946" /> : <Volume2 size={24} color="#4CAF50" />}
        </button>
      </div>
      
      {/* Play/stop button */}
      <div style={{
        backgroundColor: "#77c3f9",
        borderRadius: "50px",
        padding: "10px 30px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "black"
      }}
      onClick={() => {
        if (gameState === "playing") {
          stopGame();
        } else if (gameState === "ready" || gameState === "stopped") {
          startGame();
        } else if (gameState === "won") {
          resetGame();
        }
      }}>
        {gameState === "playing" ? "Stop" : gameState === "won" ? "Play Again" : "Play"}
      </div>
      
      {/* Game grid container */}
      <div style={{
        width: "100%",
        backgroundColor: '#ccc',
        padding: '10px 10px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: 'flex',
        justifyContent: 'center'
      }}>
        {/* Game grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize.x}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize.y}, ${cellSize}px)`,
          gap: '2px'
        }}>
          {/* Generate grid cells */}
          {Array.from({ length: gridSize.y }).map((_, y) =>
            Array.from({ length: gridSize.x }).map((_, x) => {
              // Determine cell content
              const isFireTruck = x === fireTruckPosition.x && y === fireTruckPosition.y;
              const isFire = x === firePosition.x && y === firePosition.y;
              const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
              
              // Set cell content and style
              let cellContent = null;
              let cellStyle: React.CSSProperties = {
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: '#eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '4px'
              };

              if (isFireTruck) {
                cellContent = (
                  <img 
                    src={fireTruckSvg} 
                    alt="Fire Truck" 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'won' ? 'spin 1s linear infinite' : 'bob 1s ease-in-out infinite'
                    }} 
                  />
                );
              } else if (isFire) {
                cellContent = (
                  <img 
                    src={fireSvg} 
                    alt="Fire" 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'won' ? 'shrink 1s linear forwards' : 'flicker 0.5s ease-in-out infinite'
                    }} 
                  />
                );
              } else if (isObstacle) {
                cellContent = (
                  <img 
                    src={obstacleSvg} 
                    alt="Obstacle" 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'playing' ? 'pulse 2s ease-in-out infinite' : 'none'
                    }} 
                  />
                );
              }

              return (
                <div key={`${x}-${y}`} style={cellStyle}>
                  {cellContent}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Win message */}
      {gameState === "won" && (
        <div style={{
          backgroundColor: "rgba(76, 175, 80, 0.9)",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}>
          Great job! You put out the fire! 🚒
        </div>
      )}
      
      {/* Game instructions */}
      {(gameState === "ready" || gameState === "playing") && (
        <div style={{
          maxWidth: "400px",
          textAlign: "center",
          color: "black",
          marginTop: "20px"
        }}>
          <p>Use arrow keys (or WASD) to move the fire truck to the fire!</p>
          {gameState === "ready" && <p>Press the Play button to begin.</p>}
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes flicker {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.95); opacity: 0.9; }
          }
          
          @keyframes shrink {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.95); }
          }
        `}
      </style>
    </div>
  );
};

export default RescueGame;