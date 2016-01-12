// Inits
window.onload = function init() {
    var game = new GF();
    game.start();
};


// GAME FRAMEWORK STARTS HERE
var GF = function () {
    // Vars relative to the canvas
    var canvas, ctx, w, h;

    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps;
    // for time based animation
    var delta, oldTime = 0;

    // vars for handling inputs
    var inputStates = {};

    // game states
    var gameStates = {
        mainMenu: 0,
        gameRunning: 1,
        gameOver: 2
    };
    var currentGameState = gameStates.gameRunning;
    var currentLevel = 1;
    var TIME_BETWEEN_LEVELS = 0;
    var currentLevelTime = TIME_BETWEEN_LEVELS;

    var player = {
        dead: false,
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        speed: 350 // pixels/s this time !
    };

    // obstacles
    var obstacles = [];

    // We want the object to move at speed pixels/s (there are 60 frames in a second)
    // If we are really running at 60 frames/s, the delay between frames should be 1/60
    // = 16.66 ms, so the number of pixels to move = (speed * del)/1000. If the delay is twice
    // longer, the formula works : let's move the rectangle twice longer!
    var calcDistanceToMove = function (delta, speed) {
        //console.log("#delta = " + delta + " speed = " + speed);
        return (speed * delta) / 1000;
    };

    // Player logic
    function movePlayer(x, y) {
        // draw a big player !
        // head

        // save the context
        ctx.save();

        // translate the coordinate system, draw relative to it
        ctx.translate(x, y);
        ctx.scale(0.5, 0.5);

        // (0, 0) is the top left corner of the player.
        ctx.strokeRect(0, 0, 100, 100);

        // restore the context
        ctx.restore();
    }

    function updatePlayerPosition(delta) {
        player.speedX = 0;
        // check inputStates
        if (inputStates.left) {
            player.speedX = -player.speed;
        }
        if (inputStates.right) {
            player.speedX = player.speed;
        }
        /*if (inputStates.space) {
         }
         if (inputStates.mousePos) {
         }
         if (inputStates.mousedown) {
         player.speed = 500;
         } else {
         // mouse up
         player.speed = 100;
         }*/

        // collision avec obstacles
        /*for(var i=0; i < obstacles.length; i++) {
         var o = obstacles[i];
         if(rectsOverlap(o.x, o.y, o.w, o.h,
         player.x, player.y, player.width, player.height)) {
         console.log("collision");
         //player.x = 10;
         //player.y = 10;
         player.speed = 30;
         }
         }*/
        // Compute the incX and inY in pixels depending
        // on the time elasped since last redraw
        player.x += calcDistanceToMove(delta, player.speedX);

        //Empeche le joueur de sortir de l'écran
        if(player.x < 0)
        {
            player.x = 0;
        }
        if(player.x > ( w - player.width))
        {
            player.x = w - player.width;
        }
    }


    //Objects logic

    function updateObstacles(delta) {
        for (var i =0; i < obstacles.length; i++) {
            var obstacle = obstacles[i];
            obstacle.move(delta);
            if(obstacle.isOutOfScreen())
            {
                obstacle.reset();
            }
            obstacle.draw();
        }
    }

    function testCollisionObstacleMur(obstacle, canvas) {
        if((obstacle.y + obstacle.h) > canvas.height) {
            obstacle.y = canvas.height-obstacle.h;
            obstacle.speedY = - obstacle.speedY;
        }
        if(obstacle.y < 0 )  {
            obstacle.y = 0;
            obstacle.speedY = - obstacle.speedY;
        }
        if((obstacle.x + obstacle.w) > canvas.width) {
            obstacle.x = canvas.width -obstacle.w;
            obstacle.speedX = - obstacle.speedX;
        }
        if(obstacle.x < 0) {
            obstacle.x = 0;
            obstacle.speedX = - obstacle.speedX;
        }
    }


    // Collisions between aligned rectangles
    function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {

        if ((x1 > (x2 + w2)) || ((x1 + w1) < x2))
            return false; // No horizontal axis projection overlap
        if ((y1 > (y2 + h2)) || ((y1 + h1) < y2))
            return false; // No vertical axis projection overlap
        return true;    // If previous tests failed, then both axis projections
                        // overlap and the rectangles intersect
    }

    function creerObstacles() {
        var obstacle1 = creerObstacle(Math.floor((Math.random() * w) + 1) );
        obstacles.push(obstacle1);
    }

    function creerObstacle(x) {
        var obstacle = new Obstacle(x, -1, 20, 200, 0, 150);
        return obstacle;
    }

    function Obstacle(x, y, w, h, sx, sy) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speedX = sx;
        this.speedY = sy;
        this.color = 'black';
        this.launch = false;

        this.draw = function () {
            ctx.save();
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.restore();
            this.color = 'black';
        };


        this.move = function (delta) {
            // add horizontal increment to the x pos
            // add vertical increment to the y pos

            this.x += calcDistanceToMove(delta, this.speedX);
            this.y += calcDistanceToMove(delta, this.speedY);
        };
    }

    function creerPiste() {
        for(var i = 0; i < h; i = i + 20) {
            pisteG = new Piste(50, i);
            pisteD = new Piste(300, i);
            obstacles.push(pisteG, pisteD);
        }
    }

    function Piste(x,y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.w = 30;
        this.h = 21;
        this.speed = 100;

        this.draw = function () {
            ctx.save();
            ctx.fillStyle="#FF0000";
            ctx.fillRect(this.x, this.y, this.w, this.h / 2);
            ctx.fillStyle="#FFFFFF";
            ctx.fillRect(this.x, this.y + (this.h / 2), this.w, this.h / 2);
        };

        this.move = function (delta) {
            this.y += calcDistanceToMove(delta, this.speed);
        };

        this.isOutOfScreen = function() {
            if((this.y + this.h) > h ) {
                return true;
            }
            return false;
        }

        this.reset = function(y) {
            this.x = this.initialX;
            this.y = 0;
        }

    }
    // Game logic
    var measureFPS = function (newTime) {

        // test for the very first invocation
        if (lastTime === undefined) {
            lastTime = newTime;
            return;
        }

        //calculate the difference between last & current frame
        var diffTime = newTime - lastTime;

        if (diffTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = newTime;
        }

        //and display it in an element we appended to the
        // document in the start() function
        fpsContainer.innerHTML = 'FPS: ' + fps;
        frameCount++;
    };

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
    }

    function timer(currentTime) {
        var delta = currentTime - oldTime;
        oldTime = currentTime;
        return delta;

    }
    function getMousePos(evt) {
        // necessary to take into account CSS boudaries
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    var mainLoop = function (time) {
        //main function, called each frame
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        if (player.dead) {
            currentGameState = gameStates.gameOver;
        }

        switch (currentGameState) {
            case gameStates.gameRunning:

                // draw the player
                movePlayer(player.x, player.y);

                // Check inputs and move the player
                updatePlayerPosition(delta);

                // update and draw balls
                //updateBalls(delta);
                updateObstacles(delta);

                // display Score
                displayScore();

                // decrease currentLevelTime.
                // When < 0 go to next level
                currentLevelTime += delta;

                /* if (currentLevelTime < 0) {
                 goToNextLevel();
                 }*/

                break;
            case gameStates.mainMenu:
                // TO DO !
                break;
            case gameStates.gameOver:
                ctx.fillText("GAME OVER", 50, 100);
                ctx.fillText("Press SPACE to start again", 50, 150);
                ctx.fillText("Move with arrow keys", 50, 200);
                ctx.fillText("Survive 5 seconds for next level", 50, 250);
                if (inputStates.space) {
                    this.startNewGame();
                }
                break;
        }

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    function startNewGame() {
        player.dead = false;
        currentLevelTime = 5000;
        currentLevel = 1;
        currentGameState = gameStates.gameRunning;
    }

    function goToNextLevel() {
        // reset time available for next level
        // 5 seconds in this example
        currentLevelTime = 5000;
        currentLevel++;
    }

    function displayScore() {
        ctx.save();
        ctx.fillStyle = 'Green';
        ctx.fillText("Level: " + currentLevel, 300, 30);
        ctx.fillText("Time: " + (currentLevelTime / 1000).toFixed(1), 300, 60);
        ctx.restore();
    }

    function loadAssets(callback) {
        // here we should load the souds, the sprite sheets etc.
        // then at the end call the callback function

        // simple example that loads a sound and then calls the callback. We used the howler.js WebAudio lib here.
        // Load sounds asynchronously using howler.js
        plopSound = new Howl({
            urls: ['http://mainline.i3s.unice.fr/mooc/plop.mp3'],
            autoplay: false,
            volume: 1,
            onload: function () {
                console.log("all sounds loaded");
                // We're done!
                callback();
            }
        });
    }


    var start = function () {
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);

        // Canvas, context etc.
        canvas = document.querySelector("#myCanvas");

        // often useful
        w = canvas.width;
        h = canvas.height;

        // important, we will draw with this object
        ctx = canvas.getContext('2d');
        // default police for text
        ctx.font = "20px Arial";

        //add the listener to the main, window object, and update the states
        window.addEventListener('keydown', function (event) {
            if (event.keyCode === 37) {
                inputStates.left = true;
            } else if (event.keyCode === 38) {
                inputStates.up = true;
            } else if (event.keyCode === 39) {
                inputStates.right = true;
            } else if (event.keyCode === 40) {
                inputStates.down = true;
            } else if (event.keyCode === 32) {
                inputStates.space = true;
            }
        }, false);

        //if the key will be released, change the states object
        window.addEventListener('keyup', function (event) {
            if (event.keyCode === 37) {
                inputStates.left = false;
            } else if (event.keyCode === 38) {
                inputStates.up = false;
            } else if (event.keyCode === 39) {
                inputStates.right = false;
            } else if (event.keyCode === 40) {
                inputStates.down = false;
            } else if (event.keyCode === 32) {
                inputStates.space = false;
            }
        }, false);

        // Mouse event listeners
        canvas.addEventListener('mousemove', function (evt) {
            inputStates.mousePos = getMousePos(evt);
        }, false);

        canvas.addEventListener('mousedown', function (evt) {
            inputStates.mousedown = true;
            inputStates.mouseButton = evt.button;
        }, false);

        canvas.addEventListener('mouseup', function (evt) {
            inputStates.mousedown = false;
        }, false);

        player.x = (w / 2) - (player.width / 2)
        player.y = h - player.height;

        //creerObstacles();
        creerPiste();

        // all assets (images, sounds) loaded, we can start the animation
        requestAnimationFrame(mainLoop);

    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};


