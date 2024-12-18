export class PhotoModal {
  private modalElement: HTMLDialogElement;
  private photoElement: HTMLImageElement;

  constructor(modalElement: HTMLDialogElement, photoElement: HTMLImageElement) {
    this.modalElement = modalElement;
    this.photoElement = photoElement;
  }

  isOpen = (): boolean => {
    return this.modalElement.open;
  };

  show(photoData: string): void {
    this.photoElement.src = photoData;
    this.modalElement.showModal();
  }

  close(): void {
    this.modalElement.close();
  }
}
