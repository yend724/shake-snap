export class MeterOperator {
  #value = 0;
  #limit = 0;
  #onUpdateValue: (value: number) => void;
  #onLimitReached: (value: number) => void;
  constructor(params: {
    limit: number;
    onUpdateValue: (value: number) => void;
    onLimitReached: (value: number) => void;
  }) {
    this.#value = 0;
    this.#limit = params.limit;
    this.#onLimitReached = params.onLimitReached;
    this.#onUpdateValue = params.onUpdateValue;
  }
  add(value: number) {
    this.#value += value;
    this.#value = Math.min(100, this.#value);
    this.#onUpdateValue(this.#value);
    if (this.#value === 100) {
      this.#onLimitReached(this.#value);
    }
  }
  set(value: number) {
    this.#value = Math.min(100, (value / this.#limit) * 100);
    this.#onUpdateValue(this.#value);
    if (this.#value === 100) {
      this.#onLimitReached(this.#value);
    }
  }
  reset() {
    this.#value = 0;
  }
}
