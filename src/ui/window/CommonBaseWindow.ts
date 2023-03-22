import RES from "../../res/RES";
import WindowBase from "../base/WindowBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsTexture from "../controls/base/SgsTexture";

//常用窗口
export default class CommonBaseWindow extends WindowBase
{
    protected bg:SgsTexture;
    protected closeBtn:SgsFlatButton;

    constructor()
    {
        super();
        
        this.modal = true;
        this.size(670,365);
        this.addDrawClick();
    }

    protected init():void
    {
        super.init();

        this.bg = new SgsTexture(RES.GetRes("commonWindowBg"));
        this.bg.width = this.width;
        this.bg.height = this.height;
        this.bg.sizeGrid = "277,1,82,1";
        this.addDrawChild(this.bg);

        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(588,50);
        this.closeBtn.InitSkin("commonWindowCloseBtn");
        this.closeBtn.on(Laya.Event.CLICK,this,this.onCloseHandler);
        this.addDrawChild(this.closeBtn);
    }

    public size(width:number,height:number):Laya.Sprite
    {
        super.size(width,height);
        if (this.bg)
            this.bg.height = height;
        return this;
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);
    }

    protected onCloseHandler():void
    {
        this.Close();
    }

    // public destroy(): void 
    // {
        
    //     super.destroy();
       
    // }
}