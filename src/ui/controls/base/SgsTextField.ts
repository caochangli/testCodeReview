import TipsManager from "../../../mode/base/TipsManager";
import Global from "../../../Global";
import EventExpand from "../../../event/EventExpand";

export default class SgsTextField extends Laya.Text
{
	protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected _toolTip:any = "";//注意如果sprite的texure设置了toolTip，可能会有问题
	// protected buttonMode:boolean = false;//鼠标手型

	public constructor() 
	{
		super();
	}
	

	//设置整数位置,避免字体位置出现小数点而模糊，
	public pos(x:number,y:number):Laya.Sprite
	{
        return super.pos(x >> 0,y >> 0,true);
    }
	
	// public get ButtonMode():boolean
    // {
    //     return this.buttonMode;
    // }

    // public set ButtonMode(value:boolean)
    // {
    //     if (value)
    //     {
    //         this.mouseEnabled = true;
    //         this.on(Laya.Event.MOUSE_OVER,this,this.onOverButtonMode);
    //         this.on(Laya.Event.MOUSE_OUT,this,this.onOutButtonMode);
    //     }
    //     else
    //     {
    //         this.off(Laya.Event.MOUSE_OVER,this,this.onOverButtonMode);
    //         this.off(Laya.Event.MOUSE_OUT,this,this.onOutButtonMode);
    //         SgsMouseManager.ButtonMode(this,false);
    //     }
    //     this.buttonMode = value;
    // }

    // private onOverButtonMode(event:SgsTexture):void
    // {
    //     if (this.buttonMode) {
    //         SgsMouseManager.ButtonMode(this,true);
    //     }
    // }

    // private onOutButtonMode(event:SgsTexture):void
    // {
    //     SgsMouseManager.ButtonMode(this,false);
	// }
	
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
        super.destroy(destroyChild);
    }
}