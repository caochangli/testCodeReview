import SgsTexture from "./SgsTexture";
import SgsText from "./SgsText";
import SgsSprite from "./SgsSprite";
import RES from "../../../res/RES";
import Global from "../../../Global";
import ButtonPhaseEnum from "../../../enum/base/ButtonPhaseEnum";
/*
* 普通按钮：整个按钮只占一个sprite，皮肤和文字均绘制到自身sprite中
*/

export default class SgsSpriteButton extends SgsSprite
{
    protected eventDispatcher:Laya.EventDispatcher;

    protected phase:number = 0;//按钮状态标识
    protected skins:Array<string>;//皮肤数组：up、over、down、disable、select
    protected _labelColors:Array<string>;
    protected _strokeColors:Array<string>;
    protected _labelPadding:Array<string>;
    // protected _visible:boolean = true;
    protected _selected:boolean = false;
    protected _enabled:boolean = true;
    protected _text:string = "";
    protected _loadSkins:Array<string>;

    protected _stateChanged:boolean = false;
    protected _layoutChanged:boolean = false;

    protected background:SgsTexture;
    protected textField:SgsText;

    public selectedEnabled:boolean = true;//选中状态时，是否触发点击事件
    
    constructor()
    {
        super();

        this.labelColors = "#ffffff,#ffffff,#ffffff,#ffffff,#ffffff";
        this.strokeColors = "#000000,#000000,#000000,#000000,#000000";
        this.labelPadding = "0,0,0,0";
        // this.ButtonMode = true;

        this.createChildren();

        super.on(Laya.Event.ADDED, this, this.onAddToStage);
        super.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }

    public set width(value:number)
    {
        Laya.superSetter(SgsSprite,this,"width",value);
        this.background.width = value;
        this.setLayoutChanged();
    }

    public get width():number
    {
        return this.background.width;
    }

    public set height(value:number)
    {
        Laya.superSetter(SgsSprite,this,"height",value);
        this.background.height = value;
        this.setLayoutChanged();
    }

    public get height():number
    {
        return this.background.height;
    }

    protected createChildren():void
    {
        this.background = new SgsTexture();
        this.addDrawChild(this.background);

        this.textField = new SgsText();
        this.textField.wordWrap = false;
        this.textField.align = "center";
        this.textField.valign = "middle";
        this.addDrawChild(this.textField);
    }

    protected onAddToStage(event?:Laya.Event):void
    {
        this.phase = ButtonPhaseEnum.up;

        super.on(Laya.Event.MOUSE_UP,this,this.onMouse);
        super.on(Laya.Event.MOUSE_OVER,this,this.onMouse);
        super.on(Laya.Event.MOUSE_DOWN,this,this.onMouse);
        super.on(Laya.Event.MOUSE_OUT,this,this.onMouse);
        super.on(Laya.Event.CLICK,this,this.onMouse);
    }

    protected onRemoveToStage(event?:Laya.Event):void
    {
        super.off(Laya.Event.MOUSE_UP,this,this.onMouse);
        super.off(Laya.Event.MOUSE_OVER,this,this.onMouse);
        super.off(Laya.Event.MOUSE_DOWN,this,this.onMouse);
        super.off(Laya.Event.MOUSE_OUT,this,this.onMouse);
        super.off(Laya.Event.CLICK,this,this.onMouse);

        // if (this.eventDispatcher)
        // {
        //     this.eventDispatcher.offAll();
        //     this.eventDispatcher = null;
        // }
    }

    public InitSkin(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = "",selectedDisableSkin:string = ""):void
    {
        this.skins = new Array<string>();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);

        this.background.texture = RES.GetRes(upSkin);
        this.setStateChanged();
        this.setLayoutChanged();
    }

    public InitSkinUrl(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = "",selectedDisableSkin:string = ""):void
    {
        this.skins = new Array<string>();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);

        if (!this._loadSkins)
            this._loadSkins = [];
        else
        {
            this.clearLoadSkins();
            this._loadSkins.length = 0;
        }
        let url:string = "";
        for (let i:number = 0; i < this.skins.length; i++)
        {
            url = this.skins[i];
            if (url)
            {
                if (this._loadSkins.indexOf(url) == -1)
                {
                    this._loadSkins.push(url);
                    RES.AddReference(url);
                    RES.GetResByUrl(url,this,this.onSkinLoaded,"",url);
                }
            }
        }
    } 

    /**重新加载按钮皮肤 - 针对runtime皮肤资源*/
    public ReloadSkin():void
    {
        if (!this.skins || this.skins.length <= 0) return;
        if (this.skins[0].indexOf("/") == -1) return;
        let url:string = "";
        for (let i:number = 0; i < this.skins.length; i++)
        {
            url = this.skins[i];
            if (url)
            {
                RES.GetResByUrl(url,this,this.onSkinLoaded,"",url);
            }
        }
    }

    protected onSkinLoaded(texture:Laya.Texture,url:string):void
    {
        if (this.skins && this.skins.indexOf(url) != -1)
        {
            // this.setStateChanged();
            // this.setLayoutChanged();
            //线上偶现按钮显示不出问题：原因不明，尝试修改成立即执行看看效果
            this.changeState();
            this.changeLayout();
        }
    }

    /**九宫格,数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。*/
    public set sizeGrid(value:string)
    {
        this.background.sizeGrid = value;
    }

    public set label(value:string)
    {
        this._text = value;
        this.textField.text = value;
    }

    public get label():string
    {
        return this._text;
    }

    /**
     * 表示按钮各个状态下的文本颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor,selectedColor"。</p>
     */
    public set labelColors(value:string)
    {
        if (value)
        {
            this._labelColors = value.split(",");
            this.setStateChanged();
        }
    }

    /**表示按钮文本标签的字体大小。*/        
    public set labelSize(value:number)
    {
        this.textField.fontSize = value;
    }        

    /**表示按钮文本标签的字体名称，以字符串形式表示。*/
    public set labelFont(value:string)
    {
        this.textField.font = value;
    }

    public set labelWordWrap(value:boolean)
    {
        this.textField.wordWrap = value;
    }

    public set labelLeading(value:number)
    {
        this.textField.leading = value;
    }

    /**标签水平对齐模式，默认为居中对齐。 */
    public set labelAlign(value:string)
    {
        this.textField.align = value;
    }

    /**标签垂直对齐模式，默认为居中对齐。 */
    public set labelValign(value:string)
    {
        this.textField.valign = value;
    }

    /**
     * 表示按钮各个状态下的描边颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor,selectedColor"。</p>
     */
    public set strokeColors(value:string)
    {
        if (value)
        {
            this._strokeColors = value.split(",");
            this.setStateChanged();
        }
    }

    /**描边宽度（以像素为单位）。 默认值0，表示不描边*/
    public set labelStroke(value:number)
    {
        this.textField.stroke = value;
    }
    
    /**表示按钮文本标签是否为粗体字。*/
    public set labelBold(value:boolean)
    {
        this.textField.bold = value;
    }

    /**表示按钮文本标签是否为斜体。*/
    public set labelItalic(value:boolean)
    {
        this.textField.italic = value;
    }

    /**
    *表示按钮文本标签的边距。
    *<p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
    */
    public set labelPadding(value:string)
    {
        if (value)
        {
            this._labelPadding = value.split(",");
            this.setLayoutChanged();
        }
    }
    
    public set enabled(value:boolean)
    {
        this._enabled = value;
        // this.ButtonMode = value;
        this.setStateChanged();
    }

    public get enabled():boolean
    {
        return this._enabled;
    }

    public set selected(value:boolean)
    {
        this._selected = value;
        this.setStateChanged();
    }
		
    public get selected():boolean
    {
        return this._selected;
    }    

    public on(type: string, caller: any, listener: Function, args?: Array<any>):Laya.EventDispatcher
    {
        if (!this.eventDispatcher) 
            this.eventDispatcher = new Laya.EventDispatcher();
        return this.eventDispatcher.on(type,caller,listener,args);
    }

    public off(type: string, caller: any, listener: Function, onceOnly?: boolean):Laya.EventDispatcher
    {
        if (!this.eventDispatcher) return;
        return this.eventDispatcher.off(type,caller,listener,onceOnly);
    }

    // 代理的事件执行
    public dispatcherEvent(type: string, data?: any):boolean
    {
        if (!this.eventDispatcher) return;
        this.eventDispatcher.event(type,data);
    }

    protected onMouse(event:Laya.Event):void
    {
        if (event.type == Laya.Event.MOUSE_UP)
            this.phase = ButtonPhaseEnum.over;
        else if (event.type == Laya.Event.MOUSE_OVER)
            this.phase = ButtonPhaseEnum.over;
        else if (event.type == Laya.Event.MOUSE_DOWN)
        {
            this.phase = ButtonPhaseEnum.down;
            // SgsSoundManager.PlayEffectSound("res/assets/runtime/voice/effect/button_effect_sound.mp3");
        }
        else if (event.type == Laya.Event.MOUSE_OUT)
            this.phase = ButtonPhaseEnum.up;

        if (this.enabled && !this.selected) {
            this.setStateChanged();
        }
        //禁用或选中状态时只会禁用click事件，其他鼠标事件正常(考虑禁用或选中时可能需要显示tooltip)
        if (event.type == Laya.Event.CLICK)
        {   
            if (!this.enabled) {//禁用状态阻止事件
                // event.stopPropagation();
                return;
            }
            if (this.selected && !this.selectedEnabled) {//选中状态阻止事件
                // event.stopPropagation();
                return;
            }
        }        
        if (this.eventDispatcher) this.eventDispatcher.event(event.type,event);
    }

    protected setStateChanged():void
    {
        if (!this._stateChanged)
        {
            this._stateChanged = true;
            Laya.timer.callLater(this,this.changeState);
        }
    }

    protected changeState():void//状态变化
    {
        this._stateChanged = false;

        if (!this.skins || this.skins.length < 6) return;

        let curSkin:string = "";
        let textColor:string = "";
        let strokeColor:string = "";
        if (!this._enabled)
        {
            curSkin = this._selected ? this.skins[5] : this.skins[3];
            textColor = this._labelColors[3];
            strokeColor = this._strokeColors[3];
        }
        else if (this._selected)
        {
            curSkin = this.skins[4];
            textColor = this._labelColors[4];
            strokeColor = this._strokeColors[4];
        }
        else
        {
            curSkin = this.skins[this.phase];
            textColor = this._labelColors[this.phase];
            strokeColor = this._strokeColors[this.phase];
        }
        if (curSkin == "" || !RES.GetRes(curSkin)) curSkin = this.skins[0];
        if (!textColor) textColor = "#ffffff";
        if (!strokeColor) strokeColor = "#000000";
        this.background.texture = RES.GetRes(curSkin);
        this.textField.color = textColor;
        this.textField.strokeColor = strokeColor;
    }

    protected setLayoutChanged():void
    {
        if (!this._layoutChanged)
        {
            this._layoutChanged = true;
            Laya.timer.callLater(this,this.changeLayout);
        }
    }

    protected changeLayout():void
    {
        this._layoutChanged = false;

        let left:number = parseInt(this._labelPadding[3]);
        let right:number = parseInt(this._labelPadding[1]);
        let top:number = parseInt(this._labelPadding[0]);
        let bottom:number = parseInt(this._labelPadding[2]);

        this.textField.x = left;
        this.textField.y = top;
        this.textField.width = this.width - left - right;
        this.textField.height = this.height - top - bottom;
    }

    protected redPointFlag:SgsTexture;
    protected redPointIsShow:boolean = false;
    public ShowRedPoint(res:string = "TopRedPoint",x:number = 0,y:number = 0):void
    {
        if (!this.redPointFlag)
        {
            let tex:Laya.Texture = RES.GetRes(res);
            if (!tex) return;
            this.redPointFlag = new SgsTexture(tex);
            let redPoint = this.RedPoint;
            if (x) redPoint.x = x;
            if (y) redPoint.y = y;
            this.redPointFlag.x = redPoint.x;
            this.redPointFlag.y = redPoint.y;
            this.addDrawChild(this.redPointFlag);
        }
        else
        {
           this.redPointFlag.visible = true; 
        }

        this.redPointIsShow = true;
    }

    public RemoveRedPoint():void
    {
        if (this.redPointFlag)
            this.redPointFlag.visible = false;
        this.redPointIsShow = false;
    }

    public RedPointIsShow():boolean
    {
        return this.redPointIsShow;
    }

    //红点默认坐标
    protected get RedPoint():{x:number,y:number}
    {
        return {x:this.width - 14,y:-4};
    }

    protected clearLoadSkins():void
    {
        if (this._loadSkins && this._loadSkins.length)
        {
            this._loadSkins.forEach(url => {
                RES.DelReference(url);
                RES.CancelGetResByUrl(url,this,this.onSkinLoaded);
                RES.ClearResByUrl(url);
            });
            this._loadSkins.length = 0;
        }
    }

    public destroy():void
    {
        if (this.eventDispatcher)
        {
            this.eventDispatcher.offAll();
            this.eventDispatcher = null;
        }
        super.destroy();
        this.clearLoadSkins();
        this._loadSkins = null;
    }
}