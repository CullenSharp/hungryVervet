import { CircularBrush, SinBrush } from "./brushes.js";

window.onload = function() {
    const canvas = document.getElementById("surface");
    const ctx = canvas.getContext("2d");
    const defaultBrush = new SinBrush(20, "white");

    const surface = new Surface(ctx, canvas, defaultBrush);

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

class Surface {
    #lastTime;
    #interval;
    #timer;
    #currentBrush;

    constructor(ctx, canvas, initialBrush) {
        this.canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.#lastTime = 0;
        this.#interval = 1000/60;
        this.#timer = 0;
        this.#currentBrush = initialBrush;

        // I really feel like this should just be the buffer
        this.buffer = []
        for (let segmentIdx = 0; segmentIdx < canvas.height; segmentIdx++) {
            this.buffer[segmentIdx] = new Uint8Array(canvas.width);
        }
    }

    setCurrentBrush(brush) {
        this.#currentBrush = brush;
    }

    drawCurrentBrush(x, y) {
        this.#currentBrush.draw(this, x, y);
    }

    animate(timeStamp) {
        const dt = timeStamp - this.#lastTime;
        this.#lastTime = timeStamp;

        if (this.#timer > this.#interval) {
            this.#timer = 0;
        } else {
            this.#timer += dt;
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}
