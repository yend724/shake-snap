import '../css/style.css';

// Types
declare const DeviceMotionEvent: {
  requestPermission?: () => Promise<PermissionState>;
};

// DOM Elements
const getElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) {
    alert(`要素 ${selector} が見つかりませんでした`);
    throw new Error(`Element ${selector} not found`);
  }
  return element;
};

const video = getElement<HTMLVideoElement>('#video');
const canvas = getElement<HTMLCanvasElement>('#canvas');
const start = getElement<HTMLButtonElement>('#start');
const capture = getElement<HTMLButtonElement>('#capture');
const debug = getElement<HTMLDivElement>('#debug');

const shakeThreshold = 15; // 加速度のしきい値

const ctx = (() => {
  const context = canvas.getContext('2d');
  if (!context) {
    alert('キャンバスコンテキストの取得に失敗しました');
    throw new Error('Could not get canvas context');
  }
  return context;
})();

const requestDeviceMotionPermission = async (): Promise<void> => {
  if (!DeviceMotionEvent?.requestPermission) return;

  try {
    const permissionState = await DeviceMotionEvent.requestPermission();
    if (permissionState === 'granted') {
      window.addEventListener('devicemotion', event => {
        // モーションイベントの処理をここに追加
        console.log(event);
        const { acceleration } = event;
        if (!acceleration) return;

        // nullチェックを追加
        const x = acceleration.x ?? 0;
        const y = acceleration.y ?? 0;
        const z = acceleration.z ?? 0;

        debug.textContent = JSON.stringify({ x, y, z }, null, 2);

        // 加速度の合計値を計算
        const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

        // しきい値を超えたら画像をキャプチャ
        if (totalAcceleration > shakeThreshold) {
          capturePhoto();
        }
      });
    } else {
      alert('加速度センサーの許可が得られませんでした');
    }
  } catch (error) {
    alert('デバイスモーション権限の取得に失敗しました');
  }
};

const startCamera = async (): Promise<void> => {
  try {
    requestDeviceMotionPermission();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });
    video.srcObject = stream;
  } catch (error) {
    alert('カメラの起動に失敗しました。カメラへのアクセスを許可してください。');
  }
};

const capturePhoto = (): void => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
};

// Event Listeners
start.addEventListener('click', startCamera);
capture.addEventListener('click', capturePhoto);
