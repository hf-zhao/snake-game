const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 },
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 100;
let isGameRunning = false;

// 添加特效变量
let effects = [];
let lastFoodEaten = null;

// 添加食物类型
const foodTypes = [
    { name: 'apple', color: '#e74c3c', score: 10, probability: 0.4 },
    { name: 'banana', color: '#f1c40f', score: 15, probability: 0.2 },
    { name: 'orange', color: '#e67e22', score: 20, probability: 0.15 },
    { name: 'grape', color: '#9b59b6', score: 25, probability: 0.1 },
    { name: 'watermelon', color: '#2ecc71', score: 30, probability: 0.1 },
    { name: 'strawberry', color: '#e84393', score: 35, probability: 0.05 }
];

// 当前食物类型
let currentFoodType = foodTypes[0];

// 根据概率选择食物类型
function selectFoodType() {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const foodType of foodTypes) {
        cumulativeProbability += foodType.probability;
        if (random <= cumulativeProbability) {
            return foodType;
        }
    }
    
    return foodTypes[0]; // 默认返回苹果
}

// 加载结束图片
const endGameImage = new Image();
endGameImage.src = 'pic.jpg';

// 游戏主循环
function gameLoop() {
    if (!isGameRunning) return;
    updateSnake();
    updateEffects(); // 更新特效
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
        score += currentFoodType.score;
        scoreElement.textContent = score;
        
        // 记录吃到的食物位置，用于特效
        lastFoodEaten = { x: food.x, y: food.y };
        
        // 添加吃食物的特效
        addEatEffect(food.x, food.y, currentFoodType.color);
        
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

// 添加吃食物的特效
function addEatEffect(x, y, color) {
    // 创建粒子特效
    for (let i = 0; i < 15; i++) {
        effects.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            size: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            life: 1, // 生命值，用于淡出效果
            color: color // 使用食物的颜色
        });
    }
}

// 更新特效
function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].x += effects[i].speedX;
        effects[i].y += effects[i].speedY;
        effects[i].life -= 0.02; // 逐渐消失
        
        // 移除消失的特效
        if (effects[i].life <= 0) {
            effects.splice(i, 1);
        }
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
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#3498db'; // 蓝色蛇头
        } else {
            // 蛇身渐变色
            const greenValue = Math.floor(150 + (index * 2));
            ctx.fillStyle = `rgb(46, ${greenValue}, 204)`;
        }
        
        // 绘制圆角矩形作为蛇的身体
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        const radius = 8;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据移动方向确定眼睛位置
            let eyeX1, eyeY1, eyeX2, eyeY2;
            const eyeSize = 3;
            
            if (dx === 1) { // 向右
                eyeX1 = x + size - 5;
                eyeY1 = y + 5;
                eyeX2 = x + size - 5;
                eyeY2 = y + size - 5;
            } else if (dx === -1) { // 向左
                eyeX1 = x + 5;
                eyeY1 = y + 5;
                eyeX2 = x + 5;
                eyeY2 = y + size - 5;
            } else if (dy === -1) { // 向上
                eyeX1 = x + 5;
                eyeY1 = y + 5;
                eyeX2 = x + size - 5;
                eyeY2 = y + 5;
            } else if (dy === 1) { // 向下
                eyeX1 = x + 5;
                eyeY1 = y + size - 5;
                eyeX2 = x + size - 5;
                eyeY2 = y + size - 5;
            } else { // 默认（游戏开始前）
                eyeX1 = x + 5;
                eyeY1 = y + 5;
                eyeX2 = x + size - 5;
                eyeY2 = y + 5;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 绘制食物
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    const foodSize = gridSize - 2;
    
    // 根据食物类型绘制不同的水果
    ctx.fillStyle = currentFoodType.color;
    
    switch (currentFoodType.name) {
        case 'apple':
            // 绘制苹果
            ctx.beginPath();
            ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加苹果柄
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(foodX + foodSize/2, foodY + 2);
            ctx.quadraticCurveTo(foodX + foodSize/2 + 5, foodY - 2, foodX + foodSize/2 + 10, foodY + 2);
            ctx.stroke();
            break;
            
        case 'banana':
            // 绘制香蕉
            ctx.beginPath();
            ctx.moveTo(foodX + foodSize/4, foodY + foodSize/4);
            ctx.quadraticCurveTo(foodX + foodSize/2, foodY + foodSize/2, foodX + foodSize*3/4, foodY + foodSize/4);
            ctx.quadraticCurveTo(foodX + foodSize/2, foodY + foodSize*3/4, foodX + foodSize/4, foodY + foodSize/4);
            ctx.fill();
            break;
            
        case 'orange':
            // 绘制橘子
            ctx.beginPath();
            ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加橘子纹理
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/3 - i*2, 0, Math.PI * 2);
                ctx.stroke();
            }
            break;
            
        case 'grape':
            // 绘制葡萄
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    ctx.beginPath();
                    ctx.arc(foodX + foodSize/3 + i*5, foodY + foodSize/3 + j*5, foodSize/6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            break;
            
        case 'watermelon':
            // 绘制西瓜
            ctx.beginPath();
            ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加西瓜纹理
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
        case 'strawberry':
            // 绘制草莓
            ctx.beginPath();
            ctx.moveTo(foodX + foodSize/2, foodY + 2);
            ctx.lineTo(foodX + foodSize - 2, foodY + foodSize/2);
            ctx.lineTo(foodX + foodSize/2, foodY + foodSize - 2);
            ctx.lineTo(foodX + 2, foodY + foodSize/2);
            ctx.closePath();
            ctx.fill();
            
            // 添加草莓叶子
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.ellipse(foodX + foodSize/2, foodY + 2, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    // 绘制特效
    effects.forEach(effect => {
        ctx.globalAlpha = effect.life;
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1; // 重置透明度
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不会生成在蛇身上
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
    
    // 选择新的食物类型
    currentFoodType = selectFoodType();
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
    
    // 创建结束界面的容器
    const endGameContainer = document.createElement('div');
    endGameContainer.style.position = 'fixed';
    endGameContainer.style.top = '50%';
    endGameContainer.style.left = '50%';
    endGameContainer.style.transform = 'translate(-50%, -50%)';
    endGameContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    endGameContainer.style.padding = '20px';
    endGameContainer.style.borderRadius = '15px';
    endGameContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.2)';
    endGameContainer.style.textAlign = 'center';
    endGameContainer.style.zIndex = '1000';

    // 添加得分
    const scoreText = document.createElement('h2');
    scoreText.textContent = `游戏结束！你的得分是：${score}`;
    scoreText.style.color = '#2c3e50';
    scoreText.style.marginBottom = '15px';
    endGameContainer.appendChild(scoreText);

    // 添加图片
    const image = document.createElement('img');
    image.src = 'pic.jpg';
    image.style.width = '200px';
    image.style.height = '200px';
    image.style.objectFit = 'cover';
    image.style.borderRadius = '10px';
    image.style.marginBottom = '15px';
    endGameContainer.appendChild(image);

    // 添加提示文字
    const message = document.createElement('p');
    message.textContent = '宝宝还得多练哦！';
    message.style.color = '#e74c3c';
    message.style.fontSize = '18px';
    message.style.marginBottom = '20px';
    endGameContainer.appendChild(message);

    // 添加重新开始按钮
    const restartButton = document.createElement('button');
    restartButton.textContent = '重新开始';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '16px';
    restartButton.style.backgroundColor = '#3498db';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
        document.body.removeChild(endGameContainer);
        startGame();
    };
    endGameContainer.appendChild(restartButton);

    document.body.appendChild(endGameContainer);
}

// 开始游戏
function startGame() {
    if (isGameRunning) return;
    
    // 重置游戏状态
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
    isGameRunning = true;
    
    generateFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 添加移动设备控制
function initMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    upBtn.addEventListener('click', () => {
        if (dy !== 1 && isGameRunning) {
            dx = 0;
            dy = -1;
        }
    });

    downBtn.addEventListener('click', () => {
        if (dy !== -1 && isGameRunning) {
            dx = 0;
            dy = 1;
        }
    });

    leftBtn.addEventListener('click', () => {
        if (dx !== 1 && isGameRunning) {
            dx = -1;
            dy = 0;
        }
    });

    rightBtn.addEventListener('click', () => {
        if (dx !== -1 && isGameRunning) {
            dx = 1;
            dy = 0;
        }
    });
}

// 初始化移动控制
initMobileControls();
