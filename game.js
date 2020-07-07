;(function() {

    var Game = function() {
        var canvas = document.getElementById("gamespace");
        var screen = canvas.getContext('2d');
        var gameSize = { x: canvas.width, y: canvas.height };
        var rocket = document.getElementById("rocket");
        var star = document.getElementById("star");
        var night = document.getElementById("night");
        
        this.lives = 3;
        this.starcounter = 0;
        
        this.bodies = [];
        this.bodies = this.bodies.concat(new Player(this, gameSize));

        var self = this;

        var tick = function() {
            self.update(gameSize, screen);
            self.draw(screen, gameSize, rocket);
            requestAnimationFrame(tick);
        };
        tick();
    };

    Game.prototype = {

        update: function(gameSize, screen) {
            var self = this; 
            const length = this.bodies.length;

            if (Math.random() > 0.995){
                coords = randomPosition(gameSize);
                var star = new Star({x: coords[0], y: coords[1]},
                    {x: Math.random() - 0.5, y: 2});
                this.addBody(star);
            }  

            var notCollidingWithAnything = function(b1) {
                return self.bodies.filter(function(b2) {return colliding(b1, b2) && Object.getOwnPropertyNames(b1).includes("velocity")}).length === 0;
            };

            this.bodies = this.bodies.filter(notCollidingWithAnything);

            var notCollidingWithAnything = function(b1) {
                return self.bodies.filter(function(b2) {return colliding(b1, b2) && Object.getOwnPropertyNames(b1).includes("velocity")}).length === 0;
            };

            if (length > this.bodies.length){
                this.starcounter += 1;
            }

            for (var i = 0; i < this.bodies.length; i ++){
                let bool = floorColliding(this.bodies[i], gameSize, self);
                if (bool){
                    this.bodies.splice(1, 1);
                } else {
                    this.bodies[i].update();
                }
            }
        },
        draw: function(screen, gameSize, rocket) {
            screen.fillStyle = "#EBE721";
            screen.font = "italic 30px monospace";
            if (this.lives <= 0){
                Object.freeze(this);
                screen.clearRect(0, 0, gameSize.x, gameSize.y);
                screen.drawImage(night, 0, 0, gameSize.x, gameSize.y);
                screen.fillText("GAME OVER", gameSize.x / 2 - 85, gameSize.y / 2 - 20);
                screen.font = "20px monospace";
                screen.fillStyle = "#BEC2CB";
                screen.fillText("STARS CAUGHT: " + this.starcounter, gameSize.x / 2 - 90, gameSize.y / 2 + 5)
                screen.fillText("PRESS SPACE TO START OVER", gameSize.x / 2 - 150, gameSize.y / 2 + 100)

            } else { 
                screen.clearRect(0, 0, gameSize.x, gameSize.y);
                screen.drawImage(night, 0, 0, 400, 600);
                screen.fillText("STARCATCHER", 100 , 40)
                screen.font = "20px monospace";
                screen.fillStyle = "#BEC2CB";
                screen.fillText("LIVES: " + this.lives, 40, 70);
                screen.fillText("STARS CAUGHT: " + this.starcounter, 180, 70)
                for (var i = 0; i < this.bodies.length; i++){
                    drawRect(screen, this.bodies[i], rocket);
                }
            }
        },

        addBody: function(body) {
            this.bodies.push(body);
        },
    };

    var getRandomInt = function(max) {
        return Math.floor(Math.random() * Math.floor(max));
      };

    var randomPosition = function(gameSize){
        x = 20 + getRandomInt(gameSize.x - 50);
        y = 0;
        return [x, y]
    }

    var Star = function(center, velocity){
        this.center = center;
        this.size = {x: 40, y: 40};
        this.velocity = velocity;
    };

    Star.prototype = {
        update: function () {
            if (this.center.x - (this.size.x / 2) < 0 || this.center.x + (this.size.x / 2) > 400){
                this.velocity.x = -this.velocity.x;
            }
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    };
    
    var Player = function(game, gameSize){
        this.gameSize = gameSize
        this.game = game;
        this.size = { x: 60, y: 76 };
        this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.y}

        this.keyboarder = new Keyboarder();
    };

    Player.prototype = {
        update: function() {
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x > 30){
                this.center.x -= 3;
            } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x <370){
                this.center.x += 3;
            }
        }
    };

    var Keyboarder = function() {
        var keyState = {};

        window.addEventListener('keydown', function(e){
            keyState[e.keyCode] = true;
        });

        window.addEventListener('keyup', function(e) {
            keyState[e.keyCode] = false;
        });

        this.isDown = function(keyCode) {
            return keyState[keyCode] === true;
        };

        this.KEYS = {LEFT: 37, RIGHT: 39};
        };

    var drawRect = function(screen, body, rocket) {
        if (Object.getOwnPropertyNames(body).includes("velocity")){
            screen.drawImage(star, body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
        } else {
            screen.drawImage(rocket, body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
        }
    };

    var floorColliding = function(b1, gameSize, game) {
        if (b1.center.y > gameSize.y){
            game.lives = game.lives - 1;
            return true        
        }
    }

    var colliding = function(b1, b2){
        return !(
            b1 === b2 ||
                b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 
                );
    };

    window.addEventListener('load', function() {
        let game = new Game();
        document.body.onkeyup = function(e) {
            if (e.keyCode == 32){
                location.reload();
            }
        }
      });
})();