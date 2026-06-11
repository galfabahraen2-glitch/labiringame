export interface MazeResult {
  data: number[][];
  startX: number;
  startZ: number;
  exitX: number;
  exitZ: number;
  treasures: { x: number; z: number }[];
  enemies: { x: number; z: number; type: 'pocong' | 'kuntilanak' | 'animalHead' }[];
}

export function generateMaze(level: number): MazeResult {
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
    const dirs = [...directions].sort(() => Math.random() - 0.5);
    
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
    const tx = Math.floor(Math.random() * (width - 2)) + 1;
    const tz = Math.floor(Math.random() * (height - 2)) + 1;
    
    // If it's a path, and not start/exit, and not already a treasure
    if (maze[tz][tx] === 0 && 
       !(tx === startX && tz === startZ) && 
       !(tx === exitX && tz === exitZ) &&
       !treasures.some(t => t.x === tx && t.z === tz)) {
      treasures.push({ x: tx, z: tz });
    }
  }

  // Place enemies
  const enemies: { x: number; z: number; type: 'pocong' | 'kuntilanak' | 'animalHead' }[] = [];
  const enemyCount = Math.floor(level / 5) + 1; // 1 enemy at lvl 1, 25 enemies at lvl 120
  const enemyTypes: ('pocong' | 'kuntilanak' | 'animalHead')[] = ['pocong', 'kuntilanak', 'animalHead'];

  attempts = 0;
  while (enemies.length < enemyCount && attempts < 1000) {
    attempts++;
    const ex = Math.floor(Math.random() * (width - 2)) + 1;
    const ez = Math.floor(Math.random() * (height - 2)) + 1;
    
    if (maze[ez][ex] === 0 && 
       !(ex === startX && ez === startZ) && 
       !(ex === exitX && ez === exitZ) &&
       !treasures.some(t => t.x === ex && t.z === ez) &&
       !enemies.some(e => e.x === ex && e.z === ez)) {
      
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      enemies.push({ x: ex, z: ez, type });
    }
  }

  return {
    data: maze,
    startX,
    startZ,
    exitX,
    exitZ,
    treasures,
    enemies
  };
}
