export interface MazeResult {
  data: number[][];
  startX: number;
  startZ: number;
  exitX: number;
  exitZ: number;
  treasures: { x: number; z: number }[];
}

export function generateMaze(level: number): MazeResult {
  // Simple LCG PRNG seeded by level
  let seed = level * 1234567;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Determine size based on level (1-120)
  // Easy: ~11-15, Medium: ~17-25, Hard: ~27-41 (Must be odd numbers for this algorithm)
  let baseSize = 11 + Math.floor(level / 4) * 2;
  if (baseSize > 41) baseSize = 41;

  const width = baseSize;
  const height = baseSize;
  
  // Initialize with walls (1)
  const maze = Array.from({ length: height }, () => Array(width).fill(1));
  
  // Directions: [dx, dy] where movement is 2 steps to break a wall and make a path
  const directions = [
    [0, -2], [2, 0], [0, 2], [-2, 0]
  ];

  function carve(x: number, y: number) {
    maze[y][x] = 0;
    
    // Shuffle directions
    const dirs = [...directions].sort(() => random() - 0.5);
    
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      
      // Check bounds
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
        // Carve through the wall
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  // Start carving from (1, 1)
  carve(1, 1);

  // Set start and exit
  const startX = 1;
  const startZ = 1;
  
  // Find a good exit point near the bottom right
  let exitX = width - 2;
  let exitZ = height - 2;
  // Make sure exit is reachable (0)
  while (maze[exitZ][exitX] !== 0) {
    exitX--;
    if (exitX <= 0) {
      exitX = width - 2;
      exitZ--;
    }
  }

  // Place treasures randomly on empty paths
  const treasures: {x: number, z: number}[] = [];
  const treasureCount = 3 + Math.floor(level / 10);
  
  let attempts = 0;
  while (treasures.length < treasureCount && attempts < 1000) {
    attempts++;
    const tx = Math.floor(random() * (width - 2)) + 1;
    const tz = Math.floor(random() * (height - 2)) + 1;
    
    // If it's a path, and not start/exit, and not already a treasure
    if (maze[tz][tx] === 0 && 
       !(tx === startX && tz === startZ) && 
       !(tx === exitX && tz === exitZ) &&
       !treasures.some(t => t.x === tx && t.z === tz)) {
      treasures.push({ x: tx, z: tz });
    }
  }

  return {
    data: maze,
    startX,
    startZ,
    exitX,
    exitZ,
    treasures
  };
}
