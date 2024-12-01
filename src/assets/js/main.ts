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
const meter = getElement<HTMLDivElement>('#meter');
const description = getElement<HTMLParagraphElement>('#description');

const video = createVideo();
videoWrapper.appendChild(video);

const canvas = createCanvas(video.width, video.height);
const ctx = getCanvasContext2D(canvas);

const photoModal = new PhotoModal(modal, capturedPhoto);

const camera = new Camera({
  videoElement: video,
  onCameraStart: () => {
    startCamera.remove();
  },
});
const meterOperator = new MeterOperator({
  limit: shakeThreshold,
  onUpdateValue: ({ ratio }) => {
    meter.style.setProperty('--meter', `${ratio}%`);
  },
  onBaseLineReached: () => {
    description.remove();
  },
  onLimitReached: () => {
    if (photoModal.isOpen()) {
      return;
    }
    const photoData = camera.capture(ctx);
    photoModal.show(photoData);
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
  const isGranted = await deviceMotionHandler.requestPermission();
  if (!isGranted) {
    deviceMotion.style.display = 'block';
  }
});

deviceMotion.addEventListener('click', () => {
  deviceMotionHandler.requestPermission();
});

recaptureButton.addEventListener('click', () => {
  photoModal.close();
  meterOperator.reset();
});
