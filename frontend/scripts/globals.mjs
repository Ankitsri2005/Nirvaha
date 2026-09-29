/**
 * jsdom bootstrap, loaded via `node --import ./scripts/globals.mjs` so the
 * globals exist *before* any static import is evaluated. Leaflet reads `window`
 * at module scope, so setting it inside the test body is too late.
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/dashboard',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
// bare identifiers in app code (`localStorage`, `location`) resolve against
// globalThis, not window, so they have to be re-exported explicitly
globalThis.localStorage = dom.window.localStorage
globalThis.sessionStorage = dom.window.sessionStorage
globalThis.location = dom.window.location
globalThis.history = dom.window.history
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// jsdom has no layout engine, so Leaflet's size probes return 0
globalThis.SVGElement = dom.window.SVGElement
const rect = { x: 0, y: 0, width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, toJSON() {} }
dom.window.HTMLElement.prototype.getBoundingClientRect = () => rect
Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetWidth', { get: () => 800, configurable: true })
Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetHeight', { get: () => 600, configurable: true })

/* jsdom implements these only (if at all) on window, and Recharts/Leaflet call
   the bare global names, so they have to be re-exported onto globalThis */
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
dom.window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = dom.window.ResizeObserver
for (const name of ['Element', 'HTMLElement', 'Node', 'Event', 'MouseEvent', 'CustomEvent', 'getComputedStyle', 'DOMParser']) {
  if (dom.window[name] && !globalThis[name]) globalThis[name] = dom.window[name]
}
globalThis.matchMedia = dom.window.matchMedia || ((q) => ({
  matches: false,
  media: q,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
}))

globalThis.__dom = dom
