
class Renderer {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        this.canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
        this.context = this.canvas.getContext('2d')
        this.context.fillStyle = "FF0000"
        this.context.fillRect(0, 0, 150, 75)
    }
}

new Renderer()