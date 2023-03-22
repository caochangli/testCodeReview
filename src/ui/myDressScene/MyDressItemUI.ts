import FontName from "../../enum/FontName";
import WindowManager from "../../mode/base/WindowManager";
import GameManager from "../../mode/gameManager/GameManager";
import RES from "../../res/RES";
import UIUtils from "../../utils/UIUtils";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsSprite from "../controls/base/SgsSprite";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import SgsFlatPanelItemBase from "../controls/SgsFlatPanelItemBase";
import DressAvatar from "../dressScene/DressAvatar";
import PromptWindow from "../window/PromptWindow";

export default class MyDressItemUI extends SgsFlatPanelItemBase
{
    protected bottomBg:SgsTexture;
    protected silhouette:SgsTexture;
    protected avatarSp:Laya.Sprite;
    protected avatar:DressAvatar;
    protected topBg:SgsTexture;
    protected codeBg:SgsTexture;
    protected codeText:SgsText;
    protected voteFlag:SgsTexture;
    protected avatarBtn:SgsFlatButton;
    protected btn:SgsFlatButton;

    protected itemData:any;

    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);
        this.size(329,355);
    }

    protected init():void
    {
        this.bottomBg = new SgsTexture();
        this.bottomBg.y = 16;
        this.addDrawChild(this.bottomBg);

        this.silhouette = new SgsTexture(RES.GetRes("myDressItemSilhouette"));
        this.silhouette.pos(51,30);
        this.addDrawChild(this.silhouette);

        this.avatarSp = new Laya.Sprite();
        this.oherChildPos(this.avatarSp,51,20);
        this.avatarSp.size(235,268);
        this.avatarSp.scrollRect = new Laya.Rectangle(0,0,235,268);
        this.addOtherChild(0,this.avatarSp);

        this.avatar = new DressAvatar();
        this.avatar.pos(-15, 8);
        this.avatar.scale(0.58, 0.58);
        // this.avatar.onlyDestroyClear = true;//慎重
        this.avatar.on(DressAvatar.LOAD_COMPLETE,this,this.onAvatarLoadComplete);
        this.avatarSp.addChild(this.avatar);

        this.topBg = new SgsTexture();
        this.topBg.x = 9;
        this.addOtherChild(1,this.topBg);

        this.avatarBtn = new SgsFlatButton();
        this.avatarBtn.pos(51,20);
        this.avatarBtn.size(235,268);
        this.avatarBtn.on(Laya.Event.CLICK,this,this.onAvatarHandler);
        this.addOtherChild(1,this.avatarBtn);

        this.btn = new SgsFlatButton();
        this.btn.pos(75,298);
        this.btn.on(Laya.Event.CLICK,this,this.onButtonHandler);
        this.addOtherChild(1,this.btn);
    }

    protected updateRenderer(rendererData:any):void
    {
        this.itemData = rendererData;
        this.silhouette.visible = true;
        this.avatar.visible = false;
        this.avatar.UpdateAll(this.itemData.skin,this.itemData.collocation);
        if (this.itemData.is_join)//已参赛
        {
            this.bottomBg.texture = RES.GetRes("myDressItemBottomBg1");
            this.topBg.texture = RES.GetRes("myDressItemTopBg1");
            this.updateVoteFlag(true);
            this.btn.InitSkin("myDressLookBtn1");
        }
        else
        {
            this.bottomBg.texture = RES.GetRes("myDressItemBottomBg");
            this.topBg.texture = RES.GetRes("myDressItemTopBg");
            this.updateVoteFlag(false);
            this.btn.InitSkin("myDressLookBtn");
        }
        if (!GameManager.GetInstance().Code)//没有参赛作品
        {
            this.btn.InitSkin("myDressEntryBtn");
        }
        this.updateCode(!this.itemData.is_join,this.itemData.number);
    }
    
    protected updateCode(isShow:boolean,code:number = 0):void//更新编号
    {
        if (isShow)
        {
            if (!this.codeBg)
            {
                this.codeBg = new SgsTexture(RES.GetRes("myDressCodeBg"));
                this.codeBg.pos(60,34);
                this.addOtherChild(1,this.codeBg);

                this.codeText = new SgsText();
                this.codeText.pos(this.codeBg.x,this.codeBg.y);
                this.codeText.size(52,53);
                this.codeText.font = FontName.HEITI;
                this.codeText.color = "#ffffff";
                this.codeText.fontSize = 24;
                this.codeText.align = "center";
                this.codeText.valign = "middle";
                this.addOtherChild(2,this.codeText);
            }
            let str = code.toString();
            if (str.length <= 1) str = "0" + str;
            this.codeText.text = str;
            this.codeBg.visible = this.codeText.visible = true;
        }
        else
        {
            if (this.codeBg)
                this.codeBg.visible = this.codeText.visible = false;
        }
    }

    protected updateVoteFlag(isShow:boolean):void//更新参赛中标记
    {
        if (isShow)
        {
            if (!this.voteFlag)
            {
                this.voteFlag = new SgsTexture(RES.GetRes("myDressVoteFlag"));
                this.voteFlag.pos(66,35);
                this.addOtherChild(1,this.voteFlag);
            }
            this.voteFlag.visible = true;
        }
        else
        {
            if (this.voteFlag)
                this.voteFlag.visible = false;
        }
    }

    protected onAvatarLoadComplete():void//搭配资源加载完
    {
        this.silhouette.visible = false;
        this.avatar.visible = true;
    }

    protected onAvatarHandler():void//形象点击事件
    {
        if (!this.itemData) return;
        WindowManager.GetInstance().OpenWindow("LookDressWindow",this.itemData.skin,this.itemData.collocation);
    }

    protected onButtonHandler():void//按钮点击事件
    {
        if (!this.itemData) return;
        if (!GameManager.GetInstance().Code)//没有参赛作品：参赛
        {
            UIUtils.OpenPromptWin("","*主人，我们只有一次参赛机会哦！<br/>您是否选择此作品参赛？",100,Laya.Handler.create(this,this.onConfirmCompete));
        }
        else if (this.itemData.is_join)//已参赛:查看作品
        {
            WindowManager.GetInstance().OpenWindow("VoteWorkInfoWindow",true);
        }
        else//查看搭配
        {
            WindowManager.GetInstance().OpenWindow("LookDressWindow",this.itemData.skin,this.itemData.collocation);
        }
    }

    protected onConfirmCompete():void
    {
        if (!this.itemData) return;
        GameManager.GetInstance().CollocationJoin(this.itemData.id);
    }

    public ClearDraw(destroy:boolean = true):void
    {
        super.ClearDraw(destroy);
        if (destroy)
        {
            this.itemData = null;
        }
    }
}