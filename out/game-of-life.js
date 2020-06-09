"use strict";
class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
    }
    render(game, cellSize, cellColor) {
        var _a;
        // Clear the canvas.
        this.context.fillStyle = Color.WHITE;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Set grid / cell colors.
        this.context.strokeStyle = Color.GREY;
        this.context.fillStyle = cellColor;
        // Render.
        let numHorizontalCells = Math.floor(this.canvas.width / cellSize);
        let numVerticalCells = Math.floor(this.canvas.height / cellSize);
        for (var row = 0; row < numVerticalCells; row++) {
            let y = row * cellSize;
            for (var column = 0; column < numHorizontalCells; column++) {
                let x = column * cellSize;
                if ((_a = game.cellAt(row, column)) === null || _a === void 0 ? void 0 : _a.isAlive()) {
                    this.context.fillRect(x, y, cellSize, cellSize);
                }
                this.context.strokeRect(x, y, cellSize, cellSize);
            }
        }
    }
}
var CellState;
(function (CellState) {
    CellState[CellState["ALIVE"] = 0] = "ALIVE";
    CellState[CellState["DEAD"] = 1] = "DEAD";
})(CellState || (CellState = {}));
var Color;
(function (Color) {
    Color["BLACK"] = "#000000";
    Color["WHITE"] = "#FFFFFF";
    Color["GREY"] = "#D3D3D3";
    Color["RED"] = "#FF0000";
    Color["GREEN"] = "#00FF00";
    Color["BLUE"] = "#0000FF";
})(Color || (Color = {}));
class CellLocation {
    constructor(row, column) {
        this._row = row;
        this._column = column;
    }
    get row() {
        return this._row;
    }
    get column() {
        return this._column;
    }
}
class Cell {
    constructor(state) {
        this.state = state;
    }
    isAlive() {
        return this.state == CellState.ALIVE;
    }
    toggleState() {
        this.state = this.isAlive() ? CellState.DEAD : CellState.ALIVE;
    }
}
class Game {
    constructor(numHorizontalCells, numVerticalCells) {
        this.numNeighborsToSurvive = new Set([2, 3]);
        this.numHorizontalCells = numHorizontalCells;
        this.numVerticalCells = numVerticalCells;
        this.cells = this.emptyGeneration();
    }
    emptyGeneration() {
        let generation = [];
        for (var rowIdx = 0; rowIdx < this.numVerticalCells; rowIdx++) {
            let row = [];
            for (var columnIdx = 0; columnIdx < this.numHorizontalCells; columnIdx++) {
                row.push(new Cell(CellState.DEAD));
            }
            generation.push(row);
        }
        return generation;
    }
    cellAt(row, column) {
        var _a;
        return (_a = this.cells[row]) === null || _a === void 0 ? void 0 : _a[column];
    }
    toggleCellState(row, column) {
        var _a;
        let cell = (_a = this.cells[row]) === null || _a === void 0 ? void 0 : _a[column];
        if (cell) {
            cell.toggleState();
        }
        else { // falsey value evaluated - log the offender.
            console.error(`The cell at row ${row}, column ${column} is ${cell}.`);
        }
    }
    nextGeneration() {
        let newGeneration = this.emptyGeneration();
        for (var rowIdx = 0; rowIdx < this.numVerticalCells; rowIdx++) {
            for (var columnIdx = 0; columnIdx < this.numHorizontalCells; columnIdx++) {
                let numLiveNeighbors = this.calculateNumLiveNeighbors(rowIdx, columnIdx);
                let newState = this.determineNewCellState(this.cellAt(rowIdx, columnIdx), numLiveNeighbors);
                newGeneration[rowIdx][columnIdx] = new Cell(newState);
            }
        }
        this.cells = newGeneration;
    }
    calculateNumLiveNeighbors(row, column) {
        return this.calculateNumLiveCells(new CellLocation(row - 1, column - 1), new CellLocation(row - 1, column), new CellLocation(row - 1, column + 1), new CellLocation(row, column - 1), new CellLocation(row, column + 1), new CellLocation(row + 1, column - 1), new CellLocation(row + 1, column), new CellLocation(row + 1, column + 1));
    }
    calculateNumLiveCells(...cellLocations) {
        var numLiveNeighbors = 0;
        cellLocations.forEach(cellLocation => {
            var _a;
            if ((_a = this.cellAt(cellLocation.row, cellLocation.column)) === null || _a === void 0 ? void 0 : _a.isAlive()) {
                numLiveNeighbors++;
            }
        });
        return numLiveNeighbors;
    }
    determineNewCellState(cell, numLiveNeighbors) {
        if (cell.isAlive()) {
            return (this.numNeighborsToSurvive.has(numLiveNeighbors)) ? CellState.ALIVE : CellState.DEAD;
        }
        else {
            return (numLiveNeighbors == 3) ? CellState.ALIVE : CellState.DEAD;
        }
    }
}
function main() {
    let zoomSlider = document.getElementById('zoom-slider');
    let zoomSliderOutput = document.getElementById('zoom-slider-output');
    const maximumCellSize = 64;
    const minimumCellSize = maximumCellSize * parseFloat(zoomSlider.min);
    // Register an event listener to update cell size when zoom changes.
    var renderedCellSize = 32;
    zoomSlider.oninput = function () {
        let zoomPercentage = zoomSlider.valueAsNumber;
        renderedCellSize = maximumCellSize * zoomPercentage;
        zoomSliderOutput.innerText = `${zoomPercentage * 100}%`;
        renderer.render(game, renderedCellSize, Color.RED);
    };
    let canvasDiv = document.getElementById('canvas-div');
    let canvasRect = canvasDiv.getBoundingClientRect();
    let canvas = document.getElementById('main-canvas');
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    let numHorizontalCells = canvas.width / minimumCellSize;
    let numVerticalCells = canvas.height / minimumCellSize;
    let game = new Game(numHorizontalCells, numVerticalCells);
    let renderer = new CanvasRenderer(canvas);
    // Initial render.
    renderer.render(game, renderedCellSize, Color.RED);
    // Register an event listener to toggle cell state upon mouse click.
    canvas.onclick = function (event) {
        let row = Math.floor(event.clientY / renderedCellSize);
        let column = Math.floor((event.clientX - canvasRect.x) / renderedCellSize);
        game.toggleCellState(row, column);
        renderer.render(game, renderedCellSize, Color.RED);
    };
    let pressedKeys = new Set();
    const pauseKeyCode = 32; // Spacebar
    var paused = false;
    // Register an event listener to toggle the 'pause' state.
    document.onkeydown = function (event) {
        if (event.keyCode == pauseKeyCode && !pressedKeys.has(pauseKeyCode)) {
            paused = !paused;
            pressedKeys.add(pauseKeyCode);
            let pauseTextElement = document.getElementById("pauseText");
            pauseTextElement.innerText = (paused ? "Unpause" : "Pause") + ": SPACE";
        }
    };
    // Register an event listener to remove any pressed keys from the cache.
    document.onkeyup = function (event) {
        pressedKeys.delete(event.keyCode);
    };
    // Update generations and re-render.
    let baseGameSpeedInMillis = 100;
    let gameSpeedSlider = document.getElementById('game-speed-slider');
    let gameSpeedSliderOutput = document.getElementById('game-speed-slider-output');
    var gameSpeedPercentage = gameSpeedSlider.valueAsNumber;
    let updateFunction = function () {
        if (!paused) {
            game.nextGeneration();
            renderer.render(game, renderedCellSize, Color.RED);
        }
        window.setTimeout(updateFunction, baseGameSpeedInMillis / gameSpeedPercentage);
    };
    // Register an event listener to update game speed when slider value changes.
    gameSpeedSlider.oninput = function () {
        gameSpeedPercentage = gameSpeedSlider.valueAsNumber;
        gameSpeedSliderOutput.innerText = `${gameSpeedPercentage * 100}%`;
    };
    // Run initial update.
    window.setTimeout(updateFunction, baseGameSpeedInMillis / gameSpeedPercentage);
}
// Register the main function to run when the page finishes loading.
window.onload = main;
