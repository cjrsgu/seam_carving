interface PixelColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

class SeamCarving {
  private root: HTMLElement;

  private canvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private image: HTMLImageElement;

  private imageData: Uint8ClampedArray;

  constructor() {
    this.root = document.getElementById('root');
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.image = new Image();

    this.root.appendChild(this.canvas);
  }

  public init = (src: string): Promise<void> => new Promise((resolve: Function) => {
    this.image.onload = () => {
      this.canvas.height = this.image.height;
      this.canvas.width = this.image.width;

      this.context.drawImage(this.image, 0, 0);

      this.updateImageData();

      resolve();
    };

    this.image.src = src;
  });

  updateImageData = (): void => {
    this.imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    ).data;
  }

  transformCoordinates = (x: number, y: number): number => (
    (x + this.image.width * y) * 4
  )

  getPixel = (x: number, y: number): PixelColor => {
    const transformedCoordinates: number = this.transformCoordinates(x, y);

    const pixelColors: PixelColor = {
      red: this.imageData[transformedCoordinates],
      green: this.imageData[transformedCoordinates + 1],
      blue: this.imageData[transformedCoordinates + 2],
      alpha: this.imageData[transformedCoordinates + 3],
    };

    return pixelColors;
  }

  setPixel = (x: number, y: number, data: PixelColor) => {
    const imageData: ImageData = this.context.getImageData(x, y, 1, 1);

    imageData.data[0] = data.red;
    imageData.data[1] = data.green;
    imageData.data[2] = data.blue;
    imageData.data[3] = data.alpha;

    this.context.putImageData(imageData, x, y);
  }

  sobel = (): void => {
    const {
      height,
      width,
    }: {
      height: number,
      width: number,
    } = this.image;

    const kernelX: number[][] = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    const kernelY: number[][] = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    const sobelData: number[] = [];
    const grayscaleData: number[] = [];

    for (let y: number = 0; y < height; y += 1) {
      for (let x: number = 0; x < width; x += 1) {
        const pixel: PixelColor = this.getPixel(x, y);
        const avg: number = (pixel.red + pixel.green + pixel.blue) / 3;

        grayscaleData.push(avg, avg, avg, 255);
      }
    }

    // TODO: update cycles
    for (let y: number = 0; y < height; y += 1) {
      for (let x: number = 0; x < width; x += 1) {
        const pixelX: number = (
          (kernelX[0][0] * grayscaleData[this.transformCoordinates(x - 1, y - 1)])
          + (kernelX[0][1] * grayscaleData[this.transformCoordinates(x, y - 1)])
          + (kernelX[0][2] * grayscaleData[this.transformCoordinates(x + 1, y - 1)])
          + (kernelX[1][0] * grayscaleData[this.transformCoordinates(x - 1, y)])
          + (kernelX[1][1] * grayscaleData[this.transformCoordinates(x, y)])
          + (kernelX[1][2] * grayscaleData[this.transformCoordinates(x + 1, y)])
          + (kernelX[2][0] * grayscaleData[this.transformCoordinates(x - 1, y + 1)])
          + (kernelX[2][1] * grayscaleData[this.transformCoordinates(x, y + 1)])
          + (kernelX[2][2] * grayscaleData[this.transformCoordinates(x + 1, y + 1)])
        );

        const pixelY: number = (
          (kernelY[0][0] * grayscaleData[this.transformCoordinates(x - 1, y - 1)])
          + (kernelY[0][1] * grayscaleData[this.transformCoordinates(x, y - 1)])
          + (kernelY[0][2] * grayscaleData[this.transformCoordinates(x + 1, y - 1)])
          + (kernelY[1][0] * grayscaleData[this.transformCoordinates(x - 1, y)])
          + (kernelY[1][1] * grayscaleData[this.transformCoordinates(x, y)])
          + (kernelY[1][2] * grayscaleData[this.transformCoordinates(x + 1, y)])
          + (kernelY[2][0] * grayscaleData[this.transformCoordinates(x - 1, y + 1)])
          + (kernelY[2][1] * grayscaleData[this.transformCoordinates(x, y + 1)])
          + (kernelY[2][2] * grayscaleData[this.transformCoordinates(x + 1, y + 1)])
        );

        const magnitude: number = Math.abs(
          Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) / 1,
        );

        sobelData.push(magnitude, magnitude, magnitude, 255);
      }
    }

    const clampedArray: Uint8ClampedArray = new Uint8ClampedArray(sobelData);

    const imageData: ImageData = new ImageData(clampedArray, width, height);

    this.context.putImageData(imageData, 0, 0);
    this.updateImageData();
  }

  seamCarving = (): void => {
    const {
      height,
      width,
    }: {
      height: number,
      width: number,
    } = this.image;

    const powers: number[][] = [];

    for (let y: number = 0; y < height; y += 1) {
      powers[y] = [];
      for (let x: number = 0; x < width; x += 1) {
        const energy: number = this.getPixel(x, y).red;

        if (y === 0) {
          powers[y].push({ energy, color: this.getPixel(x, y).red });
        } else {
          let min: number;

          if (x === 0) {
            min = Math.min(powers[y - 1][x].energy, powers[y - 1][x + 1].energy);
          } else if (x === width - 1) {
            min = Math.min(powers[y - 1][x - 1].energy, powers[y - 1][x].energy);
          } else {
            min = Math.min(powers[y - 1][x - 1].energy, powers[y - 1][x].energy, powers[y - 1][x + 1].energy);
          }

          powers[y].push({energy: energy + min, color: this.getPixel(x, y).red });
        }
      }
    }

    let min: number;
    let index: number;

    for (let i: number = 0; i < 100; i += 1) {
      for (let y: number = height - 1; y > 0; y -= 1) {
        if (y === height - 1) {
          const array = powers[y].map(p => p.energy);
          min = Math.min(...array);
        } else {
          index = powers[y + 1].findIndex((power: number) => power.energy === min);

          // console.log(index);
          powers[y - 1].splice(index, 1);
          if (index === 0) {
            min = Math.min(powers[y][index].energy, powers[y][index + 1].energy);
          } else if (index === width - 1) {
            min = Math.min(powers[y][index - 1].energy, powers[y][index].energy);
          } else {
            min = Math.min(powers[y][index - 1].energy, powers[y][index].energy, powers[y][index + 1].energy);
          }
        }
      }
    }

    const im: number[] = [];
    for (let y: number = 0; y < height; y += 1) {
      for (let x: number = 0; x < powers[0].length; x += 1) {
        im.push(powers[y][x].color, powers[y][x].color, powers[y][x].color, 255);
      }
    }
    
    const clampedArray: Uint8ClampedArray = new Uint8ClampedArray(im);

    const imageData: ImageData = new ImageData(clampedArray, powers[0].length, height);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.putImageData(imageData, 0, 0);
    this.updateImageData();
  }
}

export default SeamCarving;
