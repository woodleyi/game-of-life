
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

class CellLocation {
    private _row: number
    private _column: number

    constructor(row: number, column: number) {
        this._row = row
        this._column = column
    }

    get row() {
        return this._row
    }

    get column() {
        return this._column
    }
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
    private numNeighborsToSurvive = new Set([2,3])
    private numHorizontalCells: number
    private numVerticalCells: number
    private cells: Cell[][]

    constructor(numHorizontalCells: number, numVerticalCells: number) {
        this.numHorizontalCells = numHorizontalCells
        this.numVerticalCells = numVerticalCells
        this.cells = this.emptyGeneration()
    }

    private emptyGeneration(): Cell[][] {
        let generation: Cell[][] = []
        for (var rowIdx=0; rowIdx < this.numVerticalCells; rowIdx++) {
            let row: Cell[] = []
            for (var columnIdx=0; columnIdx < this.numHorizontalCells; columnIdx++) {
                row.push(new Cell(CellState.DEAD))
            }
            generation.push(row)
        }
        return generation
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

    public nextGeneration() {
        let newGeneration = this.emptyGeneration()

        for (var rowIdx=0; rowIdx < this.numVerticalCells; rowIdx++) {
            for (var columnIdx=0; columnIdx < this.numHorizontalCells; columnIdx++) {
                let numLiveNeighbors = this.calculateNumLiveNeighbors(rowIdx, columnIdx)
                let newState = this.determineNewCellState(this.cellAt(rowIdx, columnIdx), numLiveNeighbors)
                newGeneration[rowIdx][columnIdx] = new Cell(newState)
            }
        }

        this.cells = newGeneration
    }

    private calculateNumLiveNeighbors(row: number, column: number): number {
        return this.calculateNumLiveCells(
            new CellLocation(row-1,column-1), new CellLocation(row-1,column), new CellLocation(row-1,column+1),
            new CellLocation(row,column-1),                                   new CellLocation(row,column+1),
            new CellLocation(row+1,column-1), new CellLocation(row+1,column), new CellLocation(row+1,column+1)
        )
    }

    private calculateNumLiveCells(...cellLocations: CellLocation[]): number {
        var numLiveNeighbors = 0
        cellLocations.forEach(cellLocation => {
            if (this.cellAt(cellLocation.row, cellLocation.column)?.isAlive()) {
                numLiveNeighbors++
            }
        });
        return numLiveNeighbors
    }

    private determineNewCellState(cell: Cell, numLiveNeighbors: number): CellState {
        if (cell.isAlive()) {
            return (this.numNeighborsToSurvive.has(numLiveNeighbors)) ? CellState.ALIVE : CellState.DEAD
        } else {
            return (numLiveNeighbors == 3) ? CellState.ALIVE : CellState.DEAD    
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

    // Initial render.
    renderer.render(game, cellSize, Color.RED)
    
    // Register an event listener to toggle cell state upon mouse click.
    canvas.onclick = function (event: MouseEvent) {
        let row = Math.floor(event.clientY / cellSize)
        let column = Math.floor(event.clientX / cellSize)
        game.toggleCellState(row, column)
        renderer.render(game, cellSize, Color.RED)
    }

    // Update generations every second and re-render.
    window.setInterval(function() {
        game.nextGeneration()
        renderer.render(game, cellSize, Color.RED)
    }, 3_500)
}

// Register the main function to run when the page finishes loading.
window.onload = main
