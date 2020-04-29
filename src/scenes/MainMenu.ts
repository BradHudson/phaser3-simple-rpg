import { SCENES } from '../constants/scenes';

export abstract class MainMenu extends Phaser.Scene {
    constructor() {
      super('MainMenu');
    }
  
    public update() {
    }
  
    protected init() {
        const title = this.add.text(100, 50, 'DragonStone', { fill: '#0f0', fontSize: 24 });
        const login = this.add.text(100, 100, 'Login', { fill: '#0f0' });
        login.setInteractive();
        login.on('pointerdown', () => { 
            this.scene.launch(SCENES.FIRST_LEVEL);
            this.scene.launch(SCENES.GAME_MANAGER);
            });

        const register = this.add.text(100, 150, 'Register', { fill: '#0f0' });
        register.setInteractive();
        register.on('pointerdown', () => { 
            title.destroy();
            login.destroy();
            register.destroy();
            this.scene.launch(SCENES.CHARACTER_SELECT);
            });
    }
}
