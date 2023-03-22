import DressConfiger from "../../config/DressConfiger";
import FontName from "../../enum/FontName";
import Global from "../../Global";
import RES from "../../res/RES";
import UIUtils from "../../utils/UIUtils";
import WindowBase from "../base/WindowBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsSprite from "../controls/base/SgsSprite";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import DressAvatar from "../dressScene/DressAvatar";

//保存搭配
export default class SaveDressWindow extends WindowBase
{
    private closeBtn:SgsFlatButton;
    private bg:SgsTexture;
    private descText:SgsText;

    private reference:Laya.Sprite;
    private imgElement:any;

    private avatarContainer:SgsSprite;
    private avatarBg:SgsTexture;
    private dressAvatar:DressAvatar;
    private leftLogo:Laya.Image;
    private rightLogo:Laya.Image;
    private qrCode:Laya.Image;
    private bottomText:Laya.Image;
    

    constructor()
    {
        super();
        
        this.modal = true;
        this.modalAlpha = 0.8;
        if (Global.AutoClearRes)
            this.resNames = ["saveDressWin"];
        this.size(575,924);
        this.addDrawClick();
    }

    public Open(modelType:number,dressIDs:Array<number>):void
	{
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames.push("dressPartTemp");
        super.Open(modelType,dressIDs);
    }

    protected init():void
    {
        super.init();

        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(250,0);
        this.closeBtn.InitSkin("baseWindowClose");
        this.closeBtn.on(Laya.Event.CLICK,this,this.Close);
        this.addDrawChild(this.closeBtn);

        this.bg = new SgsTexture(RES.GetRes("saveDressWinScroll"));
        this.bg.pos(0,101);
        this.addDrawChild(this.bg);

        this.descText = new SgsText();
        this.descText.pos(0,900);
        this.descText.width = this.width;
        this.descText.font = FontName.HEITI;
        this.descText.color = "#DCC492";
        this.descText.fontSize = 24;
        this.descText.align = "center";
        this.descText.text = "主人，长按人物可以保存您的创作哦~";
        this.addDrawChild(this.descText);

        this.reference = new Laya.Sprite();
        this.reference.pos(60,153);
        this.reference.size(450,668);
        this.reference.zOrder = Number.MAX_VALUE - 1;
        this.addChild(this.reference);

        this.avatarContainer = new SgsSprite();
        
        this.avatarBg = new SgsTexture(RES.GetRes("saveDressWinBg_image"));
        this.avatarContainer.addDrawChild(this.avatarBg);

        this.dressAvatar = new DressAvatar();
        this.dressAvatar.pos(127,102);
        this.avatarContainer.addChild(this.dressAvatar);

        this.leftLogo = new Laya.Image();
        this.leftLogo.pos(27,17);
        this.leftLogo.source = RES.GetRes("saveDressWinLeftLogo");
        this.avatarContainer.addChild(this.leftLogo);

        this.rightLogo = new Laya.Image();
        this.rightLogo.pos(548,18);
        this.rightLogo.source = RES.GetRes("saveDressWinRightLogo");
        this.avatarContainer.addChild(this.rightLogo);

        this.qrCode = new Laya.Image();
        this.qrCode.pos(61,806);
        this.qrCode.source = RES.GetRes("saveDressWinQRCode");
        this.avatarContainer.addChild(this.qrCode);

        this.bottomText = new Laya.Image();
        this.bottomText.pos(25,1021);
        this.bottomText.source = RES.GetRes("saveDressWinBottomText");
        this.avatarContainer.addChild(this.bottomText);

        this.onStageResize();
    }

    protected enterWindow(modelType:number,dressIDs:Array<number>):void
    {
        super.enterWindow();

        this.dressAvatar.UpdateAll(modelType,dressIDs);
        Laya.timer.frameOnce(2,this,this.onMergeImg);//延迟是为了sprite上的纹理渲染上去，但实际散图资源可能也会没有加载完成
    }

    private onMergeImg():void
    {
        UIUtils.ClearTextPrompt();

        var htmlC:Laya.HTMLCanvas = this.avatarContainer.drawToCanvas(750,1113,0,0);
        var base64:string = htmlC.toBase64("image/png",1);
        
        htmlC.destroy();
        if (this.avatarContainer)
        {
            this.avatarContainer.destroy();
            this.avatarContainer = null;
        }

        this.imgElement = document.getElementById("mergeImg");
        if (this.imgElement)
            this.imgElement.style.display = "block";
        else
        {
            this.imgElement = document.createElement("img");
            this.imgElement.id = "mergeImg";
            this.imgElement.crossOrigin = "";
            document.getElementById("layaContainer").appendChild(this.imgElement);
        }
        this.imgElement.src = base64;
        Laya.Utils.fitDOMElementInArea(this.imgElement,this.reference,0,0,this.reference.width,this.reference.height);
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        if (this.imgElement)
            Laya.Utils.fitDOMElementInArea(this.imgElement,this.reference,0,0,this.reference.width,this.reference.height);
    }

    public clearWindowRes():void//清理资源
    {
        RES.DelGroupKeys("dressPartTemp");//从资源组中清空搭配部件图，防止窗口关闭随资源组回收(*对应ui会根据计数回收资源的)
        super.clearWindowRes();
    }

    public destroy(): void 
    {
        Laya.timer.clearAll(this);
        if (this.avatarContainer)
        {
            this.avatarContainer.destroy();
            this.avatarContainer = null;
        }
        if (this.imgElement)
        {
            this.imgElement.src = "";
            this.imgElement.style.display = "none";
            this.imgElement = null;
        }
        super.destroy();
    }
}