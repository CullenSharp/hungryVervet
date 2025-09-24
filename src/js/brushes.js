import { isInBounds } from "./utils.js";

class Brush {
    constructor(color="white") {
        this.color = color;
    }

    draw(surface, x, y) {
        // ...
    }
}

export class CircularBrush extends Brush {
    constructor(radius, color) {
        super(color);
        this.radius = radius;
    }

    getNewAmplitude(oldAmplitude, i , j) {
        const sqRadius = Math.pow(this.radius, 2);
        const delta = (30/sqRadius)*(sqRadius - Math.abs(i * j))
        return Math.min(255, oldAmplitude + delta);
    }

    draw({ctx, buffer, width, height}, x, y) {
        ctx.fillStyle = this.color;
        for (let i = -this.radius; i <= this.radius; i++) {
            for (let j = -this.radius; j <= this.radius; j++) {
                const offsetY = y + i;
                const offsetX = x + j;
                if (isInBounds(offsetX, offsetY, 0, width, 0, height)) {{
                    const oldAmplitude  = buffer[offsetY][offsetX];
                    const newAmplitude  = this.getNewAmplitude(oldAmplitude, i, j);
                    buffer[offsetY][offsetX] = newAmplitude;

                    
                    // paint pixels
                    const h = newAmplitude / 1.3 + 250;
                    const l = newAmplitude / 2.55;
                    this.color = `hsl(${h},100%,${l}%)`
                    surface.ctx.fillStyle = this.color;
                    surface.ctx.fillRect(offsetX, offsetY, 1, 1);
                }
            }
        }
    }
}

export class SinBrush extends Brush {
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

    draw({ctx, buffer, width, height}, x, y) {
        ctx.fillStyle = this.color;
        for (let i = -this.radius, ki = 0; i <= this.radius; i++, ki++) {
            for (let j = -this.radius, kj = 0; j <= this.radius; j++, kj++) {
                const offsetY = y + i;
                const offsetX = x + j;

                //  Suggestion: maybe make this a function
                if (isInBounds(offsetX, offsetY, 0, width, 0, height)) {
                    const oldAmplitude  = buffer[offsetY][offsetX];
                    const newAmplitude  = this.getNewAmplitude(oldAmplitude, ki, kj);
                    buffer[offsetY][offsetX] = newAmplitude;

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