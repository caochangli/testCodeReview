import Global from "../../Global";
import SceneManager from "../../mode/base/SceneManager";
import SgsSoundManager from "../../mode/base/SgsSoundManager";
import WindowManager from "../../mode/base/WindowManager";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import UIUtils from "../../utils/UIUtils";
import SceneBase from "../base/SceneBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsTexture from "../controls/base/SgsTexture";

//首页
export default class HomeScene extends SceneBase
{
    private bg:SgsTexture;
    private title:SgsTexture;
    private desc:SgsTexture;
    // private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private startBtn:SgsFlatButton;
    private myDressBtn:SgsFlatButton;
    private shareBtn:SgsFlatButton;    
    private rankBtn:SgsFlatButton;    

    constructor()
    {
        super();
        
        if (Global.AutoClearRes)
            this.resNames = ["homeScene"];
        this.addDrawClick();
    }

    protected createChildren():void
    {
        super.createChildren();

        this.bg = new SgsTexture(RES.GetRes("homeSceneBg_image"));
        this.addDrawChild(this.bg);

        this.title = new SgsTexture(RES.GetRes("homeLogo"));
        this.title.pos(0,0);
        this.addDrawChild(this.title);

        this.desc = new SgsTexture(RES.GetRes("homeText"));
        this.desc.pos(58,790);
        this.addDrawChild(this.desc);

        this.startBtn = new SgsFlatButton();
        this.startBtn.InitSkin("homeStartBtn");
        this.startBtn.on(Laya.Event.CLICK,this,this.onStartHandler);
        this.addDrawChild(this.startBtn);

        // this.homeBtn = new SgsFlatButton();
        // this.homeBtn.pos(645,31);
        // this.homeBtn.InitSkin("baseHomeBtn");
        // this.addDrawChild(this.homeBtn);

        this.soundBtn = new SgsFlatButton();
        // this.soundBtn.pos(645,135);
        this.soundBtn.pos(645,31);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK,this,this.onSoundHandler);
        this.addDrawChild(this.soundBtn);

        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK,this,this.onMyDressHandler);
        this.addDrawChild(this.myDressBtn);

        this.shareBtn = new SgsFlatButton();
        this.shareBtn.InitSkin("baseShareBtn1");
        this.shareBtn.on(Laya.Event.CLICK,this,this.onShareHandler);
        this.addDrawChild(this.shareBtn);

        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK,this,this.onRankHandler);
        this.addDrawChild(this.rankBtn);

        this.onStageResize();
    }

    private onStartHandler():void
    {
        SceneManager.GetInstance().EnterScene("DressScene");
    }

    private onSoundHandler():void
    {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }

    private onMyDressHandler():void
    {
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }

    private onShareHandler():void
    {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }

    private onRankHandler():void
    {
        SceneManager.GetInstance().EnterScene("RankScene");
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        UIUtils.BgAdaptation(this.bg);
        this.desc.pos(58, SystemContext.gameHeight * 790 / SystemContext.designHeight);

        this.startBtn.pos(211,SystemContext.gameHeight - 91 - 265);
        this.myDressBtn.pos(77,SystemContext.gameHeight - 259);
        this.shareBtn.pos(291,SystemContext.gameHeight - 259);
        this.rankBtn.pos(506,SystemContext.gameHeight - 259);

        if (this.desc.y + this.desc.height + 20 >= this.startBtn.y)
            this.desc.y = this.startBtn.y - this.desc.height - 20;
    }
}