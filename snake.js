const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const canvasSize = 400;
const gridCount = canvasSize / gridSize;
let snakeSpeed = 100; // Initial game speed

let snake = [{ x: 8 * gridSize, y: 8 * gridSize }];
let food = { x: 5 * gridSize, y: 5 * gridSize };
let direction = "RIGHT";
let changingDirection = false;
let score = 0;
let invincible = false; // Flag to track invincibility
let speedBoostActive = false; // Flag to track speed boost
let invincibilityTimer = 0; // Timer for invincibility
let speedBoostTimer = 0; // Timer for speed boost

// Power-ups array
let powerUps = [];

// Obstacles array
let obstacles = [];

// Explosion state
let explosionParts = [];

document.addEventListener("keydown", changeDirection);

// Main game loop
function gameLoop() {
    if (gameOver()) return;

    changingDirection = false;
    moveSnake();
    checkFoodCollision();
    checkPowerUpCollision();
    clearCanvas();
    drawSnake();
    drawFood();
    drawPowerUps();
    drawObstacles();
    drawScore();

    // Handle power-up timers
    if (invincible) {
        invincibilityTimer--;
        if (invincibilityTimer <= 0) {
            invincible = false;
        }
    }

    if (speedBoostActive) {
        speedBoostTimer--;
        if (speedBoostTimer <= 0) {
            speedBoostActive = false;
            snakeSpeed = 100; // Reset speed
        }
    }

    setTimeout(gameLoop, snakeSpeed);
}

// Game Over check
function gameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        explodeSnake();
        showRestartButton();
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            explodeSnake();
            showRestartButton();
            return true;
        }
    }

    // Check if snake hits an obstacle
    for (let obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y && !invincible) {
            explodeSnake();
            showRestartButton();
            return true;
        }
    }
    return false;
}

// Direction change based on key press
function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    if (keyPressed === 37 && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (keyPressed === 38 && direction !== "DOWN") {
        direction = "UP";
    } else if (keyPressed === 39 && direction !== "LEFT") {
        direction = "RIGHT";
    } else if (keyPressed === 40 && direction !== "UP") {
        direction = "DOWN";
    }
}

// Move the snake
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === "LEFT") head.x -= gridSize;
    if (direction === "RIGHT") head.x += gridSize;
    if (direction === "UP") head.y -= gridSize;
    if (direction === "DOWN") head.y += gridSize;

    snake.unshift(head); // Add new head to the snake

    // Remove the tail if the snake hasn't eaten food
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    } else {
        score += 10;
        generateFood();
    }
}

// Check if snake eats food
function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
    }
}

// Check if snake collides with power-up
function checkPowerUpCollision() {
    const head = snake[0];
    for (let i = 0; i < powerUps.length; i++) {
        if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
            if (powerUps[i].type === "speed") {
                activateSpeedBoost();
            } else if (powerUps[i].type === "invincibility") {
                activateInvincibility();
            }
            powerUps.splice(i, 1); // Remove the power-up once eaten
            break;
        }
    }
}

// Activate speed boost power-up
function activateSpeedBoost() {
    speedBoostActive = true;
    speedBoostTimer = 200; // Speed boost lasts for 200 frames
    snakeSpeed = 50; // Increase snake speed
}

// Activate invincibility power-up
function activateInvincibility() {
    invincible = true;
    invincibilityTimer = 200; // Invincibility lasts for 200 frames
}

// Draw the snake
function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = "lime";
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

// Draw the food
function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.type === "speed") {
            ctx.fillStyle = "cyan";
        } else if (powerUp.type === "invincibility") {
            ctx.fillStyle = "purple";
        }
        ctx.fillRect(powerUp.x, powerUp.y, gridSize, gridSize);
    });
}

// Generate food at a random position
function generateFood() {
    let foodPosition;
    do {
        foodPosition = {
            x: Math.floor(Math.random() * gridCount) * gridSize,
            y: Math.floor(Math.random() * gridCount) * gridSize
        };
    } while (isFoodOnSnake(foodPosition)); // Ensure food doesn't spawn on the snake

    food = foodPosition;
    generatePowerUp(); // Generate a power-up after food
}

// Check if food position is occupied by the snake
function isFoodOnSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

// Generate random power-ups
function generatePowerUp() {
    if (Math.random() < 0.1) { // 10% chance to spawn a power-up
        const powerUpType = Math.random() < 0.5 ? "speed" : "invincibility"; // 50% chance for each power-up
        const x = Math.floor(Math.random() * gridCount) * gridSize;
        const y = Math.floor(Math.random() * gridCount) * gridSize;
        powerUps.push({ x, y, type: powerUpType });
    }
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = "orange";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);
    });
}

// Generate obstacles randomly
function generateObstacles() {
    if (Math.random() < 0.05 && obstacles.length < 5) {
        const x = Math.floor(Math.random() * gridCount) * gridSize;
        const y = Math.floor(Math.random() * gridCount) * gridSize;
        obstacles.push({ x, y });
    }
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
}

// Draw the score
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Create explosion effect when the snake dies
function explodeSnake() {
    explosionParts = [];
    snake.forEach(segment => {
        for (let i = 0; i < 5; i++) { // Create 5 parts for each snake segment
            explosionParts.push({
                x: segment.x,
                y: segment.y,
                dx: (Math.random() - 0.5) * 5, // Random horizontal velocity
                dy: (Math.random() - 0.5) * 5, // Random vertical velocity
                life: 50 // How long it lasts before disappearing
            });
        }
    });

    animateExplosion();
}

// Animate explosion effect
function animateExplosion() {
    if (explosionParts.length > 0) {
        clearCanvas();
        explosionParts.forEach(part => {
            part.x += part.dx;
            part.y += part.dy;
            part.life--;
            ctx.fillStyle = "yellow";
            ctx.fillRect(part.x, part.y, gridSize / 2, gridSize / 2); // Draw explosion part
        });

        explosionParts = explosionParts.filter(part => part.life > 0);

        requestAnimationFrame(animateExplosion); // Continue animating explosion
    }
}

// Show the restart button
function restartGame() {
    snake = [{ x: 8 * gridSize, y: 8 * gridSize }];
    food = { x: 5 * gridSize, y: 5 * gridSize };
    direction = "RIGHT";
    changingDirection = false;
    score = 0;
    invincible = false;
    speedBoostActive = false;
    invincibilityTimer = 0;
    speedBoostTimer = 0;
    powerUps = [];
    obstacles = [];
    explosionParts = [];

    // Hide restart button
    const restartButton = document.getElementById("restartButton");
    restartButton.style.display = "none";

    // Restart game loop
    gameLoop();
}

// Start the game loop
generateObstacles();
gameLoop();
