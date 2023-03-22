import FontName from "../../enum/FontName";
import Global from "../../Global";
import GameManager from "../../mode/gameManager/GameManager";
import UIUtils from "../../utils/UIUtils";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
import SgsText from "../controls/base/SgsText";
import CommonBaseWindow from "./CommonBaseWindow";

//分享提示窗口
export default class SharePromptWindow extends CommonBaseWindow
{
    private titleText:SgsText;
    private descText:SgsHTMLDivElement;
    private okBtn:SgsFlatButton;

    private okHandler:Laya.Handler;
    private cancelHandler:Laya.Handler;

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

        this.okBtn = UIUtils.CreateImageFlatButton("baseOkBtn","baseTextOK");
        this.okBtn.pos(197,349);
        this.okBtn.on(Laya.Event.CLICK,this,this.onOkHandler);
        this.addDrawChild(this.okBtn);

        this.titleText = new SgsText();
        this.titleText.y = 79;
        this.titleText.width = this.width;
        this.titleText.font = FontName.HEITI;
        this.titleText.fontSize = 40;
        this.titleText.bold = true;
        this.titleText.color = "#80B6A7";
        this.titleText.align = "center";
        this.titleText.text = "分享有礼";
        this.addDrawChild(this.titleText);
        
        this.descText = new SgsHTMLDivElement();
        this.descText.pos(70,195);
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 26;
        this.descText.color = "#80B6A7";
        this.descText.leading = 24;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.descText.innerHTML = '主人，点击右上角&nbsp;<img style="height:28px;width:66px" src=' + '"' + 'res/assets/shareIcon.png"/>&nbsp;按钮可分享该活动 给您的好友，每日您将额外<font color="#FE8555">获得3个桃气值</font>哦~';
        this.addChild(this.descText);
    }

    protected enterWindow(okHandler:Laya.Handler,cancelHandler:Laya.Handler):void
    {
        super.enterWindow();

        this.okHandler = okHandler;
        this.cancelHandler = cancelHandler;

        let height:number = this.descText.y + this.descText.contextHeight + 258 - 24;
        if (height < 528) height = 528;
        this.size(this.width,height);
        this.okBtn.y = this.height - this.okBtn.height - 76;

        // if (isWinXin())
        // {
        //     wxShare("李婉皮肤共创计划","《三国杀十周年》创玩节开启，携手百万玩家参与魏阵营武将李婉皮肤设计，超多搭配，丰富竞赛奖励，打造您心中最美武将",Global.GameUrl,Global.GameUrl + "res/assets/logo.jpg",this,function(data:number){
        //         console.log("分享接口回调：" + data);//0取消 1成功
        //         if (data > 0)//分享设置成功
        //         {
        //             GameManager.GetInstance().CollocationShare();
        //         }
        //     });
        // }
    }

    protected onOkHandler():void
    {
        GameManager.GetInstance().CollocationShare();
        if (this.okHandler)
        {
            this.okHandler.run();
            this.okHandler = null;
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
    }
}