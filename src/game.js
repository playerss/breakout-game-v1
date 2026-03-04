/**
 * 打砖块桌球游戏 - 核心逻辑
 * @author KF-V4
 * @version 1.0
 */

// ==================== 游戏常量 ====================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// 挡板属性
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 15;
const PADDLE_Y = CANVAS_HEIGHT - 30;

// 小球属性
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 5;
const MAX_BALL_SPEED = 15;
const MIN_BALL_SPEED = 3;

// 砖块属性
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

// 砖块颜色
const BRICK_COLORS = ['#ff4757', '#ffa502', '#eccc68', '#2ed573', '#1e90ff'];
const BRICK_SCORES = [50, 40, 30, 20, 10];

// 游戏状态
const GAME_STATE = {
    READY: 'ready',
    RUNNING: 'running',
    GAMEOVER: 'gameover',
    VICTORY: 'victory'
};

// ==================== 游戏类 ====================
class BreakoutGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.reset();
        this.setupEventListeners();
        this.start();
    }

    /**
     * 重置游戏状态
     */
    reset() {
        this.score = 0;
        this.lives = 3;
        this.state = GAME_STATE.READY;
        this.bricks = [];
        this.ball = null;
        this.paddle = {
            x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
            y: PADDLE_Y,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            dx: 0
        };
        this.initBricks();
        this.resetBall();
        this.updateDisplay();
    }

    /**
     * 初始化砖块
     */
    initBricks() {
        this.bricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                this.bricks[c][r] = {
                    x: (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT,
                    y: (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    status: 1,
                    color: BRICK_COLORS[r],
                    score: BRICK_SCORES[r]
                };
            }
        }
    }

    /**
     * 重置小球位置
     */
    resetBall() {
        this.ball = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT - 50,
            radius: BALL_RADIUS,
            speed: INITIAL_BALL_SPEED,
            dx: INITIAL_BALL_SPEED,
            dy: -INITIAL_BALL_SPEED,
            color: '#00ff88'
        };
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 鼠标移动控制
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.state !== GAME_STATE.RUNNING) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            
            if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
                this.paddle.x = relativeX - this.paddle.width / 2;
                this.clampPaddle();
            }
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.state !== GAME_STATE.RUNNING) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.paddle.dx = -7;
                    break;
                case 'ArrowRight':
                    this.paddle.dx = 7;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    if (this.paddle.dx !== 0) {
                        this.paddle.dx = 0;
                    }
                    break;
            }
        });

        // 按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    /**
     * 开始游戏
     */
    startGame() {
        if (this.state === GAME_STATE.READY || 
            this.state === GAME_STATE.GAMEOVER || 
            this.state === GAME_STATE.VICTORY) {
            this.state = GAME_STATE.RUNNING;
            this.startBtn.disabled = true;
            
            // 确保小球在发射状态
            if (this.state === GAME_STATE.READY) {
                this.ball.dy = -this.ball.speed;
            }
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.reset();
        this.startBtn.disabled = false;
    }

    /**
     * 挡板位置限制
     */
    clampPaddle() {
        if (this.paddle.x < 0) {
            this.paddle.x = 0;
        }
        if (this.paddle.x + this.paddle.width > CANVAS_WIDTH) {
            this.paddle.x = CANVAS_WIDTH - this.paddle.width;
        }
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = '❤️'.repeat(this.lives);
    }

    /**
     * 碰撞检测 - 墙壁
     */
    wallCollision() {
        // 左墙壁
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
            this.ball.x = this.ball.radius;
        }
        // 右墙壁
        if (this.ball.x + this.ball.radius > CANVAS_WIDTH) {
            this.ball.dx = -this.ball.dx;
            this.ball.x = CANVAS_WIDTH - this.ball.radius;
        }
        // 上墙壁
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
            this.ball.y = this.ball.radius;
        }
    }

    /**
     * 碰撞检测 - 挡板
     */
    paddleCollision() {
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            
            // 计算撞击点（归一化：-1 到 1）
            let collidePoint = this.ball.x - (this.paddle.x + this.paddle.width / 2);
            collidePoint = collidePoint / (this.paddle.width / 2);
            
            // 根据撞击点调整反弹角度（最大 60 度）
            let angle = collidePoint * (Math.PI / 3);
            
            // 计算新的速度方向
            this.ball.dx = this.ball.speed * Math.sin(angle);
            this.ball.dy = -this.ball.speed * Math.cos(angle);
            
            // 速度加成（达到上限）
            this.ball.speed = Math.min(this.ball.speed + 0.5, MAX_BALL_SPEED);
        }
    }

    /**
     * 碰撞检测 - 砖块
     */
    brickCollision() {
        let bricksRemaining = 0;
        
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                let b = this.bricks[c][r];
                if (b.status === 1) {
                    bricksRemaining++;
                    if (this.ball.x > b.x && 
                        this.ball.x < b.x + b.width && 
                        this.ball.y > b.y && 
                        this.ball.y < b.y + b.height) {
                        
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.score += b.score;
                    }
                }
            }
        }
        
        if (bricksRemaining === 0) {
            this.state = GAME_STATE.VICTORY;
            this.showVictory();
        }
        
        return bricksRemaining;
    }

    /**
     * 碰撞检测 - 小球掉落
     */
    ballFall() {
        if (this.ball.y + this.ball.radius > CANVAS_HEIGHT) {
            this.lives--;
            this.updateDisplay();
            
            if (this.lives <= 0) {
                this.state = GAME_STATE.GAMEOVER;
                this.showGameOver();
            } else {
                this.resetBall();
            }
        }
    }

    /**
     * 显示胜利画面
     */
    showVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 恭喜胜利!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`最终得分：${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('点击"开始游戏"继续挑战', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }

    /**
     * 显示游戏结束画面
     */
    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#ff4757';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💀 游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`最终得分：${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('点击"重置游戏"重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }

    /**
     * 显示开始界面
     */
    showStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#e94560';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎾 打砖块桌球游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('移动鼠标或使用 ← → 键控制挡板', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.ctx.fillText('击碎所有砖块获胜，3 次掉球机会', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }

    /**
     * 渲染挡板
     */
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x, this.paddle.y, 
            this.paddle.width, this.paddle.height, 10);
        this.ctx.fillStyle = '#e94560';
        this.ctx.fill();
        this.ctx.shadowColor = '#e94560';
        this.ctx.shadowBlur = 20;
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;
    }

    /**
     * 渲染小球
     */
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();
        this.ctx.shadowColor = this.ball.color;
        this.ctx.shadowBlur = 15;
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;
    }

    /**
     * 渲染砖块
     */
    drawBricks() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (this.bricks[c][r].status === 1) {
                    let brick = this.bricks[c][r];
                    this.ctx.beginPath();
                    this.ctx.roundRect(brick.x, brick.y, 
                        brick.width, brick.height, 5);
                    this.ctx.fillStyle = brick.color;
                    this.ctx.fill();
                    this.ctx.shadowColor = brick.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.closePath();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    /**
     * 更新游戏状态
     */
    update() {
        if (this.state !== GAME_STATE.RUNNING) return;
        
        // 键盘控制移动
        this.paddle.x += this.paddle.dx;
        this.clampPaddle();
        
        // 更新小球位置
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 碰撞检测
        this.wallCollision();
        this.paddleCollision();
        this.brickCollision();
        this.ballFall();
    }

    /**
     * 渲染游戏
     */
    draw() {
        // 清屏
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 绘制游戏元素
        if (this.state === GAME_STATE.READY) {
            this.showStartScreen();
        } else {
            this.drawBricks();
            this.drawPaddle();
            this.drawBall();
        }
    }

    /**
     * 游戏主循环
     */
    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    /**
     * 启动游戏
     */
    start() {
        this.loop();
    }
}

// ==================== 游戏初始化 ====================
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new BreakoutGame();
});
