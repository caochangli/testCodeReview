import SgsSprite from "./SgsSprite";
import SgsTexture from "./SgsTexture";
import RES from "../../../res/RES";
import SgsSpriteButton from "./SgsSpriteButton";
import FilterUtils from "../../../utils/FilterUtils";

export default class SgsSlider extends SgsSprite
{
    protected trackBg:SgsTexture;
    protected trackBar:SgsTexture;
    protected trackBtn:SgsSpriteButton;

    protected _value:number = 0;
    protected _minValue:number = 0;
    protected _maxValue:number = 100;
    protected _enabled:boolean = true;
    protected _isVertical:boolean = false;//是否垂直

    constructor(isVertical:boolean = false)
    {
        super();

        this._isVertical = isVertical;

        this.trackBg = new SgsTexture();
        this.addDrawChild(this.trackBg);

        this.trackBar = new SgsTexture();
        this.addDrawChild(this.trackBar);

        this.trackBtn = new SgsSpriteButton();
        this.addChild(this.trackBtn);

        this.trackBtn.on(Laya.Event.MOUSE_DOWN,this,this.onMouseDown);
    }

    public set width(val:number)
    {
        Laya.superSetter(SgsSlider,this,"width",val);
        this.trackBg.width = val;
        this.trackBar.width = val;
        this.layoutTrackBtn();
    }
    public get width():number
    {
        return Laya.superGetter(SgsSlider,this,"width");
    }

    public set height(val:number)
    {
        Laya.superSetter(SgsSlider,this,"height",val);
        this.trackBg.height = val;
        this.trackBar.height = val;
        this.layoutTrackBtn();
    }
    public get height():number
    {
        return Laya.superGetter(SgsSlider,this,"height");
    }

    public set bgSkin(val:string)
    {
        this.trackBg.texture = RES.GetRes(val);
        if (this.width <= 0)
            this.width = this.trackBg.width;
        if (this.height <= 0)
            this.height = this.trackBg.height;
    }
    public set bgSizeGrid(val:string)
    {
        this.trackBg.sizeGrid = val;
    }

    public set barSkin(val:string)
    {
        this.trackBar.texture = RES.GetRes(val);
    }
    public set barSizeGrid(val:string)
    {
        this.trackBar.sizeGrid = val;
    }

    public setBtnSkin(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = "",selectedDisableSkin:string = "")
    {
        this.trackBtn.InitSkin(upSkin,overSkin,downSkin,disableSkin,selectedSkin,selectedDisableSkin);
        this.layoutTrackBtn();
    }
    
    public setSlider(min:number,max:number,value:number):void
    {
        this._minValue = min;
        this._maxValue = max;
        this.value = value;
    }

    public set value(val:number)
    {
        this._value = val;
        this.updateView();
    }
    public get value():number
    {
        return this._value;
    }

    public set enabled(val:boolean)
    {
        if(this._enabled == val)return;
        this._enabled = val;
        this.mouseEnabled = val;
        this.filters = val ? null : FilterUtils.GetGrayFilter();
        if (!this._enabled)//禁用
        {
            Laya.stage.off(Laya.Event.MOUSE_UP,this,this.onMouseUp);
            Laya.stage.off(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
            this.trackBtn.stopDrag();
        }
    }
    public get enabled():boolean
    {
        return this._enabled;
    }

    protected onMouseDown(e:Laya.Event):void
    {
        Laya.stage.on(Laya.Event.MOUSE_UP,this,this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
        let rect:Laya.Rectangle;
        if (this._isVertical)
            rect = new Laya.Rectangle(this.width - this.trackBtn.width >> 1,-(this.trackBtn.height >> 1),0,this.height);
        else
            rect = new Laya.Rectangle(-(this.trackBtn.width >> 1),this.height - this.trackBtn.height >> 1,this.width,0);
        this.trackBtn.startDrag(rect);
    }

    public onMouseMove(e:Laya.Event):void
    {
        this.updateValue();
    }

    protected updateValue():void
    {
        let oldValue:number = this._value;
        let num = this._maxValue - this._minValue;
        if (this._isVertical)
            this._value = ((this.trackBtn.y >> 0) + (this.trackBtn.height >> 1)) / this.height * num + this._minValue;
        else
            this._value = ((this.trackBtn.x >> 0) + (this.trackBtn.width >> 1)) / this.width * num + this._minValue;
        if (this._value < this._minValue)
            this._value = this._minValue;
        else if (this._value > this._maxValue)
            this._value = this._maxValue;
        
        if (oldValue != this._value)
        {
            this.updateView();
            this.event(Laya.Event.CHANGE,this);
        }
    }

    protected updateView():void
    {
        let num = this._maxValue - this._minValue;
        let barValue:number = 0;
        if (this._isVertical)
        {
            barValue = this.height * (this._value - this._minValue) / num >> 0;
            this.trackBtn.x = barValue - (this.trackBtn.height >> 1);
            this.trackBar.height = barValue;
        }
        else
        {
            barValue = this.width * (this._value - this._minValue) / num >> 0;
            this.trackBtn.x = barValue - (this.trackBtn.width >> 1);
            this.trackBar.width = barValue;
        }
        this.trackBar.visible = barValue > 0 ? true : false;
    }

    protected onMouseUp(e:Laya.Event):void
    {
        Laya.stage.off(Laya.Event.MOUSE_UP,this,this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
        this.trackBtn.stopDrag();
        this.updateValue();
        e.stopPropagation();
    }

    protected layoutTrackBtn():void
    {
        if (this._isVertical)
            this.trackBtn.x = this.width - this.trackBtn.width >> 1;
        else
            this.trackBtn.y = this.height - this.trackBtn.height >> 1;
    }

    public destroy():void
    {
        Laya.stage.off(Laya.Event.MOUSE_UP,this,this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
        this.trackBtn.stopDrag();
        super.destroy();
    }
}