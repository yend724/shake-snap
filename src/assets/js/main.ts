import '../css/style.css';
import {
  getElement,
  createCanvas,
  getCanvasContext2D,
  createVideo,
} from './utils';
import { shakeThreshold } from './constants';
import { DeviceMotionHandler } from './device-motion';
import { Camera } from './camera';
import { PhotoModal } from './photo-modal';
import { MeterOperator } from './meter';

// DOM Elements
const videoWrapper = getElement<HTMLDivElement>('#videoWrapper');
const startCamera = getElement<HTMLButtonElement>('#startCamera');
const deviceMotion = getElement<HTMLButtonElement>('#deviceMotion');
const modal = getElement<HTMLDialogElement>('#photoModal');
const capturedPhoto = getElement<HTMLImageElement>('#capturedPhoto');
const recaptureButton = getElement<HTMLButtonElement>('#recapturePhoto');
const store = getElement<HTMLButtonElement>('#store');
const meter = getElement<HTMLDivElement>('#meter');

const video = createVideo();
videoWrapper.appendChild(video);

const canvas = createCanvas(video.width, video.height);
const ctx = getCanvasContext2D(canvas);

const camera = new Camera({
  videoElement: video,
  onCameraStart: () => {
    startCamera.remove();
    store.disabled = false;
  },
});
const photoModal = new PhotoModal(modal, capturedPhoto);
const meterOperator = new MeterOperator({
  limit: shakeThreshold,
  onUpdateValue: value => {
    meter.style.setProperty('--meter', `${value}%`);
  },
  onLimitReached: () => {
    const photoData = camera.capture(ctx);
    photoModal.show(photoData);
    camera.stop();
  },
});

const deviceMotionHandler = new DeviceMotionHandler({
  onShake: totalAcceleration => {
    meterOperator.set(totalAcceleration);
  },
  onPermissionGranted: () => {
    deviceMotion.remove();
  },
});

startCamera.addEventListener('click', async () => {
  await camera.start();
  await deviceMotionHandler.requestPermission();
});

deviceMotion.addEventListener('click', () => {
  deviceMotionHandler.requestPermission();
});

recaptureButton.addEventListener('click', () => {
  photoModal.close();
  deviceMotionHandler.startListening();
  camera.start();
  meterOperator.reset();
});

store.addEventListener('click', () => {
  meterOperator.add(40);
});
