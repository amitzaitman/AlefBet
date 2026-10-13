import { mount } from 'svelte';
import './styles.css';
import App from './App.svelte';
import { lockPageZoom } from './lib/zoom-lock.js';

lockPageZoom(document);
mount(App, { target: /** @type {HTMLElement} */ (document.getElementById('app')) });
