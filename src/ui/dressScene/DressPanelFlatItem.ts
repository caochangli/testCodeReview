import Global from "../../Global";
import RES from "../../res/RES";
import DressVO from "../../vo/DressVO";
import SgsFlatImage from "../controls/base/SgsFlatImage";
import SgsSprite from "../controls/base/SgsSprite";
import SgsTexture from "../controls/base/SgsTexture";
import SgsFlatPanelItemBase from "../controls/SgsFlatPanelItemBase";

export default class DressPanelFlatItem extends SgsFlatPanelItemBase
{
    private bg:SgsTexture;
    private icon:SgsFlatImage;

    private dressVo:DressVO;

    constructor(otherRender:Array<SgsSprite>)
    {
        super(otherRender);
        this.size(132, 132);
    }

    protected init():void
    {
        super.init();

        this.bg = new SgsTexture();
        this.bg.mouseEnabled = true;
        this.bg.on(Laya.Event.CLICK, this, this.onClick);
        this.addDrawChild(this.bg);

        this.icon = new SgsFlatImage();
        this.icon.autoClear = Global.AutoClearRes;
        this.icon.onlyDestroyClear = true;//仅销毁时清理资源
        this.addOtherChild(0,this.icon);
    }

    protected updateRenderer(rendererData:any):void
    {
        super.updateRenderer(rendererData);
        this.dressVo = rendererData;
        if (this.dressVo.DressID == 0)//重置
        {
            this.bg.texture = RES.GetRes("dressRest");
            this.icon.skin = "";
        }   
        else
        {
            this.bg.texture = RES.GetRes("dressSelectBg");
            this.icon.skin = this.dressVo.ResourceUrl;
        }
    }

    private onClick():void 
    {
        this.event(Laya.Event.CLICK, this);
    }

    public ClearDraw(destroy:boolean = true):void 
    {
        super.ClearDraw(destroy);
        if (destroy)
        {
            this.dressVo = null;
        }    
    }
}