import './style.css';
import './components/media-panel.js';
import './components/status-panel.js';
import './components/x-slideshow.js';

// Application entry point
console.log('Widget Hub Initialized');

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
