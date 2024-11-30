export class Meter {
  #meter = 0;
  #loopFlg = true;
  constructor() {
    this.#meter = 0;
    this.#loop();
  }
  get value() {
    return this.#meter;
  }
  add(value: number) {
    this.#meter += value;
    this.#meter = Math.min(100, this.#meter);
  }
  subtract(value: number) {
    this.#meter -= value;
    this.#meter = Math.max(0, this.#meter);
  }
  start() {
    this.#loopFlg = true;
    this.#loop();
  }
  stop() {
    this.#loopFlg = false;
  }
  reset() {
    this.#meter = 0;
  }

  #loop() {
    requestAnimationFrame(() => {
      console.log(this.#loopFlg, this.#meter);
      this.subtract(0.1);
      if (this.#loopFlg) {
        this.#loop();
      }
    });
  }
}
