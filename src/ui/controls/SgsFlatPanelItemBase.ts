import SgsFlatContainer from "./base/SgsFlatContainer";
import SgsSprite from "./base/SgsSprite";
import SgsFlatPanel from "./SgsFlatPanel";

/*
* name;
*/
export default class SgsFlatPanelItemBase extends SgsFlatContainer
{
    protected rendererIndex:number = 0;//呈现器索引
    protected itemRendererFunction:Laya.Handler;//呈现器自定义函数
    protected parentPanel:SgsFlatPanel;
    protected inited:boolean = false;//是否已初始化
    protected rendererData:any;//数据
    protected selected:boolean = false;//选中状态

    protected delayLoadTime:number = 100;//资源延迟加载时间
    protected loadStatus:number = 0;//加载状态：0未加载 1加载中 2已加载 

    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);
    }

    //设置呈现器索引
    public set RendererIndex(val:number)
    {
        this.rendererIndex = val;
    }

    public get RendererIndex():number
    {
        return this.rendererIndex;
    }

    //设置呈现器自定义函数
    public set ItemRendererFunction(val:Laya.Handler)
    {
        this.itemRendererFunction = val;
    }

    public set ParentPanel(val:SgsFlatPanel)
    {
        this.parentPanel = val;
    }

    //设置呈现器数据(原则上不准重构)
    public set RendererData(val:any)
    {
        if (this.rendererData == val) return;//滚动时重新赋值，如数据一致则不往下执行(减少刷新ui执行次数)
        //重复利用时：停止本组件之前的加载及状态还原
        this.stopLoad();
        this.loadStatus = 0;
        this.rendererData = val;
        if (!this.inited)
        {
            this.inited = true;
            this.init();
        }
        if (this.itemRendererFunction)
            this.itemRendererFunction.runWith([this.rendererIndex,this.rendererData,this]);
        this.updateRenderer(this.rendererData);
        this.startLoad();
    }

    public get RendererData():any
    {
        return this.rendererData;
    }

    //设置选中状态
    public set Selected(value:boolean) 
    {
        this.selected = value;
    }

    public get Selected():boolean 
    {
        return this.selected;
    }
    
    //重置数据
    public ResetRendererData():void
    {
        this.rendererData = null;
    }

    //离开可视区域清理
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

    //初始化UI
    protected init():void
    {
        
    }

    //更新呈现器(根据数据处理UI界面)
    protected updateRenderer(rendererData:any):void
    {

    }

    protected startLoad():void//开始加载
    {
        if (this.drawed && this.loadStatus == 0)
        {
            this.loadStatus = 1;
            if (this.delayLoadTime > 0 && (!this.parentPanel || this.parentPanel.GetItemLoadStatus(this.rendererIndex) != 2))//延迟且未加载过
                Laya.timer.once(this.delayLoadTime,this,this.onDelayLoad);
            else
                this.enterDrawLoad();
        }
    }

    protected onDelayLoad():void
    {
        if (!this.drawed)
        {
            this.loadStatus = 0;
            return;
        }
        this.enterDrawLoad();
    } 

    protected enterDrawLoad():void//进入渲染加载
    {
        this.loadStatus = 2;
        if (this.parentPanel)
            this.parentPanel.UpdateItemLoadStatus(this.rendererIndex,this.loadStatus);
    }

    protected leaveDrawClear():void//离开渲染清理
    {
        this.loadStatus = 0;
        if (this.parentPanel)
            this.parentPanel.UpdateItemLoadStatus(this.rendererIndex,this.loadStatus);
    }

    protected stopLoad():void//暂停加载
    {
        if (this.loadStatus == 1)//加载中
        {
            Laya.timer.clear(this,this.onDelayLoad);
            this.loadStatus = 0;
        }
    }

    public ClearDraw(destroy:boolean = true):void
    {
        super.ClearDraw(destroy);
        this.rendererData = null;
        if (destroy)
        {
            Laya.timer.clear(this,this.onDelayLoad);
            this.itemRendererFunction = null;
            this.parentPanel = null;
        }
    }
}