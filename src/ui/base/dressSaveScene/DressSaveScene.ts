import FontName from "../../../enum/FontName";
import Global from "../../../Global";
import SceneManager from "../../../mode/base/SceneManager";
import SgsSoundManager from "../../../mode/base/SgsSoundManager";
import WindowManager from "../../../mode/base/WindowManager";
import RES from "../../../res/RES";
import SystemContext from "../../../SystemContext";
import UIUtils from "../../../utils/UIUtils";
import SgsFlatButton from "../../controls/base/SgsFlatButton";
import SgsSprite from "../../controls/base/SgsSprite";
import SgsText from "../../controls/base/SgsText";
import SgsTexture from "../../controls/base/SgsTexture";
import DressAvatar from "../../dressScene/DressAvatar";
import SceneBase from "../SceneBase";


//搭配保存场景
export default class DressSaveScene extends SceneBase
{
    private bg:SgsTexture;
    private light:SgsTexture;
    private dressAvatar:DressAvatar;
    private topSp:SgsSprite;
    private downBtn:SgsFlatButton;
    private ruleBtn:SgsFlatButton;
    private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private shareBtn:SgsFlatButton;    
    private saveBtn:SgsFlatButton;
    private myDressBtn:SgsFlatButton;    
    private rankBtn:SgsFlatButton;
    private dressBtn:SgsFlatButton;
    private desc:SgsText;

    constructor()
    {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["dressSaveScene"];
    }

    protected createChildren():void
    {
        super.createChildren();

        this.bg = new SgsTexture(RES.GetRes("dressSceneBg_image"));
        this.addDrawChild(this.bg);

        this.light = new SgsTexture(RES.GetRes("dressLight"));
        this.light.pos(134,374);
        this.addDrawChild(this.light);

        this.dressAvatar = new DressAvatar();
        this.dressAvatar.pos((SystemContext.gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72,102);
        this.dressAvatar.scale(0.72,0.72);
        this.addChild(this.dressAvatar);

        this.topSp = new SgsSprite();
        this.topSp.size(this.width,this.height);
        this.topSp.addDrawClick();
        this.addChild(this.topSp);

        this.downBtn = new SgsFlatButton();
        this.downBtn.pos(0,29);
        this.downBtn.InitSkin("baseDownBtn");
        this.downBtn.on(Laya.Event.CLICK,this,this.onDownLoadHandler);
        this.topSp.addDrawChild(this.downBtn);

        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0,133);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK,this,this.onRuleHandler);
        this.topSp.addDrawChild(this.ruleBtn);

        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(647,29);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK,this,this.onHomeHandler);
        this.topSp.addDrawChild(this.homeBtn);

        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(647,133);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK,this,this.onSoundHandler);
        this.topSp.addDrawChild(this.soundBtn);

        this.shareBtn = new SgsFlatButton();
        this.shareBtn.pos(647,237);
        this.shareBtn.InitSkin("baseShareBtn");
        this.shareBtn.on(Laya.Event.CLICK,this,this.onShareHandler);
        this.topSp.addDrawChild(this.shareBtn);

        this.saveBtn = new SgsFlatButton();
        this.saveBtn.pos(227,820);
        this.saveBtn.InitSkin("baseSaveBtn");
        this.saveBtn.on(Laya.Event.CLICK,this,this.onSaveHandler);
        this.topSp.addDrawChild(this.saveBtn);

        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK,this,this.onMyDressHandler);
        this.topSp.addDrawChild(this.myDressBtn);

        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK,this,this.onRankHandler);
        this.topSp.addDrawChild(this.rankBtn);

        this.dressBtn = new SgsFlatButton();
        this.dressBtn.InitSkin("baseDressBtn");
        this.dressBtn.on(Laya.Event.CLICK,this,this.onDressHandler);
        this.topSp.addDrawChild(this.dressBtn);

        this.desc = new SgsText();
        this.desc.pos(126,943);
        this.desc.width = SystemContext.gameWidth - 126 * 2;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#6A736F";
        this.desc.fontSize = 22;
        this.desc.leading = 10;
        // this.desc.align = "center";
        // this.desc.wordWrap = true;
        this.desc.text = "主人，点击按钮可将该搭配保存至您的手机相册哦\n同时，您可前往【我的搭配】中查看所有搭配记录。";
        this.addDrawChild(this.desc);

        if (this.sceneData)
            this.dressAvatar.UpdateAll(this.sceneData.skin,this.sceneData.collocation);

        this.onStageResize();
    }

    private onDownLoadHandler():void
    {
        Global.DownLoadGame();
    }

    private onRuleHandler():void
    {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }

    private onHomeHandler():void
    {
        SceneManager.GetInstance().EnterScene("HomeScene");
    }

    private onSoundHandler():void
    {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }

    private onShareHandler():void
    {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }

    private onSaveHandler():void
    {
        if (this.sceneData)
            WindowManager.GetInstance().OpenWindow("SaveDressWindow",this.sceneData.skin,this.sceneData.collocation);
    }

    private onMyDressHandler():void
    {
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }

    private onRankHandler():void
    {
        SceneManager.GetInstance().EnterScene("RankScene");
    }

    private onDressHandler():void
    {
        SceneManager.GetInstance().EnterScene("DressScene");
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        UIUtils.BgAdaptation(this.bg);

        let startY:number = this.desc.y + this.desc.height;
        let centerY:number = SystemContext.gameHeight - startY - 232 >> 1;
        this.myDressBtn.pos(77,startY + centerY);//SystemContext.gameHeight - 259);
        this.rankBtn.pos(291,startY + centerY);//SystemContext.gameHeight - 259);
        this.dressBtn.pos(506,startY + centerY);//SystemContext.gameHeight - 259);
    }

    public destroy():void 
    {
        super.destroy();
    }
}