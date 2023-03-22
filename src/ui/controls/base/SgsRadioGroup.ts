import SgsSpriteRadio from "./SgsSpriteRadio";
import SgsFlatRadio from "./SgsFlatRadio";
import SgsSprite from "./SgsSprite";
/*
* 控件定义一组 Radio 控件,这些控件相互排斥
*/
export default class SgsRadioGroup extends Laya.EventDispatcher
{
    public static HORIZONTAL:string = "horizontal";
    public static VERTICAL:string = "vertical";

    protected _x:number = 0;
    protected _y:number = 0;
    protected _space:number = 10;
    protected _rowledge:number = 10;
    protected _direction:string = SgsRadioGroup.HORIZONTAL;
    protected _visible:boolean = true;
    protected _enabled:boolean = true;

    protected _upSkin:string = "";
    protected _overSkin:string = "";
    protected _downSkin:string = "";
    protected _disableSkin:string = "";
    protected _selectedSkin:string = "";

    protected _enabledField:string = "enabled";
    protected _labelField:string = "label";
    protected _labelColors:string = "";
    protected _labelSize:number = Laya.Text.defaultFontSize;
    protected _labelFont:string = Laya.Text.defaultFont;
    protected _strokeColors:string = "";
    protected _labelStroke:number = 0;
    protected _labelBold:boolean = false;
    protected _labelItalic:boolean = false;
    protected _labelPadding:string = "";

    protected _selectedIndex:number = -1;

    protected _isCreate:boolean = false;
    protected _childList:Array<any>;
    protected _radioList:Array<SgsSpriteRadio | SgsFlatRadio>;

    protected render:Laya.Sprite | SgsSprite;
    protected isFlat:boolean = false;
    protected otherRenders:Array<SgsSprite>;
    
    protected _lineLength:number = 10000;
    protected _linefeed:boolean = false;

    constructor(render:Laya.Sprite | SgsSprite,isFlat:boolean = false,otherRenders:Array<SgsSprite> = null)
    {
        super();

        this.render = render;
        if (this.render)
            this.render.on("destroyEvent",this,this.onFollowDestroy);
        this.isFlat = isFlat;
        this.otherRenders = otherRenders;
    }

    public set x(value:number)
    {   
        if (this._x == value) return;
        this._x = value;
        this.layout();
    }

    public get x():number
    {
        return this._x;
    }

    public set y(value:number)
    {
        if (this._y == value) return;
        this._y = value;
        this.layout();
    }

    public get y():number
    {
        return this._y;
    }

    /** 行长度,数值为除了正整数以外的其他数字，无效 */
    public set LineLength(value:number)
    {
        if(value > 0 && value % 1 === 0)
            this._lineLength = value;
    }

    /** 行长度,长度为0时，换行无效 */
    public get LineLength()
    {
        return this._lineLength;
    }

    /** 是否换行 - 默认不换行 */
    public set Linefeed(value:boolean)
    {
        this._linefeed = value;
    }

    /** 是否换行 - 默认不换行 */
    public get Linefeed()
    {
        return this._linefeed;
    }

    public set enabled(value:boolean)
    {
        this._enabled = value;
        if (this._radioList)
        {
            let radio:SgsSpriteRadio | SgsFlatRadio;
            for (let i:number = 0; i < this._radioList.length; i++)
            {
                radio = this._radioList[i];
                radio.enabled = this._enabled;
            }
        }
    }

    public get enabled():boolean
    {
        return this._enabled;
    }

    public set visible(value:boolean)
    {
        this._visible = value;
        if (this._radioList)
        {
            let radio:SgsSpriteRadio | SgsFlatRadio;
            for (let i:number = 0; i < this._radioList.length; i++)
            {
                radio = this._radioList[i];
                radio.visible = this._visible;
            }
        }
    }

    public get visible():boolean
    {
        return this._visible;
    }

    /**间距*/
    public set space(value:number)
    {
        this._space = value;
        this.layout();
    }

    /**行间距*/
    public set Rowledge(value:number)
    {
        this._rowledge = value;
        this.layout();
    }

    /**布局方向：HORIZONTAL、VERTICAL*/
    public set direction(value:string)
    {
        this._direction = value;
        this.layout();
    }

    public set childList(value:Array<any>)
    {
        this.removeChilds();

        if (!value || value.length <= 0) return;

        this._childList = [];
        for (let i:number = 0; i < value.length; i++)
        {
            this._childList.push(value[i]);
        }
        this.createChilds();
    }

    /**清理*/
    public Clear():void
    {
        this.removeChilds();
        if (this.render)
        {
            this.render.off("destroyEvent",this,this.onFollowDestroy);
            this.render = null;
        }
        this.otherRenders = null;
        this.offAll();
    }

    public InitSkin(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = ""):void
    {
        this._upSkin = upSkin;
        this._overSkin = overSkin;
        this._downSkin = downSkin;
        this._disableSkin = disableSkin;
        this._selectedSkin = selectedSkin;

        this.createChilds();
    }

    public get SelectedValue():number
    {
        if (!this._childList || this._childList.length <= 0) return -1;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._childList.length) return -1;
        return this._childList[this._selectedIndex].value;
    }

    public set SelectedValue(value:number)
    {
        this.selectedIndex = this.getIndexByValue(value);
        this.updateRadioState();
    }

    protected getIndexByValue(value:number):number
    {
        if (!this._childList || this._childList.length <= 0) return -1;
        let result:number = -1;
        let data:any;
        for (let i:number = 0; i < this._childList.length; i++)
        {
            data = this._childList[i];
            if (typeof(data) == "object")
            {
                if (this._childList[i].value == value)
                {
                    result = i;
                    break;
                }
            }
        }
        return result;
    }

    /**选中索引*/
    public get selectedIndex():number
    {
        return this._selectedIndex;
    }

    /**选中索引*/
    public set selectedIndex(value:number)
    {
        this._selectedIndex = value;
        this.updateRadioState();
    }

    /**选中的数据*/
    public get selectedItem():any
    {
        if (!this._childList || this._childList.length <= 0) return null;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._childList.length) return null;
        return this._childList[this._selectedIndex];
    }

    /**选中的数据*/
    public get selectedRadio():any
    {
        if (!this._radioList || this._radioList.length <= 0) return null;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._radioList.length) return null;
        return this._radioList[this._selectedIndex];
    }

    /**标签显示字段名(如传入数组为字符串类型可忽略)*/
    public set labelField(value:string)
    {
        this._labelField = value;
    }

    /**
     * 表示按钮各个状态下的文本颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor,selectedColor"。</p>
     */
    public set labelColors(value:string)
    {
        this._labelColors = value;
        this.styleChanged();
    }

    /**表示按钮文本标签的字体大小。*/        
    public set labelSize(value:number)
    {   
        this._labelSize = value;
        this.styleChanged();
    }        
    
    /**表示按钮文本标签的字体名称，以字符串形式表示。*/
    public set labelFont(value:string)
    {
        this._labelFont = value;
        this.styleChanged();
    }
    
    /**
     * 表示按钮各个状态下的描边颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor,selectedColor"。</p>
     */
    public set strokeColors(value:string)
    {
        this._strokeColors = value;
        this.styleChanged();
    }
    
    /**描边宽度（以像素为单位）。 默认值0，表示不描边*/
    public set labelStroke(value:number)
    {
        this._labelStroke = value;
        this.styleChanged();
    }
    
    /**表示按钮文本标签是否为粗体字。*/
    public set labelBold(value:boolean)
    {
        this._labelBold = value;
        this.styleChanged();
    }
    
    /**表示按钮文本标签是否为斜体。*/
    public set labelItalic(value:boolean)
    {   
        this._labelItalic = value;
        this.styleChanged();
    }
    
    /**
    *表示按钮文本标签的边距。
    *<p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
    */
    public set labelPadding(value:string)
    {
        this._labelPadding = value;
        this.styleChanged();
    }
    /**
     * 
     * @param val 
     */
    public RemoveChildByValue(val:number):void{
        let index:number = this.getIndexByValue(val);
        let radio:SgsSpriteRadio | SgsFlatRadio = this._radioList[index];
        if(radio){
            this._radioList.splice(index,1);
            if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite)
            {
                this.render.removeDrawChild(radio);
            }
            else if (radio instanceof SgsSprite)
            {
                if (radio.parent) radio.parent.removeChild(radio);
            }
            this.layout();
        }
    }
    /**
     * 
     * @param val 
     */
    public RemoveChildWithoutValue(val:number):void{
        let index:number = this.getIndexByValue(val);
        let radio:SgsSpriteRadio | SgsFlatRadio = this._radioList[index];
        for(let i:number = 0;i < this._radioList.length;i++){
            let radio1:SgsSpriteRadio | SgsFlatRadio = this._radioList[i];
            if(radio1 != radio){
                this._radioList.splice(i,1);
                if (radio1 instanceof SgsFlatRadio && this.render instanceof SgsSprite)
                {
                    this.render.removeDrawChild(radio1);
                }
                else if (radio1 instanceof SgsSprite)
                {
                    if (radio1.parent) radio1.parent.removeChild(radio1);
                }         
                i--           
            }
            
        }
        this.layout();
    }

    protected createChilds():void
    {
        if (!this.render) return;
        if (!this._childList || this._childList.length <= 0) return;
        if (this._upSkin == "") return;
        if (this._isCreate) return;
        this._isCreate = true;
        this._radioList = [];
        let radio:SgsSpriteRadio | SgsFlatRadio;
        let data:any;
        for (let i:number = 0; i < this._childList.length; i++)
        {
            data = this._childList[i];
            if (this.isFlat) 
                radio = new SgsFlatRadio(this.otherRenders);
            else 
                radio = new SgsSpriteRadio();
            radio.name = i.toString();
            radio.enabled = this._enabled;
            radio.visible = this._visible;
            radio.InitSkin(this._upSkin,this._overSkin,this._downSkin,this._disableSkin,this._selectedSkin);
            radio.on(Laya.Event.CHANGE,this,this.onChange);
            if (typeof(data) == "string")
            {
                radio.label = data;
            }
            else if (typeof(data) == "number")
            {
                radio.label = data.toString();
            }
            else
            {
                radio.label = data[this._labelField];
            }
            
            if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite)
                this.render.addDrawChild(radio);
            else
                this.render.addChild(<SgsSpriteRadio>radio);
            this._radioList.push(radio);
        }
        this.updateRadioState();
        this.styleChanged();
    }

    protected removeChilds():void
    {
        if (!this.render) return;
        if (this._childList)
        {
            while (this._childList.length > 0)
            {
                this._childList.pop();
            }
            this._childList = null;
        }
        if (this._radioList)
        {
            let radio:SgsSpriteRadio | SgsFlatRadio;
            while (this._radioList.length > 0)
            {
                radio = this._radioList.pop();
                radio.off(Laya.Event.CHANGE,this,this.onChange);
                if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite)
                {
                    this.render.removeDrawChild(radio);
                }
                else if (radio instanceof SgsSprite)
                {
                    if (radio.parent) radio.parent.removeChild(radio);
                }
            }
            this._radioList = null;
        }

        // todo 重新赋值需要重置状态
        this._isCreate = false;
        this._styleChanged = false;
    }

    protected onChange(event:any):void
    {
        let index:number = -1;
        if (event instanceof SgsFlatRadio) index = parseInt(event.name);
        else if (event instanceof Laya.Event) index = parseInt(event.currentTarget.name);
        this._selectedIndex = index;
        this.updateRadioState();
        this.event(Laya.Event.CHANGE,this);
    }

    protected updateRadioState():void
    {
        if (!this._radioList || this._radioList.length <= 0) return;
        let radio:SgsSpriteRadio | SgsFlatRadio;
        for (let i:number = 0; i < this._radioList.length; i++)
        {
            radio = this._radioList[i];
            radio.selected = i == this._selectedIndex ? true : false;
        }
    }

    protected _styleChanged:boolean = false;
    protected styleChanged():void
    {
        if (!this._styleChanged)
        {
            this._styleChanged = true;
            Laya.timer.callLater(this,this.changeChanged);
        }
    }

    protected changeChanged():void
    {
        if (!this._radioList || this._radioList.length <= 0) return;
        let radio:SgsSpriteRadio | SgsFlatRadio;
        for (let i:number = 0; i < this._radioList.length; i++)
        {
            radio = this._radioList[i];
            if (this._labelColors != "") radio.labelColors = this._labelColors;
            radio.labelSize = this._labelSize;
            radio.labelFont = this._labelFont;
            if (this._strokeColors != "") radio.strokeColors = this._strokeColors;
            radio.labelStroke = this._labelStroke;
            radio.labelBold = this._labelBold;
            radio.labelItalic = this._labelItalic;
            if (this._labelPadding != "") radio.labelPadding = this._labelPadding;
        }
        this.layout();
    }

    protected layout():void
    {
        if (!this._radioList || this._radioList.length <= 0) return;
        let lastRadio:SgsSpriteRadio | SgsFlatRadio;
        let radio:SgsSpriteRadio | SgsFlatRadio;
        for (let i:number = 0; i < this._radioList.length; i++)
        {
            radio = this._radioList[i];
            if (this._direction == SgsRadioGroup.HORIZONTAL)
            {
                if(this._linefeed && this._lineLength > 0)
                {
                    if(i % this._lineLength === 0)
                    {
                        radio.x = this._x;
                    }
                    else
                    {
                        radio.x = lastRadio ? lastRadio.x + lastRadio.width + this._space : this._x;
                    }
                    radio.y = this._y +  Math.floor(i / this._lineLength) * this._rowledge;
                }
                else
                {
                    radio.x = lastRadio ? lastRadio.x + lastRadio.width + this._space : this._x;
                    radio.y = this._y;
                }
            }
            else
            {
                if(this._linefeed && this._lineLength > 0)
                {

                }
                else
                {
                    radio.y = lastRadio ? lastRadio.y + lastRadio.height + this._space : this._y;
                    radio.x = this._x;
                }
            }
            lastRadio = radio;
        }
    }

    protected onFollowDestroy(target:Laya.Sprite):void//回收跟随的对象destroy了
    {
        this.Clear();
    }
}