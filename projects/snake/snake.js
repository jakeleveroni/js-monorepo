/**
 * The game of snake.
 */
class Snake extends GridGame {
  /**
   * The number of blocks on each side of the square grid.
   * @type {number}
   */
  numBlocks = 16;

  /**
   * The number of milliseconds between each frame.
   * @type {number}
   */
  frameTimeMs = 270;

  appleColor = '#f51439';
  snakeColor = '#33FF00';

  appleCoords = { x: this.randomInteger(1, 14), y: this.randomInteger(1, 14) };

  /**
   * The snake.
   * @type {{ x: number, y: number}[]}
   */
  snake = [
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 3, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ];

  /**
   * @type {{ x: number, y: number }}
   */
  currentPivot = undefined;

  /* ===== INFORMATION =====

    // The snake should move in this direction on each call to `update()`.
    //  { x: -1, y: 0 } // left
    //  { x: 1,  y: 0 } // right
    //  { x: 0,  y: -1 } // up
    //  { x: 0,  y: 1 } // down
    this.velocity

    // Draws a colored square at some coordinate. (0, 0) is the top left border square.
    this.drawSquare(x, y, color)

    // Generates a random integer between min and max, inclusive.
    this.randomInteger(min, max)

    // End the game by throwing `GameOverError`.

  ===== INFORMATION ===== */

  /**
   * Updates the game state every frame.
   */
  update() {
    // check for collisions
    const previousHeadPosition = this.snake[0];
    const newHeadPos = {
      x: previousHeadPosition.x + this.velocity.x,
      y: previousHeadPosition.y + this.velocity.y,
    };

    // check for border collision
    if (
      newHeadPos.x < 1 ||
      newHeadPos.x > this.numBlocks - 2 ||
      newHeadPos.y < 1 ||
      newHeadPos.y > this.numBlocks - 2
    ) {
      throw new GameOverError();
    }

    // check for apple collision
    if (newHeadPos.x === this.appleCoords.x && newHeadPos.y === this.appleCoords.y) {
      this.snake.unshift(this.appleCoords);
      this.appleCoords = { x: this.randomInteger(0, 14), y: this.randomInteger(0, 14) };
    } else {
      // apply velocity
      const restOfSnake = this.snake.slice(0, this.snake.length - 1);
      this.snake = [newHeadPos, ...restOfSnake];
    }

    // check for self collisions ()
  }

  /**
   * Draws the game state every frame.
   */
  draw() {
    this.drawSquare(this.appleCoords.x, this.appleCoords.y, this.appleColor);
    // Draw the current game state in this function.
    // The canvas is cleared before each time `draw()` is called.
    for (const part of this.snake) {
      this.drawSquare(part.x, part.y, this.snakeColor);
    }
  }
}

new Snake().start();
