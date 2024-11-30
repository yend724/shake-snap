export class MeterOperator {
  #value = 0;

  constructor() {
    this.#value = 0;
  }
  get value() {
    return this.#value;
  }
  add(value: number) {
    this.#value += value;
    this.#value = Math.min(100, this.#value);
  }
  set(value: number) {
    this.#value = value;
    this.#value = Math.min(100, this.#value);
  }
  reset() {
    this.#value = 0;
  }
}
