import '../css/style.css';
import { getElement } from './utils';
import { shakeThreshold } from './constants';
import { DeviceMotionHandler } from './device-motion';
import { Camera } from './camera';
import { PhotoModal } from './PhotoModal';

// DOM Elements
const video = getElement<HTMLVideoElement>('#video');
const canvas = getElement<HTMLCanvasElement>('#canvas');
const start = getElement<HTMLButtonElement>('#start');
const capture = getElement<HTMLButtonElement>('#capture');
const modal = getElement<HTMLDialogElement>('#photoModal');
const capturedPhoto = getElement<HTMLImageElement>('#capturedPhoto');
const retakeButton = getElement<HTMLButtonElement>('#retakePhoto');
const debug = getElement<HTMLSpanElement>('#debug');

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

const camera = new Camera(video, start);
const photoModal = new PhotoModal(modal, capturedPhoto);
const deviceMotionHandler = new DeviceMotionHandler({
  onShake: totalAcceleration => {
    maxShake = Math.max(maxShake, totalAcceleration);

    debug.textContent = `maxShake: ${maxShake.toFixed(
      2
    )}, totalAcceleration: ${totalAcceleration.toFixed(2)}`;

    if (totalAcceleration > shakeThreshold) {
      const photoData = camera.capture(canvas, ctx);
      photoModal.show(photoData);
    }
  },
});

start.addEventListener('click', async () => {
  await camera.start();
  await deviceMotionHandler.requestPermission();
});

capture.addEventListener('click', () => {
  const photoData = camera.capture(canvas, ctx);

  if (photoData !== 'data:,') {
    photoModal.show(photoData);
    deviceMotionHandler.stopListening();
    camera.stop();
  }
});

retakeButton.addEventListener('click', () => {
  photoModal.close();
  deviceMotionHandler.startListening();
  camera.start();
});
