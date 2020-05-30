"use strict";
var CanvasRenderer = /** @class */ (function () {
    function CanvasRenderer(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
    }
    CanvasRenderer.prototype.render = function (game, cellSize, cellColor) {
        var _a;
        // Clear the canvas.
        this.context.fillStyle = Color.WHITE;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Set grid / cell colors.
        this.context.strokeStyle = Color.GREY;
        this.context.fillStyle = cellColor;
        // Render.
        var numHorizontalCells = Math.floor(this.canvas.width / cellSize);
        var numVerticalCells = Math.floor(this.canvas.height / cellSize);
        for (var row = 0; row < numVerticalCells; row++) {
            var y = row * cellSize;
            for (var column = 0; column < numHorizontalCells; column++) {
                var x = column * cellSize;
                if ((_a = game.cellAt(row, column)) === null || _a === void 0 ? void 0 : _a.isAlive()) {
                    this.context.fillRect(x, y, cellSize, cellSize);
                }
                this.context.strokeRect(x, y, cellSize, cellSize);
            }
        }
    };
    return CanvasRenderer;
}());
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
var Cell = /** @class */ (function () {
    function Cell(state) {
        this.state = state;
    }
    Cell.prototype.isAlive = function () {
        return this.state == CellState.ALIVE;
    };
    Cell.prototype.toggleState = function () {
        this.state = this.isAlive() ? CellState.DEAD : CellState.ALIVE;
    };
    return Cell;
}());
var Game = /** @class */ (function () {
    function Game(numHorizontalCells, numVerticalCells) {
        this.cells = [];
        for (var rowIdx = 0; rowIdx < numVerticalCells; rowIdx++) {
            var row = [];
            for (var columnIdx = 0; columnIdx < numHorizontalCells; columnIdx++) {
                row.push(new Cell(CellState.DEAD));
            }
            this.cells.push(row);
        }
    }
    Game.prototype.cellAt = function (row, column) {
        var _a;
        return (_a = this.cells[row]) === null || _a === void 0 ? void 0 : _a[column];
    };
    Game.prototype.toggleCellState = function (row, column) {
        var _a;
        var cell = (_a = this.cells[row]) === null || _a === void 0 ? void 0 : _a[column];
        if (cell) {
            cell.toggleState();
        }
        else { // falsey value evaluated - log the offender.
            console.error("The cell at row " + row + ", column " + column + " is " + cell + ".");
        }
    };
    return Game;
}());
function main() {
    var cellSize = 32;
    var canvas = document.getElementById('mainCanvas');
    // Adjust the canvas dimensions to be factors of 'cellSize'.
    canvas.width = window.innerWidth - (window.innerWidth % cellSize);
    canvas.height = window.innerHeight - (window.innerHeight % cellSize);
    var numHorizontalCells = canvas.width / cellSize;
    var numVerticalCells = canvas.height / cellSize;
    var game = new Game(numHorizontalCells, numVerticalCells);
    var renderer = new CanvasRenderer(canvas);
    // Register an event listener to toggle cell state upon mouse click.
    canvas.onclick = function (event) {
        var row = Math.floor(event.clientY / cellSize);
        var column = Math.floor(event.clientX / cellSize);
        game.toggleCellState(row, column);
        renderer.render(game, cellSize, Color.RED);
    };
    // Initial render.
    renderer.render(game, cellSize, Color.RED);
}
// Register the main function to run when the page finishes loading.
window.onload = main;
