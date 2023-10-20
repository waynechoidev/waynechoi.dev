import { Wave } from "../wave";

export class WaveGroup {
  canvas: HTMLCanvasElement;
  totalWaves: number;
  totalPoints: number;
  color: string[];
  waves: Wave[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.totalWaves = 5;
    this.totalPoints = Math.round(canvas.offsetWidth * 0.03);

    this.color = [
      "rgba(0,230,230,0.2)",
      "rgba(0,199,235,0.2)",
      "rgba(0,146,199,0.2)",
      "rgba(0,87,158,0.2)",
      "rgba(0,72,130,0.2)",
    ];
    this.waves = [];
    for (let i = 0; i < this.totalWaves; i++) {
      const wave = new Wave(i, this.totalPoints, this.color[i]);
      this.waves[i] = wave;
    }
  }

  resize(stageWidth: number, stageHeight: number) {
    for (let i = 0; i < this.totalWaves; i++) {
      const wave = this.waves[i];
      wave.resize(stageWidth, stageHeight);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.totalWaves; i++) {
      const wave = this.waves[i];
      wave.draw(ctx);
    }
  }
}
