import { Orientation } from '../geometry/orientation';
import { Player } from '../game-objects/Player';
import { Treant } from '../game-objects/Treant';
import { Monster } from '../game-objects/Monster';
import { Mole } from '../game-objects/Mole';
import { Npc } from '../game-objects/Npc';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { ASSETS } from '../constants/assets';
import { MONSTERS } from '../constants/monsters';

const CAMERA_LERP = 1;
const PLAYER_INITIAL_POSITION = {
  x: 50,
  y: 200,
};

interface InterSceneData {
  comesFrom: string;
}

export abstract class AbstractScene extends Phaser.Scene {
  public player: Player;
  public container: Phaser.GameObjects.Container;
  public cursors: CursorKeys;
  public npcs: Npc[];
  public monsters: Monster[];
  public map: Phaser.Tilemaps.Tilemap;
  public monsterGroup: Phaser.Physics.Arcade.Group;
  public layers: {
    terrain: Phaser.Tilemaps.StaticTilemapLayer;
    deco: Phaser.Tilemaps.StaticTilemapLayer;
    bridge: Phaser.Tilemaps.StaticTilemapLayer;
  };
  public mapKey: string;

  constructor(key: string, mapKey: string) {
    super(key);

    this.mapKey = mapKey;

    this.player = null;
    this.cursors = null;
    this.npcs = [];
    this.monsters = [];
    this.monsterGroup = null;
    this.map = null;
    this.layers = null;
  }

  public update() {
    const keyPressed = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      space: this.cursors.space.isDown,
      shift: this.cursors.shift.isDown,
    };

    this.monsters.map((monster: Monster) => monster.updateMonster());
    this.player.updatePlayer(keyPressed);
      if (this.cursors.down.isDown){
        this.container.body.velocity.y = 80;
        this.container.body.velocity.x = 0;
      } else if (this.cursors.up.isDown) {
        this.container.body.velocity.y = -80;
        this.container.body.velocity.x = 0;

      } else if (this.cursors.right.isDown) {
        this.container.body.velocity.x = 80;
        this.container.body.velocity.y = 0;

      } else if (this.cursors.left.isDown) {
        this.container.body.velocity.x = -80;
        this.container.body.velocity.y = 0;
      } else {
        this.container.body.velocity.x = 0;
        this.container.body.velocity.y = 0;
    }
  }

  protected init(data: InterSceneData) {
    this.createMapWithLayers();

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    const levelChangerObjectLayer = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.ZONES,
    );

    const playerInitialPosition = this.getPlayerInitialPosition(levelChangerObjectLayer, data);
    this.player = new Player(this, 0, 0);
    var sprite2 = this.add.sprite(2, 0, 'sword');
    sprite2.setScale(.3,.3);

    this.container = this.add.container(playerInitialPosition.x, playerInitialPosition.y);
    this.container.setSize(16, 16, true);
    this.container.add(this.player);
    this.container.add(sprite2);
    this.physics.world.enable(this.container);
    this.container.body.setVelocity(0).setCollideWorldBounds(true);

    

    const npcsMapObjects = this.map.objects.find(o => o.name === MAP_CONTENT_KEYS.objects.NPCS);
    const npcs: any = npcsMapObjects ? npcsMapObjects.objects : [];
    this.npcs = npcs.map(npc => {
      return new Npc(this, npc.x, npc.y, npc.properties.message);
    });

    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters: any = monstersMapObjects ? monstersMapObjects.objects : [];

    this.monsters = monsters.map(
      (monster: any): Monster => {
        switch (monster.name) {
          case MONSTERS.treant:
            return new Treant(this, monster.x, monster.y);
          case MONSTERS.mole:
            return new Mole(this, monster.x, monster.y);
          default:
        }
      },
    );

    if (levelChangerObjectLayer) {
      levelChangerObjectLayer.objects.map((o: any) => {
        const zone = this.add.zone(o.x, o.y, o.width, o.height);
        this.physics.add.existing(zone);
        this.physics.add.overlap(zone, this.container, () => {
          this.scene.start(o.properties.scene, { comesFrom: this.scene.key });
        });
      });
    }

    this.addColliders();

    this.initCamera();

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  private createMapWithLayers() {
    this.map = this.make.tilemap({ key: this.mapKey });
    const tileset = this.map.addTilesetImage(ASSETS.TILESET, ASSETS.IMAGES.TILES, 16, 16, 0, 0);

    this.layers = {
      terrain: this.map.createStaticLayer(MAP_CONTENT_KEYS.layers.BACKGROUND, tileset, 0, 0),
      deco: this.map.createStaticLayer(MAP_CONTENT_KEYS.layers.DECORATION, tileset, 0, 0),
      bridge: this.map.createStaticLayer(MAP_CONTENT_KEYS.layers.BRIDGE, tileset, 0, 0),
    };
    this.layers.terrain.setCollisionByProperty({ collides: true });
    this.layers.deco.setCollisionByProperty({ collides: true });
  }

  private addColliders() {
    this.monsterGroup = this.physics.add.group(this.monsters.map(monster => monster));
    this.physics.add.collider(this.monsterGroup, this.layers.terrain);
    this.physics.add.collider(this.monsterGroup, this.layers.deco);
    this.physics.add.collider(this.monsterGroup, this.container, (_: Player, m: Monster) => {
      m.attack();
    });

    this.physics.add.collider(this.container, this.layers.terrain);
    this.physics.add.collider(this.container, this.layers.deco);
    this.npcs.map((npc: Npc) => this.physics.add.collider(npc, this.container, npc.talk));
  }

  private getPlayerInitialPosition(
    levelChangerObjectLayer: Phaser.Tilemaps.ObjectLayer,
    data: InterSceneData,
  ): { x: number; y: number } {
    let playerX = PLAYER_INITIAL_POSITION.x;
    let playerY = PLAYER_INITIAL_POSITION.y;

    if (data && data.comesFrom) {
      const levelChanger: any = levelChangerObjectLayer.objects.find((o: any) => {
        return o.properties.scene === data.comesFrom;
      });

      // We shift the player position because we can't make him spawn on the
      // zone changer directly
      let xShift = 0;
      let yShift = 0;
      const SHIFT_VALUE = 50;
      switch (levelChanger.properties.comesBackFrom) {
        case Orientation.Right:
          xShift = SHIFT_VALUE;
          yShift = 0;
          break;
        case Orientation.Left:
          xShift = -SHIFT_VALUE;
          yShift = 0;
          break;
        case Orientation.Up:
          xShift = 0;
          yShift = -SHIFT_VALUE;
          break;
        case Orientation.Down:
          xShift = 0;
          yShift = SHIFT_VALUE;
          break;
        default:
          break;
      }

      playerX = levelChanger.x + levelChanger.width / 2 + xShift;
      playerY = levelChanger.y + levelChanger.height / 2 + yShift;
    }

    return { x: playerX, y: playerY };
  }

  private initCamera() {
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.container, true, CAMERA_LERP, CAMERA_LERP);
  }
}
