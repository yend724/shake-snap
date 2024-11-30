export class Camera {
  private videoElement: HTMLVideoElement;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      this.videoElement.srcObject = stream;
    } catch (error) {
      alert(
        'カメラの起動に失敗しました。カメラへのアクセスを許可してください。'
      );
    }
  }

  capture(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
}
