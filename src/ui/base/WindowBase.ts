import SgsSprite from "../controls/base/SgsSprite";
import LayerBase from "../layer/LayerBase";
import WindowLayer from "../layer/WindowLayer";
import SystemContext from "../../SystemContext";
import GameEventDispatcher from "../../event/GameEventDispatcher";
import WindowManager from "../../mode/base/WindowManager";
import SilenceResManager from "../../mode/base/SilenceResManager";
import LoadingManager from "../../mode/base/LoadingManager";
import RES from "../../res/RES";
import ResourceEvent from "../../res/ResourceEvent";
import AnimateManager from "../../mode/base/AnimateManager";
import EffectUtils from "../../utils/EffectUtils";

/** 窗口基类 
 *  生命周期：OpenWindow > init > enterWindow > inAnimate > addEventListener > openEnd > outAnimate > closeEnd > removeEventListener > destroy
*/
export default class WindowBase extends SgsSprite
{
	public static CLOSE_NORMAL:number = 1;//正常关闭：不自动回收则从舞台移除，自动回收则destroy
	public static CLOSE_HIDE:number = 2;//掩藏关闭：仅从舞台移除，不destroy

	protected parentLayer:LayerBase;//父级层
	protected modalBg:Laya.Sprite;//模态背景
	protected animateTween:Laya.Tween;//

	protected autoRecover:boolean = true;//自动回收弹窗
	protected autoRecoverRes:boolean = true;//自动回收弹窗资源
	protected canAutoClose:boolean = true;//是否可以被自动关闭
	protected hideOtherView:boolean = false;//打开时是否掩藏其他视图(全屏窗口打开时不显示其背后的其他窗口和场景)
	protected modal:boolean = false;//是否模态窗口(true会在弹窗后面出现一个透明黑色背景阻止背后鼠标事件)
	protected modalAlpha:number = 0.5;//模态透明度
	protected needInAnimate:boolean = false;//需要进入动画
	protected needOutAnimate:boolean = false;//需要离开动画
	protected opening:boolean = false;//是否打开过程中
	protected closeing:boolean = false;//是否关闭过程中
	protected closeed:boolean = false;//已关闭
    protected resNames:Array<string>;//弹窗资源组名
	protected recoverTemplets:Array<string>;//退出时移除骨骼模板(弹窗中使用AnimateManager加载的骨骼模板)
	protected skeletonEffectPools:Array<string>;
	protected silenceResArr:Array<string>;//静默资源组列表
	protected loading:boolean = false;//加载资源中
	protected eventAdded:boolean = false;
	protected windowData:any;//窗口数据
	protected openSound:string = "window_open_sound";//弹窗打开音效

	constructor() 
	{
		super();

		this.parentLayer = WindowLayer.GetInstance();//如需添加到其他层，可在子类的构造函数中修改
		this.size(SystemContext.gameWidth,SystemContext.gameHeight);
	}

	public get ModalBg():Laya.Sprite
	{
		return this.modalBg;
	}

	public get Loading():boolean
	{
		return this.loading;
	}

	public get Opening():boolean
	{
		return this.opening;
	}

	public get Closeing():boolean
	{
		return this.closeing;
	}

	public get CanAutoClose():boolean
	{
		return this.canAutoClose;
	}

	public get AutoRecover():boolean
	{
		return this.autoRecover;
	}

	public get HideOtherView():boolean
	{
		return this.hideOtherView;
	}

	public size(width:number,height:number):Laya.Sprite
    {
        super.size(width,height);
		this.clearAnimateTween();
		this.scale(1,1);
		this.pos(SystemContext.gameWidth - this.width >> 1,SystemContext.gameHeight - this.height >> 1);
		return this;
    }

	//打开窗口：创建window时由windowManager调用
	public Open(...args):void
	{
		this.closeed = false;
		this.windowData = args;
		if (!this.resNames || this.resNames.length <= 0)//无需加载资源
		{
			this.init();
			this.enterWindow(...this.windowData);
		}
		else
			this.startLoadRes();
	}

	//关闭窗口：从舞台移除，若自动回收则执行destory
	public Close(ignoreCloseAnimate:boolean = false):void
	{
		if (this.loading)//加载资源中
		{
			this.closeEnd(WindowBase.CLOSE_NORMAL);
			return;
		}
		if (this.opening)
		{
			this.clearAnimateTween();
			this.opening = false;
		}
		if (this.closeing)
		{
			if (ignoreCloseAnimate)//忽略关闭动画
			{
				this.clearAnimateTween();
				this.closeEnd(WindowBase.CLOSE_NORMAL);
			}
			return;
		}
		if (this.needOutAnimate && !ignoreCloseAnimate && this.parent)
			this.outAnimate(WindowBase.CLOSE_NORMAL);
		else
			this.closeEnd(WindowBase.CLOSE_NORMAL);
	}

	//显示窗口:显示掩藏的窗口
	public Show():void
	{
		if (this.loading || this.opening)
			return;
		this.closeed = false;
		if (this.closeing)
		{
			this.clearAnimateTween();
			this.closeing = false;
		}	
		this.showHandler();
	}

	//掩藏窗口：从舞台移除但不destory
	public Hide():void
	{
		if (this.loading)//加载资源中
		{
			this.closeEnd(WindowBase.CLOSE_NORMAL);
			return;
		}
		if (this.closeing || !this.parent) 
			return;
		if (this.opening)
		{
			this.clearAnimateTween();
			this.opening = false;
		}
		if (this.needOutAnimate)
			this.outAnimate(WindowBase.CLOSE_HIDE);
		else
			this.closeEnd(WindowBase.CLOSE_HIDE);
	}

	//不回收的窗口，再次打开
	public ResetOpen(data:any):void
	{
		this.closeed = false;
		this.windowData = data;
		this.enterWindow(...this.windowData);
	}

	protected init():void//初始化：资源加载完后执行
	{
		//创建UI
	}

	protected enterWindow(...args):void//进入窗口：资源加载完后执行
	{
		if (!this.closeed)//资源加载完后，窗口已关闭但未destroy
			this.showHandler();
		if (!this.eventAdded)
			this.addEventListener();
	}

	protected showHandler():void
	{
		if (this.modal)//需要模态
		{
			if (!this.modalBg)
			{
				this.modalBg = new Laya.Sprite();
				this.modalBg.alpha = this.modalAlpha;
				this.modalBg.on(Laya.Event.CLICK,this,this.onModalClick);
			}
			this.modalBg.graphics.clear();
			this.modalBg.graphics.drawRect(0,0,SystemContext.gameWidth,SystemContext.gameHeight,"#000000");
			this.modalBg.size(SystemContext.gameWidth,SystemContext.gameHeight);
			if (!this.modalBg.parent)
				this.parentLayer.addChild(this.modalBg);
			else//设置到最顶层
				this.parent.setChildIndex(this,this.parent.numChildren-1);
			this.modalBg.visible = true;
		}
		else//不需要
		{
			if (this.modalBg)
				this.modalBg.removeSelf();
		}
		if (!this.parent)
			this.parentLayer.addChild(this);
		else//设置到最顶层
			this.parent.setChildIndex(this,this.parent.numChildren-1);
			
		this.visible = true;
		if (this.needInAnimate)
			this.inAnimate();
		else
			this.openEnd();
		if (this.openSound)
		{
			// SgsSoundManager.PlayEffectSound("res/assets/runtime/voice/effect/" + this.openSound + ".mp3");
		}
	}

	protected addEventListener():void//添加事件监听
	{
		this.eventAdded = true;
		GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE,this,this.onStageResize);
	}

	protected removeEventListener():void//删除事件监听
	{
		GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE,this,this.onStageResize);
	}

	protected inAnimate():void//子类重构进入动画函数:动画结束后调用openEnd函数
	{
		if (this.opening && this.animateTween)//正在打开中
			return;
		if (this.closeing)//正在关闭中:先停止关闭动画
		{
			this.clearAnimateTween();
			this.closeing = false;
		}
		this.mouseEnabled = false;
		this.startAnimateIn();
	}

	protected startAnimateIn():void
	{ 
		this.opening = true;
		this.pos(SystemContext.gameWidth >> 1,SystemContext.gameHeight >> 1);
		this.scale(0,0);

		let endPos:Laya.Point = this.windowTargetPos();
		this.animateTween = Laya.Tween.to(this,{x:endPos.x,y:endPos.y,scaleX:1,scaleY:1}
			,300,Laya.Ease.sineOut,new Laya.Handler(this,this.openEnd));
	}
	
	protected windowTargetPos():Laya.Point//窗口目标位置
	{
		return new Laya.Point(SystemContext.gameWidth - this.width >> 1,SystemContext.gameHeight - this.height >> 1);
	}

	protected openEnd():void
	{
		let endPos:Laya.Point = this.windowTargetPos();
		this.pos(endPos.x,endPos.y);
		this.scale(1,1);
		this.animateTween = null;
		this.opening = false;
		this.mouseEnabled = true;
		this.loadSilenceRes();
		if (this.hideOtherView)//掩藏其他窗口场景
			WindowManager.GetInstance().UpdateHideView(this,true);
	}

	protected outAnimate(closeType:number):void//子类重构离开动画函数：动画结束后调用closeEnd函数
	{
		if (this.closeing && this.animateTween)//正在关闭中
			return;
		if (this.opening)//正在打开中:先停止打开动画
		{
			this.clearAnimateTween();
			this.opening = false;
		}
		this.mouseEnabled = false;
		this.startAnimateOut(closeType);
		if (this.hideOtherView)//更新掩藏其他视图
			WindowManager.GetInstance().UpdateHideView(this,false);
	}

	protected startAnimateOut(closeType:number):void
	{
		this.closeing = true;
		this.animateTween = Laya.Tween.to(this,{x:SystemContext.gameWidth >> 1,y:SystemContext.gameHeight >> 1,scaleX:0,scaleY:0}
			,300,Laya.Ease.sineOut,new Laya.Handler(this,this.closeEnd,[closeType,true]));
	}

	protected closeEnd(closeType:number,animateEnd:boolean = false):void
	{
		this.closeed = true;
		this.animateTween = null;
		this.closeing = false;
		this.mouseEnabled = true;
		if (this.modalBg)
			this.modalBg.removeSelf();
		this.removeSelf();
		if (closeType == WindowBase.CLOSE_NORMAL)//正常
		{
			if (this.autoRecover)//自动回收
				this.destroy();
		}
		else if (closeType == WindowBase.CLOSE_HIDE)//掩藏
		{}
		if (!animateEnd)//不是动画播放结束
		{
			if (this.hideOtherView)//更新掩藏其他视图
				WindowManager.GetInstance().UpdateHideView(this,false);
		}
		GameEventDispatcher.GetInstance().event(GameEventDispatcher.WINDOW_CLOSED,this.name);
	}

	protected onStageResize(event:Laya.Event):void//舞台尺寸变化
	{
		if (this.modalBg)
		{
			this.modalBg.graphics.clear();
			this.modalBg.graphics.drawRect(0,0,SystemContext.gameWidth,SystemContext.gameHeight,"#000000");
			this.modalBg.size(SystemContext.gameWidth,SystemContext.gameHeight);
		}
		if (this.parent && !this.closeing)//非关闭中
		{
			this.clearAnimateTween();
			this.scale(1,1);
			this.windowTargetPos();
		}
		this.pos(SystemContext.gameWidth - this.width >> 1,SystemContext.gameHeight - this.height >> 1);
	}

	private onModalClick(event:Laya.Event):void
    {
    }

	////////////////////////////资源加载逻辑/////////////////////////////////
	protected totalCount:number = 0;
	protected loadedCount:number = 0;
	protected startLoadRes():void
	{
		SilenceResManager.GetInstance().PauseSilenceRes();
		this.loading = true;
		LoadingManager.ShowLoading();
		this.addResEvent();
		this.totalCount = this.resNames.length;
		this.loadedCount = 0;
		let priority:number = 100 + this.resNames.length - 1;
		for (let i:number = 0; i < this.resNames.length; i++)
		{
			RES.LoadGroup(this.resNames[i],priority);
			priority --;
		}
	}

	protected addResEvent():void
	{
		RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
		RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
		RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
	}

	protected removeResEvent():void
	{
		RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
		RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
		RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
		this.totalCount = 0;
		this.loadedCount = 0;
	}

	protected onResourceProgress(event:ResourceEvent):void
	{
		if (!this.resNames || this.resNames.indexOf(event.groupName) == -1) return;
		let progress:number = event.progress;
		progress = this.loadedCount / this.totalCount + progress * (1 / this.totalCount);
		LoadingManager.ShowLoadProgress(progress * 100,100);
	}

	protected onResourceError(event:ResourceEvent):void
	{
		if (!this.resNames || this.resNames.indexOf(event.groupName) == -1) return;
		this.removeResEvent();
		LoadingManager.ShowLoadError("资源组加载失败：" + event.groupName,this.name);
		SilenceResManager.GetInstance().RecoverySilenceRes();
		this.loading = false;
		if (this.destroyed)//窗口已被destroy
		{
			this.clearSkeletonEffectPools();
			this.clearWindowRes();
		}
		else
			this.destroy();
	}

	protected onResourceLoadComplete(event:ResourceEvent):void//资源加载完成
    {	
		if (!this.resNames || this.resNames.indexOf(event.groupName) == -1) return;
		this.loadedCount ++;
		if (this.loadedCount >= this.totalCount)
		{
			this.loading = false;
			this.removeResEvent();
			LoadingManager.CloseLoading();
			if (this.destroyed)//资源加载完时，窗口已被destroy
			{
				this.clearSkeletonEffectPools();
				this.clearWindowRes();
			}
			else
			{
				this.init();
				this.enterWindow(... this.windowData);
			}
			SilenceResManager.GetInstance().RecoverySilenceRes();
		}
	}

    protected loadSilenceRes():void//加载静默资源
    {
        if (!this.silenceResArr || this.silenceResArr.length <= 0) return;
        SilenceResManager.GetInstance().LoadSilenceRes(this.silenceResArr);
	}

	public AddRecoverTemplet(url:string):void
    {
        if (!this.recoverTemplets) 
            this.recoverTemplets = [];
        if (this.recoverTemplets.indexOf(url) == -1)
            this.recoverTemplets.push(url);
    }

	public AddRecoverEffectPool(poolSign:string):void//记录使用对象池的特效，用于退出场景时清理其对象池
    {
		if (!this.skeletonEffectPools)
			this.skeletonEffectPools = [];
		if (this.skeletonEffectPools.indexOf(poolSign) == -1)
			this.skeletonEffectPools.push(poolSign);
	}

	protected clearAnimateTween():void
	{
		if (this.animateTween)
		{
			this.animateTween.clear();
			this.animateTween = null;
		}
	}

	protected clearSkeletonEffectPools():void//清理对象池
    {
        if (this.skeletonEffectPools && this.skeletonEffectPools.length)
        {
            let length:number = this.skeletonEffectPools.length;
            for (let i:number = 0; i < length; i++)
            {
                EffectUtils.ClearSkeletonEffectPool(this.skeletonEffectPools[i]);
            }
            this.skeletonEffectPools.length = 0;
        }
    }
	
	public clearWindowRes():void//清理资源
    {
		if (!this.autoRecoverRes) return;
		//回收动画模板
		if (this.recoverTemplets && this.recoverTemplets.length > 0)
		{
			let length:number = this.recoverTemplets.length;
			for (let i:number = 0; i < length; i++)
			{
				AnimateManager.GetInstane().DestroyAnimate(this.recoverTemplets[i]);
			}
			this.recoverTemplets.length = 0;
		}
        //回收资源组
        if (this.resNames && this.resNames.length > 0)
        {
            for (let i:number = 0; i < this.resNames.length; i++)
            {
                RES.ClearResByGroup(this.resNames[i],false,true);
            }
            this.resNames.length = 0;
        }
    }

	//销毁窗口不准调用destory，请调用Close
	public destroy():void
	{
		this.clearAnimateTween();
		if (this.modalBg)
		{
			this.modalBg.off(Laya.Event.CLICK,this,this.onModalClick);
			this.modalBg.destroy();
			this.modalBg = null;
		} 
		if (this.eventAdded)
			this.removeEventListener();
		super.destroy(true);
		this.clearSkeletonEffectPools();
		this.clearWindowRes();
		this.parentLayer = null;
		this.windowData = null;
		WindowManager.GetInstance().DeleteKey(this.name);
	}
}