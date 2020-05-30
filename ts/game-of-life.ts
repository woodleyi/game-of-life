
class Renderer {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        this.canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    }
}

new Renderer()