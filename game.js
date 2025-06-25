class MinesweeperBoard {
    constructor(width, height, totalMines) {
      this.width = width;
      this.height = height;
      this.totalMines = totalMines;
  
      this.mines = Array.from({ length: height }, () => Array(width).fill(false));
      this.revealed = Array.from({ length: height }, () => Array(width).fill(false));
      this.proximity = Array.from({ length: height }, () => Array(width).fill(0));
    }
  
    placeMines() {
      let placed = 0;
      while (placed < this.totalMines) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        if (!this.mines[y][x]) {
          this.mines[y][x] = true;
          placed++;
        }
      }
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
                if (dx === 0 && dy === 0) continue;
                const ny = y + dy;
                const nx = x + dx;
                if (
                  ny >= 0 &&
                  ny < this.height &&
                  nx >= 0 &&
                  nx < this.width &&
                  this.mines[ny][nx]
                ) {
                  count++;
                }
              }
            }
            this.proximity[y][x] = count;
          }
        }
      }
    }
  
    copyFrom(otherBoard) {
      this.width = otherBoard.width;
      this.height = otherBoard.height;
      this.totalMines = otherBoard.totalMines;
      this.mines = otherBoard.mines.map(row => row.slice());
      this.proximity = otherBoard.proximity.map(row => row.slice());
      this.revealed = Array.from({ length: this.height }, () => Array(this.width).fill(false));
    }
  
    revealCell(x, y) {
      if (this.revealed[y][x]) return false;
      
      const queue = [[x, y]];
    
      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
    
        if (
          cx < 0 || cx >= this.width ||
          cy < 0 || cy >= this.height ||
          this.revealed[cy][cx]
        ) continue;
    
        this.revealed[cy][cx] = true;
    
        // Stop flood at numbers or mines
        if (this.mines[cy][cx]) return true;
    
        if (this.proximity[cy][cx] === 0) {
          // Add 8 neighbors to queue
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              queue.push([cx + dx, cy + dy]);
            }
          }
        }
      }    
  
      return false;
    }
  
    countSafeCells() {
      let count = 0;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!this.mines[y][x]) count++;
        }
      }
      return count;
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

class Player {
    constructor(width, height, mines) {
      this.score = 0;
      this.board = new MinesweeperBoard(width, height, mines);
      this.startTime = null;
      this.endTime = null;
    }
  
    startRound() {
      this.startTime = new Date();
    }
  
    endRound() {
      this.endTime = new Date();
    }
  
    getTimeTakenSeconds() {
      return (this.endTime - this.startTime) / 1000;
    }
  
    calculateScore(completed, maxTimeAllowed = 180.0) {
      const safeCells = this.board.countSafeCells();
      const revealedSafe = this.board.countRevealedSafeCells();
      const percentage = revealedSafe / safeCells;
  
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
  
/* const width = 10, height = 10, mines = 10;
const player1 = new Player(width, height, mines);
const player2 = new Player(width, height, mines);

const sharedBoard = new MinesweeperBoard(width, height, mines);
sharedBoard.placeMines();
sharedBoard.computeProximity();

player1.board.copyFrom(sharedBoard);
player2.board.copyFrom(sharedBoard); */
