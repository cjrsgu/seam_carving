const root: HTMLElement = document.getElementById('root');
const canvas: HTMLCanvasElement = document.createElement('canvas');

canvas.width = 600;
canvas.height = 600;

root.appendChild(canvas);

const context: CanvasRenderingContext2D = canvas.getContext('2d');

