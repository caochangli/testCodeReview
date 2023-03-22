import DressConfiger from "../../config/DressConfiger";
import Global from "../../Global";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import WindowBase from "../base/WindowBase";
import SgsSpriteButton from "../controls/base/SgsSpriteButton";
import DressAvatar from "../dressScene/DressAvatar";

//查看搭配
export default class LookDressWindow extends WindowBase
{
    private dressAvatar:DressAvatar;
    private closeBtn:SgsSpriteButton;

    constructor()
    {
        super();
        
        this.modal = true;
        this.modalAlpha = 0.8;
    }

    public Open(modelType:number,dressIDs:Array<number>):void
	{
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames = ["dressPartTemp"];
        super.Open(modelType,dressIDs);
    }

    protected init():void
    {
        super.init();

        this.dressAvatar = new DressAvatar();
        this.dressAvatar.scale(0.9,0.9);
        this.addChild(this.dressAvatar);

        this.closeBtn = new SgsSpriteButton();
        this.closeBtn.InitSkin("baseWindowClose");
        this.closeBtn.on(Laya.Event.CLICK,this,this.Close);
        this.addChild(this.closeBtn);

        this.onStageResize();
    }

    protected enterWindow(modelType:number,dressIDs:Array<number>):void
    {
        super.enterWindow();

        this.dressAvatar.UpdateAll(modelType,dressIDs);
        
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        this.size(SystemContext.gameWidth,SystemContext.gameHeight);
        this.dressAvatar.pos((this.width - this.dressAvatar.width * 0.9 >> 1) + Global.ModelOffsetX * 0.9, (this.height - this.dressAvatar.height >> 1) + 30);
        this.closeBtn.pos(556,this.dressAvatar.y - 100);
    }

    public clearWindowRes():void//清理资源
    {
        RES.DelGroupKeys("dressPartTemp");//从资源组中清空搭配部件图，防止窗口关闭随资源组回收(*对应ui会根据计数回收资源的)
        super.clearWindowRes();
    }

    public destroy(): void 
    {
        super.destroy();
    }
}