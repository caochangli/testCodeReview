import SgsSprite from "../controls/base/SgsSprite";
import SystemContext from "../../SystemContext";
import WindowManager from "../../mode/base/WindowManager";
import GameEventDispatcher from "../../event/GameEventDispatcher";
import SilenceResManager from "../../mode/base/SilenceResManager";
import EffectUtils from "../../utils/EffectUtils";
import AnimateManager from "../../mode/base/AnimateManager";
import RES from "../../res/RES";

/** 场景基类 
 *  生命周期：init > onAddToStage > createChildren > addEventListener > AnimateIn > AnimateOut > removeEventListener > destroy
*/
export default class SceneBase extends SgsSprite
{
    public static ANIMATE_OUT_COMPLETE:string = "animate_out_complete";
    public static ANIMATE_IN_COMPLETE:string = "animate_in_complete";
    public static ANIMATE_RESET_COMPLETE:string = "ANIMATE_RESET_COMPLETE";

    protected inited:boolean = false;//是否已初始化
    protected needInAnimate:boolean = false;//需要进入动画
	protected needOutAnimate:boolean = false;//需要离开动画
    protected resNames:Array<string>;//场景资源组列表
    protected sceneData:any;//场景数据(外部传入)
    protected silenceResArr:Array<string>;//静默资源组列表(进入场景后自动加载这些资源)
    protected recoverTemplets:Array<string>;//随场景回收的动画模板
    protected skeletonEffectPools:Array<string>;//随场景回收的特效对象池
    protected operationRecord:Array<string>;//操作记录(用于武将、皮肤、三国秀界面返回)
    protected enterComplete:Laya.Handler;

    constructor()
    {
        super();

        this.size(SystemContext.gameWidth,SystemContext.gameHeight);
        this.init();
    }

    //场景名 - 实例是会被自动赋值上类名
    protected sceneName:string = "";
	public get SceneName():string
	{
		return this.sceneName;
	}
	public set SceneName(val:string)
	{
		this.sceneName = val;
	}

    //场景数据 - 进入场景时传递的数据
    public set SceneData(val:any)
	{
		this.sceneData = val;
	}
    public get SceneData():any
    {
        return this.sceneData;
    }

    public get ResNames():Array<string>
    {
        return this.resNames;
    }
    public set ResNames(value:Array<string>)
    {
        this.resNames = value;
    }

    public get EnterComplete():Laya.Handler
    {
        return this.enterComplete;
    }
    public set EnterComplete(value:Laya.Handler)
    {
        this.enterComplete = value;
    }

    //场景存在的情况下再次进入
    public ResetScene(data:any):void
    {
        
    }

    //获取操作记录
    public get OperationRecord():Array<string>
    {
        return this.operationRecord;
    }

    //添加操作记录
    public AddOperationRecord(name:string):void
    {
        if (!this.operationRecord)
            this.operationRecord = [];
        if (this.operationRecord.indexOf(name) == -1)
            this.operationRecord.push(name);
    }

    //返回上一界面(同时删除最后一条记录)
    public BackFrontView(isBack:boolean = true):void
    {
        if(isBack)
        {
            let frontName:string = this.getFrontOperationRecord();
            if (frontName != "")//存在上一界面
                WindowManager.GetInstance().ShowWindow(frontName);
            else//还原场景内容
            {
                
            }
            this.delLastOperationRecord();
        }
        else//直接还原场景内容
        {
            this.DelAllOperationRecord();
        }
    }

    //获取最后一条操作记录
    public GetLastOperationRecord():string
    {
        if (this.operationRecord && this.operationRecord.length >= 1)
            return this.operationRecord[this.operationRecord.length - 1];
        return "";
    }

    //删除全部操作记录
    public DelAllOperationRecord():void
    {
        if (this.operationRecord)
            this.operationRecord.length = 0;
    }

    //获取上一条操作记录
    private getFrontOperationRecord():string
    {
        if (this.operationRecord && this.operationRecord.length >= 2)
            return this.operationRecord[this.operationRecord.length - 2];
        return "";
    }

    //删除最后一条操作记录
    private delLastOperationRecord():void
    {
        if (this.operationRecord && this.operationRecord.length > 0)
            this.operationRecord.pop();
    }

    protected init():void//初始化 - 做一些数据初始化
    {
        this.on(Laya.Event.ADDED, this, this.onAddToStage);
        this.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }

    protected onAddToStage(event?:Laya.Event):void//被添加到舞台上
    {
        if (!this.inited) 
        {
            this.inited = true;
            this.createChildren();
            this.addEventListener();
            this.loadSilenceRes();
        }
        this.AnimateIn();
    }
    
    protected createChildren():void//创建子项 - add到舞台后执行
    {   
        //子项在这里创建，切换场景缓存的协议在createChildren后才释放缓存协议
    }

    protected addEventListener():void//添加事件监听
    {
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE,this,this.onStageResize);
    }
   
    protected removeEventListener():void//删除事件监听
    {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE,this,this.onStageResize);
    }

    protected loadSilenceRes():void//加载静默资源
    {
        if (!this.silenceResArr || this.silenceResArr.length <= 0) return;
        SilenceResManager.GetInstance().LoadSilenceRes(this.silenceResArr);
    }

    public AnimateIn():void//进入场景过度效果
    {
        this.mouseEnabled = false;
        if (this.needInAnimate)//需要进入动画
        {
            //子类重构实现，并在进入动画结束后调用animateInEnd接口
        }
        else
        {
            this.animateInEnd();
        }
        // WBMgr.GetInstance().StopCache();//进入场景，关闭缓存
    }
    
	protected animateInEnd():void//进入场景过度动画结束
	{
        this.mouseEnabled = true;
        this.event(SceneBase.ANIMATE_IN_COMPLETE,this);
        if (this.enterComplete)
        {
            this.enterComplete.run();
            this.enterComplete = null;
        }
	}
    
    public AnimateOut():void//离开场景过度效果
    {   
        if (this.needOutAnimate)//需要离开动画
        {
            //子类重构实现，并在进入动画结束后调用animateOutEnd接口
        }   
        else
        {
            this.animateOutEnd();
        }   
    }

    protected animateOutEnd():void//离开场景动画结束
    {
        this.removeSelf();
        this.removeEventListener();
        this.event(SceneBase.ANIMATE_OUT_COMPLETE,this);
    }

    protected onRemoveToStage(event?:Laya.Event):void//从舞台上移除
    {
        this.off(Laya.Event.ADDED, this, this.onAddToStage);
        this.off(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        this.size(SystemContext.gameWidth,SystemContext.gameHeight);
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

    protected clearSceneRes():void//清理资源
    {
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

    public destroy():void
    {
        if (this.destroyed) return;
        Laya.Tween.clearAll(this);
        Laya.timer.clearAll(this);
        super.destroy(true);	
        this.clearSkeletonEffectPools();
        this.clearSceneRes();
        this.sceneData = null;
        this.enterComplete = null;
	}
}