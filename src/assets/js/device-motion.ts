declare const DeviceMotionEvent: {
  requestPermission?: () => Promise<PermissionState>;
};

export class DeviceMotionHandler {
  #onShake: (accelerationRatio: number) => void;
  #onPermissionGranted: () => void;

  constructor(params: {
    onShake: (accelerationRatio: number) => void;
    onPermissionGranted: () => void;
  }) {
    this.#onShake = params.onShake;
    this.#onPermissionGranted = params.onPermissionGranted;

    if (!this.isNeededPermission()) {
      this.#onPermissionGranted();
    }
  }

  isNeededPermission(): boolean {
    return typeof DeviceMotionEvent.requestPermission === 'function';
  }

  isFeatureSupported(): boolean {
    console.log(new DeviceMotionEvent('').acceleration);
    return 'DeviceMotionEvent' in window;
  }

  async requestPermission(): Promise<boolean> {
    if (!DeviceMotionEvent.requestPermission) return true;

    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        this.#onPermissionGranted();
        this.start();
      } else {
        alert('加速度センサーの許可が得られませんでした');
        console.warn('permissionState:', permissionState);
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  }

  start() {
    const handler = (event: DeviceMotionEvent) => {
      const { acceleration } = event;
      const x = acceleration?.x ?? 0;
      const y = acceleration?.y ?? 0;
      const z = acceleration?.z ?? 0;
      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      this.#onShake(totalAcceleration);
    };

    window.addEventListener(
      'devicemotion',
      event => {
        requestAnimationFrame(() => handler(event));
      },
      {
        passive: true,
      }
    );
  }
}
