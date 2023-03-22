
import EventExpand from "../../../event/EventExpand";
import Global from "../../../Global";
import TipsManager from "../../../mode/base/TipsManager";
import SgsTemplet from "./SgsTemplet";
/*
* name;
*/
export default class SgsSkeleton extends Laya.Skeleton
{
    protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected _toolTip:any = "";

    protected nameOrIndex:any;
    protected playLoop:boolean = false;
    protected buttonMode:boolean = false;//鼠标手型
    protected _playbackRate:number = 1;//播放速率

    constructor(temp?:Laya.Templet,mode?:number)
    {
        super(temp,mode);
    }

    public init(temp:Laya.Templet,mode?:number):void
    {
        if (this.destroyed || !temp || temp.destroyed) return;
        //启用对象池时，清理之前的数据
        if (this["_templet"])
        {
            // if (this.templet instanceof SgsTemplet)
            //     this.templet.delBindSkeleton(this);
            this["_templet"]["_removeReference"](1);
            this["_templet"] = null;
        }
        if (this["_player"])
        {
            this["_player"]["offAll"]();
            this["_player"] = null;
        }
        this["_pathDic"] = null;
        this["_curOriginalData"] = null;
        this["_boneSlotDic"] = null;
        this["_bindBoneBoneSlotDic"] = null;
        this["_boneSlotArray"] = null;
        if (this["_boneMatrixArray"])
            this["_boneMatrixArray"].length = 0;
        if (this["_soundChannelArr"].length > 0) {
            this["_onAniSoundStoped"](true);
        }
        //启用对象池时，清理之前的数据
        super.init(temp,mode);
        // //模板持有UI的风险在于：模板不回收的情况下，UI也没有destory，则UI回收不了，以前UI也许可以回收
        // if (this.templet instanceof SgsTemplet)//绑定
        //     this.templet.addBindSkeleton(this);
        if (this._playbackRate != 1)
            super.playbackRate(this._playbackRate);
    }

    /**
     * 播放动画
     * @param nameOrIndex 动画名字或者索引
     * @param loop 是否循环播放
     * @param force false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param start 起始时间
     * @param end 结束时间
     * @param freshSkin 是否刷新皮肤数据
     * @param playAudio 是否播放音频
     */
    public play(nameOrIndex:any,loop:boolean,force:boolean = true,start:number = 0,end:number = 0,freshSkin:boolean = true,playAudio:boolean = true):void
    {
        if (this.destroyed || !this.templet || this.templet.destroyed) return;
        super.play(nameOrIndex,loop,force,start,end,freshSkin,playAudio);
    }

    //设置动画播放速率(引擎底层在资源未加载之前设置无效)
    public playbackRate(value:number):void
    {
        this._playbackRate = value;
        super.playbackRate(value);
    }

    //获取动画播放速率
    public GetPlaybackRate():number
    {
        return this._playbackRate;
    }

    protected _update(autoKey?:boolean):void
    {
        if (this.destroyed || !this["_templet"] || this["_templet"]["_isDestroyed"]) {
            this.offAll(Laya.Event.STOPPED);
            super.stop();//caochangli 动画播放中模板数据被回收时改为停止播放，防止UI被destroy后上层业务不知道还在使用UI对象进行各种操作
            return;
		}
        Laya.Skeleton.prototype["_update"].call(this,autoKey);
    }

    protected _createGraphics(_clipIndex?:number):void
    {
        if (this.destroyed || !this["_templet"] || this["_templet"]["_isDestroyed"]) {
            this.offAll(Laya.Event.STOPPED);
            super.stop();//caochangli 动画播放中模板数据被回收时改为停止播放，防止UI被destroy后上层业务不知道还在使用UI对象进行各种操作
            return;
		}
        Laya.Skeleton.prototype["_createGraphics"].call(this,_clipIndex);
    }

    public set TipTriggerType(val:string)
	{
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
			this.addSelfEvent();
    }
    
    public get ToolTip():any
    {   
        return this._toolTip;
    }

    public set ToolTip(val:any)
    {
        if (this._toolTip == val) return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val,this.tipTriggerType,this);
    }

    //是否已长按
    public get longDowned():boolean
    {
        return this._longDowned;
    }

    protected addSelfEvent():void
    {
        this.on(Laya.Event.MOUSE_DOWN,this,this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP,this,this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT,this,this.onSelfUp);
    }

    protected removeSelfEvent():void
    {
        this.off(Laya.Event.MOUSE_DOWN,this,this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP,this,this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT,this,this.onSelfUp);
    }

    protected onSelfDown(event:Laya.Event):void
    {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime,this,this.onLongTimer,[event.currentTarget]);
    }

    protected onSelfUp(event:Laya.Event):void
    {
        Laya.timer.clear(this,this.onLongTimer);
    }

    protected onLongTimer(event):void
    {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN,event);
    }

    public destroy(destroyChild:boolean = true):void
    {
        Laya.timer.clear(this,this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        this.offAll(Laya.Event.STOPPED);
        super.stop();
        this.removeSelf();
        this.removeChildren();
        let templet = this.templet;
        // if (templet && templet instanceof SgsTemplet)//组件销毁时解除绑定
        //     templet.delBindSkeleton(this);
        super.destroy(destroyChild);
        
        let graphicsCache = templet && !templet["_isDestroyed"] && templet["_graphicsCache"];
        if (graphicsCache)
        {
            for (var i = 0, n = graphicsCache.length; i < n; i++) 
            {
                for (var j = 0, len = graphicsCache[i].length; j < len; j++)
                {
                    var gp = graphicsCache[i][j];
                    if (gp && gp._sp && gp._sp === this)
                        gp._sp = null;
                }
            }
        } 
        templet = null;  
    }
}