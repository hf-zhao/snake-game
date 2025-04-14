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

const gridSize = 25; // 增大网格大小
let tileCount = Math.floor(canvas.width / gridSize);

// 食物类型定义
const foodTypes = [
    { type: 'apple', color: '#e74c3c', points: 10, image: '🍎' },
    { type: 'banana', color: '#f1c40f', points: 15, image: '🍌' },
    { type: 'orange', color: '#e67e22', points: 20, image: '🍊' },
    { type: 'strawberry', color: '#e84393', points: 25, image: '🍓' },
    { type: 'cherry', color: '#c0392b', points: 30, image: '🍒' }
];

let snake = [
    { x: 10, y: 10 },
];
let food = { x: 15, y: 15, type: foodTypes[0] };
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 100;
let isGameRunning = false;

// 键盘控制处理函数
function handleKeyPress(event) {
    if (!isGameRunning) return;
    
    const key = event.key;
    console.log('按键按下:', key);
    
    switch (key) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
                console.log('设置向上移动');
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
                console.log('设置向下移动');
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
                console.log('设置向左移动');
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
                console.log('设置向右移动');
            }
            break;
    }
    
    // 防止按键引起页面滚动
    event.preventDefault();
}

// 游戏主循环
function gameLoop() {
    if (!isGameRunning) {
        console.log('游戏未运行');
        return;
    }
    
    updateSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    drawGame();
}

// 更新蛇的位置
function updateSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += food.type.points;
        scoreElement.textContent = score;
        generateFood();
        
        // 加快游戏速度
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

// 绘制游戏画面
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        
        if (index === 0) {
            // 蛇头使用纯色
            ctx.fillStyle = '#3498db';
            
            // 绘制圆角矩形作为蛇头
            roundRect(ctx, x + 1, y + 1, size - 2, size - 2, 10);
            ctx.fill();
            
            // 添加眼睛
            ctx.fillStyle = 'white';
            if (dx === 1) { // 向右
                ctx.beginPath();
                ctx.arc(x + size - 8, y + 8, 3, 0, Math.PI * 2);
                ctx.arc(x + size - 8, y + size - 8, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (dx === -1) { // 向左
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
                ctx.arc(x + 8, y + size - 8, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (dy === -1) { // 向上
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
                ctx.arc(x + size - 8, y + 8, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (dy === 1) { // 向下
                ctx.beginPath();
                ctx.arc(x + 8, y + size - 8, 3, 0, Math.PI * 2);
                ctx.arc(x + size - 8, y + size - 8, 3, 0, Math.PI * 2);
                ctx.fill();
            } else { // 默认（游戏开始时）
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
                ctx.arc(x + size - 8, y + 8, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // 蛇身使用纯色
            ctx.fillStyle = '#2ecc71';
            
            // 绘制圆角矩形作为蛇身
            roundRect(ctx, x + 1, y + 1, size - 2, size - 2, 8);
            ctx.fill();
        }
    });

    // 绘制食物
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    const foodSize = gridSize - 2;
    
    // 绘制食物背景
    ctx.fillStyle = food.type.color;
    ctx.beginPath();
    ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制食物表情
    ctx.font = `${foodSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.type.image, foodX + foodSize/2, foodY + foodSize/2);
}

// 生成食物
function generateFood() {
    const randomType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: randomType
    };
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            type: randomType
        };
    }
}

// 检查碰撞
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

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // 创建游戏结束界面
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    // 创建结果容器
    const resultContainer = document.createElement('div');
    resultContainer.style.backgroundColor = '#34495e';
    resultContainer.style.padding = '20px';
    resultContainer.style.borderRadius = '15px';
    resultContainer.style.textAlign = 'center';
    resultContainer.style.maxWidth = '80%';
    
    // 添加得分
    const scoreText = document.createElement('h2');
    scoreText.style.color = '#ecf0f1';
    scoreText.style.marginBottom = '20px';
    scoreText.textContent = `游戏结束！得分：${score}`;
    
    // 添加图片
    const image = document.createElement('img');
    image.src = './pic.jpg';
    image.style.maxWidth = '200px';
    image.style.borderRadius = '10px';
    image.style.marginBottom = '20px';
    
    // 添加鼓励文字
    const message = document.createElement('p');
    message.style.color = '#ecf0f1';
    message.style.fontSize = '1.2em';
    message.style.marginBottom = '20px';
    message.textContent = '宝宝还需要多加练习哦！';
    
    // 添加重新开始按钮
    const restartButton = document.createElement('button');
    restartButton.textContent = '再玩一次';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '1.1em';
    restartButton.style.backgroundColor = '#3498db';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    
    restartButton.onclick = () => {
        document.body.removeChild(overlay);
        startGame();
    };
    
    // 组装界面
    resultContainer.appendChild(scoreText);
    resultContainer.appendChild(image);
    resultContainer.appendChild(message);
    resultContainer.appendChild(restartButton);
    overlay.appendChild(resultContainer);
    document.body.appendChild(overlay);
}

// 开始游戏
function startGame() {
    if (isGameRunning) return;
    
    // 重置所有状态
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
    isGameRunning = true;
    
    // 重新计算网格数量
    tileCount = Math.floor(canvas.width / gridSize);
    
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    
    // 显示控制提示
    showControlTips();
}

// 显示控制提示
function showControlTips() {
    const tips = document.createElement('div');
    tips.style.position = 'fixed';
    tips.style.top = '10px';
    tips.style.left = '50%';
    tips.style.transform = 'translateX(-50%)';
    tips.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tips.style.color = 'white';
    tips.style.padding = '10px 20px';
    tips.style.borderRadius = '5px';
    tips.style.zIndex = '1000';
    tips.textContent = '使用方向键控制蛇的移动';
    document.body.appendChild(tips);
    setTimeout(() => tips.remove(), 3000);
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

// 直接添加键盘事件监听
document.addEventListener('keydown', handleKeyPress);

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
