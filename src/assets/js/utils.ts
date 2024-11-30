export const getElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) {
    alert(`要素 ${selector} が見つかりませんでした`);
    throw new Error(`Element ${selector} not found`);
  }
  return element;
};
