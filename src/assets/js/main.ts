import '../css/style.css';
import { getElement, createCanvas } from './utils';
import { shakeThreshold } from './constants';
import { DeviceMotionHandler } from './device-motion';
import { Camera } from './camera';
import { PhotoModal } from './photo-modal';

// DOM Elements
const video = getElement<HTMLVideoElement>('#video');
const start = getElement<HTMLButtonElement>('#start');
const deviceMotion = getElement<HTMLSpanElement>('#deviceMotion');
const capture = getElement<HTMLButtonElement>('#capture');
const modal = getElement<HTMLDialogElement>('#photoModal');
const capturedPhoto = getElement<HTMLImageElement>('#capturedPhoto');
const retakeButton = getElement<HTMLButtonElement>('#retakePhoto');
const debug = getElement<HTMLSpanElement>('#debug');

// Canvas Context
const ctx = (() => {
  const canvas = createCanvas(video.width, video.height);
  const context = canvas.getContext('2d');
  if (!context) {
    alert('キャンバスコンテキストの取得に失敗しました');
    throw new Error('Could not get canvas context');
  }
  return context;
})();

const camera = new Camera(video);
const photoModal = new PhotoModal(modal, capturedPhoto);
const deviceMotionHandler = new DeviceMotionHandler({
  onShake: totalAcceleration => {
    debug.textContent = `totalAcceleration: ${totalAcceleration.toFixed(5)}`;

    if (totalAcceleration > shakeThreshold) {
      const photoData = camera.capture(ctx);
      photoModal.show(photoData);
    }
  },
});

if (!deviceMotionHandler.isNeededPermission()) {
  deviceMotion.style.display = 'none';
}

start.addEventListener('click', async () => {
  const bool = await camera.start();
  if (bool) {
    start.style.display = 'none';
  }
});

deviceMotion.addEventListener('click', async () => {
  const bool = await deviceMotionHandler.requestPermission();
  if (bool) {
    deviceMotion.style.display = 'none';
  }
});

capture.addEventListener('click', () => {
  const photoData = camera.capture(ctx);

  photoModal.show(photoData);
  deviceMotionHandler.stopListening();
  camera.stop();
});

retakeButton.addEventListener('click', () => {
  photoModal.close();
  deviceMotionHandler.startListening();
  camera.start();
});
