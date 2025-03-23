const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const instructionsElement = document.getElementById('instructions');
const gameInstructionsElement = document.getElementById('gameInstructions');

canvas.width = 400;
canvas.height = 600;

let playerImg = new Image();
playerImg.src = 'img/player.png'; // Link to player image

let obstacleImg = new Image();
obstacleImg.src = 'img/obstacle.png'; // Link to obstacle image

// Add sound effects
const shootSound = new Audio('audio/shoot.wav'); //Link to shoot sound
const hitSound = new Audio('audio/hit.wav'); // Link to hit sound
const gameOverSound = new Audio('audio/gameover.wav'); //Link to game over sound

let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40, // size of player
    height: 40,
    speed: 5,
    dx: 0
};

let obstacles = [];
let bullets = [];
let obstacleSpeed = 2;
let bulletSpeed = 5;
let score = 0;
let gameOver = false;
let gameStarted = false;
let difficultyIncreaseInterval = 1000;

// Limited ammo
const maxBullets = 6;       // Limit the number of bullets fired
let bulletCount = 0;        // Count the number of bullets fired
let canShoot = true;        // Variable check if can fire
const reloadTime = 2000;    // Reload time in milliseconds

// Create obstacle
function createObstacle() {
    const width = 40;  // Size of obstacle
    const height = 40;
    const x = Math.floor(Math.random() * (canvas.width - width));
    obstacles.push({ x, y: 0, width, height });
}

// Create bullet
function createBullet() {
    if (canShoot) {
        bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 5, height: 10 });
        shootSound.play();  // Play shoot sound
        bulletCount++;
        
        // Check if the number of bullets fired exceeds the limit
        if (bulletCount >= maxBullets) {
            canShoot = false;  // Temporarily no shooting
            gameInstructionsElement.innerText = "Loading ammo...";  // Add instructions while reloading
            setTimeout(() => {
                canShoot = true;   // Allow shooting again
                bulletCount = 0;   // Reset the number of bullets fired
                gameInstructionsElement.innerText = "Press W to shoot, press arrow keys or A/D to move.";  // Change instructions after reloading
            }, reloadTime);        
        }
    }
}

// Draw player
function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = 'green';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Move player
function movePlayer() {
    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Move obstacles
function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}

// Move bullets
function moveBullets() {
    bullets.forEach(bullet => {
        bullet.y -= bulletSpeed;
    });

    bullets = bullets.filter(bullet => bullet.y > 0);
}

// Check bullet collision with obstacles
function checkBulletCollision() {
    bullets.forEach((bullet, bulletIndex) => {
        obstacles.forEach((obstacle, obstacleIndex) => {
            if (
                bullet.x < obstacle.x + obstacle.width &&
                bullet.x + bullet.width > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.height + bullet.y > obstacle.y
            ) {
                bullets.splice(bulletIndex, 1);
                obstacles.splice(obstacleIndex, 1);
                hitSound.play();  // Play hit sound
                score += 50;
            }
        });
    });
}

// Check collision with obstacles
function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.height + player.y > obstacle.y
        ) {
            gameOver = true;
        }
    });
}

// Update game
function update() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);
        instructionsElement.innerText = "Press W to play again";
        gameOverSound.play();  // Play game over sound
        document.addEventListener('keydown', reloadGame);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawObstacles();
    drawBullets();

    movePlayer();
    moveObstacles();
    moveBullets();
    checkCollision();
    checkBulletCollision();

    score++;
    scoreElement.innerText = `Score: ${score}`;

    if (score % difficultyIncreaseInterval === 0) {
        obstacleSpeed += 0.5;
    }

    if (score % 100 === 0) createObstacle();

    requestAnimationFrame(update);
}

// Control player
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === 'w' || e.key === 'W') {
        createBullet();  // Call createBullet function when pressing W
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'a') {
        player.dx = 0;
    }
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Reload game
function reloadGame() {
    gameOver = false;
    score = 0;
    obstacleSpeed = 2;
    obstacles = [];
    bullets = [];
    instructionsElement.innerText = "";
    gameInstructionsElement.innerText = "Press W to shoot, press arrow keys or A/D to move.";
    document.removeEventListener('keydown', reloadGame);
    update();
}

// Start game
canvas.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        instructionsElement.innerText = "";
        createObstacle();
        update();
    }
});
// Add high score
let highScore = 0; // Create a variable to store high score

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
    }
    document.getElementById('highScore').innerText = `High Score: ${highScore}`;
}

// Update game
function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.height + player.y > obstacle.y
        ) {
            gameOver = true;
            updateHighScore();  // Update high score
        }
    });
}