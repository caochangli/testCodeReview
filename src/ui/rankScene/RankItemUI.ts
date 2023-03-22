import FontName from "../../enum/FontName";
import WindowManager from "../../mode/base/WindowManager";
import RES from "../../res/RES";
import SgsSprite from "../controls/base/SgsSprite";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import MyDressItemUI from "../myDressScene/MyDressItemUI";

export default class RankItemUI extends MyDressItemUI
{
    protected rankBg:SgsTexture;
    protected rankText:SgsText;
    protected selfVoteFlag:SgsTexture;

    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);
        this.size(329,355 + 14);
    }

    protected init():void
    {
        super.init();
        this.bottomBg.y = 16 + 14;
        this.silhouette.y = 30 + 14;
        this.oherChildPos(this.avatarSp,51,20 + 14);
        this.topBg.y = 0 + 14;
        this.avatarBtn.y = 20 + 14;
        this.btn.y = 298 + 14;
    }

    protected updateRenderer(rendererData:any):void
    {
        this.itemData = rendererData;
        this.silhouette.visible = true;
        this.avatar.visible = false;
        this.avatar.UpdateAll(this.itemData.skin,this.itemData.collocation);
        this.bottomBg.texture = RES.GetRes("myDressItemBottomBg1");
        this.topBg.texture = RES.GetRes("myDressItemTopBg1");
        this.btn.InitSkin("myDressGoVoteBtn");
        this.updateRank(true,this.itemData.rank);
        this.updateSelfVoteFlag(this.itemData.is_self);
    }

    protected updateRank(isShow:boolean,rank:number = 0):void//更新排名
    {
        if (isShow)
        {
            if (!this.rankBg)
            {
                this.rankBg = new SgsTexture();
                this.rankBg.pos(114, 0);
                this.addOtherChild(1,this.rankBg);

                this.rankText = new SgsText();
                this.rankText.pos(this.rankBg.x,this.rankBg.y);
                this.rankText.size(110,53);
                this.rankText.font = FontName.HEITI;
                this.rankText.color = "#ffffff";
                this.rankText.fontSize = 24;
                this.rankText.align = "center";
                this.rankText.valign = "middle";
                this.addOtherChild(2,this.rankText);
            }
            if (rank >= 1 && rank <= 3)
                this.rankBg.texture = RES.GetRes("myDressRankBg" + rank);
            else
                this.rankBg.texture = RES.GetRes("myDressRankBg4");
            let rankStr = rank.toString();
            if (!rank || rank > 9999)
                rankStr = "9999+";
            else if (rankStr.length <= 1) 
                rankStr = "0" + rankStr;
            this.rankText.text = rankStr;
            this.rankBg.visible = this.rankText.visible = true;
        }
        else
        {
            if (this.rankBg)
                this.rankBg.visible = this.rankText.visible = false;
        }
    }

    protected updateSelfVoteFlag(isShow:boolean):void//更新我的作品标记
    {
        if (isShow)
        {
            if (!this.selfVoteFlag)
            {
                this.selfVoteFlag = new SgsTexture(RES.GetRes("myDressSelfWork1"));
                this.selfVoteFlag.pos(304, 234);
                this.addOtherChild(1,this.selfVoteFlag);
            }
            this.selfVoteFlag.visible = true;
        }
        else
        {
            if (this.selfVoteFlag)
                this.selfVoteFlag.visible = false;
        }
    }

    protected onButtonHandler():void//按钮点击事件
    {
        if (!this.itemData) return;
        WindowManager.GetInstance().OpenWindow("VoteWorkInfoWindow",false,this.itemData);
    }

    public ClearDraw(destroy:boolean = true):void
    {
        super.ClearDraw(destroy);
        if (destroy)
        {
        
        }
    }
}