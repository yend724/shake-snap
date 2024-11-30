export class Camera {
  #videoElement: HTMLVideoElement;
  #onCameraPlayStart: () => void;
  constructor(params: {
    videoElement: HTMLVideoElement;
    onCameraPlayStart: () => void;
  }) {
    this.#videoElement = params.videoElement;
    this.#onCameraPlayStart = params.onCameraPlayStart;
  }

  async start(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      this.#videoElement.srcObject = stream;
      this.#onCameraPlayStart();
      return true;
    } catch (error) {
      console.error(error);
      alert(
        'カメラの起動に失敗しました。カメラへのアクセスを許可してください。'
      );
    }
    return false;
  }

  stop(): void {
    const stream = this.#videoElement.srcObject as MediaStream;
    // stream.getTracks().forEach(track => track.stop());
    stream.getTracks().forEach(track => stream.removeTrack(track));
  }

  capture(ctx: CanvasRenderingContext2D): string {
    const canvas = ctx.canvas;
    canvas.width = this.#videoElement.videoWidth;
    canvas.height = this.#videoElement.videoHeight;
    ctx.drawImage(this.#videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
}
