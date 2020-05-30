var Renderer = /** @class */ (function () {
    function Renderer() {
        this.canvas = document.getElementById('mainCanvas');
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = "FF0000";
        this.context.fillRect(0, 0, 150, 75);
    }
    return Renderer;
}());
new Renderer();
