declare const DeviceMotionEvent: {
  requestPermission?: () => Promise<PermissionState>;
};

type Handler = (event: DeviceMotionEvent) => void;
export class DeviceMotionHandler {
  #onShake: (totalAcceleration: number) => void;
  #onReachShakeThreshold: (totalAcceleration: number) => void;

  constructor(params: {
    onShake: (totalAcceleration: number) => void;
    onReachShakeThreshold: (totalAcceleration: number) => void;
  }) {
    this.#onShake = params.onShake;
    this.#onReachShakeThreshold = params.onReachShakeThreshold;
  }

  isNeededPermission(): boolean {
    return typeof DeviceMotionEvent.requestPermission === 'function';
  }

  async requestPermission(): Promise<boolean> {
    if (!DeviceMotionEvent.requestPermission) return true;

    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        this.startListening();
        return true;
      } else {
        alert('加速度センサーの許可が得られませんでした');
      }
    } catch (error) {
      console.error(error);
      alert('デバイスモーション権限の取得に失敗しました');
    }
    return false;
  }

  startListening() {
    const handler = (event: DeviceMotionEvent) => {
      const { acceleration } = event;
      const x = acceleration?.x ?? 0;
      const y = acceleration?.y ?? 0;
      const z = acceleration?.z ?? 0;
      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

      if (totalAcceleration >= 100) {
        this.#onReachShakeThreshold(100);
        window.removeEventListener('devicemotion', handler);
      } else {
        this.#onShake(totalAcceleration);
      }
    };

    window.addEventListener('devicemotion', handler);
  }
}
