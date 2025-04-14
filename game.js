const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 计算画布尺寸
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, window.innerHeight - 180);
    canvas.width = size;
    canvas.height = size;
}

// 初始化时设置画布尺寸
resizeCanvas();
// 窗口大小改变时重新计算画布尺寸
window.addEventListener('resize', resizeCanvas);

const gridSize = 20;
let tileCount = 30; // 固定网格数量
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let isGameRunning = false;

// 键盘控制
document.addEventListener('keydown', function(event) {
    if (!isGameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

function gameLoop() {
    if (!isGameRunning) return;
    
    // 更新蛇的位置
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 绘制游戏
    drawGame();
}

function drawGame() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#3498db' : '#2ecc71';
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * gridSize + 1,
        food.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    );
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // 确保食物不会出现在蛇身上
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    alert(`游戏结束！得分：${score}`);
}

function startGame() {
    // 重置游戏状态
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameRunning = true;
    
    // 设置画布大小
    canvas.width = 600;
    canvas.height = 600;
    
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

// 辅助函数：绘制圆角矩形
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 确保canvas可以接收键盘事件
canvas.tabIndex = 1;
canvas.style.outline = 'none'; // 移除焦点边框

// 添加触摸控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!isGameRunning) return;
    
    e.preventDefault();
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // 确定滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0 && dx !== -1) {
            dx = 1;
            dy = 0;
            console.log('触摸向右'); // 调试信息
        } else if (deltaX < 0 && dx !== 1) {
            dx = -1;
            dy = 0;
            console.log('触摸向左'); // 调试信息
        }
    } else {
        // 垂直滑动
        if (deltaY > 0 && dy !== -1) {
            dx = 0;
            dy = 1;
            console.log('触摸向下'); // 调试信息
        } else if (deltaY < 0 && dy !== 1) {
            dx = 0;
            dy = -1;
            console.log('触摸向上'); // 调试信息
        }
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});
