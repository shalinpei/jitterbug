// Connects the HTML controls (slider, Play button, shape label) to the model.
// It knows nothing about Three.js: it just reports a slider value 0..1.

import { shapeName } from './jitterbug.js';

const CYCLE_SECONDS = 8; // one full open → collapsed → open loop

export function initUI({ onChange }) {
  const slider = document.getElementById('twist');
  const playButton = document.getElementById('play');
  const label = document.getElementById('shape-name');

  let playing = false;
  let phase = 0; // 0..1 position within the animation loop
  let lastTime = 0;

  function setValue(t) {
    slider.value = t;
    label.textContent = shapeName(t);
    onChange(t);
  }

  function setPlaying(on) {
    playing = on;
    playButton.textContent = on ? 'Pause' : 'Play';
    playButton.setAttribute('aria-pressed', String(on));
    if (on) {
      // Start the loop from wherever the slider currently is (on the "closing" half).
      phase = Math.acos(1 - 2 * Number(slider.value)) / (2 * Math.PI);
      lastTime = performance.now();
      requestAnimationFrame(step);
    }
  }

  function step(now) {
    if (!playing) return;
    phase = (phase + (now - lastTime) / 1000 / CYCLE_SECONDS) % 1;
    lastTime = now;
    // A cosine wave eases in and out at each end, like a real model slowing down.
    setValue((1 - Math.cos(phase * 2 * Math.PI)) / 2);
    requestAnimationFrame(step);
  }

  slider.addEventListener('input', () => {
    setPlaying(false); // grabbing the slider takes over from the animation
    setValue(Number(slider.value));
  });

  playButton.addEventListener('click', () => setPlaying(!playing));

  setValue(Number(slider.value));
}
