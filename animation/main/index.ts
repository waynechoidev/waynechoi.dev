import { Boat } from "../boat";
import { WaveGroup } from "../wave_group";

export class MainAnimation {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  waveGroup: WaveGroup;
  boat: Boat;
  stageWidth!: number;
  stageHeight!: number;
  animationFrame?: number;
  stopped = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas!.getContext("2d")!;

    this.waveGroup = new WaveGroup(this.canvas!);
    this.boat = new Boat();

    this.resize();
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  resize() {
    this.stageWidth = this.canvas!.offsetWidth * 2;
    this.stageHeight = this.canvas!.offsetHeight * 2;

    this.canvas!.width = this.stageWidth;
    this.canvas!.height = this.stageHeight;
    this.waveGroup.resize(this.stageWidth, this.stageHeight);
    this.boat.resize(this.stageWidth * 0.3, this.stageHeight * 0.3);
  }

  animate = () => {
    if (this.stopped) return;
    this.ctx!.clearRect(0, 0, this.stageWidth, this.stageHeight);

    this.boat.draw(this.ctx!);
    this.waveGroup.draw(this.ctx!);

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  stop() {
    this.stopped = true;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}
