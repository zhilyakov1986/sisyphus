import { Game } from './Game';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    document.body.appendChild(canvas);

    const game = new Game(canvas);
    game.start();
});
