import { SCENES } from '../constants/scenes';

export abstract class CharacterSelect extends Phaser.Scene {
    constructor() {
      super('CharacterSelect');
    }
  
    public update() {
    }
  
    protected init() {
        this.add.text(50, 50, 'Select Your Character', { fill: '#0f0', fontSize: 24 });
        const elf = this.add.text(100, 100, 'Elf', { fill: '#0f0' });
        elf.setInteractive();
        elf.on('pointerdown', () => { 
            this.scene.launch(SCENES.FIRST_LEVEL);
            this.scene.launch(SCENES.GAME_MANAGER);
            });

        const human = this.add.text(100, 150, 'Human', { fill: '#0f0' });
        human.setInteractive();
        human.on('pointerdown', () => { 
            this.scene.launch(SCENES.FIRST_LEVEL);
            this.scene.launch(SCENES.GAME_MANAGER);
            });

        const dwarf = this.add.text(100, 200, 'Dwarf', { fill: '#0f0' });
        dwarf.setInteractive();
        dwarf.on('pointerdown', () => { 
            this.scene.launch(SCENES.FIRST_LEVEL);
            this.scene.launch(SCENES.GAME_MANAGER);
            });
    }
}
