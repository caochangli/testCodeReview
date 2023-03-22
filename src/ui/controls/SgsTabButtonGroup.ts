import UIUtils from "./../../utils/UIUtils";
import SgsTabButton from "./SgsTabButton";
import SgsSprite from "./base/SgsSprite";
import SgsTabFlatButton from "./SgsTabFlatButton";
/*
* name;
*/
export default class SgsTabButtonGroup extends SgsSprite
{
    public static TAP_CLICKED:string = "TAP_CLICKED";

    protected otherLayerNum:number = 0;
    protected isVertical:boolean = false;
    protected gap:number = 5;
    protected btnClass:any;
    protected btnWidth:number = 0;
    protected gap2:number = 0;
    protected btnList:Array<SgsTabButton | SgsTabFlatButton>;
    protected lastTabButton:SgsTabButton | SgsTabFlatButton;
    protected otherRenders:Array<SgsSprite>;//其他渲染器(分层渲染层)

    /** 
     * @param data 按钮列表数据[{label:string,value:number,....}]
     * @param otherLayerNum 额外层数量 数量大于0表示使用扁平按钮
     * @param isVertical 是否垂直布局 (水平、垂直两种布局)
     * @param gap 按钮间距
	 * @param btnClass 按钮类
     * @param btnWidth 按钮宽度 默认按按钮资源尺寸
     * @param gap2
     */
    constructor(data:Array<any>,otherLayerNum:number = 0,isVertical:boolean = false,gap:number = 5,btnClass:any = SgsTabFlatButton,btnWidth:number = 0,gap2:number = 0)
    {
        super();

        this.btnList = [];
        this.otherLayerNum = otherLayerNum;
        this.isVertical = isVertical;
        this.gap = gap;
        this.btnClass = btnClass;
        this.btnWidth = btnWidth;
        this.gap2 = gap2;

        if (this.otherLayerNum > 0)
        {
            this.addDrawClick();
            this.addDrawMouseEvent();
            this.otherRenders = [];
            let layerSp:SgsSprite;
            for (let i:number = 0; i < otherLayerNum; i++)
            {
                layerSp = new SgsSprite();
                this.addChild(layerSp);
                this.otherRenders.push(layerSp);
            }
        }
        this.initUI(data);
    }

    //根据value选中
    public set SelectedValue(value:number)
    {
        if (this.btnList.length)
        {
            for (let i:number = 0; i < this.btnList.length; i++)
            {
                if (this.btnList[i].value == value)
                    this.selectButton(this.btnList[i]);
            }
        }
    }

    //根据索引选中
    public set SelectedIndex(index:number)
    {
        if(this.btnList.length && index < this.btnList.length)
        {
            this.selectButton(this.btnList[index]);
        }
    }

    public get SelectedValue():number
    {
        return this.lastTabButton ? this.lastTabButton.value : -1;
    }

    public get SelectedIndex():number
    {
        if (!this.lastTabButton || !this.btnList || this.btnList.length <= 0)
            return -1;
        return this.btnList.indexOf(this.lastTabButton);
    }

    public get SelectedButton():any
    {
        return this.lastTabButton;
    }

    //还原回都不选中的状态
    public Rest()
    {
        if(this.btnList.length)
        {
            if(this.lastTabButton)
            {
                this.lastTabButton.selected = false;
                this.lastTabButton = null;
            }
        }
    }

    public GetButtonByValue(value:number):any
    {
        let selectBtn:SgsTabButton | SgsTabFlatButton;
        for(let i:number = 0; i < this.btnList.length; i++)
        {
            let btn:SgsTabButton | SgsTabFlatButton = this.btnList[i];
            if(btn.value == value)
            {
                selectBtn = btn;
                break;
            }
        }
        return selectBtn;
    }

    public GetButtonByIndex(index:number):any
    {
        let btn:SgsTabButton | SgsTabFlatButton;
        if(this.btnList.length && index < this.btnList.length)
        {
            btn = this.btnList[index];
        }
        return btn;
    }

    public GetButtonList():Array<any>
    {
        return this.btnList;
    }

    public get ListLength():number
    {
        return this.btnList ? this.btnList.length : 0;   
    }

    public ShowRedPointByIndex(index:number,isShow:boolean):void
    {
        let btn = this.GetButtonByIndex(index);
        if (btn)
        {
            if (isShow)
                btn.ShowRedPoint();
            else
                btn.RemoveRedPoint();
        }
    }

    public ShowRedPointByValue(value:any,isShow:boolean):void
    {
        let btn = this.GetButtonByValue(value);
        if (btn)
        {
            if (isShow)
                btn.ShowRedPoint();
            else
                btn.RemoveRedPoint();
        }
    }

    protected initUI(data:Array<any>):void
    {
        if(data)
        {
            let btn:SgsTabButton | SgsTabFlatButton;
            let sx:number = 0;
            let sy:number = 0;
            data.forEach((value) =>{
                if (this.otherLayerNum > 0)
                    btn = new this.btnClass(this.otherRenders);
                else
                    btn = new this.btnClass();
                this.btnList.push(btn);
                if (value.label)
                    btn.label = value.label;
                btn.value = value.value;
                if(value.enableTip)
                    btn.EnableTip = value.enableTip;
                if(value.skinList)
                    btn.init(value.skinList[0],value.skinList[1],value.skinList[2],value.skinList[3],value.skinList[4]);
                else
                    btn.init();
                btn.on(Laya.Event.CLICK,this,this.onBtnClick);
                if (btn instanceof SgsTabFlatButton)
                    this.addDrawChild(btn);
                else
                    this.addChild(btn);
            },this);
        }
        this.layout();
    }

    protected onBtnClick(event:any):void
    {
        let target:SgsTabButton | SgsTabFlatButton;
        if (event instanceof SgsTabFlatButton)
            target = event;
        else
            target = event.target;
        if (this.lastTabButton == target) return;
        if (!target.enabled)
        {
            // if(target.EnableTip)
            //     UIUtils.ShowTextPrompt(target.EnableTip);
            return;
        }
        this.selectButton(target);
    }

    protected selectButton(btn:SgsTabButton | SgsTabFlatButton):void
    {
        if(btn)
        {
            if (this.lastTabButton)
                this.lastTabButton.selected = false;
            this.lastTabButton = btn;
            this.lastTabButton.selected = true;
            this.event(SgsTabButtonGroup.TAP_CLICKED,this.lastTabButton.value);
        }
    }

    public layout():void
    {
        let btn:SgsTabButton | SgsTabFlatButton;
        let sx:number = 0;
        let sy:number = 0;
        this.btnList.forEach((btn) =>{
            if (btn && btn.visible)
            {
                btn.pos(sx,sy);
                if (this.btnWidth)
                    btn.width = this.btnWidth;
                if (this.isVertical)
                {
                    sy += btn.height + this.gap;
                    sx += this.gap2;
                }
                else
                {
                    sx += btn.width + this.gap;
                    sy += this.gap2;
                }
                this.size(btn.x + btn.width,btn.y + btn.height);            
            }
        })
    }

    public destroy():void
    {
        super.destroy();
    }
}