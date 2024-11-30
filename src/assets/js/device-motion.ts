declare const DeviceMotionEvent: {
  requestPermission: () => Promise<PermissionState>;
};

type Handler = (event: DeviceMotionEvent) => void;
export class DeviceMotionHandler {
  #handlers: Handler[] = [];
  #onShake: (totalAcceleration: number) => void;
  constructor(params: { onShake: (totalAcceleration: number) => void }) {
    this.#onShake = params.onShake;
  }

  async requestPermission(): Promise<void> {
    if (!DeviceMotionEvent?.requestPermission) return;

    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        this.startListening();
      } else {
        alert('加速度センサーの許可が得られませんでした');
        console.log(permissionState);
      }
    } catch (error) {
      console.error(error);
      alert('デバイスモーション権限の取得に失敗しました');
    }
  }

  startListening() {
    const handler = (event: DeviceMotionEvent) => {
      const { acceleration } = event;
      if (!acceleration) return;

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;

      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

      requestAnimationFrame(() => {
        this.#onShake(totalAcceleration);
      });
    };
    window.addEventListener('devicemotion', handler);
    this.#handlers.push(handler);
  }

  stopListening() {
    this.#handlers.forEach(handler => {
      window.removeEventListener('devicemotion', handler);
    });
    this.#handlers = [];
  }
}
