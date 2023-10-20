import { Point } from "../point";

export class Wave {
  index: number;
  totalPoints: number;
  color: string;
  points: Point[];
  stageWidth!: number;
  stageHeight!: number;
  centerX!: number;
  centerY!: number;
  pointGap!: number;

  constructor(index: number, totalPoints: number, color: string) {
    this.index = index;
    this.totalPoints = totalPoints;
    this.color = color;
    this.points = [];
  }

  resize(stageWidth: number, stageHeight: number) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    this.centerX = stageWidth / 2;
    this.centerY = stageHeight - 60;

    this.pointGap = this.stageWidth / (this.totalPoints - 1);
    this.init();
  }

  init() {
    this.points = [];
    for (let i = 0; i < this.totalPoints; i++) {
      const point = new Point(
        this.index + i,
        Math.random() * 20,
        this.pointGap * i,
        this.centerY
      );
      this.points[i] = point;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;

    let prevX = this.points[0].x;
    let prevY = this.points[0].y;
    ctx.moveTo(prevX, prevY);
    for (let i = 0; i < this.totalPoints; i++) {
      if (i < this.totalPoints) {
        this.points[i].update();
      }
      const cx = (prevX + this.points[i].x) / 2;
      const cy = (prevY + this.points[i].y) / 2;

      ctx.quadraticCurveTo(prevX, prevY, cx, cy);

      prevX = this.points[i].x;
      prevY = this.points[i].y;
    }

    ctx.lineTo(prevX, prevY);
    ctx.lineTo(this.stageWidth, this.stageHeight);
    ctx.lineTo(this.points[0].x, this.stageHeight);
    ctx.fill();
    ctx.closePath();
  }
}
