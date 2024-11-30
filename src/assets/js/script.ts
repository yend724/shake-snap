import '../css/style.css';

declare const DeviceMotionEvent: {
  requestPermission: () => Promise<PermissionState>;
};

// Utility Functions
const getElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) {
    alert(`要素 ${selector} が見つかりませんでした`);
    throw new Error(`Element ${selector} not found`);
  }
  return element;
};

// Constants
const shakeThreshold = 100; // 加速度のしきい値

// DOM Elements
const video = getElement<HTMLVideoElement>('#video');
const canvas = getElement<HTMLCanvasElement>('#canvas');
const start = getElement<HTMLButtonElement>('#start');
const capture = getElement<HTMLButtonElement>('#capture');
const debug = getElement<HTMLDivElement>('#debug');
const modal = getElement<HTMLDialogElement>('#photoModal');
const capturedPhoto = getElement<HTMLImageElement>('#capturedPhoto');
const saveButton = getElement<HTMLButtonElement>('#savePhoto');
const retakeButton = getElement<HTMLButtonElement>('#retakePhoto');
const maxShakeDisplay = getElement<HTMLSpanElement>('#maxShake');

let maxShake = 0;

// Canvas Context
const ctx = (() => {
  const context = canvas.getContext('2d');
  if (!context) {
    alert('キャンバスコンテキストの取得に失敗しました');
    throw new Error('Could not get canvas context');
  }
  return context;
})();

// DeviceMotion Module
class DeviceMotionHandler {
  private shakeCallback: () => void;

  constructor(shakeCallback: () => void) {
    this.shakeCallback = shakeCallback;
  }

  async requestPermission(): Promise<void> {
    if (!DeviceMotionEvent?.requestPermission) return;

    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        this.startListening();
      } else {
        alert('加速度センサーの許可が得られませんでした');
      }
    } catch (error) {
      alert('デバイスモーション権限の取得に失敗しました');
    }
  }

  private startListening(): void {
    window.addEventListener('devicemotion', event => {
      const { acceleration } = event;
      if (!acceleration) return;

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;

      debug.textContent = JSON.stringify({ x, y, z }, null, 2);

      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (totalAcceleration > shakeThreshold) {
        this.shakeCallback();
      }
      if (totalAcceleration > maxShake) {
        maxShake = totalAcceleration;
      }

      maxShakeDisplay.textContent = maxShake.toFixed(2);
    });
  }
}

// Camera Module
class Camera {
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

// Modal Module
class PhotoModal {
  private modalElement: HTMLDialogElement;
  private photoElement: HTMLImageElement;

  constructor(modalElement: HTMLDialogElement, photoElement: HTMLImageElement) {
    this.modalElement = modalElement;
    this.photoElement = photoElement;
  }

  show(photoData: string): void {
    this.photoElement.src = photoData;
    this.modalElement.showModal();
  }

  close(): void {
    this.modalElement.close();
  }

  save(photoData: string): void {
    const link = document.createElement('a');
    link.download = `shakesnap-${Date.now()}.png`;
    link.href = photoData;
    link.click();
    this.close();
  }
}

// Main Application Logic
const camera = new Camera(video);
const photoModal = new PhotoModal(modal, capturedPhoto);
const deviceMotionHandler = new DeviceMotionHandler(() => {
  const photoData = camera.capture(canvas, ctx);
  photoModal.show(photoData);
});

// Event Listeners
start.addEventListener('click', async () => {
  await camera.start();
  await deviceMotionHandler.requestPermission();
});

capture.addEventListener('click', () => {
  const photoData = camera.capture(canvas, ctx);
  photoModal.show(photoData);
});

saveButton.addEventListener('click', () => {
  const photoData = canvas.toDataURL('image/png');
  photoModal.save(photoData);
});

retakeButton.addEventListener('click', () => photoModal.close());

modal.addEventListener('click', (e: MouseEvent) => {
  if (e.target === modal) {
    photoModal.close();
  }
});
