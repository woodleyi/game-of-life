
class GameRenderer {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        this.canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    }

    public draw(game: Game, cellSize: number, cellColor: Color) {
        this.context.fillStyle = cellColor
        
        let numHorizontalCells = Math.floor(this.canvas.width / cellSize)
        let numVerticalCells = Math.floor(this.canvas.height / cellSize)

        for (var row=0; row <= numVerticalCells; row++) {
            let y = row * cellSize
            
            for (var column=0; column <= numHorizontalCells; column++) {
                let x = column * cellSize

                if (game.cells[row]?.[column]?.isAlive()) {
                    this.context.fillRect(x, y, cellSize, cellSize)
                }
                this.context.strokeRect(x, y, cellSize, cellSize)
            }
        }
    }
}



enum CellState {
    ALIVE, DEAD
}

enum Color {
    BLACK = "#000000",
    RED = "#FF0000",
    GREEN = "#00FF00",
    BLUE = "#0000FF"
}


class Cell {
    private state: CellState

    constructor(state: CellState) {
        this.state = state
    }

    public isAlive(): boolean {
        return this.state == CellState.ALIVE
    }
}


class Game {
    private _cells: Cell[][] = []

    get cells(): Cell[][] {
        return this._cells
    }
}



// Start the game
let game = new Game()
let renderer = new GameRenderer()

renderer.draw(game, 32, Color.BLACK)