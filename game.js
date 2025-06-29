class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameRunning = true;
        this.keys = {};
        this.obstacles = this.generateObstacles();
        
        // Players - Find safe spawn positions
        const player1Pos = this.findSafeSpawnPosition(40, 40);
        const player2Pos = this.findSafeSpawnPosition(40, 40);
        
        this.player1 = new Tank(player1Pos.x, player1Pos.y, '#e74c3c', 'player1');
        this.player2 = new Tank(player2Pos.x, player2Pos.y, '#3498db', 'player2');
        
        // Bullets
        this.bullets = [];
        
        // Bind events
        this.bindEvents();
        
        // Start game loop
        this.gameLoop();
    }
    
    generateObstacles() {
        const obstacles = [];
        // Add some random obstacles
        for (let i = 0; i < 8; i++) {
            obstacles.push({
                x: Math.random() * (this.width - 100) + 50,
                y: Math.random() * (this.height - 100) + 50,
                width: 60 + Math.random() * 40,
                height: 60 + Math.random() * 40
            });
        }
        
        // Add border walls
        obstacles.push(
            {x: 0, y: 0, width: this.width, height: 20}, // Top
            {x: 0, y: this.height - 20, width: this.width, height: 20}, // Bottom
            {x: 0, y: 0, width: 20, height: this.height}, // Left
            {x: this.width - 20, y: 0, width: 20, height: this.height} // Right
        );
        
        return obstacles;
    }
    
    findSafeSpawnPosition(tankWidth, tankHeight) {
        const maxAttempts = 100;
        const margin = 30; // Extra space around tank
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = margin + Math.random() * (this.width - tankWidth - 2 * margin);
            const y = margin + Math.random() * (this.height - tankHeight - 2 * margin);
            
            const testTank = {
                x: x,
                y: y,
                width: tankWidth,
                height: tankHeight
            };
            
            let collision = false;
            
            // Check collision with all obstacles
            for (let obstacle of this.obstacles) {
                if (this.checkCollision(testTank, obstacle)) {
                    collision = true;
                    break;
                }
            }
            
            // Check minimum distance from other players if they exist
            if (!collision && this.player1) {
                const distance = Math.sqrt(
                    Math.pow(x - this.player1.x, 2) + Math.pow(y - this.player1.y, 2)
                );
                if (distance < 100) { // Minimum distance between players
                    collision = true;
                }
            }
            
            if (!collision) {
                return { x: x, y: y };
            }
        }
        
        // Fallback positions if no safe position found
        return { x: 50, y: 50 };
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Shooting
            if (e.code === 'Space' && this.gameRunning) {
                e.preventDefault();
                this.player1.shoot(this.bullets);
            }
            if (e.code === 'Enter' && this.gameRunning) {
                e.preventDefault();
                this.player2.shoot(this.bullets);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update players
        this.player1.update(this.keys, this.obstacles, this.width, this.height);
        this.player2.update(this.keys, this.obstacles, this.width, this.height);
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            
            // Remove bullets that are out of bounds
            if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
                return false;
            }
            
            // Check collision with obstacles
            for (let obstacle of this.obstacles) {
                if (this.checkCollision(bullet, obstacle)) {
                    return false;
                }
            }
            
            // Check collision with players
            if (bullet.owner !== 'player1' && this.checkCollision(bullet, this.player1)) {
                this.player1.takeDamage(25);
                this.updateHealthBar('player1', this.player1.health);
                return false;
            }
            
            if (bullet.owner !== 'player2' && this.checkCollision(bullet, this.player2)) {
                this.player2.takeDamage(25);
                this.updateHealthBar('player2', this.player2.health);
                return false;
            }
            
            return true;
        });
        
        // Check for game over
        if (this.player1.health <= 0) {
            this.gameOver('Player 2 Wins!');
        } else if (this.player2.health <= 0) {
            this.gameOver('Player 1 Wins!');
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateHealthBar(player, health) {
        const healthBar = document.getElementById(player + '-health');
        const healthText = document.getElementById(player + '-health-text');
        const percentage = Math.max(0, health);
        
        healthBar.style.width = percentage + '%';
        healthText.textContent = Math.max(0, health);
    }
    
    gameOver(winner) {
        this.gameRunning = false;
        document.getElementById('winnerText').textContent = winner;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw obstacles
        this.ctx.fillStyle = '#34495e';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add border to obstacles
            this.ctx.strokeStyle = '#ecf0f1';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw players
        this.player1.render(this.ctx);
        this.player2.render(this.ctx);
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.render(this.ctx));
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Tank {
    constructor(x, y, color, owner) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = color;
        this.owner = owner;
        this.angle = 0;
        this.speed = 3;
        this.rotationSpeed = 0.1; // radians per frame
        this.health = 100;
        this.lastShot = 0;
        this.shootCooldown = 300; // milliseconds
    }
    
    update(keys, obstacles, canvasWidth, canvasHeight) {
        // Check if tank is stuck in a wall and try to escape
        if (this.isStuckInWall(obstacles, canvasWidth, canvasHeight)) {
            this.escapeFromWall(obstacles, canvasWidth, canvasHeight);
        }
        
        // Handle movement and rotation with improved system
        this.handleMovementAndRotation(keys, obstacles, canvasWidth, canvasHeight);
    }
    
    handleMovementAndRotation(keys, obstacles, canvasWidth, canvasHeight) {
        let deltaX = 0;
        let deltaY = 0;
        let shouldRotate = false;
        
        // Player 1 controls (WASD)
        if (this.owner === 'player1') {
            const isMovingForwardBackward = keys['KeyW'] || keys['KeyS'];
            
            // Forward/Backward movement
            if (keys['KeyW']) {
                deltaX += Math.cos(this.angle) * this.speed;
                deltaY += Math.sin(this.angle) * this.speed;
            }
            if (keys['KeyS']) {
                deltaX -= Math.cos(this.angle) * this.speed;
                deltaY -= Math.sin(this.angle) * this.speed;
            }
            
            // Left/Right - steering when moving, rotation when stationary
            if (keys['KeyA']) {
                if (isMovingForwardBackward) {
                    // Steering while moving - rotate tank
                    this.angle -= this.rotationSpeed;
                    shouldRotate = true;
                } else {
                    // Stationary rotation (like old Q key)
                    this.angle -= this.rotationSpeed;
                    shouldRotate = true;
                }
            }
            if (keys['KeyD']) {
                if (isMovingForwardBackward) {
                    // Steering while moving - rotate tank
                    this.angle += this.rotationSpeed;
                    shouldRotate = true;
                } else {
                    // Stationary rotation (like old E key)
                    this.angle += this.rotationSpeed;
                    shouldRotate = true;
                }
            }
        }
        
        // Player 2 controls (Arrow keys)
        if (this.owner === 'player2') {
            const isMovingForwardBackward = keys['ArrowUp'] || keys['ArrowDown'];
            
            // Forward/Backward movement
            if (keys['ArrowUp']) {
                deltaX += Math.cos(this.angle) * this.speed;
                deltaY += Math.sin(this.angle) * this.speed;
            }
            if (keys['ArrowDown']) {
                deltaX -= Math.cos(this.angle) * this.speed;
                deltaY -= Math.sin(this.angle) * this.speed;
            }
            
            // Left/Right - steering when moving, rotation when stationary
            if (keys['ArrowLeft']) {
                if (isMovingForwardBackward) {
                    // Steering while moving - rotate tank
                    this.angle -= this.rotationSpeed;
                    shouldRotate = true;
                } else {
                    // Stationary rotation (like old Z key)
                    this.angle -= this.rotationSpeed;
                    shouldRotate = true;
                }
            }
            if (keys['ArrowRight']) {
                if (isMovingForwardBackward) {
                    // Steering while moving - rotate tank
                    this.angle += this.rotationSpeed;
                    shouldRotate = true;
                } else {
                    // Stationary rotation (like old X key)
                    this.angle += this.rotationSpeed;
                    shouldRotate = true;
                }
            }
        }
        
        // Keep angle in reasonable range
        if (shouldRotate) {
            if (this.angle > Math.PI * 2) {
                this.angle -= Math.PI * 2;
            } else if (this.angle < 0) {
                this.angle += Math.PI * 2;
            }
        }
        
        // Apply movement if there's any
        if (deltaX !== 0 || deltaY !== 0) {
            // Try to move on X-axis first
            if (deltaX !== 0) {
                const newX = this.x + deltaX;
                if (this.canMoveTo(newX, this.y, obstacles, canvasWidth, canvasHeight)) {
                    this.x = newX;
                }
            }
            
            // Try to move on Y-axis second
            if (deltaY !== 0) {
                const newY = this.y + deltaY;
                if (this.canMoveTo(this.x, newY, obstacles, canvasWidth, canvasHeight)) {
                    this.y = newY;
                }
            }
        }
    }
    
    canMoveTo(newX, newY, obstacles, canvasWidth, canvasHeight) {
        // Check canvas boundaries with proper margins
        if (newX < 20 || newX + this.width > canvasWidth - 20 ||
            newY < 20 || newY + this.height > canvasHeight - 20) {
            return false;
        }
        
        // Check collision with obstacles
        const tempTank = {
            x: newX,
            y: newY,
            width: this.width,
            height: this.height
        };
        
        for (let obstacle of obstacles) {
            if (this.checkCollision(tempTank, obstacle)) {
                return false;
            }
        }
        
        return true;
    }
    
    isStuckInWall(obstacles, canvasWidth, canvasHeight) {
        // Check if current position is colliding with any obstacle
        const currentTank = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        // Check boundary collision
        if (this.x < 20 || this.x + this.width > canvasWidth - 20 ||
            this.y < 20 || this.y + this.height > canvasHeight - 20) {
            return true;
        }
        
        // Check obstacle collision
        for (let obstacle of obstacles) {
            if (this.checkCollision(currentTank, obstacle)) {
                return true;
            }
        }
        
        return false;
    }
    
    escapeFromWall(obstacles, canvasWidth, canvasHeight) {
        const escapeDistance = 5;
        const directions = [
            { x: escapeDistance, y: 0 },   // Right
            { x: -escapeDistance, y: 0 },  // Left
            { x: 0, y: escapeDistance },   // Down
            { x: 0, y: -escapeDistance },  // Up
            { x: escapeDistance, y: escapeDistance },   // Down-Right
            { x: -escapeDistance, y: escapeDistance },  // Down-Left
            { x: escapeDistance, y: -escapeDistance },  // Up-Right
            { x: -escapeDistance, y: -escapeDistance }  // Up-Left
        ];
        
        // Try each direction to find a safe position
        for (let direction of directions) {
            const newX = this.x + direction.x;
            const newY = this.y + direction.y;
            
            if (this.canMoveTo(newX, newY, obstacles, canvasWidth, canvasHeight)) {
                this.x = newX;
                this.y = newY;
                return; // Successfully escaped
            }
        }
        
        // If still stuck, try larger escape distances
        for (let distance = 10; distance <= 30; distance += 5) {
            for (let direction of directions) {
                const newX = this.x + direction.x * (distance / escapeDistance);
                const newY = this.y + direction.y * (distance / escapeDistance);
                
                if (this.canMoveTo(newX, newY, obstacles, canvasWidth, canvasHeight)) {
                    this.x = newX;
                    this.y = newY;
                    return; // Successfully escaped
                }
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    shoot(bullets) {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            bullets.push(new Bullet(centerX, centerY, this.angle, this.owner));
            this.lastShot = now;
        }
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }
    
    render(ctx) {
        ctx.save();
        
        // Move to tank center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        // Draw tank body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw tank outline
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw cannon
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.width / 2 - 5, -3, 20, 6);
        
        // Draw direction indicator
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(5, -2, 10, 4);
        
        ctx.restore();
        
        // Draw health bar above tank
        const barWidth = this.width;
        const barHeight = 6;
        const barX = this.x;
        const barY = this.y - 15;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = this.color;
        ctx.fillRect(barX, barY, (barWidth * this.health) / 100, barHeight);
        
        // Border
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

class Bullet {
    constructor(x, y, angle, owner) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.angle = angle;
        this.speed = 8;
        this.owner = owner;
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    render(ctx) {
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        // Add glow effect
        ctx.shadowColor = '#f39c12';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Global functions
let game;

function startGame() {
    game = new Game();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

// Start the game when page loads
window.addEventListener('load', () => {
    startGame();
});