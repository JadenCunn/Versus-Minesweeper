// This is a partial conversion of your C++ Minesweeper code into JavaScript.
// This version is focused on core logic and suitable for integration with a web backend.

class MinesweeperBoard {
  constructor(width, height, totalMines) {
    this.width = width;
    this.height = height;
    this.totalMines = totalMines;
    this.mines = Array.from({ length: height }, () => Array(width).fill(false));
    this.revealed = Array.from({ length: height }, () => Array(width).fill(false));
    this.proximity = Array.from({ length: height }, () => Array(width).fill(0));
  }

  computeProximity() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.mines[y][x]) {
          this.proximity[y][x] = 9;
        } else {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dy === 0 && dx === 0) continue;
              const ny = y + dy, nx = x + dx;
              if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
                if (this.mines[ny][nx]) count++;
              }
            }
          }
          this.proximity[y][x] = count;
        }
      }
    }
  }

  copyFrom(other) {
    this.width = other.width;
    this.height = other.height;
    this.totalMines = other.totalMines;
    this.mines = other.mines.map(row => [...row]);
    this.proximity = other.proximity.map(row => [...row]);
    this.revealed = Array.from({ length: this.height }, () => Array(this.width).fill(false));
  }

  revealCell(x, y) {
    if (this.revealed[y][x]) return false;
    this.revealed[y][x] = true;
    if (this.mines[y][x]) return true;

    if (this.proximity[y][x] === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
            this.revealCell(nx, ny);
          }
        }
      }
    }
    return false;
  }

  countSafeCells() {
    return this.mines.flat().filter(cell => !cell).length;
  }

  countRevealedSafeCells() {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.revealed[y][x] && !this.mines[y][x]) count++;
      }
    }
    return count;
  }

  isComplete() {
    return this.countRevealedSafeCells() === this.countSafeCells();
  }
}

function placeMines(mines, width, height, totalMines) {
  let placed = 0;
  while (placed < totalMines) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!mines[y][x]) {
      mines[y][x] = true;
      placed++;
    }
  }
}

class Player {
  constructor(width, height, mineCount) {
    this.score = 0;
    this.board = new MinesweeperBoard(width, height, mineCount);
    this.startTime = 0;
    this.endTime = 0;
  }

  startRound() {
    this.startTime = Date.now();
  }

  endRound() {
    this.endTime = Date.now();
  }

  getTimeTakenSeconds() {
    return (this.endTime - this.startTime) / 1000.0;
  }

  calculateScore(completed, maxTimeAllowed) {
    const safe = this.board.countSafeCells();
    const revealed = this.board.countRevealedSafeCells();
    const percentage = revealed / safe;
    const timeTaken = this.getTimeTakenSeconds();

    if (completed) {
      this.score += 1000;
    } else {
      if (percentage < 0.10) {
        this.score += Math.floor(percentage * 500);
      } else {
        const timeFactor = Math.min(maxTimeAllowed / timeTaken, 2.0);
        this.score += Math.floor(percentage * 500 * timeFactor);
      }
    }
  }
}

// Game loop and UI interaction would be implemented in the frontend or Node.js backend server depending on architecture.
