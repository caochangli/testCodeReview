import SgsFlatButton from "./SgsFlatButton";
import SgsSprite from "./SgsSprite";

/*
* 扁平CheckBox:状态改变后派发Laya.Event.CHANGE事件，手动设置selected属性不派发事件。
*/
export default class SgsFlatCheckBox extends SgsFlatButton
{   
    protected _data:any;

    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);

        this.labelPadding = "0,0,0,5";
    }

    protected _width:number = 0;
    public set width(value:number)
    {
        this._width = value;
    }

    public get width():number
    {
        if (this._width > 0)//外部设置了宽度
            return this._width;
        let left:number = parseInt(this._labelPadding[3]);
        return this.background.width + left + this.textField.width;
    }

    public set height(value:number)
    {
    }

    public get height():number
    {
        return Math.max(this.background.height,this.textField.height);
    }

    public size(width:number, height:number):void
    {
        
    }

    public set data(value:any)
    {
        this._data = value;
    }

    public get data():any
    {
        return this._data;
    }

    protected initChilds():void
    {
        super.initChilds();

        this.textField.mouseEnabled = true;
        // this.textField.ButtonMode = true;
        this.textField.align = "left";
        this.textField.valign = "top";
    }

    /**绘制*/
	public Draw(render:SgsSprite,index:number = -1):void
	{
        super.Draw(render,index);

        this.textField.on(Laya.Event.MOUSE_UP,this,this.onUp);
        this.textField.on(Laya.Event.MOUSE_OVER,this,this.onOver);
        this.textField.on(Laya.Event.MOUSE_DOWN,this,this.onDown);
        this.textField.on(Laya.Event.MOUSE_OUT,this,this.onOut);
        this.textField.on(Laya.Event.CLICK,this,this.onClick);
	}

	/**清除 -- 擦除绘制及数据*/
	public ClearDraw(destroy:boolean = true):void
	{
        super.ClearDraw(destroy);

        this.textField.off(Laya.Event.MOUSE_UP,this,this.onUp);
        this.textField.off(Laya.Event.MOUSE_OVER,this,this.onOver);
        this.textField.off(Laya.Event.MOUSE_DOWN,this,this.onDown);
        this.textField.off(Laya.Event.MOUSE_OUT,this,this.onOut);
        this.textField.off(Laya.Event.CLICK,this,this.onClick);
	}

    public set enabled(value:boolean)
    {
        Laya.superSetter(SgsFlatCheckBox,this,"enabled",value);
        // this.textField.ButtonMode = value;
    }

    public get enabled():boolean
    {
        return Laya.superGetter(SgsFlatCheckBox,this,"enabled");
    }

    public set TipTriggerType(value:any)
    {
        Laya.superSetter(SgsFlatCheckBox,this,"TipTriggerType",value);
        this.textField.TipTriggerType = value;
    }

    public set ToolTip(value:any)
    {
        Laya.superSetter(SgsFlatCheckBox,this,"ToolTip",value);
        this.textField.ToolTip = value;
    }

    public get ToolTip():any
    {
        return Laya.superGetter(SgsFlatCheckBox,this,"ToolTip");
    }

    protected onClick(event:Laya.Event):void
    {
        super.onClick(event);

        if (!this.enabled) return;//禁用状态阻止事件
        this.dispEventChange(event);
    }

    protected dispEventChange(event:Laya.Event):void
    {
        this.selected = !this.selected;
        this.event(Laya.Event.CHANGE,this);
    }

    protected changeLayout():void
    {
        this._layoutChanged = false;

        let left:number = parseInt(this._labelPadding[3]);
        let top:number = parseInt(this._labelPadding[0]);

        this.textField.x = this.background.width + left;
        if (this.background.height >= this.textField.height)//图比文字高
        {
            this.background.y = 0;
            this.textField.y = top + (this.background.height - this.textField.height >> 1);
        }
        else
        {
            this.textField.y = 0;
            this.background.y = top + (this.textField.height - this.background.height >> 1);
        }
    }
}