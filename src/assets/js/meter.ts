export class Meter {
  #meter = 0;

  constructor() {
    this.#meter = 0;
  }
  get value() {
    return this.#meter;
  }
  add(value: number) {
    this.#meter += value;
    this.#meter = Math.min(100, this.#meter);
  }
  set(value: number) {
    this.#meter = value;
    this.#meter = Math.min(100, this.#meter);
  }
  reset() {
    this.#meter = 0;
  }
}
