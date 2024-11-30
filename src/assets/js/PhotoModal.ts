export class PhotoModal {
  private modalElement: HTMLDialogElement;
  private photoElement: HTMLImageElement;

  constructor(modalElement: HTMLDialogElement, photoElement: HTMLImageElement) {
    this.modalElement = modalElement;
    this.photoElement = photoElement;
  }

  show(photoData: string): void {
    this.photoElement.src = photoData;
    this.modalElement.showModal();
  }

  close(): void {
    this.modalElement.close();
  }

  save(photoData: string): void {
    const link = document.createElement('a');
    link.download = `shakesnap-${Date.now()}.png`;
    link.href = photoData;
    link.click();
    this.close();
  }
}
