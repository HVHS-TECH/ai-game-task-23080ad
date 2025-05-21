const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const gridSize = 20;
const canvasSize = 400;
const gridCount = canvasSize / gridSize;

// Snake and food
let snake = [
    { x: 8 * gridSize, y: 8 * gridSize }
];
let food = { x: 5 * gridSize, y: 5 * gridSize };
let direction = "RIGHT";
let changingDirection = false;
let score = 0;

// Event listener for direction change
document.addEventListener("keydown", changeDirection);

// Game loop
function gameLoop() {
    if (gameOver()) return;
    
    changingDirection = false;
    moveSnake();
    checkFoodCollision();
    clearCanvas();
    drawSnake();
    drawFood();
    drawScore();

    setTimeout(gameLoop, 100);
}

// Game Over
function gameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        alert("Game Over! Final Score: " + score);
        document.location.reload();
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            alert("Game Over! Final Score: " + score);
            document.location.reload();
            return true;
        }
    }
    return false;
}

// Change direction based on key press
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

// Generate food at a random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridCount) * gridSize,
        y: Math.floor(Math.random() * gridCount) * gridSize
    };
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

// Start the game loop
gameLoop();