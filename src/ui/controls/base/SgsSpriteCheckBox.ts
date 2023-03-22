import SgsSpriteButton from "./SgsSpriteButton";

/*
* 普通CheckBox：状态改变后派发Laya.Event.CHANGE事件，手动设置selected属性不派发事件。
*/
export default class SgsSpriteCheckBox extends SgsSpriteButton
{
    protected _data:any;

    constructor()
    {
        super();

        this.labelPadding = "0,0,0,5";
    }

    public set width(value:number)
    {
    }

    public get width():number
    {
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

    public set data(value:any)
    {
        this._data = value;
    }

    public get data():any
    {
        return this._data;
    }

    protected createChildren():void
    {
        super.createChildren();

        this.textField.align = "left";
        this.textField.valign = "top";
    }

    protected onMouse(event:Laya.Event):void
    {
        super.onMouse(event);

        if (this.enabled && event.type == Laya.Event.CLICK)
        {
            this.dispEventChange(event);
        }
    }

    protected dispEventChange(event:Laya.Event):void
    {
        this.selected = !this.selected;
        event.type = Laya.Event.CHANGE;
        if (this.eventDispatcher) this.eventDispatcher.event(Laya.Event.CHANGE,event);
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