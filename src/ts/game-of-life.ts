
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
    let zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement
    let zoomSliderOutput = document.getElementById('zoom-slider-output') as HTMLOutputElement
    
    const maximumCellSize = 64
    const minimumCellSize = maximumCellSize * parseFloat(zoomSlider.min)
    
    // Register an event listener to update cell size when zoom changes.
    var renderedCellSize = 32
    zoomSlider.oninput = function() {
        let zoomPercentage = zoomSlider.valueAsNumber
        renderedCellSize = maximumCellSize * zoomPercentage
        zoomSliderOutput.innerText = `${zoomPercentage * 100}%`
        renderer.render(game, renderedCellSize, Color.RED)
    };

    let canvasDiv = document.getElementById('canvas-div') as HTMLDivElement
    let canvasRect = canvasDiv.getBoundingClientRect()
    
    let canvas = document.getElementById('mainCanvas') as HTMLCanvasElement    
    canvas.width = canvasRect.width
    canvas.height = canvasRect.height

    let numHorizontalCells = canvas.width / minimumCellSize
    let numVerticalCells = canvas.height / minimumCellSize  
    let game = new Game(numHorizontalCells, numVerticalCells)

    let renderer = new CanvasRenderer(canvas)

    // Initial render.
    renderer.render(game, renderedCellSize, Color.RED)
    
    // Register an event listener to toggle cell state upon mouse click.
    canvas.onclick = function (event: MouseEvent) {
        let row = Math.floor(event.clientY / renderedCellSize)
        let column = Math.floor( (event.clientX - canvasRect.x) / renderedCellSize)
        game.toggleCellState(row, column)
        renderer.render(game, renderedCellSize, Color.RED)
    }

    let pressedKeys = new Set()
    const pauseKeyCode = 32 // Spacebar
    var paused = false
    
    // Register an event listener to toggle the 'pause' state.
    document.onkeydown = function(event) {        
        if (event.keyCode == pauseKeyCode && !pressedKeys.has(pauseKeyCode)) {
            paused = !paused
            pressedKeys.add(pauseKeyCode)
            let pauseTextElement = document.getElementById("pauseText") as HTMLHeadingElement
            pauseTextElement.innerText = ( paused ? "Unpause" : "Pause" ) + ": SPACE"
        }
    }

    // Register an event listener to remove any pressed keys from the cache.
    document.onkeyup = function(event) {        
        pressedKeys.delete(event.keyCode)
    }

    // Update generations and re-render.
    let baseGameSpeedInMillis = 100
    let gameSpeedSlider = document.getElementById('gameSpeedSlider') as HTMLInputElement
    let gameSpeedSliderOutput = document.getElementById('game-speed-slider-output') as HTMLOutputElement
    var gameSpeedPercentage = gameSpeedSlider.valueAsNumber
    
    let updateFunction = function() {
        if (!paused) {
            game.nextGeneration()
            renderer.render(game, renderedCellSize, Color.RED)
        }
        window.setTimeout(updateFunction, baseGameSpeedInMillis / gameSpeedPercentage)
    }

    // Register an event listener to update game speed when slider value changes.
    gameSpeedSlider.oninput = function() {
        gameSpeedPercentage = gameSpeedSlider.valueAsNumber
        gameSpeedSliderOutput.innerText = `${gameSpeedPercentage * 100}%`
    }

    // Run initial update.
    window.setTimeout(updateFunction, baseGameSpeedInMillis / gameSpeedPercentage)
}

// Register the main function to run when the page finishes loading.
window.onload = main
