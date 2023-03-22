import LayoutEnum from "../../enum/base/LayoutEnum";
import FontName from "../../enum/FontName";
import Global from "../../Global";
import SceneManager from "../../mode/base/SceneManager";
import SgsSoundManager from "../../mode/base/SgsSoundManager";
import WindowManager from "../../mode/base/WindowManager";
import GameManager from "../../mode/gameManager/GameManager";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import UIUtils from "../../utils/UIUtils";
import SceneBase from "../base/SceneBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsImage from "../controls/base/SgsImage";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import SgsFlatPanel from "../controls/SgsFlatPanel";
import PromptWindow from "../window/PromptWindow";
import MyDressItemUI from "./MyDressItemUI";

//我的搭配
export default class MyDressScene extends SceneBase
{
    private bg:SgsTexture;
    private notBg:SgsTexture;
    private notText:SgsText;
    private ruleBtn:SgsFlatButton;
    private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private dressBtn:SgsFlatButton;    
    private rankBtn:SgsFlatButton;
    private downBtn:SgsFlatButton;   
    private currencyBg:SgsTexture;
    private currencyTitle:SgsText;
    private currencyText:SgsText;
    private desc:SgsText;
    private panel:SgsFlatPanel;
    private panelBottomBg:SgsImage;

    constructor()
    {
        super();
        if (Global.AutoClearRes)
        {
            this.resNames = ["myDressScene"];
            let list = GameManager.GetInstance().MyCollocationList;
            if (list && list.length > 0)//已有装扮:删除无装扮资源加载
                RES.DelGroupKeys("myDressScene",["myDressSceneNot_image"]);
        }
        this.addDrawClick();
    }

    protected createChildren():void
    {
        super.createChildren();

        this.bg = new SgsTexture(RES.GetRes("myDressSceneBg_image"));
        this.addDrawChild(this.bg);

        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0,36);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK,this,this.onRuleHandler);
        this.addDrawChild(this.ruleBtn);

        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(552,36);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK,this,this.onHomeHandler);
        this.addDrawChild(this.homeBtn);

        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(652,36);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK,this,this.onSoundHandler);
        this.addDrawChild(this.soundBtn);

        this.dressBtn = new SgsFlatButton();
        this.dressBtn.InitSkin("baseDressBtn");
        this.dressBtn.on(Laya.Event.CLICK,this,this.onDressHandler);
        this.addDrawChild(this.dressBtn);

        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK,this,this.onRankHandler);
        this.addDrawChild(this.rankBtn);

        this.downBtn = new SgsFlatButton();
        this.downBtn.InitSkin("baseDownBtn1");
        this.downBtn.on(Laya.Event.CLICK,this,this.onDownLoadHandler);
        this.addDrawChild(this.downBtn);

        this.currencyBg = new SgsTexture(RES.GetRes("baseCurrencyBg"));
        this.currencyBg.pos(439,75);
        this.addDrawChild(this.currencyBg);

        this.currencyTitle = new SgsText();
        this.currencyTitle.font = FontName.HEITI;
        this.currencyTitle.color = "#9da093";
        this.currencyTitle.fontSize = 30;
        this.currencyTitle.text = "我的桃气值：";
        this.currencyTitle.pos(this.currencyBg.x - this.currencyTitle.width + 10,this.currencyBg.y + 22);
        this.addDrawChild(this.currencyTitle);

        this.currencyText = new SgsText();
        this.currencyText.pos(this.currencyBg.x,this.currencyBg.y);
        this.currencyText.size(this.currencyBg.width,this.currencyBg.height);
        this.currencyText.font = FontName.HEITI;
        this.currencyText.color = "#ffffff";
        this.currencyText.fontSize = 26;
        this.currencyText.align = "center";
        this.currencyText.valign = "middle";
        this.currencyText.bold = true;
        this.addDrawChild(this.currencyText);

        this.desc = new SgsText();
        this.desc.width = SystemContext.gameWidth;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#B0B4B0";
        this.desc.fontSize = 22;
        this.desc.align = "center";
        this.desc.text = "主人，您还没有参赛呢，快选一组作品上传吧~";
        this.desc.visible = false;
        this.addDrawChild(this.desc);

        this.panel = new SgsFlatPanel(MyDressItemUI,3,1);
        this.panel.SetLayout(LayoutEnum.TileLayout, 34, 15, 2);
        this.panel.width = 694 + 12;
        this.panel.pos(34, 167);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("blueVscroll");
        this.panel.on("scrollChange",this,this.onScrollChange);
        this.addChild(this.panel);

        this.panelBottomBg = new SgsImage();
        this.panelBottomBg.source = RES.GetRes("myDressBottomBg");
        this.panelBottomBg.visible = false;
        this.addChild(this.panelBottomBg);

        this.initView();
        this.onStageResize();
    }

    private initView():void
    {
        let manager = GameManager.GetInstance();
        let list = manager.MyCollocationList;
        if (!list || list.length <= 0)
        {
            this.showNotView();
        }
        else
        {
            this.panel.DataProvider = list;
        }
        this.updatePanelBottomBg();
        this.updateCurrency();
        this.desc.visible = list && list.length > 0 && !manager.Code ? true : false;

        manager.on(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.on(GameManager.COLLOCATION_JOIN_SUCC,this,this.onJoinSucc);
    }

    private onScoreChange():void
    {
        this.updateCurrency();
    }

    private onJoinSucc():void
    {
        let manager = GameManager.GetInstance();
        UIUtils.OpenPromptWin("","*主人，恭喜您已经成功参赛！<br/>您的作品编号为：" + manager.Code,100,null,null,PromptWindow.BTN_TYPE2);
        this.panel.DataProvider = manager.MyCollocationList;
        this.desc.visible = manager.Code ? true : false;
    }
    
    private updateCurrency():void
    {
        let score = GameManager.GetInstance().Score;
        this.currencyText.text = score + "";
        this.currencyText.fontSize = score < 100 ? 32 : 26;
    }

    private updatePanelBottomBg():void
    {
        this.panelBottomBg.visible = false;
        let self = this;
        Laya.timer.frameOnce(2,this,function(){
            if (self.destroyed) return;
            self.panelBottomBg.visible = self.panel.vScrollBar.max > 0 ? true : false;
        })
    }

    private showNotView():void//无数据UI
    {
        if (!this.notBg)
        {
            this.notBg = new SgsTexture(RES.GetRes("myDressSceneNot_image"));
            this.notBg.x = 53;
            this.addDrawChild(this.notBg);

            this.notText = new SgsText();
            this.notText.pos(this.notBg.x + 83,this.notBg.y + 155);
            this.notText.font = FontName.HEITI;
            this.notText.color = "#a2693f";
            this.notText.fontSize = 30;
            this.notText.leading = 20;
            this.notText.text = "呜呜呜，主人，\n您还没有给婉儿搭配任何一套衣服呢！ \n快去创作您心目里最美丽的造型吧~";
            this.addDrawChild(this.notText);

            this.onStageResize();
        }
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

    private onDressHandler():void
    {
        SceneManager.GetInstance().EnterScene("DressScene");
    }

    private onRankHandler():void
    {
        SceneManager.GetInstance().EnterScene("RankScene");
    }

    private onDownLoadHandler():void
    {
        Global.DownLoadGame();
    }

    private onScrollChange():void
    {
        let scrollBar = this.panel.vScrollBar;
        if (!scrollBar) return;
        this.panelBottomBg.visible = scrollBar.value < scrollBar.max;
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        UIUtils.BgAdaptation(this.bg);

        this.panel.height = SystemContext.gameHeight - this.panel.y - 345;
        this.panelBottomBg.y = this.panel.y + this.panel.height - 97;
        this.desc.y = SystemContext.gameHeight - 296;
        if (this.notBg)
        {
            this.notBg.y = 150 + (SystemContext.gameHeight - 150 - 260 - this.notBg.height + 100 >> 1); //173;
            this.notText.pos(this.notBg.x + 83,this.notBg.y + 155);
        }
        this.dressBtn.pos(77,SystemContext.gameHeight - 259);
        this.rankBtn.pos(291,SystemContext.gameHeight - 259);
        this.downBtn.pos(506,SystemContext.gameHeight - 259);
    }

    public destroy():void 
    {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.off(GameManager.COLLOCATION_JOIN_SUCC,this,this.onJoinSucc);
        manager = null;
        super.destroy();
    }
}