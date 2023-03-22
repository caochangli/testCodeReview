import EventExpand from "../../../event/EventExpand";
import Global from "../../../Global";
import TipsManager from "../../../mode/base/TipsManager";
import RES from "../../../res/RES";
import TextureAtlasManager from "../../../textureAtlas/TextureAtlasManager";

/**
 * 重构Image组件：可根据Laya.Event.COMPLETE、Laya.Event.ERROR事件监听加载成功、失败
 */
export default class SgsImage extends Laya.Image
{
    protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected _toolTip:any = "";
    
    protected loadedSkins:Array<string>;//已加载的皮肤地址数组
    
    public autoClear:boolean = true;//自动清理纹理(laya2默认自动回收)
    public onlyDestroyClear:boolean = false;//是否仅destroy时清理资源
    public isMergeAtlas:boolean = true;//是否合并进动态图集
    // public isThorough:boolean = false;//是否彻底清理(调用RES.ClearRes)(laya2采用引用计数回收不再需要保留壳的回收方式)

    constructor(skin:string = "") 
    {
		super(skin);
    }

    public set skin(value:string)
    {
        if (this._skin == value) 
        {
            if (this.source && this.source.url == value)
                this.event(Laya.Event.COMPLETE,this);
            return;
        }
        if (this._skin)//停止之前的加载
        {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin,this,this.loadSkinComplete);
        }
        this.source = null;
        this._skin = value;
        this.clearLoadedSkins(false);
        if (!this._skin)
            return;
        RES.AddReference(value);
        this.addLoadSkin(value);
        this.loadSkin();
    }

    public get skin():string
    {
        return Laya.superGetter(SgsImage,this,"skin");
    }

    public set source(value:Laya.Texture)
    {
        Laya.superSetter(SgsImage,this,"source",value);
    }

    public get source():Laya.Texture
    {
        if (!this["_bitmap"]) return null;
        return Laya.superGetter(SgsImage,this,"source");
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

    protected loadSkin():void
    {
        RES.GetResByUrl(this._skin,this,this.loadSkinComplete,"image",this._skin);
    }

    protected loadSkinComplete(texture:Laya.Texture,key:string):void
    {
		if (this._skin != key) return;
		if (!texture)//加载失败 
        {
			this.source = null;
            this.event(Laya.Event.ERROR,this);
        }
        else
		{
            if (this.isMergeAtlas && TextureAtlasManager.Instance)
                TextureAtlasManager.Instance.NeedPushAtlas(texture);
			this.setSource(key,texture);
            this.event(Laya.Event.COMPLETE,this);
		}
    }

    protected addLoadSkin(url:string):void
    {
        if (!this.loadedSkins)
            this.loadedSkins = [];
        if (url && this.loadedSkins.indexOf(url) == -1)
            this.loadedSkins.push(url);
    }

    protected clearLoadedSkins(destroy:boolean = true):void
    {
        if (!this.autoClear) return;
        if (this.onlyDestroyClear && !destroy) return;
        if (!this.loadedSkins || this.loadedSkins.length <= 0) return;
        let url:string;
        for (let i:number = 0; i < this.loadedSkins.length; i++)
        {
            url = this.loadedSkins[i];
            if (!destroy && url == this._skin) continue;
            RES.ClearResByUrl(url);
        }
        this.loadedSkins.length = 0;
        if (!destroy && this._skin)
            this.loadedSkins.push(this._skin);
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
        if (this._skin)
        {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin,this,this.loadSkinComplete);
        }
        Laya.timer.clear(this,this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        super.destroy(destroyChild);
        this.clearLoadedSkins(true);
        this._skin = null;
    }
}