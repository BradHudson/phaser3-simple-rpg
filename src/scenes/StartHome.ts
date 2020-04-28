import { AbstractScene } from './AbstractScene';
import { SCENES } from '../constants/scenes';
import { MAPS } from '../constants/maps';

export class StartHome extends AbstractScene {
  constructor() {
    super(SCENES.START_HOME, MAPS.startHome.key);
  }
}
