import SgsSprite from "./base/SgsSprite";
import LoadingManager from "../../mode/base/LoadingManager";
import RES from "../../res/RES";
import ResourceEvent from "../../res/ResourceEvent";

/*
* viewStack子项基类
*/
export default class ViewStackBase extends SgsSprite
{
    protected autoRecoverRes:boolean = true;//自动回收弹窗资源
    protected resNames:Array<string>;//资源组名
    protected loading:boolean = false;//加载资源中
    protected totalCount:number = 0;
	protected loadedCount:number = 0;
    protected initData:any = null;

    constructor(initData:any = null)
    {
        super();

        this.initData = initData;
    }

    //初始化:资源加载完后调用
    protected init():void
    {

    }

    //再次显示
    public Reset():void
    {

    }

    //移除
    public Remove():void
    {

    }

    //准备关闭(窗口调用close时执行)
    public ReadyClose():void
    {

    }

    //开始加载资源
	public StartLoadRes():void
	{
        if (this.loading)//加载中:等待加载完成自动调用init
            return;
        if (!this.resNames || this.resNames.length <= 0)//无需加载资源
        {
            this.init();
            return;
        }
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
		this.loading = false;
		if (this.destroyed)//窗口已被destroy
		{
			this.clearViewStackRes();
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
				this.clearViewStackRes();
			}
			else
			{
				this.init();
			}
		}
    }
    
    protected clearViewStackRes():void//回收资源组
    {
        if (!this.autoRecoverRes) return;
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
        super.destroy();
        this.clearViewStackRes();
        this.initData = null;
    }
}