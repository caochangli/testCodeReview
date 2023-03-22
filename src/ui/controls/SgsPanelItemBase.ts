import SgsSprite from "./base/SgsSprite";

/*
* name;
*/
export default class SgsPanelItemBase extends SgsSprite
{
    protected drawed:boolean = false;//是否已渲染
    protected inited:boolean = false;//是否已初始化
    protected dataed:boolean = false;//已设置数据

    protected delayLoadTime:number = 100;//资源延迟加载时间
    protected loadStatus:number = 0;//加载状态：0未加载 1加载中 2已加载 

    constructor()
    {
        super();
        this.visible = false;
        this.on(Laya.Event.REMOVED,this,this.onSelfRemoved);
    }

    public get Drawed():boolean
    {
        return this.drawed;
    }

    public get Inited():boolean
    {
        return this.inited;
    }

    public get Dataed():boolean
    {
        return this.dataed;
    }

    public get NeedLeaveDrawClear():boolean//是否需要离开渲染区域清理
    {
        return this.loadStatus != 0;
    }

    /**进入渲染(进入可视区域时调用,滚动时会多次执行)*/
    public EnterDraw():void
    { 
        if (this.drawed) return;
        this.drawed = true;
        this.visible = true;
        if (!this.inited)
        {
            this.inited = true;
            this.init();
            if (this.dataed)
                this.updateViewData();
        }
        else
        {
            if (this.dataed)
                this.startLoad();
        }
    }

    /**离开渲染(离开可视区域时调用,滚动时会多次执行)*/
    public LeaveDraw():void
    {
        if (!this.drawed) return;
        this.drawed = false;
        this.visible = false;
    }

    /**离开可视区域清理*/
    public LeaveDrawClear():void
    {
        if (this.loadStatus == 1)//加载中
        {
            Laya.timer.clear(this,this.onDelayLoad);
            this.loadStatus = 0;
        }
        else if (this.loadStatus == 2)//已加载
            this.leaveDrawClear();
    }

    /**设置数据*/
    public SetData(...args):void
    {
        if (this.inited && this.dataed && this["isLeaveDrawClear"])//重复利用时
            this.LeaveDrawClear();
        this.stopLoad();
        this.loadStatus = 0;
        this.dataed = true;
        if (this.inited)//已初始化
            this.updateViewData();
    }

    /**初始化(首次渲染时调用，仅执行一次)*/
    protected init():void
    {

    }

    /**更新UI界面*/
    protected updateViewData():void
    {
        this.startLoad();
    }

    protected startLoad():void//开始加载
    {
        if (this.drawed && this.loadStatus == 0)
        {
            this.loadStatus = 1;
            if (this.delayLoadTime > 0)
                Laya.timer.once(this.delayLoadTime,this,this.onDelayLoad);
            else
                this.enterDrawLoad();
        }
    }

    protected onDelayLoad():void
    {
        if (!this.drawed || !this.parent)
        {
            this.loadStatus = 0;
            return;
        }
        this.enterDrawLoad();
    }

    protected enterDrawLoad():void//进入渲染加载
    {
        this.loadStatus = 2;
    }

    protected leaveDrawClear():void//离开渲染清理
    {
        this.loadStatus = 0;
    }

    protected stopLoad():void//暂停加载
    {
        if (this.loadStatus == 1)//加载中
        {
            Laya.timer.clear(this,this.onDelayLoad);
            this.loadStatus = 0;
        }
    }

    protected onSelfRemoved(event:Laya.Event):void
    {
        if (!this.destroyed)//非destroy
        {
            if (this.inited && this.dataed && this["isLeaveDrawClear"])//从舞台移除：如回收到对象池
                this.LeaveDrawClear();
        }
    }

    public destroy(destroyChild:boolean=true):void
    {
        Laya.timer.clear(this,this.onDelayLoad);
        super.destroy(destroyChild);
    }
}