export class Camera {
  #videoElement: HTMLVideoElement;
  #trigger: HTMLButtonElement;

  constructor(videoElement: HTMLVideoElement, trigger: HTMLButtonElement) {
    this.#videoElement = videoElement;
    this.#trigger = trigger;
  }

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      this.#videoElement.srcObject = stream;
      this.#trigger.disabled = true;
      this.#trigger.style.display = 'none';
    } catch (error) {
      alert(
        'カメラの起動に失敗しました。カメラへのアクセスを許可してください。'
      );
    }
  }

  stop(): void {
    const stream = this.#videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }

  capture(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = this.#videoElement.videoWidth;
    canvas.height = this.#videoElement.videoHeight;
    ctx.drawImage(this.#videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
}
