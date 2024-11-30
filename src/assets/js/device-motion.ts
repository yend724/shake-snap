interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission: () => Promise<PermissionState>;
}
export class DeviceMotionHandler {
  #onShake: (accelerationRatio: number) => void;
  #onPermissionGranted: () => void;

  constructor(params: {
    onShake: (accelerationRatio: number) => void;
    onPermissionGranted: () => void;
  }) {
    this.#onShake = params.onShake;
    this.#onPermissionGranted = params.onPermissionGranted;
  }

  #getRequestPermission() {
    const requestPermission = (
      DeviceMotionEvent as unknown as DeviceOrientationEventiOS
    ).requestPermission;
    const isRequestNeeded = typeof requestPermission === 'function';

    if (!isRequestNeeded) {
      return async () => 'granted' as const;
    }
    return requestPermission;
  }

  async requestPermission(): Promise<boolean> {
    const requestPermission = this.#getRequestPermission();

    try {
      const permissionState = await requestPermission();
      if (permissionState === 'granted') {
        this.#onPermissionGranted();
        this.#registerEventHandlers();
        return true;
      } else {
        alert('加速度センサーの許可が得られませんでした');
        console.warn('permissionState:', permissionState);
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  }

  #registerEventHandlers() {
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
