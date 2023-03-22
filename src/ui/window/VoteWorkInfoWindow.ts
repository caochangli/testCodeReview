import DressConfiger from "../../config/DressConfiger";
import FontName from "../../enum/FontName";
import Global from "../../Global";
import SceneManager from "../../mode/base/SceneManager";
import SgsSoundManager from "../../mode/base/SgsSoundManager";
import WindowManager from "../../mode/base/WindowManager";
import GameManager from "../../mode/gameManager/GameManager";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import UIUtils from "../../utils/UIUtils";
import WindowBase from "../base/WindowBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsImage from "../controls/base/SgsImage";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import DressAvatar from "../dressScene/DressAvatar";
import PromptWindow from "./PromptWindow";

//参赛作品详情窗口
export default class VoteWorkInfoWindow extends WindowBase
{
    private bg:SgsTexture;
    private backBtn:SgsFlatButton;
    private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private myDressBtn:SgsFlatButton;    
    private shareBtn:SgsFlatButton;   
    private rankBtn:SgsFlatButton;
    private currencyBg:SgsTexture;
    private currencyTitle:SgsText;
    private currencyText:SgsText;
    
    private avatarBg:SgsTexture;
    private rankFlag:SgsTexture;
    private decorateLeft:SgsTexture;
    private decorateRight:SgsTexture;
    private voteFlag:SgsImage;
    private voteBtn:SgsFlatButton;
    private codeTitle:SgsText;
    private codeText:SgsText;
    private taoqiTitle:SgsText;
    private taoqiText:SgsText;
    private desc:SgsText;
    private avatarSp:Laya.Sprite;
    private avatar:DressAvatar;

    private isMyDress:boolean = false;
    private isSelf:boolean = false;
    private code:string = "";
    private isVoteSucc:boolean = false;

    constructor()
    {
        super();
        
        this.modal = true;
        this.hideOtherView = true;
        this.addDrawClick();
    }

    public Open(modelType:number,dressIDs:Array<number>):void
	{
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames = ["dressPartTemp"];
        super.Open(modelType,dressIDs);
    }

    protected init():void
    {
        super.init();

        this.bg = new SgsTexture(RES.GetRes("myDressSceneBg_image"));
        this.addDrawChild(this.bg);

        this.backBtn = new SgsFlatButton();
        this.backBtn.pos(0,36);
        this.backBtn.InitSkin("baseBackBtn");
        this.backBtn.on(Laya.Event.CLICK,this,this.onBackHandler);
        this.addDrawChild(this.backBtn);

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

        this.currencyBg = new SgsTexture(RES.GetRes("baseCurrencyBg"));
        this.currencyBg.pos(439,75);
        this.addDrawChild(this.currencyBg);

        this.avatarBg = new SgsTexture(RES.GetRes("VoteWorkInfoAvatarBg_image"));
        this.addDrawChild(this.avatarBg);

        this.rankFlag = new SgsTexture(RES.GetRes("myDressRank1"));
        this.rankFlag.visible = false;
        this.addDrawChild(this.rankFlag);

        this.decorateLeft = new SgsTexture(RES.GetRes("myDressDecorateLeft"));
        this.decorateLeft.visible = false;
        this.addDrawChild(this.decorateLeft);

        this.decorateRight = new SgsTexture(RES.GetRes("myDressDecorateRight"));
        this.decorateRight.visible = false;
        this.addDrawChild(this.decorateRight);

        this.voteBtn = new SgsFlatButton();
        this.voteBtn.InitSkin("myDressSelfVoteBtn");
        this.voteBtn.visible = false;
        this.voteBtn.on(Laya.Event.CLICK,this,this.onVoteHandler);
        this.addDrawChild(this.voteBtn);

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

        this.codeTitle = new SgsText();
        this.codeTitle.font = FontName.HEITI;
        this.codeTitle.color = "#CBB07D";
        this.codeTitle.fontSize = 22;
        this.codeTitle.text = "参赛编号：";
        this.addDrawChild(this.codeTitle);

        this.codeText = new SgsText();
        this.codeText.font = FontName.HEITI;
        this.codeText.color = "#C09264";
        this.codeText.fontSize = 26;
        this.codeText.bold = true;
        this.addDrawChild(this.codeText);

        this.taoqiTitle = new SgsText();
        this.taoqiTitle.font = FontName.HEITI;
        this.taoqiTitle.color = "#CBB07D";
        this.taoqiTitle.fontSize = 22;
        this.taoqiTitle.text = "桃气值：";
        this.addDrawChild(this.taoqiTitle);

        this.taoqiText = new SgsText();
        this.taoqiText.font = FontName.HEITI;
        this.taoqiText.color = "#C09264";
        this.taoqiText.fontSize = 26;
        this.taoqiText.bold = true;
        this.addDrawChild(this.taoqiText);

        this.desc = new SgsText();
        this.desc.width = SystemContext.gameWidth - 74 * 2;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#E5A7AE";
        this.desc.fontSize = 24;
        this.desc.leading = 10;
        this.desc.wordWrap = true;
        this.addDrawChild(this.desc);

        this.avatarSp = new Laya.Sprite();
        this.avatarSp.size(404,618);
        this.avatarSp.scrollRect = new Laya.Rectangle(0,0,404,618);
        this.addChild(this.avatarSp);

        this.avatar = new DressAvatar();
        // this.avatar.pos(18, 104);
        // this.avatar.scale(0.78, 0.78);
        this.avatar.pos(28, 110);
        this.avatar.scale(0.73, 0.73);
        this.avatarSp.addChild(this.avatar);

        this.voteFlag = new SgsImage();
        this.voteFlag.source = RES.GetRes("myDressSelfWork");
        this.voteFlag.visible = false;
        this.addChild(this.voteFlag);

        this.onStageResize();
    }

    protected enterWindow(isMyDress:boolean,rankInfo:any = null):void
    {
        super.enterWindow();

        this.isMyDress = isMyDress;
        let manager = GameManager.GetInstance();
        if (isMyDress)//我的搭配界面跳转进来
        {
            this.isSelf = true;
            let info = manager.JoinCollocationInfo;
            if (info) this.avatar.UpdateAll(info.skin,info.collocation);
            this.code = manager.Code;
        }
        else if (rankInfo)
        {
            this.isSelf = rankInfo.is_self ? true : false;
            this.avatar.UpdateAll(rankInfo.skin,rankInfo.collocation);
            this.code = rankInfo.code;
            this.onRankInfo(rankInfo);
        }

        this.voteFlag.visible = this.isSelf;
        this.voteBtn.InitSkin(this.isSelf ? "myDressSelfVoteBtn" : "myDressOtherVoteBtn");
        this.voteBtn.visible = true;
        this.codeText.text = this.code;
        this.updateCurrency();
        
        manager.on(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.on(GameManager.COLLOCATION_RANK_INFO,this,this.onRankInfo);
        manager.on(GameManager.COLLOCATION_VOTE_SUCC,this,this.onVoteSucc);

        if (isMyDress && this.code)
            manager.CollocationRankInfo(this.code);

        this.layoutChangeUI();
    }

    private onScoreChange():void
    {
        this.updateCurrency();
    }

    private onRankInfo(data:any):void
    {
        if (data.code != this.code) return;
        this.taoqiText.text = data.score + "";
        this.desc.visible = this.isSelf;
        if (data.rank >= 1 && data.rank <= 3)//前三名
        {
            this.rankFlag.texture = RES.GetRes("myDressRank" + data.rank);
            this.rankFlag.visible = true;
            this.decorateLeft.visible = this.decorateRight.visible = false;
        }
        else
        {
            this.rankFlag.visible = false;
            this.decorateLeft.visible = this.decorateRight.visible = true;
        }
        
        if (this.desc.visible)
        {
            if (!data.rank)
            {
                this.desc.text = "主人，您的参赛作品-" + data.code + ",暂未上榜 快邀请您的好友，为您助力投票吧~";
            }
            else
            {
                if (data.rank >= 1 && data.rank <= 99)
                    this.desc.text = "恭喜主人，您的参赛作品-" + data.code + ",目前排名：" + data.rank + "，快邀请您的好友，为您投票助力获得更高的排行吧~";
                else
                    this.desc.text = "主人，您的参赛作品-" + data.code + ",目前排名：" + data.rank + "，暂未上榜 快邀请您的好友，为您助力投票吧~";
            }
        }
        this.layoutChangeUI();
    }

    private onVoteSucc(code:string):void
    {
        if (code != this.code) return;
        this.isVoteSucc = true;
        UIUtils.OpenPromptWin("","*主人，您已成功投出1票哦",100,Laya.Handler.create(this,this.onConfirmShare),null,PromptWindow.BTN_TYPE3);
        GameManager.GetInstance().CollocationRankInfo(this.code);
    }

    private updateCurrency():void
    {
        let score = GameManager.GetInstance().Score;
        this.currencyText.text = score + "";
        this.currencyText.fontSize = score < 100 ? 32 : 26;
    } 

    private onBackHandler():void
    {
        if (!this.isMyDress && this.isVoteSucc)//排行榜进来且投过票
        {
            GameManager.GetInstance().event(GameManager.BACK_RANK_CHANGE);
        }
        this.Close();
    }

    private onHomeHandler():void
    {
        this.Close();
        SceneManager.GetInstance().EnterScene("HomeScene");
    }

    private onSoundHandler():void
    {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }

    private onMyDressHandler():void
    {
        this.Close();
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }

    private onShareHandler():void
    {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }

    private onRankHandler():void
    {
        if (!this.isMyDress && this.isVoteSucc)//排行榜进来且投过票
        {
            GameManager.GetInstance().event(GameManager.BACK_RANK_CHANGE);
        }
        this.Close();
        SceneManager.GetInstance().EnterScene("RankScene");
    }

    private saveTime:number = 0;
    private onVoteHandler():void//投票
    {
        let manager = GameManager.GetInstance();
        if (manager.Score <= 0)
            UIUtils.OpenPromptWin("","*主人，您的桃气值不足；可以通过每日登录或者分享获取桃气值哦！",100,Laya.Handler.create(this,this.onConfirmShare),null,PromptWindow.BTN_TYPE3);
        else
        {
            let curTime:number = Laya.Browser.now();
            if (curTime - this.saveTime < Global.OperationFastTime)
                return;
            this.saveTime = curTime;
            manager.CollocationVote(this.code);
        }
    }

    protected onConfirmShare():void
    {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }

    protected layoutCodeAnyTaoQi():void
    {
        this.codeTitle.pos(this.avatarBg.x + 120,this.avatarBg.y + 640);
        this.codeText.pos(this.codeTitle.x + this.codeTitle.width,this.codeTitle.y - 2);
        let startX:number = 528 - (this.taoqiTitle.width + this.taoqiText.width);
        this.taoqiTitle.pos(this.avatarBg.x + startX,this.avatarBg.y + 640);
        this.taoqiText.pos(this.taoqiTitle.x + this.taoqiTitle.width,this.taoqiTitle.y - 2);
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        UIUtils.BgAdaptation(this.bg);
        this.size(SystemContext.gameWidth,SystemContext.gameHeight);

        this.avatarBg.pos(52,126);
        this.rankFlag.pos(this.avatarBg.x + 24,this.avatarBg.y + 75);
        this.decorateLeft.pos(this.avatarBg.x + 59,this.avatarBg.y + 87);
        this.decorateRight.pos(this.avatarBg.x + 557,this.avatarBg.y + 87);
        this.voteFlag.pos(this.avatarBg.x + 153,this.avatarBg.y + 110);
        this.voteBtn.pos(this.avatarBg.x + 159,this.avatarBg.y + 686);

        this.desc.pos(74,this.avatarBg.y + 810);
        this.avatarSp.pos(this.avatarBg.x + 123,this.avatarBg.y);

        this.layoutChangeUI();
    }

    protected layoutChangeUI():void
    {
        this.layoutCodeAnyTaoQi();
        
        let startY:number = this.desc.y + this.desc.height;
        if (!this.desc.visible)
            startY = this.voteBtn.y + this.voteBtn.height;
        let centerY:number = SystemContext.gameHeight - startY - 232 >> 1;
        this.myDressBtn.pos(77,startY + centerY);//SystemContext.gameHeight - 259);
        this.shareBtn.pos(291,startY + centerY);//SystemContext.gameHeight - 259);
        this.rankBtn.pos(506,startY + centerY);//SystemContext.gameHeight - 259);
    }
    
    public clearWindowRes():void//清理资源
    {
        RES.DelGroupKeys("dressPartTemp");//从资源组中清空搭配部件图，防止窗口关闭随资源组回收(*对应ui会根据计数回收资源的)
        super.clearWindowRes();
    }

    public destroy(): void 
    {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.SCORE_CHANGE,this,this.onScoreChange);
        manager.off(GameManager.COLLOCATION_RANK_INFO,this,this.onRankInfo);
        manager.off(GameManager.COLLOCATION_VOTE_SUCC,this,this.onVoteSucc);
        manager = null;
        super.destroy();
    }
}