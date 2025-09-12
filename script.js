let canvas;
let surface;
let ctx;
let surfaceAnimation;
let specMap = [];

window.onload = function() {
    canvas = document.getElementById("surface");
    ctx = canvas.getContext("2d");

    for (let segmentIdx = 0; segmentIdx < canvas.height; segmentIdx++) {
        specMap[segmentIdx] = new Uint8Array(canvas.width);
    }

    const defaultBrush = new Testing_SinBrush(20, "white");
    surface = new Surface(ctx, canvas.width, canvas.height, defaultBrush);

    canvas.onmousedown=function(e){
        
        document.onmousemove=function(e){
            mouse.x = e.x - canvas.offsetLeft; 
            mouse.y = e.y - canvas.offsetTop;

            surface.drawCurrentBrush(mouse.x, mouse.y);
        } 
        document.onmouseup=function(){
            document.onmousemove=null;
        }
        document.onmousemove(e);
    }
    surface.animate(0);
}

const mouse = {
    x: 0,
    y: 0,
}


window.addEventListener("resize", function() {
    const defaultBrush = new Testing_SinBrush(20, "white");
    surface = new Surface(ctx, canvas.width, canvas.height, defaultBrush);
    surface.animate(0);
});

class Surface {
    #lastTime;
    #interval;
    #timer;
    #currentBrush;

    constructor(ctx, width, height, initialBrush) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.#lastTime = 0;
        this.#interval = 1000/60;
        this.#timer = 0;
        this.#currentBrush = initialBrush;
    }

    setCurrentBrush(brush) {
        this.#currentBrush = brush;
    }

    drawCurrentBrush(x, y) {
        this.#currentBrush.draw(this.ctx, x, y);
    }

    animate(timeStamp) {
        const dt = timeStamp - this.#lastTime;
        this.#lastTime = timeStamp;

        if (this.#timer > this.#interval) {
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

    draw(ctx, x, y) {
        // ...
    }
}

class CircularBrush extends Brush {
    constructor(radius, color) {
        super(color);
        this.radius = radius;
    }

    getNewAmplitude(oldAmplitude, i , j) {
        const sqRadius = Math.pow(this.radius, 2);
        const delta = (30/sqRadius)*(sqRadius - Math.abs(i * j))
        return Math.min(255, oldAmplitude + delta);
    }

    draw(ctx, x, y) {
        ctx.fillStyle = this.color;
        for (let i = -this.radius; i <= this.radius; i++) {
            for (let j = -this.radius; j <= this.radius; j++) {
                const offsetY = y + i;
                const offsetX = x + j;
                if (
                    (offsetY < surface.height) &&
                    (offsetY >= 0)             &&
                    (offsetX < surface.width)  &&
                    (offsetX >= 0)
                ) {
                    const oldAmplitude  = specMap[offsetY][offsetX];
                    const newAmplitude  = this.getNewAmplitude(oldAmplitude, i, j);
                    specMap[offsetY][offsetX] = newAmplitude;

                    
                    // paint pixels
                    const h = newAmplitude / 1.3 + 250;
                    const l = newAmplitude / 2.55;
                    this.color = `hsl(${h},100%,${l}%)`
                    ctx.fillStyle = this.color;
                    ctx.fillRect(offsetX, offsetY, 1, 1);
                }
            }
        }
    }
}

class Testing_SinBrush extends Brush {
    constructor(radius, color) {
        super(color);
        this.radius = radius;
        this.kernel = [];

        const dphi = Math.PI/(2*this.radius + 1);
        for (let phi1 = 0, i = 0; phi1 < Math.PI; phi1 += dphi, i++) {
	        this.kernel[i] = new Float32Array(2*this.radius + 1)
            for (let phi2 = 0, j = 0; phi2 <= Math.PI; phi2 += dphi, j++) {
                this.kernel[i][j] = 30*(Math.sin(phi1) * Math.sin(phi2));
            }
        }
    }

    getNewAmplitude(oldAmplitude, ki, kj) {
        const delta = this.kernel[ki][kj]
        return Math.min(255, oldAmplitude + delta);
    }

    draw(ctx, x, y) {
        ctx.fillStyle = this.color;
        for (let i = -this.radius, ki = 0; i <= this.radius; i++, ki++) {
            for (let j = -this.radius, kj = 0; j <= this.radius; j++, kj++) {
                const offsetY = y + i;
                const offsetX = x + j;

                //  Suggestion: maybe make this a function
                if (
                    (offsetY < surface.height) &&
                    (offsetY >= 0)             &&
                    (offsetX < surface.width)  &&
                    (offsetX >= 0)
                ) {
                    const oldAmplitude  = specMap[offsetY][offsetX];
                    const newAmplitude  = this.getNewAmplitude(oldAmplitude, ki, kj);
                    specMap[offsetY][offsetX] = newAmplitude;

                    // paint pixels
                    const h = newAmplitude / 1.3 + 250;
                    const l = newAmplitude / 2.55;
                    this.color = `hsl(${h},100%,${l}%)`
                    ctx.fillStyle = this.color;
                    ctx.fillRect(offsetX, offsetY, 1, 1);
                }
            }
        }
    }
}
