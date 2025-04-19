/**
 * Throw this error to end the game.
 */
class GameOverError extends Error {}

/**
 * A game played on a grid.
 */
class GridGame {
  // ===== HELPERS =====
  /**
   * Gets the current velocity.
   * @example
   *  { x: -1, y: 0 } // left
   *  { x: 1,  y: 0 } // right
   *  { x: 0,  y: -1 } // up
   *  { x: 0,  y: 1 } // down
   * @returns {{ x: number, y: number }}
   */
  get velocity() {
    return this.#velocity;
  }

  /**
   * Draws a colored square at some coordinate.
   * @param {number} x The x coordinate.
   * @param {number} y The y coordinate.
   * @param {string} color The color.
   */
  drawSquare(x, y, color) {
    this.#ctx.fillStyle = color;
    this.#ctx.fillRect(
      this.#squareHeight * x + this.#borderShrink,
      this.#squareHeight * y + this.#borderShrink,
      this.#squareHeight - this.#borderShrink * 2,
      this.#squareHeight - this.#borderShrink * 2,
    );
  }

  /**
   * Generates a random integer between `min` and `max`, inclusive.
   * @param {number} min The minimum.
   * @param {number} max The maximum.
   * @returns {number}
   */
  randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ===== OVERRIDABLE =====
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

  // ===== GAME BOILERPLATE =====
  #width = 1200;
  #height = 1200;
  #scale = 2;
  #borderShrinkFactor = 0.09;
  #lastRenderTime = Number.NEGATIVE_INFINITY;
  #isGameOver = false;

  #squareHeight;
  #borderShrink;
  /** @type {HTMLCanvasElement} */
  #canvas;
  #gameOverOverlay;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  /**
   * The velocity at the last tick.
   * @type {{x: number, y: number}}
   */
  #lastTickVelocity = { x: 1, y: 0 };
  /**
   *
   * @type {{ x: number, y: number }}
   */
  #velocity = { x: 1, y: 0 };

  #background = '#282828';
  #borderColor = '#9922ee';

  start() {
    this.#initialize();

    const render = (time) => {
      if (this.#isGameOver) {
        // Once we game over, stop the game loop.
        return;
      }

      // Schedule the next frame.
      requestAnimationFrame(render);

      if (time - this.#lastRenderTime >= this.frameTimeMs) {
        this.#lastRenderTime = time;
        this.#tick();

        if (this.#isGameOver) {
          this.#showGameOver();
        }
      }
    };

    // Kick off the rendering.
    requestAnimationFrame(render);
  }

  /**
   * Updates the game state every frame.
   */
  update() {}

  /**
   * Draws the game state every frame.
   */
  draw() {}

  #tick() {
    // Save the last tick velocity so that we know which velocity was
    // last presented to the `update` and `draw` functions for the purposes
    // of preventing 180 degree movement.
    this.#lastTickVelocity = this.#velocity;

    try {
      this.update();

      this.#clearCanvas();
      this.#drawBorder();
      this.draw();
    } catch (e) {
      if (e instanceof GameOverError) {
        this.#isGameOver = true;
        return;
      }

      throw e;
    }
  }

  #initialize() {
    this.#initCanvas();
    this.#bindEvents();
  }

  #bindEvents() {
    // Handle the Start Over button click.
    document
      .querySelector('.canvas-container > .game-over > button')
      .addEventListener('click', () => window.location.reload());

    document.addEventListener('keydown', (event) => {
      // Bind the Enter key to restart during the game-over state.
      if (event.key === 'Enter' && this.#isGameOver) {
        event.preventDefault();
        window.location.reload();
        return;
      }

      // Bind arrow keys to change velocity, blocking 180 degree movement.
      let isArrow = true;
      switch (event.key) {
        case 'ArrowLeft':
          if (this.#lastTickVelocity.x !== 1) {
            // ... not going right.
            this.#velocity = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (this.#lastTickVelocity.x !== -1) {
            // ... not going left.
            this.#velocity = { x: 1, y: 0 };
          }
          break;
        case 'ArrowUp':
          if (this.#lastTickVelocity.y !== 1) {
            // ... not going down.
            this.#velocity = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (this.#lastTickVelocity.y !== -1) {
            // ... not going up.
            this.#velocity = { x: 0, y: 1 };
          }
          break;
        default:
          isArrow = false;
          break;
      }

      if (isArrow) {
        event.preventDefault();
      }
    });
  }

  #initCanvas() {
    this.#canvas = document.querySelector('.canvas-container > canvas');
    this.#gameOverOverlay = document.querySelector('.canvas-container > .game-over');
    this.#ctx = this.#canvas.getContext('2d');

    this.#canvas.width = this.#width;
    this.#canvas.height = this.#height;

    // Make canvas not look blurry on high-res screens.
    this.#canvas.style.width = `${this.#width / this.#scale}px`;
    this.#canvas.style.height = `${this.#height / this.#scale}px`;

    this.#squareHeight = this.#width / this.numBlocks;
    this.#borderShrink = this.#squareHeight * this.#borderShrinkFactor;
  }

  #clearCanvas() {
    this.#ctx.fillStyle = this.#background;
    this.#ctx.fillRect(0, 0, this.#width, this.#height);
  }

  #drawBorder() {
    for (let i = 0; i < this.numBlocks; i++) {
      this.drawSquare(0, i, this.#borderColor);
      this.drawSquare(i, 0, this.#borderColor);
      this.drawSquare(this.numBlocks - 1, i, this.#borderColor);
      this.drawSquare(i, this.numBlocks - 1, this.#borderColor);
    }
  }

  #showGameOver() {
    this.#gameOverOverlay.style.display = 'flex';
  }
}
