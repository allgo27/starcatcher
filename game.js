;(function() {

    class Game {
        constructor() {
            const canvas = document.getElementById("gamespace");
            const screen = canvas.getContext('2d');
            const gameSize = { x: canvas.width, y: canvas.height };
            
            const rocket = document.getElementById("rocket");
            const star = document.getElementById("star");
            const night = document.getElementById("night");
            
            this.lives = 3;
            this.starcounter = 0;
            this.gameover = false;

            this.bodies = [new Player(this, gameSize)];

            let tick = () => {
                this.update(gameSize);
                this.draw(screen, gameSize, rocket);
                if (!this.gameover){
                    requestAnimationFrame(tick);
                }
            }
            tick();
        }

        update = (gameSize) => {
            const length = this.bodies.length;

            if (Math.random() > 0.995){
                let coords = randomPosition(gameSize);
                const star = new Star({x: coords[0], y: coords[1]},
                    {x: Math.random() - 0.5, y: 2});
                this.addBody(star);
            }  

            let notCollidingWithAnything = (b1) => {
                return this.bodies.filter(function(b2) {return colliding(b1, b2) && b1 instanceof Star}).length === 0;
            };

            this.bodies = this.bodies.filter(notCollidingWithAnything);

            if (length > this.bodies.length){
                this.starcounter += 1;
            }

            for (const body of this.bodies) {
                if (floorColliding(body, gameSize, this)){
                    this.bodies.splice(1, 1);
                } else {
                    body.update();
                }
            }
        }

        draw = (screen, gameSize, rocket) => {
            screen.fillStyle = "#EBE721";
            screen.font = "italic 30px monospace";
            if (this.lives <= 0){
                screen.clearRect(0, 0, gameSize.x, gameSize.y);
                screen.drawImage(night, 0, 0, gameSize.x, gameSize.y);
                screen.fillText("GAME OVER", gameSize.x / 2 - 85, gameSize.y / 2 - 20);
                screen.font = "20px monospace";
                screen.fillStyle = "#BEC2CB";
                screen.fillText("STARS CAUGHT: " + this.starcounter, gameSize.x / 2 - 90, gameSize.y / 2 + 5)
                screen.fillText("PRESS SPACE TO START OVER", gameSize.x / 2 - 150, gameSize.y / 2 + 100)
                this.gameover = true;

            } else { 
                screen.clearRect(0, 0, gameSize.x, gameSize.y);
                screen.drawImage(night, 0, 0, 400, 600);
                screen.fillText("STARCATCHER", 100 , 40)
                screen.font = "20px monospace";
                screen.fillStyle = "#BEC2CB";
                screen.fillText("LIVES: " + this.lives, 40, 70);
                screen.fillText("STARS CAUGHT: " + this.starcounter, 180, 70)
                for (const body of this.bodies){
                    drawRect(screen, body, rocket);
                }
            }
        }

        addBody = (body) => {
            this.bodies.push(body);
        }
    }

    class Star{
        constructor(center, velocity){
            this.center = center;
            this.size = {x: 40, y: 40};
            this.velocity = velocity;
        }
        update = () => {
            if (this.center.x - (this.size.x / 2) < 0 || this.center.x + (this.size.x / 2) > 400){
                this.velocity.x = -this.velocity.x;
            }
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    }
    
class Player {
    constructor(game, gameSize){
        this.gameSize = gameSize
        this.game = game;
        this.size = { x: 60, y: 76 };
        this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.y}

        this.keyboarder = new Keyboarder();
    }
    update = () => {
        if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x > 30){
            this.center.x -= 3;
        } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x <370){
            this.center.x += 3;
        }
    }
}

    class Keyboarder {
        constructor() {
            const keyState = {};

            window.addEventListener('keydown', function(e){
                keyState[e.keyCode] = true;
                e.preventDefault();
            });
    
            window.addEventListener('keyup', function(e) {
                keyState[e.keyCode] = false;
            });
    
            this.isDown = function(keyCode) {
                
                return keyState[keyCode] === true;
            };
    
            this.KEYS = {LEFT: 37, RIGHT: 39};
            };
        }       

    drawRect = (screen, body, rocket) =>{
        if (body instanceof Star){
            screen.drawImage(star, body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
        } else {
            screen.drawImage(rocket, body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
        }
    };

    floorColliding = (b1, gameSize, game) => {
        if (b1.center.y > gameSize.y){
            game.lives = game.lives - 1;
            return true        
        }
    };

    colliding = (b1, b2) => {
        return !(
            b1 === b2 ||
                b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 
                );
    };

    getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    };

    randomPosition = (gameSize) => {
        x = 20 + getRandomInt(gameSize.x - 50);
        y = 0;
        return [x, y]
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