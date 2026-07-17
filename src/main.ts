import './style.css';
import { GameApp } from './game/GameApp';
import { MockPlatformAdapter } from './platform/MockPlatformAdapter';

const mount = document.querySelector<HTMLElement>('#app');

if (mount === null) {
  throw new Error('App mount node was not found');
}

const app = new GameApp(mount, new MockPlatformAdapter());

void app.start();
