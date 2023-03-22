import AnimateManager from "../../../mode/base/AnimateManager";
import SceneManager from "../../../mode/base/SceneManager";
import SgsSoundManager from "../../../mode/base/SgsSoundManager";
import WindowManager from "../../../mode/base/WindowManager";
import SgsFlatContainer from "./SgsFlatContainer";
import SgsSkeleton from "./SgsSkeleton";

export default class SgsSkeletonEffect extends SgsSkeleton
{
    public static CLEAR_FOLLOW_SCENE:string = "clearFollowScene";//跟随场景回收

    public static LOAD_COMPLETE:string = "loadComplete";//加载完成事件
    public static PLAY_COMPLETE:string = "playComplete";//播放结束事件

    protected _isStop:boolean = false;//是否已停止

    protected animateUrl:string = "";
    protected mode:number = 0;
    protected soundUrl:string = "";
    protected slotSkins:Array<{slotName:string,texture:Laya.Texture}>;
    
    //组件回收策略
    protected _forceFllowTarget:Laya.Sprite;//组件强制跟随回收对象：跟随此对象销毁而销毁，主要用于特效添加到其他层时使用
    public autoRecoverSelf:boolean = false;//自动回收自身：动画播放结束时回收自身，若循环播放则此属性无效
    public loadErrorRecoverSelf:boolean = false;//加载失败回收自身

    //动画模板回收策略
    public autoClearTemplet:boolean = false;//自动回收动画模板：回收自身时回收动画模板
    public clearTempletFollow:string = "";//scene：随场景回收 ***window：随窗口回收 

    //对象池回收策略
    public poolSign:string = "";//对象池标记:存在表示回收至对象池
    public clearPoolFollow:string = "";//scene：随场景回收 ***window：随窗口回收 
    public poolCount:number = 0;//对象池个数：限制对象池中对象个数 0表示不限制

    //延迟回调
    public delayTime:number = 0;//播放后延迟***毫秒回调
    public delayHandler:Laya.Handler;//延迟回调

    constructor(temp?:Laya.Templet,mode?:number)
    {
        super(temp,mode);
    }

    public set forceFllowTarget(target:Laya.Sprite)//组件强制跟随回收对象：跟随此对象销毁而销毁，主要用于特效添加到其他层时使用
    {
        if (this._forceFllowTarget)
            this._forceFllowTarget.off("destroyEvent",this,this.onFollowDestroy);
        this._forceFllowTarget = target;
        if (this._forceFllowTarget)
            this._forceFllowTarget.on("destroyEvent",this,this.onFollowDestroy);
    }

    public poolStrategy(poolSign:string,clearPoolFollow:string = "",poolCount:number = 0):void//对象池策略
    {
        this.poolSign = poolSign;
        this.clearPoolFollow = clearPoolFollow;
        this.poolCount = poolCount;
    }

    public RecoverPool():void//回收到对象池
    {
        if (this.destroyed || this["__InPool"]) return;
        let pools:Array<any> = Laya.Pool.getPoolBySign(this.poolSign);
        if (this.poolCount <= 0 || !pools || pools.length < this.poolCount)//限制对象池个数
        {
            //随窗口或场景清理对象池 - 将对象池标记添加到窗口或场景上
            if (this.clearPoolFollow == SgsSkeletonEffect.CLEAR_FOLLOW_SCENE)
                SceneManager.GetInstance().AddRecoverEffectPool(this.poolSign);
            else if (this.clearPoolFollow)
                WindowManager.GetInstance().AddRecoverEffectPool(this.clearPoolFollow,this.poolSign);
            Laya.Pool.recover(this.poolSign,this);
        }   
        else
        {
            this.destroy();
        }
    }

    public stop():void//停止
    {
        this._isStop = true;
        this.off(Laya.Event.STOPPED,this,this.onEffectStop);
        super.stop();
    }

    public paused():void//暂停
    {
        this._isStop = true;
        super.paused();
    }

    public resume():void//恢复
    {
        this._isStop = false;
        super.resume();
    }

    public get AnimateUrl():string
    {
        return this.animateUrl;
    }

    public get PlayIndex():any
    {
        return this.nameOrIndex;
    }

    /**
     * 
     * @param url 特效文件url
     * @param nameOrIndex 名称或者索引 -1表示加载完不自动播放
     * @param loop 是否循环播放
     * @param mode 播放模式
     * @param playbackRate 速率
     * @param soundUrl 声音文件，播放特效时同时播放声音
     */
    public playEffect(url:string,nameOrIndex:any = 0,loop:boolean = false,mode:number = 0,playbackRate:number = 1,soundUrl:string = ""):void
    {
        if (this.destroyed)
        {
            this.clearEffect();
            return;
        }
        let animateManager:AnimateManager = AnimateManager.GetInstane();
        if (this.animateUrl)
        {
            animateManager.DelReference(this.animateUrl);
            if (url != this.animateUrl)//新传入的动画与之前的动画不一致
            {
                this.clearSkeletonContent();
                if (this.autoClearTemplet)//自动回收动画模板
                    AnimateManager.GetInstane().DestroyAnimate(this.animateUrl); 
            }  
        }
        this.animateUrl = url;
        if (!this.animateUrl) return;
        this.nameOrIndex = nameOrIndex;
        this.playLoop = loop;
        this.mode = mode;
        this._playbackRate = playbackRate;
        this.soundUrl = soundUrl;
        animateManager.AddReference(this.animateUrl);

        //随窗口或场景清理模板 - 将模板添加到窗口或场景上
        if (this.clearTempletFollow == SgsSkeletonEffect.CLEAR_FOLLOW_SCENE)
            SceneManager.GetInstance().AddRecoverTemplet(this.animateUrl);
        else if (this.clearTempletFollow)    
            WindowManager.GetInstance().AddRecoverTemplet(this.clearTempletFollow,this.animateUrl);

        this["_pause"] = true;
        this._isStop = false;
        let templet:Laya.Templet = this.templet;
        if (templet && !templet["_isDestroyed"] && templet["_skBufferUrl"] == url && animateManager.HasTemplet(url))//可以直接开始播放
        {
            this.onStartPlay(this.templet,true);
            this.event(SgsSkeletonEffect.LOAD_COMPLETE,templet);//派发加载结束事件
        }
        else
        {   
            this.on(AnimateManager.ANIMATE_LOAD_COMPLETE,this,this.onLoadComplete);
            animateManager.LoadAnimate(url,this);
        }
    }

    /**预设插槽皮肤*/
    public presetSlotSkins(val:Array<{slotName:string,texture:Laya.Texture}>):void
    {
        this.slotSkins = val;
    }

    protected onLoadComplete(temp:Laya.Templet):void//加载完成
    {
        if (!temp) return;//原则上不会发生
        if (typeof(temp) == "string")//加载失败
        {
            if (this.animateUrl == temp)//是本次需要的动画
            {
                this.onLoadError();
                this.event(SgsSkeletonEffect.LOAD_COMPLETE,temp);//派发加载结束事件：不代表加载成功(可能因为没有资源或网络问题导致加载失败)
            }
            return;
        }
        if (this.animateUrl != temp.name) return;//不是本次需要的动画
        this.off(AnimateManager.ANIMATE_LOAD_COMPLETE,this,this.onLoadComplete);
        
        if (this.destroyed)
        {
            this.clearEffect();
            return;
        }

        this.clearSkeletonContent();
        this.onStartPlay(temp);
        this.event(SgsSkeletonEffect.LOAD_COMPLETE,temp);//派发加载结束事件
    }

    protected onLoadError():void//加载失败处理
    {
        if (this.loadErrorRecoverSelf || (this.autoRecoverSelf && !this.playLoop))//加载失败自动回收或播放结束自动回收
            this.clearEffect();
    }

    protected onStartPlay(temp:Laya.Templet,isEqual:boolean = false):void//开始播放
    {
        if (!isEqual || this["_aniMode"] != this.mode)//相同url、模式无需初始化
            this.init(temp,this.mode);
        this.playbackRate(this._playbackRate);
        if (!this.playLoop)//循环播放无法收到结束事件，反而外部调用stop接口时会收到结束事件
            this.on(Laya.Event.STOPPED,this,this.onEffectStop);
        this.changeSlotSkin();
        if (this.nameOrIndex != -1 && !this._isStop)//存在播放动作且未停止
        {
            this.play(this.nameOrIndex,this.playLoop);
            if (this.soundUrl) 
                SgsSoundManager.PlaySound(this.soundUrl);
            if (this.delayTime && this.delayHandler)
                Laya.timer.once(this.delayTime,this,this.onDelayHandler);
        }
    }

    protected changeSlotSkin():void//换肤
    {
        if (this.slotSkins && this.slotSkins.length > 0)//预设插槽皮肤处理
        {
            this.slotSkins.forEach(element => {
                if (element.slotName && element.texture)
                    this.setSlotSkin(element.slotName,element.texture);
            });
        }
    }

    protected onDelayHandler():void//延迟回调
    {
        if (this.delayHandler)
        {
            this.delayHandler.run();
            this.delayHandler = null;
        }
    }

    protected onEffectStop():void//播放结束
    {
        this.event(SgsSkeletonEffect.PLAY_COMPLETE,this);
        if (this.autoRecoverSelf)//自动回收
            this.clearEffect();
    }

    protected onFollowDestroy(target:Laya.Sprite):void//回收跟随的对象destroy了
    {
        this.destroy();
    }

    protected clearSkeletonContent():void//清理skeleton内容
    {
        if (!this.templet || !this.player) return;//从未播放过
        this.off(Laya.Event.STOPPED,this,this.onEffectStop);
        super.stop();
        this.removeChildren();
    }
    
    /** 清理特效
      * @param force 强制回收：忽略回收至对象池(用于清理对象池中特效和场景或窗口退出时强制清理特效)
    */
    public clearEffect(force:boolean = false):void
    {
        if (this.destroyed) return;
        Laya.timer.clearAll(this);
        this.offAll();
        this.off(AnimateManager.ANIMATE_LOAD_COMPLETE,this,this.onLoadComplete);
        this.off(Laya.Event.STOPPED,this,this.onEffectStop);
        let parentContainer:SgsFlatContainer = this["parentContainer"];
        let otherRenderIndex:number = this["otherRenderIndex"];
        if (!force && this.poolSign)//回收至对象池
        {
            super.stop();
            if (parentContainer && otherRenderIndex >= 0)//添加到额外层的
                parentContainer.removeOherChild(otherRenderIndex,this,false);
            else
                this.removeSelf();
        }
        else
        {
            if (parentContainer && otherRenderIndex >= 0)//添加到额外层的
                parentContainer.removeOherChild(otherRenderIndex,this,true);
            else
                super.destroy(true);
        }
        this._isStop = false;
        let animateManager:AnimateManager = AnimateManager.GetInstane();
        if (this.animateUrl)
        {
            animateManager.DelReference(this.animateUrl);
            if (this.autoClearTemplet)//自动回收动画模板
                AnimateManager.GetInstane().DestroyAnimate(this.animateUrl);
            this.animateUrl = "";
        }
        if (this._forceFllowTarget)
        {
            this._forceFllowTarget.off("destroyEvent",this,this.onFollowDestroy);
            this._forceFllowTarget = null;
        }
        this.slotSkins = null;
        this.delayHandler = null;
        if (!force && this.poolSign)//回收至对象池
        {
            this.RecoverPool();
        }
    }

    public destroy(destroyChild:boolean = true):void
    {
        if (!this.destroyed)
        {
            this.clearEffect(true);
            if (!this.destroyed)
                super.destroy(true);
        }
    }
}