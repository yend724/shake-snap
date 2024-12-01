import '../css/style.css';
import {
  getElement,
  createCanvas,
  getCanvasContext2D,
  createVideo,
} from './utils';
import { SHAKE_THRESHOLD } from './constants';
import { DeviceMotionHandler } from './device-motion';
import { Camera } from './camera';
import { PhotoModal } from './photo-modal';
import { MeterOperator } from './meter';

// DOM Elements
const videoWrapper = getElement<HTMLDivElement>('#video-wrapper');
const startCameraButton = getElement<HTMLButtonElement>('#start-camera');
const deviceMotionButton = getElement<HTMLButtonElement>(
  '#device-motion-button'
);
const modal = getElement<HTMLDialogElement>('#photo-modal');
const capturedPhoto = getElement<HTMLImageElement>('#captured-photo');
const recaptureButton = getElement<HTMLButtonElement>('#recapture-photo');
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
    startCameraButton.remove();
  },
});
const meterOperator = new MeterOperator({
  limit: SHAKE_THRESHOLD,
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
    deviceMotionButton.remove();
  },
  onTimeOut: isShaken => {
    if (!isShaken) {
      alert('お使いの端末はサポート対象外の可能性があります');
    }
  },
});

startCameraButton.addEventListener('click', async () => {
  await camera.start();
  const isGranted = await deviceMotionHandler.requestPermission();
  if (!isGranted) {
    deviceMotionButton.style.display = 'block';
  }
});

deviceMotionButton.addEventListener('click', () => {
  deviceMotionHandler.requestPermission();
});

recaptureButton.addEventListener('click', () => {
  photoModal.close();
  meterOperator.reset();
});
