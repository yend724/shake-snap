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
const start = getElement<HTMLButtonElement>('#start');
const deviceMotion = getElement<HTMLDivElement>('#deviceMotion');

const modal = getElement<HTMLDialogElement>('#photoModal');
const capturedPhoto = getElement<HTMLImageElement>('#capturedPhoto');
const retakeButton = getElement<HTMLButtonElement>('#retakePhoto');
const countUp = getElement<HTMLButtonElement>('#countUp');
const meter = getElement<HTMLDivElement>('#meter > div');

const video = createVideo();
videoWrapper.appendChild(video);

const canvas = createCanvas(video.width, video.height);
const ctx = getCanvasContext2D(canvas);

const camera = new Camera({
  videoElement: video,
  onCameraPlayStart: () => {
    start.remove();
    countUp.disabled = false;
  },
});
const photoModal = new PhotoModal(modal, capturedPhoto);
const meterOperator = new MeterOperator();

const deviceMotionHandler = new DeviceMotionHandler({
  shakeThreshold,
  onShake: accelerationRatio => {
    meterOperator.set(accelerationRatio);
    meter.style.setProperty('--meter', `${accelerationRatio}%`);
  },
  onReachShakeThreshold: accelerationRatio => {
    meterOperator.set(accelerationRatio);
    meter.style.setProperty('--meter', `${accelerationRatio}%`);
    const photoData = camera.capture(ctx);
    photoModal.show(photoData);
    camera.stop();
  },
  onPermissionGranted: () => {
    deviceMotion.remove();
  },
});

if (!deviceMotionHandler.isNeededPermission()) {
  deviceMotion.remove();
}

start.addEventListener('click', () => {
  camera.start();
});

deviceMotion.addEventListener('click', () => {
  deviceMotionHandler.requestPermission();
});

retakeButton.addEventListener('click', () => {
  photoModal.close();
  deviceMotionHandler.startListening();
  camera.start();
  meterOperator.reset();
});

countUp.addEventListener('click', () => {
  meterOperator.add(40);
  meter.style.setProperty('--meter', `${meterOperator.value}%`);
  if (meterOperator.value >= 100) {
    const photoData = camera.capture(ctx);
    photoModal.show(photoData);
    camera.stop();
  }
});
