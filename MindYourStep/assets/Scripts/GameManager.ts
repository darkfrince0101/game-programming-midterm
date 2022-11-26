import { _decorator, Component, Node, Prefab, CCInteger, instantiate, game, Vec3, Label, EventMouse } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public cubePrefab: Prefab | null = null;
    @property({ type: CCInteger })
    public roadLength: Number = 50;
    private _road: number[] = [];
    private _curState: GameState = GameState.GS_INIT;
    private _curPos: Vec3 = new Vec3();
    @property({ type: PlayerController })
    public playerCtrl: PlayerController = null;
    @property({ type: Node })
    public startMenu: Node = null;
    @property({ type: Label })
    public stepsLabelGame: Label | null = null;
    @property({ type: Node })
    public gameOverMenu: Node = null;
    @property({ type: Label })
    public stepsLabelOver: Label | null = null;

    start() {
        this.curState = GameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init() {
        if (this.gameOverMenu) {
            this.gameOverMenu.active = false;
        }

        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(this._curPos);
        }

        this.playerCtrl.reset();
    }

    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabelGame) {
                    this.stepsLabelGame.string = '0';
                }
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                this.gameOverMenu.active = true;
                this.stepsLabelOver.string = this.stepsLabelGame.string;
                this.stepsLabelGame.string = '';
                break;
        }
        this._curState = value;
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    onPlayAgainButtonClicked() {
        this.curState = GameState.GS_INIT;
    }

    generateRoad() {
        this.node.removeAllChildren();

        this._road = [];

        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this.roadLength; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.cubePrefab) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrefab);
                break;
        }
        return block;
    }

    checkResult(moveIndex: number) {
        if (moveIndex <= this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.curState = GameState.GS_END;
            }
        } else {
            this.curState = GameState.GS_END;
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        this.stepsLabelGame.string = '' + moveIndex;
        this.checkResult(moveIndex);
    }

    update(deltaTime: number) {
        
    }
}


