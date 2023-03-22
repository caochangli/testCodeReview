import SgsSprite from "../controls/base/SgsSprite";
import SgsTexture from "../controls/base/SgsTexture";
import SgsText from "../controls/base/SgsText";
import GameEventDispatcher from "../../event/GameEventDispatcher";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import UIUtils from "../../utils/UIUtils";
import FontName from "../../enum/FontName";
import SgsSkeletonEffect from "../controls/base/SgsSkeletonEffect";
import EffectUtils from "../../utils/EffectUtils";

/*
* name;
*/
export default class MainLoadingView extends SgsSprite
{
    private bg:SgsTexture;
    private descText:SgsText;
    private effect:SgsSkeletonEffect;

    protected curValue:number = 0;
    protected maxValue:number = 0;
    protected oldValue:number = 0;
    protected tweenPos:number = 0;
    protected tweenProgress:Laya.Tween;

    constructor()
    {
        super();

        this.initChilds();

        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE,this,this.onStageResize);
        this.onStageResize();
    }

    private initChilds():void
    {
        this.bg = new SgsTexture(RES.GetRes("mainLoadingBg_image"));
        this.addDrawChild(this.bg);

        this.descText = new SgsText();
        this.descText.width = SystemContext.gameWidth;
        this.descText.font = FontName.HEITI;
        this.descText.fontSize = 40;
        this.descText.color = "#A7928A";
        this.descText.bold = true;
        this.descText.align = "center";
        this.addDrawChild(this.descText);

        this.effect = EffectUtils.GetSkeletonEffect(false,true);
        this.effect.x = SystemContext.gameWidth >> 1;
        this.effect.scale(1,1);
        this.effect.playEffect("res/assets/mainLoading/tuzitiao.sk",0,true);
        this.addChild(this.effect);
    }

    public ShowProgress(curValue:number,maxValue:number):void
    {
        //先定位到上次进度
        this.clearTweenProgress();
        this.oldValue = this.curValue;
        this.locationProgress(this.curValue,this.maxValue);

        this.curValue = curValue;
        this.maxValue = maxValue; 
        if (this.curValue >= this.maxValue)//已完成
        {
            this.locationProgress(this.curValue,this.maxValue);
        }
        else
        {
            this.startTweenProgress();
        }
    }

    public ShowError(errorMsg:string):void
    {
        this.descText.text = "资源加载失败，请刷新...";
    }

    public ShowText(msg:string):void
    {
        this.descText.text = msg;
    }

    public ShowParseConfig():void
    {
       
    }

    public ResetProgress():void
    {
        
    }

    private startTweenProgress():void//缓动走进度条
    {
        this.clearTweenProgress();
        this.tweenPos = 0;
        this.tweenProgress = Laya.Tween.to(this,{tweenPos:1},1000,null,Laya.Handler.create(this,this.onTweenComplete));
        this.tweenProgress.update = Laya.Handler.create(this,this.onTweenUpdate,null,false);
    }

    private clearTweenProgress():void
    {
        if (this.tweenProgress)
        {
            Laya.Tween.clear(this.tweenProgress);
            this.tweenProgress = null;
        }
    }

    private onTweenUpdate():void
    {
        let value:number = this.oldValue + (this.curValue - this.oldValue) * this.tweenPos;
        this.locationProgress(value,this.maxValue);
    }

    private onTweenComplete():void
    {
        this.tweenProgress = null;
        this.locationProgress(this.curValue,this.maxValue);
    }

    private locationProgress(curValue:number,maxValue:number):void
    {
        let ratio:number = curValue / maxValue;
        if (ratio >= 1) ratio = 0.99;
        ratio = Math.floor(ratio * 100);
        this.descText.text = "加载中：" + ratio + "%";
    }

    private onStageResize(event:Laya.Event = null):void
    {
        UIUtils.BgAdaptation(this.bg);

        this.effect.y = SystemContext.gameHeight / 2 + 100;
        this.descText.y = this.effect.y - 350;
    }

    public destroy():void
    {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE,this,this.onStageResize);
        this.clearTweenProgress();
        super.destroy();
        RES.ClearResByGroup("mainLoading");
    }
}