import {
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
} from "@angular/core";

@Component({
  selector: "app-root",
  host: {
    '(window:mouseup)': 'onMouseUp($event)',
    '(window:resize)': 'onResize()',
  },
  template: `
    <div class="h-screen bg-white relative">
      <div class="absolute top-0 right-0 m-4 p-2 px-3 text-white rounded gap-3 grid *:p-4 *:py-2 *:cursor-pointer">
        <button class="bg-black rounded" (click)="usePencil('black')">Black</button>
        <button class="bg-red-500  rounded" (click)="usePencil('red')">Red</button>
        <button class="bg-blue-700  rounded" (click)="usePencil('blue')">Blue</button>
        <button class="ring-1 ring-inset ring-gray-800 text-black rounded" (click)="useEraser()">Erase</button>
      </div>
      <canvas
        #canvas
        class="cursor-crosshair" 
        [width]="canvasWidth()" 
        [height]="canvasHeight()"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
      >
      </canvas>
    </div>
  `,
})
export class AppComponent {
  clientWidth = () => document.documentElement.clientWidth - 10;
  clientHeight = () => document.documentElement.clientHeight - 10;

  canvasWidth = signal(this.clientWidth());
  canvasHeight = signal(this.clientHeight());

  x = signal(0);
  y = signal(0);
  isDrawing = signal(false);

  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  rect = computed(() => this.canvas().nativeElement.getBoundingClientRect());
  context = computed<CanvasRenderingContext2D>(
    () => this.canvas().nativeElement.getContext("2d")!
  );

  pencilColor = signal<PencilColor>("black");
  pencilSize = signal(1);

  imageData?: ImageData;

  onResize() {
    this.canvasWidth.set(this.clientWidth());
    this.canvasHeight.set(this.clientHeight());
  }

  onMouseDown(event: MouseEvent) {
    this.x.set(event.clientX - this.rect().left);
    this.y.set(event.clientY - this.rect().top);
    this.isDrawing.set(true);
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDrawing()) {
      const ctx = this.context();
      ctx.lineWidth = this.pencilSize();
      ctx.lineCap = "round";
      ctx.strokeStyle = this.pencilColor();

      this.drawLine(
        ctx,
        this.x(),
        this.y(),
        e.clientX - this.rect().left,
        e.clientY - this.rect().top
      );

      this.x.set(e.clientX - this.rect().left);
      this.y.set(e.clientY - this.rect().top);
    }
  }

  onMouseUp(e: MouseEvent) {
    if (this.isDrawing()) {
      this.drawLine(
        this.context(),
        this.x(),
        this.y(),
        e.clientX - this.rect().left,
        e.clientY - this.rect().top
      );
      this.x.set(0);
      this.y.set(0);
      this.isDrawing.set(false);
    }
  }

  useEraser() {
    this.pencilColor.set('white')
    this.pencilSize.set(10);
  }

  usePencil(color: PencilColor) {
    this.pencilColor.set(color);
    this.pencilSize.set(1);
  }

  drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }
}
type PencilColor = "black" | "red" | "blue" | "white";
