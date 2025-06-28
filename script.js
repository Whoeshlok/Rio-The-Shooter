console.log("SCRIPT LOADED");

var SHOOT_KNOCKBACK = 5;
var SHOOT_KNOCKBACKRESET = 0.25;

var mouse = {
    x: 0,
    y: 0,
};

// The Player class
class Player {
    constructor(options) {
        // Store references
        this.controls = options.controls;
        this.createBullet = options.createBullet;
        this.createSmoke = options.createSmoke;

        // Creating the player element
        this.createElement(options.parentContainer);

        // Position/movement
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.xvel = 0;
        this.yvel = 0;
        this.friction = 0.8;
        this.speed = 0.8;
        this.scaleX = 1;
        this.width = 40;
        this.height = 40;

        // Anim
        this.anim = {
            counter: 0,
            inc: Math.PI / 10,
            rightArm: {
                rot: 0,
                offsetX: 0,
                offsetY: 0,
            },
            leftArm: {
                rot: 0,
            },
            leftLeg: {
                rot: 0,
            },
            rightLeg: {
                rot: 0,
            },
            gun: {
                rot: 0,
            },
            lift: 0,
            knockback: 0,
        };

        // Shooting
        this.shoot();

        // Updating
        options.startUpdating(this.aim.bind(this));
        options.startUpdating(this.turn.bind(this));
        options.startUpdating(this.move.bind(this));
        options.startUpdating(this.animate.bind(this));
        options.startUpdating(this.boundaries.bind(this));
        options.startUpdating(this.updateStyles.bind(this));
    }

    // Creating / injecting the element
    createElement(parentContainer) {
        // The Markup
        this.el = $(`
          <div class="player">
            <p class="txt">Yayy!❤️</p>
            <div class='hat'></div>
            <div class='eye right'></div>
            <div class='eye left'></div>
            <div class='mouth'></div>
            <div class='shirt'>
              <div class='under'></div>
            </div>
            <div class='arm right'>
              <div class='sleeve'></div>
              <div class='gun'>
                <div class='grey'></div>
                <div class='barrel'></div>
              </div>
            </div>
            <div class='arm left'>
              <div class='sleeve'></div>
            </div>
            <div class='leg right'>
              <div class='pant'></div>
            </div>
            <div class='leg left'>
              <div class='pant'></div>
            </div>
          </div>
        `);

        // Injection
        parentContainer.append(this.el);

        // Update dimensions
        this.width = this.el.outerWidth();
        this.height = this.el.outerHeight();
    }

    // Animate the player
    animate() {
        var isMoving =
            this.controls.isDown('right') ||
            this.controls.isDown('left') ||
            this.controls.isDown('up') ||
            this.controls.isDown('down')
            ? true
            : false;

        // Running animation
        if (isMoving) {
            // Arms
            this.anim.leftArm.rot = Math.sin(this.anim.counter) / 2;

            // Legs
            this.anim.rightLeg.rot = Math.sin(this.anim.counter * 0.9) * 0.5;
            this.anim.leftLeg.rot = Math.sin(-this.anim.counter * 0.9) * 0.5;

            // Lift
            this.anim.lift = Math.sin(this.anim.counter) * 5;

            // Inc
            this.anim.counter += this.anim.inc;
        } else {
            // Resetting to idle state
            var leftArm = this.anim.leftArm.rot;
            var rightLeg = this.anim.rightLeg.rot;
            var leftLeg = this.anim.leftLeg.rot;
            var lift = this.anim.lift;
            var resetSpeed = 0.1;

            // Arms
            this.anim.leftArm.rot = leftArm - (leftArm - 0) * resetSpeed;

            // Legs
            this.anim.rightLeg.rot = rightLeg - (rightLeg - 0) * resetSpeed;
            this.anim.leftLeg.rot = leftLeg - (leftLeg - 0) * resetSpeed;

            // Lift
            this.anim.lift = lift - (lift - 0) * resetSpeed;
        }

        // Shooting
        var rightArmRot = this.anim.rightArm.rot;
        this.anim.rightArm.offsetX =
            Math.cos(rightArmRot - Math.PI / 2) * this.anim.knockback;
        this.anim.rightArm.offsetY =
            Math.sin(rightArmRot - Math.PI / 2) * this.anim.knockback;
        this.anim.gun.rot = -this.anim.knockback * 0.1;

        // Resetting the knockback
        this.anim.knockback =
            this.anim.knockback -
            (this.anim.knockback - 0) * SHOOT_KNOCKBACKRESET;
    }

    // Aiming at the mouse
    aim() {
        var rightArm = $('.player .arm.right');
        var armX = rightArm.offset().left;
        var armY = rightArm.offset().top;
        var angle = Math.atan2(mouse.y - armY, mouse.x - armX);
        this.anim.rightArm.rot = (angle - Math.PI / 2) * this.scaleX;
    }

    // Facing the mouse
    turn() {
        if (mouse.x < this.x) {
            this.scaleX = -1;
        } else {
            this.scaleX = 1;
        }
    }

    // Movement
    move() {
        // Physics
        this.x += this.xvel;
        this.y += this.yvel;
        this.xvel *= this.friction;
        this.yvel *= this.friction;

        // Keys
        if (this.controls.isDown('right')) {
            this.xvel += this.speed;
        } else if (this.controls.isDown('left')) {
            this.xvel -= this.speed;
        }
        if (this.controls.isDown('up')) {
            this.yvel -= this.speed;
        } else if (this.controls.isDown('down')) {
            this.yvel += this.speed;
        }
    }

    // Staying on screen
    boundaries() {
        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2 + 1;
            this.xvel = 0;
        } else if (this.x + this.width / 2 > window.innerWidth) {
            this.x = window.innerWidth - this.width / 2 - 1;
            this.xvel = 0;
        }
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2 + 1;
            this.yvel = 0;
        } else if (this.y + this.height / 2 > window.innerHeight) {
            this.y = window.innerHeight - this.height / 2 - 1;
            this.yvel = 0;
        }
    }

    // Listen for mousepresses and shoot
    shoot() {
        $(window).on(
            'mousedown',
            function () {
                var barrel = $('.barrel');
                var x = barrel.offset().left;
                var y = barrel.offset().top;
                var dir = this.anim.rightArm.rot * this.scaleX;

                // Create the bullet
                this.createBullet(x, y, dir);

                // Knockback animations
                this.anim.knockback = SHOOT_KNOCKBACK;

                // Pushback the player
                this.xvel += Math.cos(dir - Math.PI / 2) * 2.5;
                this.yvel += Math.sin(dir - Math.PI / 2) * 2.5;

                // Smoke
                this.createSmoke(x, y, dir, 1);
            }.bind(this)
        );
    }

    // Updating the styles
    updateStyles() {
        var rightArm = $('.player .arm.right');
        var leftArm = $('.player .arm.left');
        var rightLeg = $('.leg.right');
        var leftLeg = $('.leg.left');
        var gun = $('.gun');

        // Main el
        this.el.css({
            left: this.x,
            top: this.y,
            transform: `
            translateX(-50%)
            translateY(-${50 + this.anim.lift}%)
            scaleX(${this.scaleX})
          `,
        });

        // Arms
        rightArm.css({
            transform: `
            translateX(${this.anim.rightArm.offsetX}px)
            translateY(${this.anim.rightArm.offsetY}px)
            rotate(${this.anim.rightArm.rot}rad)
          `,
        });
        leftArm.css({
            transform: `rotate(${this.anim.leftArm.rot}rad)`,
        });

        // Legs
        rightLeg.css({
            transform: `
            translateX(-50%)
            rotate(${this.anim.rightLeg.rot}rad)
          `,
        });
        leftLeg.css({
            transform: `
            translateX(-50%)
            rotate(${this.anim.leftLeg.rot}rad)
          `,
        });

        // Gun
        gun.css({
            transform: `rotate(${this.anim.gun.rot}rad)`,
        });
    }
}

// The Bullet class
class Bullet {
    constructor(options) {
        // Create the element
        this.createElement(options.parentContainer);
        this.createFlash(options.parentContainer, options.x, options.y);

        // Positioning / movement
        this.x = options.x;
        this.y = options.y;
        this.speed = 10;
        this.dir = options.dir;

        // Flash
        this.flashTimer = 0;
    }

    // Creating / injecting the Player element
    createElement(parentContainer) {
        // The markup
        this.el = $('<div class="bullet"></div>');

        // Injection
        parentContainer.append(this.el);

        // Dimensions
        this.width = parseInt(this.el.css('width'));
        this.height = parseInt(this.el.css('height'));
    }

    // Create the flash effect element
    createFlash(parentContainer, x, y) {
        // The markup
        this.flashEl = $('<div class="flash"></div>');

        // Positioning
        this.flashEl.css({
            left: x,
            top: y,
        });

        // Injection
        parentContainer.append(this.flashEl);
    }

    // Updating (executed automatically by the `BulletHandler`
    // class.)
    update(alienManager) {
        // Movement
        this.x += Math.cos(this.dir + Math.PI / 2) * this.speed;
        this.y += Math.sin(this.dir + Math.PI / 2) * this.speed;

        // Going out of bounds
        if (
            this.x < 0 ||
            this.y < 0 ||
            this.x > window.innerWidth ||
            this.y > window.innerHeight
        ) {
            this.delete = true;
        }

        // Update styles
        this.el.css({
            left: this.x,
            top: this.y,
            transform: `
            translateX(-50%)
            translateY(-50%)
            rotate(${this.dir + Math.PI / 2}rad)
          `,
        });

        // Removing the flash
        this.flashTimer++;
        if (this.flashTimer > 1) {
            this.flashEl.remove();
        }

        // Check for collision with aliens
        if (alienManager) {
            const hit = alienManager.checkBulletHit(this.x, this.y);
            if (hit) {
                console.log('Bullet hit confirmed, deleting bullet at:', this.x, this.y);
                this.delete = true;
            }
        } else {
            console.log('No alien manager available for bullet at:', this.x, this.y);
        }
    }
}

// The Bullet Handler class
class BulletHandler {
    constructor(options) {
        // Store options references
        this.parentContainer = options.parentContainer;
        this.alienManager = options.alienManager;

        // Store all bullets
        this.bullets = [];

        // Updating all bullets
        options.startUpdating(this.updateBullets.bind(this));

        // Binding public functions
        this.createBullet = this.createBullet.bind(this);
    }

    // Updating all of the bullets
    updateBullets() {
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(this.alienManager);

            // Removing the bullet if it's out of bounds
            if (this.bullets[i].delete) {
                this.bullets[i].el.remove();
                this.bullets.splice(i, 1);
                i--;
            }
        }
    }

    // Creating a new bullet
    createBullet(x, y, dir) {
        this.bullets.push(
            new Bullet({
                parentContainer: this.parentContainer,
                x: x,
                y: y,
                dir: dir,
            })
        );
    }
}

// The Smoke class
class Smoke {
    constructor(options) {
        // Create the element
        this.createElement(options.parentContainer);

        // Positioning / movement
        this.x = options.x;
        this.y = options.y;
        this.dir = options.dir;
        this.speed = options.speed;
        this.size = options.size;
        this.life = 1;
        this.lifeDecay = 0.02;
    }

    // Creating / injecting the element
    createElement(parentContainer) {
        // The markup
        this.el = $('<div class="cloud"></div>');

        // Injection
        parentContainer.append(this.el);
    }

    // Updating (executed automatically by the `SmokeHandler`
    // class.)
    update() {
        // Movement
        this.x += Math.cos(this.dir + Math.PI / 2) * this.speed;
        this.y += Math.sin(this.dir + Math.PI / 2) * this.speed;

        // Life
        this.life -= this.lifeDecay;

        // Update styles
        this.el.css({
            left: this.x,
            top: this.y,
            width: this.size,
            height: this.size,
            opacity: this.life,
        });

        // Removing if dead
        if (this.life <= 0) {
            this.delete = true;
        }
    }
}

// The Smoke Handler class
class SmokeHandler {
    constructor(options) {
        // Store options references
        this.parentContainer = options.parentContainer;

        // Store all smoke clouds
        this.clouds = [];

        // Updating all smoke clouds
        options.startUpdating(this.updateClouds.bind(this));

        // Binding public functions
        this.createSmoke = this.createSmoke.bind(this);
    }

    // Updating all of the smoke clouds
    updateClouds() {
        for (var i = 0; i < this.clouds.length; i++) {
            this.clouds[i].update();

            // Removing the cloud if it's dead
            if (this.clouds[i].delete) {
                this.clouds[i].el.remove();
                this.clouds.splice(i, 1);
                i--;
            }
        }
    }

    // Creating a new smoke cloud
    createSmoke(x, y, dir, speed) {
        this.clouds.push(
            new Smoke({
                parentContainer: this.parentContainer,
                x: x,
                y: y,
                dir: dir,
                speed: speed,
                size: Math.random() * 20 + 10,
            })
        );
    }
}

// The Controls class
class Controls {
    constructor() {
        // Store the keys
        this.keys = {};

        // Listen for keydowns
        $(window).on('keydown', (e) => {
            this.keys[e.keyCode] = true;
        });

        // Listen for keyups
        $(window).on('keyup', (e) => {
            this.keys[e.keyCode] = false;
        });

        // Listen for mousemove
        $(window).on('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
    }

    // Check if a key is down
    isDown(keyCode) {
        return this.keys[keyCode] ? true : false;
    }
}

// ALIEN CLASS (emoji style)
class Alien {
    constructor(options) {
        this.parentContainer = options.parentContainer;
        this.player = options.player;
        this.speedMultiplier = options.speedMultiplier;
        this.createElement();
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
            this.x = Math.random() * window.innerWidth;
            this.y = -40;
        } else if (edge === 1) {
            this.x = window.innerWidth + 40;
            this.y = Math.random() * window.innerHeight;
        } else if (edge === 2) {
            this.x = Math.random() * window.innerWidth;
            this.y = window.innerHeight + 40;
        } else {
            this.x = -40;
            this.y = Math.random() * window.innerHeight;
        }
        this.speed = 1.1 + Math.random() * 0.7;
        this.size = 300;
        this.dead = false;
        this.hitRadius = 100;
        this.destroying = false;
    }

    createElement() {
        this.el = $(`<div class="alien-emoji">👻</div>`);
        this.parentContainer.append(this.el);
    }

    destroy() {
        if (!this.dead && !this.destroying) {
            this.dead = true;
            this.destroying = true;
            
            // Remove element immediately to prevent further hits
            if (this.el && this.el.parent().length) {
                this.el.fadeOut(200, () => {
                    if (this.el && this.el.parent().length) {
                        this.el.remove();
                    }
                });
            }

            if (typeof window.incrementScore === 'function') {
                window.incrementScore();
            }
        }
    }

    update() {
        if (this.dead) return;

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            this.x += (dx / dist) * this.speed * this.speedMultiplier;
            this.y += (dy / dist) * this.speed * this.speedMultiplier;
        }

        this.el.css({
            left: this.x,
            top: this.y,
            width: this.size,
            height: this.size,
            fontSize: '4rem',
            position: 'absolute',
            zIndex: 20,
            userSelect: 'none',
            pointerEvents: 'none',
        });

        const px = this.player.x, py = this.player.y, pr = 22;
        if (Math.abs(this.x - px) < pr && Math.abs(this.y - py) < pr) {
            if (typeof window.endGame === 'function') window.endGame();
        }
    }
}

// ALIEN MANAGER
class AlienManager {
    constructor(options) {
        this.parentContainer = options.parentContainer;
        this.player = options.player;
        this.aliens = [];
        this.speedMultiplier = 1.0;
        this.baseSpawnInterval = 2200;
        this.currentSpawnInterval = this.baseSpawnInterval;
        this.countdownActive = true;
        
        // Clean up any existing countdown elements
        $('#countdownText').remove();
        
        // Create simple countdown text in corner
        this.createCountdownText();
        
        // Start countdown
        this.startCountdown();
        
        options.startUpdating(this.updateAliens.bind(this));
        options.startUpdating(this.updateDifficulty.bind(this));
    }
    
    createCountdownText() {
        // Remove any existing countdown elements first
        $('#countdownText').remove();
        
        // Create simple countdown text in left corner with glassy effect
        this.countdownText = $(`
            <div id="countdownText" style="
                position: fixed;
                top: 20px;
                left: 20px;
                color: white;
                font-size: 24px;
                font-weight: bold;
                z-index: 1000;
                font-family: 'Montserrat', sans-serif;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 15px;
                padding: 15px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                Game starts in: <span id="countdownNumber">10</span>...
            </div>
        `);
        
        $('body').append(this.countdownText);
    }
    
    startCountdown() {
        let countdown = 10;
        const countdownNumber = $('#countdownNumber');
        
        // Clear any existing intervals
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            countdown--;
            countdownNumber.text(countdown);
            
            if (countdown <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownActive = false;
                this.countdownText.remove();
                
                // Start spawning aliens after countdown
                this.spawnInterval = setInterval(() => this.spawnAlien(), this.currentSpawnInterval);
            }
        }, 1000);
    }
    
    updateDifficulty() {
        // Only update difficulty if countdown is finished
        if (this.countdownActive) return;
        
        // Use global game start time for difficulty scaling
        if (!window.gameStartTime) return;
        
        // Calculate time elapsed since actual game start (in seconds)
        const timeElapsed = (Date.now() - window.gameStartTime) / 1000;
        
        // Increase speed multiplier over time (max 3x speed at 60 seconds)
        this.speedMultiplier = 1.0 + (timeElapsed / 30) * 2.0;
        this.speedMultiplier = Math.min(this.speedMultiplier, 3.0);
        
        // Decrease spawn interval over time (min 800ms at 60 seconds)
        const newSpawnInterval = this.baseSpawnInterval - (timeElapsed / 60) * 1400;
        this.currentSpawnInterval = Math.max(newSpawnInterval, 800);
        
        // Update spawn interval if it changed significantly
        if (Math.abs(this.currentSpawnInterval - this.baseSpawnInterval) > 100) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = setInterval(() => this.spawnAlien(), this.currentSpawnInterval);
            this.baseSpawnInterval = this.currentSpawnInterval;
        }
        
        // Update the timer display to show current difficulty
        if (typeof window.updateTimer === 'function') {
            window.updateTimer();
        }
    }
    
    spawnAlien() {
        // Don't spawn aliens during countdown
        if (this.countdownActive) return;
        
        if (this.aliens.length < 3) {
            this.aliens.push(new Alien({
                parentContainer: this.parentContainer,
                player: this.player,
                speedMultiplier: this.speedMultiplier
            }));
        }
    }
    updateAliens() {
        // Remove dead aliens first
        this.aliens = this.aliens.filter(a => !a.dead);
        
        // Update remaining aliens
        for (let a of this.aliens) {
            a.update();
        }
    }
    checkBulletHit(x, y) {
        let hit = false;
        console.log(`Checking bullet hit at (${x}, ${y}) with ${this.aliens.length} aliens`);
        
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const a = this.aliens[i];
            if (a.dead || a.destroying) {
                console.log(`Alien ${i} is dead or destroying, skipping`);
                continue;
            }
            
            const dx = a.x - x;
            const dy = a.y - y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            console.log(`Alien ${i}: pos(${a.x}, ${a.y}), dist=${dist.toFixed(2)}, hitRadius=${a.hitRadius}`);
            
            if (dist < a.hitRadius) {
                console.log(`HIT! Destroying alien ${i}`);
                a.destroy();
                hit = true;
                break; // Only hit one alien per bullet
            }
        }
        return hit;
    }
}

// SCORE LOGIC
window.score = 0;
window.incrementScore = function() {
    window.score += 10;
    const sb = document.getElementById('scoreBoard');
    if (sb) sb.textContent = 'Score: ' + window.score;
}
window.resetScore = function() {
    window.score = 0;
    const sb = document.getElementById('scoreBoard');
    if (sb) sb.textContent = 'Score: 0';
}

// TIMER & OUTRO LOGIC
window.gameTimer = null;
window.timeLeft = 60;
window.highScore = Number(localStorage.getItem('rioHighScore') || 0);
window.gameStartTime = null; // Will be set when countdown ends

window.updateTimer = function() {
    const tb = document.getElementById('timerBoard');
    if (tb) {
        tb.textContent = 'Time: ' + window.timeLeft;
    }
}

window.startTimer = function() {
    window.timeLeft = 60;
    window.updateTimer();
    if (window.gameTimer) clearInterval(window.gameTimer);
    
    // Timer will start after 10 seconds (when countdown ends)
    setTimeout(() => {
        window.gameStartTime = Date.now(); // Set actual game start time
        window.gameTimer = setInterval(() => {
            window.timeLeft--;
            window.updateTimer();
            if (window.timeLeft <= 0) {
                window.endGame();
            }
        }, 1000);
    }, 10000); // 10 second delay
}

window.endGame = function() {
    // Stop timer
    if (window.gameTimer) clearInterval(window.gameTimer);
    
    // Stop game music
    const gameMusic = document.getElementById('gameMusic');
    if (gameMusic) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
    }
    
    // Update high score if current score is higher
    if (window.score > window.highScore) {
        window.highScore = window.score;
        localStorage.setItem('rioHighScore', window.highScore);
    }
    
    // Redirect to combined game over page with score as URL parameter
    window.location.href = `gameover.html?score=${window.score}`;
}

// Back to Home button
const backBtn = document.getElementById('backToHomeBtn');
if (backBtn) {
    backBtn.onclick = function() {
        window.location.reload();
    };
}

// The Game class
class Game {
    constructor() {
        // Store the container
        this.container = $('.container');

        // Create the controls
        this.controls = new Controls();

        // Create the alien manager FIRST
        this.alienManager = new AlienManager({ 
            parentContainer: this.container, 
            player: null, // Will be set after player creation
            startUpdating: this.startUpdating.bind(this) 
        });

        // Create the handlers
        this.bulletHandler = new BulletHandler({
            parentContainer: this.container,
            alienManager: this.alienManager, // Pass alien manager reference
            startUpdating: this.startUpdating.bind(this),
        });

        this.smokeHandler = new SmokeHandler({
            parentContainer: this.container,
            startUpdating: this.startUpdating.bind(this),
        });

        // Create the player
        this.player = new Player({
            parentContainer: this.container,
            controls: this.controls,
            createBullet: this.bulletHandler.createBullet,
            createSmoke: this.smokeHandler.createSmoke,
            startUpdating: this.startUpdating.bind(this),
        });

        // Update alien manager with player reference
        this.alienManager.player = this.player;

        // Start the game loop
        this.startUpdating(this.update.bind(this));

        // Reset score
        window.resetScore();
        // Start timer
        window.startTimer();
    }

    // Start the game loop
    startUpdating(updateFunction) {
        var lastTime = 0;
        var gameLoop = function (currentTime) {
            var deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            updateFunction(deltaTime);

            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    // The game loop
    update(deltaTime) {
        // Update the bullets
        this.bulletHandler.updateBullets();

        // Update the smoke
        this.smokeHandler.updateClouds();
    }
}

// Add click effect for "Yayy!❤️" text
document.body.addEventListener('click', () => {
    const text = document.querySelector('.txt');
    if (text) {
        text.classList.add('show');
        setTimeout(() => {
            text.classList.remove('show');
        }, 500);
    }
});

// Start game button
document.getElementById('startGame').addEventListener('click', function() {
    document.querySelector('.landing-main').style.display = 'none';
    document.querySelector('.space-bg').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    document.querySelector('.game-bg').style.display = 'block';
    
    // Start game music
    const gameMusic = document.getElementById('gameMusic');
    if (gameMusic) {
        gameMusic.play().catch(e => console.log('Audio autoplay blocked:', e));
    }
    
    window.game = new Game();
});

// Feed Aria outro page stars and confetti
function createOutroStars() {
    const canvas = document.getElementById('outroStars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let stars = Array.from({length: 120}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      o: Math.random() * 0.5 + 0.5,
      s: Math.random() * 0.5 + 0.2,
      tw: Math.random() * 2.5 // twinkle offset
    }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      let t = Date.now() * 0.002;
      for (let star of stars) {
        ctx.globalAlpha = star.o * (0.7 + 0.3 * Math.abs(Math.sin(t + star.tw)));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#7ecfff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    }
    function animate() {
      for (let star of stars) {
        star.y += star.s;
        if (star.y > h) {
          star.y = 0;
          star.x = Math.random() * w;
        }
      }
      draw();
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
}
// Bokeh animation for outro page
function createBokeh() {
    const canvas = document.getElementById('bokehCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const colors = ['#a1c4fd', '#fbc2eb', '#baf8d4', '#fff6b7', '#e0eafc'];
    let circles = Array.from({length: 22}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 24 + Math.random() * 32,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.18 + Math.random() * 0.18
    }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let c of circles) {
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.restore();
        c.x += c.dx;
        c.y += c.dy;
        if (c.x < -c.r) c.x = w + c.r;
        if (c.x > w + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = h + c.r;
        if (c.y > h + c.r) c.y = -c.r;
      }
    }
    function animate() {
      draw();
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
}
// Show outro page with all effects
window.showOutroPage = function() {
    const outroPage = document.getElementById('outroPage');
    outroPage.style.display = 'flex';
    outroPage.style.flexDirection = 'column';
    outroPage.style.justifyContent = 'center';
    outroPage.style.alignItems = 'center';
    createBokeh();
    createOutroStars();
    // Restart animations
    const h2 = document.querySelector('#outroContent h2');
    const social = document.querySelector('#outroContent .social');
    const contact = document.querySelector('#outroContent .contact');
    const btn = document.getElementById('backToHomeBtn');
    if(h2 && social && contact && btn) {
      h2.style.animation = 'none'; social.style.animation = 'none'; contact.style.animation = 'none'; btn.style.animation = 'none';
      void h2.offsetWidth; void social.offsetWidth; void contact.offsetWidth; void btn.offsetWidth;
      h2.style.animation = '';
      social.style.animation = 'fadeInUpSocial 0.7s ease 0.7s forwards';
      contact.style.animation = 'fadeInUpContact 0.7s ease 1.1s forwards';
      btn.style.animation = '';
    }
}; 