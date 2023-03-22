import FontName from "../../enum/FontName";
import UIUtils from "../../utils/UIUtils";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
import SgsText from "../controls/base/SgsText";
import CommonBaseWindow from "./CommonBaseWindow";

//提示窗口
export default class PromptWindow extends CommonBaseWindow
{
    public static BTN_TYPE1:string = "BTN_TYPE1";//取消、确定
    public static BTN_TYPE2:string = "BTN_TYPE2";//确定
    public static BTN_TYPE3:string = "BTN_TYPE3";//确定、分享

    private titleText:SgsText;
    private descText:SgsHTMLDivElement;
    
    private okHandler:Laya.Handler;
    private cancelHandler:Laya.Handler;
    private btnType:string = "";

    constructor()
    {
        super();
        
        this.modal = true;
        this.width = 670;
        this.addDrawClick();
    }

    protected init():void
    {
        super.init();
        
        this.titleText = new SgsText();
        this.titleText.y = 79;
        this.titleText.width = this.width;
        this.titleText.font = FontName.HEITI;
        this.titleText.fontSize = 40;
        this.titleText.bold = true;
        this.titleText.color = "#80B6A7";
        this.titleText.align = "center";
        this.addDrawChild(this.titleText);

        this.descText = new SgsHTMLDivElement();
        this.descText.y = 195;
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 26;
        this.descText.color = "#80B6A7";
        this.descText.align = "center";
        this.descText.leading = 24;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.addChild(this.descText);
    }

    protected enterWindow(title:string,desc:string,descPaddingLeft:number,okHandler:Laya.Handler,cancelHandler:Laya.Handler,btnType:string):void
    {
        super.enterWindow();

        this.okHandler = okHandler;
        this.cancelHandler = cancelHandler;
        this.btnType = btnType;

        this.titleText.text = title || "提示";
        this.descText.x = descPaddingLeft || 140;
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.innerHTML = desc;

        let height:number = this.descText.y + this.descText.contextHeight + 258 - 24;
        if (height < 528) height = 528;
        this.size(this.width,height);
        
        if (btnType == PromptWindow.BTN_TYPE1)//取消、确定
        {
            this.createButton(46,"baseCancelBtn","baseTextCancel",cancelHandler);
            this.createButton(349,"baseOkBtn","baseTextOK",okHandler);
        }
        else if (btnType == PromptWindow.BTN_TYPE2)//确定
        {
            this.createButton(196,"baseOkBtn","baseTextOK",okHandler);
        }
        else if (btnType == PromptWindow.BTN_TYPE3)//确定、分享
        {
            this.createButton(46,"baseOkBtn","baseTextOK",cancelHandler);
            this.createButton(349,"baseCancelBtn","baseTextShare",okHandler);
        }
    }

    protected createButton(x:number,bgRes:string,textRes:string,handler:Laya.Handler):SgsFlatButton
    {
        let btn = UIUtils.CreateImageFlatButton(bgRes,textRes);
        btn.pos(x,this.height - btn.height - 76);
        btn.on(Laya.Event.CLICK,this,this.onButtonHandler,[handler]);

        let index = this.closeBtn.endIndex;
        if (index >= 0)
            this.addDrawChildAt(btn,index + 1);
        else
            this.addDrawChild(btn);
        return btn;
    }

    protected onButtonHandler(handler:Laya.Handler):void
    {
        if (handler)
        {
            handler.run();
            handler = null;
        }
        this.Close();
    }

    protected onCloseHandler():void
    {
        if (this.cancelHandler)
        {
            this.cancelHandler.run();
            this.cancelHandler = null;
        }
        this.Close();
    }

    public destroy(): void 
    {  
        super.destroy();
        this.okHandler = null;
        this.cancelHandler = null;
    }
}