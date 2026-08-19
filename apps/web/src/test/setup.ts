import '@testing-library/jest-dom/vitest'

// jsdom não implementa o canvas 2D; o Background usa canvas apenas como
// efeito visual opcional, então um stub mínimo evita ruído nos testes.
HTMLCanvasElement.prototype.getContext = (() => ({
  clearRect: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  setTransform: () => {},
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
