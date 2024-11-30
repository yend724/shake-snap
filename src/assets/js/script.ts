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

// Canvas Context
const ctx = (() => {
  const context = canvas.getContext('2d');
  if (!context) {
    alert('キャンバスコンテキストの取得に失敗しました');
    throw new Error('Could not get canvas context');
  }
  return context;
})();

// Device Motion Permission
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
        const { x, y, z } = acceleration;

        debug.textContent = JSON.stringify({ x, y, z }, null, 2);
      });
    } else {
      alert('加速度センサーの許可が得られませんでした');
    }
  } catch (error) {
    alert('デバイスモーション権限の取得に失敗しました');
  }
};

// Camera Functions
const startCamera = async (): Promise<void> => {
  try {
    requestDeviceMotionPermission();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
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
