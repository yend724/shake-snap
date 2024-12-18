export class MeterOperator {
  #value = 0;
  #limit = 0;
  #ratio = 0;
  #onUpdateValue: ({ value, ratio }: { value: number; ratio: number }) => void;
  #onBaseLineReached: () => void;
  #onLimitReached: () => void;
  constructor(params: {
    limit: number;
    onUpdateValue: ({ value, ratio }: { value: number; ratio: number }) => void;
    onBaseLineReached: () => void;
    onLimitReached: () => void;
  }) {
    this.#value = 0;
    this.#limit = params.limit;
    this.#onLimitReached = params.onLimitReached;
    this.#onUpdateValue = params.onUpdateValue;
    this.#onBaseLineReached = params.onBaseLineReached;
  }

  set(value: number) {
    this.#value = Math.min(value, this.#limit);
    this.#ratio = Math.min((value / this.#limit) * 100, 100);

    this.#onUpdateValue({
      value: this.#value,
      ratio: this.#ratio,
    });

    if (this.#ratio >= 30) {
      this.#onBaseLineReached();
    }

    if (this.#ratio >= 100) {
      this.#onLimitReached();
    }
  }

  reset() {
    this.#value = 0;
  }
}
