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
import SgsSpriteButton from "../controls/base/SgsSpriteButton";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import SgsFlatPanel from "../controls/SgsFlatPanel";
import PromptWindow from "../window/PromptWindow";
import RankItemUI from "./RankItemUI";


//排行榜场景
export default class RankScene extends SceneBase
{
    private bg:SgsTexture;
    // private notBg:SgsTexture;
    // private notText:SgsText;
    private ruleBtn:SgsFlatButton;
    private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private dressBtn:SgsFlatButton;    
    private myDressBtn:SgsFlatButton;
    private downBtn:SgsFlatButton;   
    private searchBg:SgsTexture;
    private currencyTitle:SgsText;
    private currencyBg:SgsTexture;
    private currencyText:SgsText;
    private desc:SgsText;
    private searchInput:Laya.TextInput;
    private searchClearBtn:SgsSpriteButton;
    private searchButton:SgsSpriteButton;
    private panel:SgsFlatPanel;
    private panelBottomBg:SgsImage;

    private isSearch:boolean = false;
    private operationTime:number = 0;

    constructor()
    {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["rankScene"];
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

        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK,this,this.onMyDressHandler);
        this.addDrawChild(this.myDressBtn);

        this.downBtn = new SgsFlatButton();
        this.downBtn.InitSkin("baseDownBtn1");
        this.downBtn.on(Laya.Event.CLICK,this,this.onDownLoadHandler);
        this.addDrawChild(this.downBtn);

        this.searchBg = new SgsTexture(RES.GetRes("baseSearchBg"));
        this.searchBg.pos(52,156);
        this.searchBg.size(645,52);
        this.searchBg.sizeGrid = "1,64,1,30";
        this.addDrawChild(this.searchBg);

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
        this.desc.x = 60;
        this.desc.width = SystemContext.gameWidth - 120;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#E5A7AE";
        this.desc.fontSize = 24;
        this.desc.leading = 10;
        // this.desc.align = "center";
        this.desc.wordWrap = true;
        this.addDrawChild(this.desc);

        this.searchInput = new Laya.TextInput();
        this.searchInput.pos(this.searchBg.x + 30,this.searchBg.y);
        this.searchInput.size(this.searchBg.width - 30 - 120,this.searchBg.height);
        this.searchInput.font = FontName.HEITI;
        this.searchInput.fontSize = 24;
        this.searchInput.color = "#C8BBA5";
        this.searchInput.promptColor = "#C8BBA5";
        this.searchInput.prompt = "主人，这里输入编号可快速查找到对应作品哦~";
        this.searchInput.on(Laya.Event.INPUT,this,this.onSearchChanage);
        // this.searchInput.on(Laya.Event.FOCUS,this,this.onSearchChanage);
        this.searchInput.on(Laya.Event.BLUR,this,this.onSearchChanage);
        this.searchInput.on(Laya.Event.ENTER,this,this.onSearchHandler);
        this.addChild(this.searchInput);

        this.searchClearBtn = new SgsSpriteButton();
        this.searchClearBtn.pos(this.searchBg.x + 543,this.searchBg.y + 16);
        this.searchClearBtn.InitSkin("baseSearchClearBtn");
        this.searchClearBtn.visible = false;
        this.searchClearBtn.on(Laya.Event.CLICK,this,this.onSearchClearHandler);
        this.addChild(this.searchClearBtn);

        this.searchButton = new SgsSpriteButton();
        this.searchButton.pos(this.searchBg.x + 583,this.searchBg.y);
        this.searchButton.size(62,52);
        this.searchButton.on(Laya.Event.CLICK,this,this.onSearchHandler);
        this.addChild(this.searchButton);

        this.panel = new SgsFlatPanel(RankItemUI,3,1);
        this.panel.SetLayout(LayoutEnum.TileLayout, 34, 15, 2);
        this.panel.width = 694 + 12;
        this.panel.pos(34,240);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("yellowVscroll");
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
        manager.on(GameManager.COLLOCATION_RANK,this,this.onRank);
        manager.on(GameManager.COLLOCATION_RANK_SEARCH,this,this.onRankSearch);
        manager.on(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.on(GameManager.BACK_RANK_CHANGE,this,this.onBackRankChange);

        this.updateCurrency();
        manager.CollocationRank();
    }

    private onRank(data:any):void
    {
        if (!data) return;
        let manager = GameManager.GetInstance();
        let myRank = data.myRank;
        if (myRank)
        {
            if (!manager.CheckCollocation(myRank.skin,myRank.collocation))//数据异常
                myRank.collocation = null;
            this.updateDesc(myRank.code,myRank.rank);
        }
        let rank:Array<any> = data.rank;
        if (rank && rank.length > 0 && rank[0].code)
        {
            //自己作品置顶
            let list:Array<any> = [];
            let isContainSelf:boolean = false;
            rank.forEach(element => {
                if (!manager.CheckCollocation(element.skin,element.collocation))//数据异常
                    element.collocation = null;
                if (element.is_self)//自己作品
                {
                    isContainSelf = true;
                    list.unshift(element);
                }
                else
                {
                    list.push(element);
                }
            });
            if (!isContainSelf)//自己未进排行榜
            {
                if (myRank)
                    list.unshift(myRank);
            }
            this.panel.DataProvider = list;
        }
        else
        {
            this.panel.DataProvider = null;
        }
        this.updatePanelBottomBg();     
    }

    private onRankSearch(data:any):void
    {
        if (!data) return;
        let rank:Array<any> = data.rank;
        if (rank && rank.length > 0 && rank[0].code)
        {
            this.isSearch = true;
            if (!GameManager.GetInstance().CheckCollocation(rank[0].skin,rank[0].collocation))//数据异常
                rank[0].collocation = null;
            this.panel.DataProvider = rank;
            if (rank[0].is_self)//自己作品
            {
                this.updateDesc(rank[0].code,rank[0].rank);
            }
        }
        else
        {
            // UIUtils.OpenPromptWin("","没有该编号的作品",100,null,null,PromptWindow.BTN_TYPE2);
            UIUtils.ShowTextPrompt("没有该编号的作品");
        }
    }

    private onScoreChange():void
    {
        this.updateCurrency();
    }

    private onBackRankChange():void
    {
        if (this.isSearch)//搜索状态
        {
            let dataProvider = this.panel.DataProvider;
            if (dataProvider && dataProvider.length > 0)
                GameManager.GetInstance().CollocationRankSearch(dataProvider[0].code);
        }
        else
        {
            GameManager.GetInstance().CollocationRank();
        }
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

    private updateDesc(code:string,rank:number):void
    {
        if (!rank)
        {
            this.desc.text = "主人，您的参赛作品-" + code + ",暂未上榜 快邀请您的好友，为您助力投票吧~";
        }
        else
        {
            if (rank >= 1 && rank <= 99)
                this.desc.text = "恭喜主人，您的参赛作品-" + code + ",目前排名：" + rank + "，快邀请您的好友，为您投票助力获得更高的排行吧~";
            else
                this.desc.text = "主人，您的参赛作品-" + code + ",目前排名：" + rank + "，暂未上榜 快邀请您的好友，为您助力投票吧~";
        }
    }

    // private showNotView():void//无数据UI
    // {
    //     if (!this.notBg)
    //     {
    //         this.notBg = new SgsTexture(RES.GetRes("myDressSceneNot_image"));
    //         this.notBg.pos(53,173);
    //         this.addDrawChild(this.notBg);

    //         this.notText = new SgsText();
    //         this.notText.pos(this.notBg.x + 83,this.notBg.y + 155);
    //         this.notText.font = FontName.HEITI;
    //         this.notText.color = "#a2693f";
    //         this.notText.fontSize = 30;
    //         this.notText.leading = 20;
    //         this.notText.text = "呜呜呜，主人，\n您还没有给婉儿搭配任何一套衣服呢！ \n快去创作您心目里最美丽的造型吧~";
    //         this.addDrawChild(this.notText);
    //     }
    // }

    private onSearchClearHandler():void
    {
        let curTime:number = Laya.Browser.now();
        if (curTime - this.operationTime < Global.OperationFastTime)
            return;
        this.operationTime = curTime;
        this.searchInput.text = "";
        this.searchClearBtn.visible = this.searchInput.text ? true : false;
        if (this.isSearch)
            GameManager.GetInstance().CollocationRank();
        this.isSearch = false;
    }

    private onSearchChanage():void
    {
        this.searchClearBtn.visible = this.searchInput.text ? true : false;
    }

    private onSearchHandler():void
    {
        if (!this.searchInput.text) 
        {
            UIUtils.OpenPromptWin("","请先输入编号",100,null,null,PromptWindow.BTN_TYPE2);
            return;
        }
        let curTime:number = Laya.Browser.now();
        if (curTime - this.operationTime < Global.OperationFastTime)
            return;
        this.operationTime = curTime;
        GameManager.GetInstance().CollocationRankSearch(this.searchInput.text);
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

    private onMyDressHandler():void
    {
        SceneManager.GetInstance().EnterScene("MyDressScene");
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

        this.panel.height = SystemContext.gameHeight - this.panel.y - 356;
        this.panelBottomBg.y = this.panel.y + this.panel.height - 97;
        this.desc.y = SystemContext.gameHeight - 318;
        this.dressBtn.pos(77,SystemContext.gameHeight - 259);
        this.myDressBtn.pos(291,SystemContext.gameHeight - 259);
        this.downBtn.pos(506,SystemContext.gameHeight - 259);
    }

    public destroy():void 
    {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.COLLOCATION_RANK,this,this.onRank);
        manager.off(GameManager.COLLOCATION_RANK_SEARCH,this,this.onRankSearch);
        manager.off(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.off(GameManager.BACK_RANK_CHANGE,this,this.onBackRankChange);
        manager = null;
        super.destroy();
    }
}