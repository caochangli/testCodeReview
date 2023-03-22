import PromptLayer from "./../layer/PromptLayer";
import RES from "./../../res/RES";
import FontName from "./../../enum/FontName";
import SgsHTMLDivElement from "./base/SgsHTMLDivElement";
import SgsSprite from "./base/SgsSprite";
import SgsTexture from "./base/SgsTexture";
import SystemContext from "../../SystemContext";
/*
* name;
*/
export default class TextPromptUI extends SgsSprite
{
    private msgBg:SgsTexture;
    private htmlDiv:SgsHTMLDivElement;

    public HideComplete:Function;
    private upTween:Laya.Tween;
    private padding:number = 35;//左右间距
    private showTime:number = 3000;

    constructor()
    {
        super();

        this.size(SystemContext.gameWidth,77);
        this.zOrder = 1004;
        this.initChilds();
    }

    private initChilds():void
    {
        this.msgBg = new SgsTexture(RES.GetRes("textPromptBg"));
        this.msgBg.size(this.width,this.height);
        this.msgBg.sizeGrid = "1,220,1,220";
        this.addDrawChild(this.msgBg);

        this.htmlDiv = new SgsHTMLDivElement();
        this.htmlDiv.width = SystemContext.gameWidth - this.padding * 2;
        this.htmlDiv.fontFamily = FontName.HEITI;
        this.htmlDiv.fontSize = 36;
        this.htmlDiv.color = "#f8f9f1";
        // this.htmlDiv.leading = 10;
        // this.htmlDiv.wordWrap = true;
        this.htmlDiv.mouseEnabled = false;
        this.htmlDiv.mouseThrough = false;
        this.addChild(this.htmlDiv);
    }

    public Show(value:string,time:number = 3000)
    {
        this.showTime = time;
        this.htmlDiv.innerHTML = value;
        this.htmlDiv.pos(this.width - this.htmlDiv.contextWidth >> 1,this.height - this.htmlDiv.contextHeight >> 1);
        this.delayHide();
        PromptLayer.GetInstance().addChild(this);
    }

    public UpMove(y:number):void
    {
        if (this.y == y) return;

        if (this.upTween)
        {
            Laya.Tween.clear(this.upTween);
            this.upTween = null;
        }
        this.upTween = Laya.Tween.to(this,{y:y},300,null,Laya.Handler.create(this,this.onUpComplete));
    }

    public Clear():void
    {
        Laya.Tween.clearAll(this);
        this.removeSelf();
        this.HideComplete = null;
        this.upTween = null;
        this.showTime = 3000;
        this.alpha = 1;
        this.y = 0;
    }

    private onUpComplete():void
    {
        this.upTween = null;
    }

    private delayHide():void//延迟消失
    {
        Laya.Tween.to(this,{alpha:0},300,null,Laya.Handler.create(this,this.onHideComplete), this.showTime);
    }

    private onHideComplete()//掩藏结束
    {
        if (this.HideComplete)
        {
            this.HideComplete(this);
        }
    }
}