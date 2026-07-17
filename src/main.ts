import './styles.css';
import { startGameApp } from './game/core/app';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Root #app not found');
}

startGameApp(root).catch((error: unknown) => {
  console.error('Application boot failed', error);
});
