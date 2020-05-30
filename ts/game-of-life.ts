
class CanvasRenderer {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    }

    public render(game: Game, cellSize: number, cellColor: Color) {        
        // Clear the canvas.
        this.context.fillStyle = Color.WHITE
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Set grid / cell colors.
        this.context.strokeStyle = Color.GREY
        this.context.fillStyle = cellColor
        
        // Render.
        let numHorizontalCells = Math.floor(this.canvas.width / cellSize)
        let numVerticalCells = Math.floor(this.canvas.height / cellSize)

        for (var row=0; row < numVerticalCells; row++) {
            let y = row * cellSize
            
            for (var column=0; column < numHorizontalCells; column++) {
                let x = column * cellSize

                if (game.cellAt(row, column)?.isAlive()) {
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
    WHITE = "#FFFFFF",
    GREY = "#D3D3D3",
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

    public toggleState() {
        this.state = this.isAlive() ? CellState.DEAD : CellState.ALIVE
    }
}


class Game {
    private cells: Cell[][] = []

    constructor(numHorizontalCells: number, numVerticalCells: number) {
        for (var rowIdx=0; rowIdx < numVerticalCells; rowIdx++) {
            let row: Cell[] = []
            for (var columnIdx=0; columnIdx < numHorizontalCells; columnIdx++) {
                row.push(new Cell(CellState.DEAD))
            }
            this.cells.push(row)
        }
    }

    public cellAt(row: number, column: number): Cell {
        return this.cells[row]?.[column]
    }

    public toggleCellState(row: number, column: number) {
        let cell = this.cells[row]?.[column]
        if (cell) {
            cell.toggleState()
        } else { // falsey value evaluated - log the offender.
            console.error(`The cell at row ${row}, column ${column} is ${cell}.`)
        }
    }
}


function main() {
    const cellSize = 32
    
    let canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
    // Adjust the canvas dimensions to be factors of 'cellSize'.
    canvas.width = window.innerWidth - (window.innerWidth % cellSize)
    canvas.height = window.innerHeight - (window.innerHeight % cellSize)

    let numHorizontalCells = canvas.width / cellSize
    let numVerticalCells = canvas.height / cellSize
    let game = new Game(numHorizontalCells, numVerticalCells)

    let renderer = new CanvasRenderer(canvas)
    
    // Register an event listener to toggle cell state upon mouse click.
    canvas.onclick = function (event: MouseEvent) {
        let row = Math.floor(event.clientY / cellSize)
        let column = Math.floor(event.clientX / cellSize)
        game.toggleCellState(row, column)
        renderer.render(game, cellSize, Color.RED)
    }

    // Initial render.
    renderer.render(game, cellSize, Color.RED)
}

// Register the main function to run when the page finishes loading.
window.onload = main
