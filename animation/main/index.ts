import { Boat } from "../boat";
import { WaveGroup } from "../wave_group";

export class MainAnimation {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  waveGroup: WaveGroup;
  boat: Boat;
  stageWidth!: number;
  stageHeight!: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas!.getContext("2d")!;

    this.waveGroup = new WaveGroup(this.canvas!);
    this.boat = new Boat();

    this.resize();
    requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.stageWidth = this.canvas!.offsetWidth * 2;
    this.stageHeight = this.canvas!.offsetHeight * 2;

    this.canvas!.width = this.stageWidth;
    this.canvas!.height = this.stageHeight;
    this.waveGroup.resize(this.stageWidth, this.stageHeight);
    this.boat.resize(this.stageWidth * 0.3, this.stageHeight * 0.3);
  }

  animate() {
    this.ctx!.clearRect(0, 0, this.stageWidth, this.stageHeight);

    this.boat.draw(this.ctx!);
    this.waveGroup.draw(this.ctx!);

    requestAnimationFrame(this.animate.bind(this));
  }
}
