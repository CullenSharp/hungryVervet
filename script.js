let canvas;
let surface;
let ctx;
let surfaceAnimation;

window.onload = function() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    surface = new Surface(ctx, canvas.width, canvas.height);
    const defaultBrush = new CircularBrush(20, "white");
    surface.addEntity(defaultBrush);
    surface.animate(0);
}

const mouse = {
    x: 0,
    y: 0,
}

window.addEventListener("mousemove", function(e) {
    mouse.x = e.x;
    mouse.y = e.y;
})

class Surface {
    #width;
    #height;
    #lastTime;
    #interval;
    #timer;
    #entities;
    #len;

    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#lastTime = 0;
        this.#interval = 1000/60;
        this.#timer = 0;
        this.#entities = [];
        this.#len = 0;
    }

    addEntity(entity) {
        this.#len = this.#entities.push(entity)
    }

    animate(timeStamp) {
        const dt = timeStamp - this.#lastTime;
        this.#lastTime = timeStamp;

        if (this.#timer > this.#interval) {
            // this.ctx.clearRect(0, 0, this.#width, this.#height);

            for (let i = 0; i < this.#len; i++) {
                this.#entities[i].draw(surface);
            }

            this.#timer = 0;
        } else {
            this.#timer += dt;
        }

        surfaceAnimation = requestAnimationFrame(this.animate.bind(this));
    }
}

class Brush {
    constructor(color="white") {
        this.color = color;
    }

    draw(surface) {
        // ...
    }
}

class CircularBrush extends Brush {
    constructor(radius, color) {
        super(color);
        this.radius = radius;
    }

    draw(surface) {
        surface.ctx.fillStyle = this.color;
        const n = 10;
        const dphi = 2*Math.PI/n;
        for (let phi = 0; phi < 2*Math.PI; phi += dphi) {
            const x = mouse.x - this.radius*Math.cos(phi);
            const y = mouse.y - this.radius*Math.sin(phi);
            surface.ctx.fillRect(x,y,n, n);
        }
    }
}