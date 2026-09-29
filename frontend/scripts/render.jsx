/**
 * Full-app render check: mounts the real <App /> in jsdom and walks the demo
 * flow - role picker, the farmer sign-in gate, the dashboard, section tabs and
 * the QR share pass. Catches import cycles, missing hooks, and the gate letting
 * people through to a console that isn't built yet.
 *
 *   npm run test:render
 *
 * The DOM comes from scripts/globals.mjs, preloaded by node so Leaflet (which
 * reads window at module scope) can see it.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/App.jsx'
import { SESSION_KEY } from '../src/lib/session.js'

const dom = globalThis.__dom
const act = React.act

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`)
}

const text = () => document.body.textContent || ''

let currentRoot = null

const mount = async (session = null) => {
  if (currentRoot) {
    await act(async () => { currentRoot.unmount() })
    currentRoot = null
  }
  if (session) dom.window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else dom.window.localStorage.removeItem(SESSION_KEY)
  dom.window.history.replaceState({}, '', '/')
  const root = createRoot(document.getElementById('root'))
  currentRoot = root
  await act(async () => { root.render(React.createElement(App)) })
  await act(async () => { await new Promise((r) => setTimeout(r, 60)) })
  return root
}

const button = (label) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent.includes(label))

const click = async (el) => {
  await act(async () => { el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) })
  await act(async () => { await new Promise((r) => setTimeout(r, 30)) })
}

const setSelect = async (el, value) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  })
}

const setInput = async (el, value) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
}

/* ---------------- anonymous lands on the role picker ---------------- */
let root = await mount(null)

check('app mounts without crashing', text().length > 0, `${text().length} chars`)
check('login screen shown when signed out', text().includes('Sign in to continue'))
check('role picker present', Boolean(document.querySelector('select#role')))
check('sign out control hidden while signed out', !document.querySelector('button[title="Sign out"]'))

const options = [...document.querySelectorAll('select#role option')].map((o) => o.value)
check('picker offers farmer, transporter and buyer',
  ['farmer', 'transporter', 'buyer'].every((r) => options.includes(r)),
  options.join(', '))
check('no dashboard leaks before sign-in', !text().includes('CURRENT SHIPMENT'))
check('no role switcher in the gate', !document.querySelector('select[name="role"]'))

/* ---------------- transporter and buyer are gated off for now ---------------- */
await setSelect(document.querySelector('select#role'), 'transporter')
check('transporter flagged as not built yet', text().includes('not built yet'))
check('transporter submit disabled', document.querySelector('button[type="submit"]').disabled)
check('transporter cannot reach the dashboard', !text().includes('CURRENT SHIPMENT'))

await setSelect(document.querySelector('select#role'), 'buyer')
check('buyer flagged as not built yet', text().includes('not built yet'))
check('buyer submit disabled', document.querySelector('button[type="submit"]').disabled)

/* ---------------- farmer signs in ---------------- */
await setSelect(document.querySelector('select#role'), 'farmer')
check('farmer submit enabled', !document.querySelector('button[type="submit"]').disabled)

await setInput(document.querySelector('input#name'), 'Rajesh Patil')
const form = document.querySelector('form')
await act(async () => {
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
})
await act(async () => { await new Promise((r) => setTimeout(r, 600)) })

check('farmer reaches the dashboard', text().includes('CURRENT SHIPMENT'))
check('dashboard greets the signed-in user', text().includes('Good morning, Rajesh'))
check('signed-in name shown', text().includes('Rajesh Patil'))
check('role shown as FARMER', text().includes('FARMER'))
check('session persisted', Boolean(dom.window.localStorage.getItem(SESSION_KEY)),
  dom.window.localStorage.getItem(SESSION_KEY) || 'empty')
check('sign out control now present', Boolean(document.querySelector('button[title="Sign out"]')))
check('role picker is gone from the console', !document.querySelector('select#role'))
check('gate no longer renders', !text().includes('Sign in to continue'))
check('farmer can open the register form', text().includes('+ Batch'))
check('detail form not forced on arrival', !text().includes('Register Food Batch (Farmer)'))

/* ---------------- dashboard panels ---------------- */
check('condition panel present', text().includes('CONDITION'))
check('temperature history present', text().includes('TEMPERATURE HISTORY'))
check('food condition present', text().includes('FOOD CONDITION'))
check('active alerts present', text().includes('ACTIVE ALERTS'))
check('recent batches present', text().includes('RECENT BATCHES'))

/* ---------------- section tabs ---------------- */
await click(button('Live Map'))
check('live map view opens', Boolean(document.querySelector('.leaflet-container')))
check('map view shows the vehicle', text().includes('Live GPS Active'))

await click(button('Traceability'))
check('traceability view opens', text().includes('Cold Storage'))

await click(button('IoT Hardware'))
check('hardware view opens', text().includes('ESP32'))

await click(button('All Batches'))
check('batches view opens', text().includes('Batches & Inventory Directory'))

await click(button('Dashboard'))
check('dashboard tab returns home', text().includes('CURRENT SHIPMENT'))

/* ---------------- QR share pass ---------------- */
await click(button('Share QR'))
check('QR pass opens', text().includes('Batch QR & Share Pass'))
check('QR pass shows the batch id', text().includes('BATCH-MNG-9041'))
await click(button('Done'))
check('QR pass closes', !text().includes('Batch QR & Share Pass'))

/* ---------------- reload keeps the session ---------------- */
await act(async () => { currentRoot.unmount() })
currentRoot = null
dom.window.history.replaceState({}, '', '/')
currentRoot = createRoot(document.getElementById('root'))
await act(async () => { currentRoot.render(React.createElement(App)) })
await act(async () => { await new Promise((r) => setTimeout(r, 60)) })
check('reload stays signed in', text().includes('CURRENT SHIPMENT'))
check('reload skips the login screen', !text().includes('Sign in to continue'))

/* ---------------- sign out ---------------- */
const signOut = document.querySelector('button[title="Sign out"]')
await click(signOut)
check('sign out returns to the login screen', text().includes('Sign in to continue'))
check('sign out clears the session', !dom.window.localStorage.getItem(SESSION_KEY))
check('sign out hides the dashboard', !text().includes('CURRENT SHIPMENT'))

await act(async () => { root.unmount() })

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
