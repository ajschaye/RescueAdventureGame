import { create } from "zustand";

// Types for positions
interface Position {
  x: number;
  y: number;
}

// Game states
type GameState = "ready" | "playing" | "stopped" | "won";

// Interface for the game store
interface RescueGameState {
  // State
  gridSize: Position;
  obstacleCount: number;
  gameState: GameState;
  fireTruckPosition: Position;
  firePosition: Position;
  obstacles: Position[];
  moveCooldown: boolean;
  
  // Actions
  setGridSize: (x: number, y: number) => void;
  setObstacleCount: (count: number) => void;
  moveTruck: (dx: number, dy: number) => void;
  checkWinCondition: () => void;
  startGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  getRandomPosition: () => Position;
}

// Create the store
export const useRescueGame = create<RescueGameState>((set, get) => {
  // Helper function to check if position is valid
  const isValidPosition = (x: number, y: number): boolean => {
    const { gridSize, obstacles } = get();
    
    // Check grid boundaries
    if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
      return false;
    }
    
    // Check for obstacles
    return !obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
  };
  
  // Helper to get random position that's not occupied
  const getRandomPosition = (): Position => {
    const { gridSize, fireTruckPosition, firePosition, obstacles } = get();
    
    let x: number, y: number;
    let isOccupied: boolean;
    
    do {
      x = Math.floor(Math.random() * gridSize.x);
      y = Math.floor(Math.random() * gridSize.y);
      
      // Check if position is already occupied
      isOccupied = (
        (x === fireTruckPosition.x && y === fireTruckPosition.y) || // Fire truck
        (x === firePosition.x && y === firePosition.y) || // Fire
        obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y) // Obstacles
      );
    } while (isOccupied);
    
    return { x, y };
  };
  
  // Initialize or reset the game
  const initializeGame = () => {
    const { gridSize, obstacleCount } = get();
    
    // Place fire truck at bottom
    const truckX = Math.floor(gridSize.x / 2);
    const truckY = gridSize.y - 1;
    
    // Generate random fire position (not where the truck is)
    let fireX: number, fireY: number;
    do {
      fireX = Math.floor(Math.random() * gridSize.x);
      fireY = Math.floor(Math.random() * (gridSize.y - 2)); // Keep away from bottom row
    } while (fireX === truckX && fireY === truckY);
    
    // Generate obstacles
    const newObstacles: Position[] = [];
    
    // Create a reference to current state for getRandomPosition
    set(state => {
      // Update state with truck and fire positions
      state = {
        ...state,
        fireTruckPosition: { x: truckX, y: truckY },
        firePosition: { x: fireX, y: fireY }
      };
      
      // Generate obstacles
      for (let i = 0; i < obstacleCount; i++) {
        if (i >= gridSize.x * gridSize.y - 2) break; // Safety check
        
        const newPos = getRandomPosition();
        newObstacles.push(newPos);
      }
      
      return {
        ...state,
        obstacles: newObstacles,
        gameState: "ready"
      };
    });
  };

  return {
    // State
    gridSize: { x: 5, y: 5 },
    obstacleCount: 0,
    gameState: "ready" as GameState,
    fireTruckPosition: { x: 2, y: 4 },  // Default position at bottom center of 5x5 grid
    firePosition: { x: 2, y: 0 },       // Default position at top center of 5x5 grid
    obstacles: [],
    moveCooldown: false,
    
    // Methods
    getRandomPosition,
    
    // Set grid size
    setGridSize: (x: number, y: number) => {
      set({ gridSize: { x, y } });
      get().resetGame();
    },
    
    // Set obstacle count
    setObstacleCount: (count: number) => {
      set({ obstacleCount: count });
      get().resetGame();
    },
    
    // Move truck
    moveTruck: (dx: number, dy: number) => {
      const { gameState, fireTruckPosition, moveCooldown } = get();
      
      if (gameState !== "playing" || moveCooldown) return;
      
      set({ moveCooldown: true });
      
      // Cooldown to prevent rapid movement
      setTimeout(() => set({ moveCooldown: false }), 150);
      
      const newX = fireTruckPosition.x + dx;
      const newY = fireTruckPosition.y + dy;
      
      if (isValidPosition(newX, newY)) {
        set({ fireTruckPosition: { x: newX, y: newY } });
      } else {
        // Could play collision sound here if implemented
        // Using audio API from a store is tricky, we'll handle it in the component
      }
    },
    
    // Check win condition
    checkWinCondition: () => {
      const { fireTruckPosition, firePosition } = get();
      
      if (
        fireTruckPosition.x === firePosition.x &&
        fireTruckPosition.y === firePosition.y
      ) {
        // Player wins!
        set({ gameState: "won" });
        // Sound will be played in component
      }
    },
    
    // Start game
    startGame: () => {
      set({ gameState: "playing" });
    },
    
    // Stop game
    stopGame: () => {
      set({ gameState: "stopped" });
    },
    
    // Reset game
    resetGame: () => {
      initializeGame();
    }
  };
});
