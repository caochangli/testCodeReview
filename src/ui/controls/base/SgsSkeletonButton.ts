import RES from "../../../res/RES";
import SgsImage from "./SgsImage";
import SgsSkeletonEffect from "./SgsSkeletonEffect";

/*
* spine按钮：默认组件destroy时自动回收spine模板
* 可通过设置：autoClearTemplet、clearTempletFollow调整模板回收策略
* 设置的size值为点击区域
*/
export default class SgsSkeletonButton extends SgsSkeletonEffect
{
    protected skUrl:string = "";
    protected actionName:any = 0;
    protected redIcon:SgsImage;

    constructor(skUrl:string,actionName:any = 0,autoClearTemplet:boolean = true,clearTempletFollow:string = "")
    {
        super();

        this.autoClearTemplet = autoClearTemplet;
        this.clearTempletFollow = clearTempletFollow;

        this.skUrl = skUrl;
        this.actionName = actionName;
        this.playEffect(skUrl,actionName,true);
        this.on(Laya.Event.MOUSE_DOWN,this,this.mouseDownHandler);
    }

    //自定义点击区域:一般用于spine动画原点在中心点的时候
    public ClickArea(x:number,y:number,width:number,height:number):void
    {
        if (!this.hitArea)
            this.hitArea = new Laya.Rectangle(x,y,width,height);
        else
            this.hitArea.setTo(x,y,width,height);
        this.size(width,height);
    }

    //显示红点
    public ShowRedPoint(res:string = "TopRedPoint",xx:number = 45,yy:number = 2):void
    {
        if(!this.redIcon)
        {
            this.redIcon = new SgsImage();
            this.redIcon.source = RES.GetRes(res);
            this.addChild(this.redIcon);
            this.redIcon.pos(xx, yy);
        }
        this.redIcon.visible = true;
    }

    //移除红点
    public RemoveRedPoint():void
    {
        if (this.redIcon)
            this.redIcon.visible = false;
    }

    protected mouseDownHandler(event:Laya.Event):void
    {
        // SgsSoundManager.PlayEffectSound("res/assets/runtime/voice/effect/button_effect_sound.mp3");
    }

    public destroy(destroyChild:boolean = true):void
    {
        this.off(Laya.Event.MOUSE_DOWN,this,this.mouseDownHandler);
        this.hitArea = null;
        super.destroy(destroyChild);
    }
}