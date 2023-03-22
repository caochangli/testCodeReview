import SgsFlatContainer from "./SgsFlatContainer";
import SgsTexture from "./SgsTexture";
import SgsText from "./SgsText";
import SgsSprite from "./SgsSprite";
import RES from "../../../res/RES";
import ButtonPhaseEnum from "../../../enum/base/ButtonPhaseEnum";

/*
* 扁平按钮：皮肤和文字均绘制到外部通过Draw接口传入的sgsSprite中
* 派发事件数据为SgsFlatButton本身
*/
export default class SgsFlatButton extends SgsFlatContainer
{
    protected phase:number = 0;//按钮状态标识

    protected skins:Array<string>;//皮肤数组：up、over、down、disable、select
    protected _labelColors:Array<string>;
    protected _strokeColors:Array<string>;
    protected _labelPadding:Array<string>;
    protected _selected:boolean = false;
    protected _enabled:boolean = true;
    protected _text:string = "";
    protected _loadSkins:Array<string>;

    protected _stateChanged:boolean = false;
    protected _layoutChanged:boolean = false;

    public selectedEnabled:boolean = true;//选中状态时，是否触发点击事件

    protected background:SgsTexture;
    protected textField:SgsText;
  
    //额外层：如传入额外层，则额外第0层为文字层，第1层为红点层
    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);

        this.labelColors = "#ffffff,#ffffff,#ffffff,#ffffff,#ffffff";
        this.strokeColors = "#000000,#000000,#000000,#000000,#000000";
        this.labelPadding = "0,0,0,0";
        this.initChilds();
    }

    public set alpha (value:number)
    {
        this.background.alpha = value;
    }

    public set width(value:number)
    {
        Laya.superSetter(SgsFlatButton,this,"width",value);
    }

    public get width():number
    {
        return this.background.width;
    }

    public set height(value:number)
    {
        Laya.superSetter(SgsFlatButton,this,"height",value);
    }

    public get height():number
    {
        return this.background.height;
    }

    public size(width:number, height:number):void
    {
        super.size(width,height);

        this.background.width = width;
        this.background.height = height;
        this.setLayoutChanged();
    }

    protected initChilds():void
    {
        this.background = new SgsTexture();
        this.background.mouseEnabled = true;
        // this.background.ButtonMode = true;
        this.addDrawChild(this.background);

        this.textField = new SgsText();
        this.textField.wordWrap = false;
        this.textField.align = "center";
        this.textField.valign = "middle";
        if (this.otherRenders && this.otherRenders.length)
            this.addOtherChild(0,this.textField);
        else
            this.addDrawChild(this.textField);
    }

    public InitSkin(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = "",selectedDisableSkin:string = "",selectedOverSkin:string=""):void
    {
        this.skins = new Array<string>();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        if(selectedOverSkin.length > 0)
        {
            this.skins.push(selectedOverSkin);
        }

        this.background.texture = RES.GetRes(upSkin);//先设置默认纹理，防止在外部立即调用Draw绘制接口时，纹理不存在无法绘制背景而先绘制了文字，导致文字绘制在了背景下面
        this.setStateChanged();
        this.setLayoutChanged();
    }

    public InitSkinUrl(upSkin:string,overSkin:string = "",downSkin:string = "",disableSkin:string = "",selectedSkin:string = "",selectedDisableSkin:string = "",selectedOverSkin:string=""):void
    {
        this.skins = new Array<string>();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        if(selectedOverSkin.length > 0)
        {
            this.skins.push(selectedOverSkin);
        }

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

    /**绘制*/
	public Draw(render:SgsSprite,index:number = -1):void
	{
        super.Draw(render,index);

        this.background.on(Laya.Event.MOUSE_UP,this,this.onUp);
        this.background.on(Laya.Event.MOUSE_OVER,this,this.onOver);
        this.background.on(Laya.Event.MOUSE_DOWN,this,this.onDown);
        this.background.on(Laya.Event.MOUSE_OUT,this,this.onOut);
        this.background.on(Laya.Event.CLICK,this,this.onClick);
	}

	/**清除 -- 擦除绘制及数据*/
	public ClearDraw(destroy:boolean = true):void
	{
        super.ClearDraw(destroy);

        this.background.off(Laya.Event.MOUSE_UP,this,this.onUp);
        this.background.off(Laya.Event.MOUSE_OVER,this,this.onOver);
        this.background.off(Laya.Event.MOUSE_DOWN,this,this.onDown);
        this.background.off(Laya.Event.MOUSE_OUT,this,this.onOut);
        this.background.off(Laya.Event.CLICK,this,this.onClick);

        if (destroy)
        {
            this.clearLoadSkins();
            this._loadSkins = null;
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

    public get labelWidth():number
    {
        if(this.textField)
        {
            return this.textField.textWidth;
        }
        return 0;
    }

    public set labelWidth(width:number)
    {
        if(this.textField)
        {
            this.textField.width = width;
        }
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
        // this.background.ButtonMode = value;
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

    // public set ButtonMode(value:boolean)
    // {
    //     this.background.ButtonMode = value;
    // }

    // public get ButtonMode():boolean
    // {
    //     return this.background.ButtonMode;
    // }

    public set TipTriggerType(val:string)
	{
		this.background.TipTriggerType = val;
	}

    public set ToolTip(value:any)
    {
        this.background.ToolTip = value;
    }

    public get ToolTip():any
    {
        return this.background.ToolTip;
    }    

    protected onUp(event:any):void
    {
        this.phase = ButtonPhaseEnum.over;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_UP,this);
    }

    protected onOver(event:any):void
    {
        this.phase = ButtonPhaseEnum.over;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_OVER,this);   
    }

    protected onDown(event:any):void
    {
        this.phase = ButtonPhaseEnum.down;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_DOWN,this);
        // SgsSoundManager.PlayEffectSound("res/assets/runtime/voice/effect/button_effect_sound.mp3");
    }

    protected onOut(event:any):void
    {
        this.phase = ButtonPhaseEnum.up;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_OUT,this);
    }

    protected onClick(event:Laya.Event):void
    {
        if (!this.enabled) return;//禁用状态阻止事件
        if (this.selected && !this.selectedEnabled) return;//选中状态阻止事件 
        
        this.event(Laya.Event.CLICK,this);
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
            let skinIndex:number = 4;
            if(this.skins.length == 7 && this.phase == ButtonPhaseEnum.over)
            {
                skinIndex = 6;
            }
            curSkin = this.skins[skinIndex];
            textColor = this._labelColors[skinIndex];
            strokeColor = this._strokeColors[skinIndex];
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
            if (this.otherRenders && this.otherRenders.length > 1)
                this.addOtherChild(1,this.redPointFlag);
            else
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
}