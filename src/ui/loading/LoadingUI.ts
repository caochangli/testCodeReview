
import SystemContext from "./../../SystemContext";
import RES from "./../../res/RES";
import GameEventDispatcher from "./../../event/GameEventDispatcher";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsImage from "../controls/base/SgsImage";
import SgsSprite from "../controls/base/SgsSprite";
import SgsText from "../controls/base/SgsText";
import FontName from "../../enum/FontName";
/*
* name;
*/
export default class LoadingUI extends SgsSprite {
    protected modalBg: Laya.Sprite;
    protected contentSp: SgsSprite;
    protected circle: SgsImage;
    protected txt: SgsText;

    // private reloadBtn: SgsFlatButton;

    constructor() 
    {
        super();

        this.size(SystemContext.gameWidth,SystemContext.gameHeight);
        this.addDrawClick();
        this.initChilds();
    }

    private initChilds(): void 
    {
        this.contentSp = new SgsSprite();
        this.contentSp.visible = false;
        this.addChild(this.contentSp);

        this.modalBg = new Laya.Sprite();
        this.modalBg.alpha = 0.6;
        this.contentSp.addChild(this.modalBg);

        this.circle = new SgsImage();
        this.circle.pivot(37, 37);
        this.circle.pos(this.width / 2,this.height / 2);
        this.circle.source = RES.GetRes("loadingCircle");
        this.contentSp.addChild(this.circle);

        this.txt = new SgsText();
        this.txt.pos(this.width - this.txt.textWidth >> 1,this.circle.y + 50);
        this.txt.font = FontName.HEITI;
        this.txt.color = "#ffffff";
        this.txt.fontSize = 26;
        this.txt.text = "加载中，请等待...";
        this.contentSp.addDrawChild(this.txt);

        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onStageResize);
        this.onStageResize();
    }

    public Show(delay:number): void 
    {
        //按策划需求，延迟出现加载条
        Laya.timer.clearAll(this);
        this.contentSp.visible = false;
        if (delay <= 0) 
            this.playCircle();
        else 
            Laya.timer.once(delay, this, this.onDelayShow);
    }

    public Hide():void
    {
        Laya.timer.clearAll(this);
        this.removeSelf();
    }

    private playCircle(): void 
    {
        Laya.timer.loop(50, this, this.onLoop);
        this.contentSp.visible = true;
    }

    private onLoop(): void 
    {
        this.circle.rotation += 9;
    }

    public ShowProgress(curValue: number, maxValue: number): void 
    {
        //先定位到上次进度
    }

    public ShowError(errorMsg: string, winName: string = ""): void 
    {
        // this.winName = winName;
    }

    private onDelayShow(): void 
    {
        this.playCircle();
    }

    private onStageResize(event: Laya.Event = null):void 
    {
        this.size(SystemContext.gameWidth,SystemContext.gameHeight);
        this.modalBg.graphics.clear();
        this.modalBg.graphics.drawRect(0, 0,this.width,this.height, "#000000");
        this.circle.pos(this.width / 2,this.height / 2);
        this.txt.pos(this.width - this.txt.textWidth >> 1,this.circle.y + 50);
    }

    public destroy():void 
    {
        Laya.timer.clearAll(this);
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onStageResize);
        super.destroy();
    }
}