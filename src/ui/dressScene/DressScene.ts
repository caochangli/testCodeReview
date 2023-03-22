import DressConfiger from "../../config/DressConfiger";
import DressType from "../../enum/DressType";
import FontName from "../../enum/FontName";
import Global from "../../Global";
import SceneManager from "../../mode/base/SceneManager";
import SgsSoundManager from "../../mode/base/SgsSoundManager";
import WindowManager from "../../mode/base/WindowManager";
import GameManager from "../../mode/gameManager/GameManager";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import UIUtils from "../../utils/UIUtils";
import DressVO from "../../vo/DressVO";
import SceneBase from "../base/SceneBase";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsSprite from "../controls/base/SgsSprite";
import SgsSpriteButton from "../controls/base/SgsSpriteButton";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import SgsTabButtonGroup from "../controls/SgsTabButtonGroup";
import CollocationDressAvatar from "./CollocationDressAvatar";
import DressBottomView from "./DressBottomView";
import DressColorTabFlatButton from "./DressColorTabFlatButton";

//搭配
export default class DressScene extends SceneBase
{
    private bg:SgsTexture;
    private light:SgsTexture;
    private dressAvatar:CollocationDressAvatar;
    private topSp:SgsSprite;
    private downBtn:SgsFlatButton;
    private ruleBtn:SgsFlatButton;
    private homeBtn:SgsFlatButton;
    private soundBtn:SgsFlatButton;
    private shareBtn:SgsFlatButton;    
    private myDressBtn:SgsFlatButton;    
    private rankBtn:SgsFlatButton;
    private dressIngFlag:SgsTexture;
    private changeSkinText:SgsText;
    private saveBtn:SgsSpriteButton;
    private skinColorTabGroup:SgsTabButtonGroup;
    private bottomView:DressBottomView;

    constructor()
    {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["dressScene"];
    }

    protected createChildren():void
    {
        super.createChildren();

        this.bg = new SgsTexture(RES.GetRes("dressSceneBg_image"));
        this.addDrawChild(this.bg);

        this.light = new SgsTexture(RES.GetRes("dressLight"));
        this.addDrawChild(this.light);

        this.dressAvatar = new CollocationDressAvatar();
        this.addChild(this.dressAvatar);

        this.topSp = new SgsSprite();
        this.topSp.size(this.width,this.height);
        this.topSp.addDrawClick();
        this.addChild(this.topSp);

        this.downBtn = new SgsFlatButton();
        this.downBtn.pos(0,29);
        this.downBtn.InitSkin("baseDownBtn");
        this.downBtn.on(Laya.Event.CLICK,this,this.onDownLoadHandler);
        this.topSp.addDrawChild(this.downBtn);

        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0,133);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK,this,this.onRuleHandler);
        this.topSp.addDrawChild(this.ruleBtn);

        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(647,29);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK,this,this.onHomeHandler);
        this.topSp.addDrawChild(this.homeBtn);

        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(647,133);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK,this,this.onSoundHandler);
        this.topSp.addDrawChild(this.soundBtn);

        this.shareBtn = new SgsFlatButton();
        this.shareBtn.pos(647,237);
        this.shareBtn.InitSkin("baseShareBtn");
        this.shareBtn.on(Laya.Event.CLICK,this,this.onShareHandler);
        this.topSp.addDrawChild(this.shareBtn);

        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.pos(647,341);
        this.myDressBtn.InitSkin("baseMyDressBtn");
        this.myDressBtn.on(Laya.Event.CLICK,this,this.onMyDressHandler);
        this.topSp.addDrawChild(this.myDressBtn);

        this.rankBtn = new SgsFlatButton();
        this.rankBtn.pos(647,445);
        this.rankBtn.InitSkin("baseRankBtn");
        this.rankBtn.on(Laya.Event.CLICK,this,this.onRankHandler);
        this.topSp.addDrawChild(this.rankBtn);

        this.dressIngFlag = new SgsTexture(RES.GetRes("dressIngFlag"));
        this.dressIngFlag.pos(150,435);
        this.dressIngFlag.visible = false;
        this.topSp.addDrawChild(this.dressIngFlag);
        this.dressAvatar.SetDressIngFlag(this.dressIngFlag);

        this.changeSkinText = new SgsText();
        this.changeSkinText.pos(560,110);
        this.changeSkinText.width = 26;
        this.changeSkinText.font = FontName.HEITI;
        this.changeSkinText.color = "#A4AF9F";
        this.changeSkinText.fontSize = 27;
        this.changeSkinText.leading = 5;
        this.changeSkinText.wordWrap = true;
        this.changeSkinText.text = "切换肤色";
        this.topSp.addDrawChild(this.changeSkinText);

        this.skinColorTabGroup = new SgsTabButtonGroup([{label:"",value:1},{label:"",value:2},{label:"",value:3}],1,true,-18,DressColorTabFlatButton);
        this.skinColorTabGroup.pos(442,63);
        this.skinColorTabGroup.on(SgsTabButtonGroup.TAP_CLICKED,this,this.onSkinColorTabClick);
        this.addChild(this.skinColorTabGroup);

        this.bottomView = new DressBottomView();
        this.bottomView.on("changeDress",this,this.onChangeDress);
        this.bottomView.on("delDress",this,this.onDelDress);
        this.bottomView.on("openCloseEvent",this,this.onOpenCloseHandler);
        this.addChild(this.bottomView);

        this.saveBtn = new SgsSpriteButton();
        this.saveBtn.pos(227,820);
        if (GameManager.GetInstance().IsCollocationMaxed)
            this.saveBtn.InitSkin("dressMaxedBtn","dressMaxedBtn","dressMaxedBtn","dressMaxedBtn");
        else
            this.saveBtn.InitSkin("dressSaveBtn","dressSaveBtn","dressSaveBtn","dressSaveBtnDisable");
        this.saveBtn.enabled = false;
        this.saveBtn.on(Laya.Event.CLICK,this,this.onSaveHandler);
        this.addChild(this.saveBtn);

        this.dressAvatar.UpdateAll(1,DressConfiger.GetInstance().DefaultDressIDs);
        this.skinColorTabGroup.SelectedValue = 1;

        this.onStageResize();

        GameManager.GetInstance().on(GameManager.COLLOCATION_SAVE_SUCC,this,this.onSaveSucc);
    }

    private onSaveSucc(data:any):void
    {
        UIUtils.ShowTextPrompt("保存成功");
        if (data)
		    SceneManager.GetInstance().EnterScene("DressSaveScene",data);
    }

    private onDownLoadHandler():void
    {
        Global.DownLoadGame();
    }

    private onRuleHandler():void
    {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }

    private onHomeHandler():void
    {
        this.checkChangeScene("HomeScene");
    }

    private onSoundHandler():void
    {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }

    private onShareHandler():void
    {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }

    private onMyDressHandler():void
    {
        this.checkChangeScene("MyDressScene");
    }

    private onRankHandler():void
    {
        this.checkChangeScene("RankScene");
    }

    private onSkinColorTabClick(value:number):void//切换肤色
    {
        this.dressAvatar.UpdateModel(value);
    }

    private onChangeDress(dressVo:DressVO):void//选择搭配
    {
        if (!dressVo || this.dressAvatar.IsDressIng) return;
        if (dressVo.DressID == 0)//还原本类型装扮成默认装扮
        {
            this.dressAvatar.RecoveryDefaultByType(dressVo.DressType);
        }
        else if (dressVo.DressType == DressType.DESSuit)//选择套装：脱掉上衣、下衣,穿上套装
        {
            this.dressAvatar.ReplaceDress(dressVo.DressID);//新资源加载完后，才可换掉
        }
        else
        {
            this.dressAvatar.ReplaceDress(dressVo.DressID);//新资源加载完后，才可换掉
        }
        this.updateSaveBtnState();
    }

    private onDelDress():void//清除
    {
        if (this.dressAvatar.IsDressIng) return;
        if (this.saveBtn.enabled)//可以保存：表示非默认搭配
            UIUtils.OpenPromptWin("","主人，您是否要清空当前所有装扮？",100,Laya.Handler.create(this,this.onConfirmDel));
        // else
        //     this.dressAvatar.UpdateAll(1,DressConfiger.GetInstance().DefaultDressIDs);
    }

    private onConfirmDel():void
    {
        this.dressAvatar.UpdateAll(1,DressConfiger.GetInstance().DefaultDressIDs);
        this.updateSaveBtnState();
    }

    // private saveTime:number = 0;
    private onSaveHandler():void//立即保存
    {
        // let curTime:number = Laya.Browser.now();
        // if (curTime - this.saveTime < Global.OperationFastTime)
        //     return;
        // this.saveTime = curTime;
        // GameManager.GetInstance().CollocationSave(this.skinColorTabGroup.SelectedValue,this.dressAvatar.DressIDs);
        UIUtils.OpenPromptWin("","*主人~是否保存该搭配？<br>（保存后无法修改和删除，并且最多保存99条）",40,Laya.Handler.create(this,this.onConfirmCompete));
    }

    protected onConfirmCompete():void
    {
        if (this.destroyed) return;
        GameManager.GetInstance().CollocationSave(this.skinColorTabGroup.SelectedValue,this.dressAvatar.DressIDs);
    }

    private updateSaveBtnState():void//非默认搭配才可保存
    {
        if (GameManager.GetInstance().IsCollocationMaxed) 
        {
            this.saveBtn.enabled = false;
            return;//已达上限
        }
        let defaultDressIDs = DressConfiger.GetInstance().DefaultDressIDs;
        let curDressIDs = this.dressAvatar.DressIDs;
        let isEqual:boolean = true;
        if ((!defaultDressIDs && curDressIDs) || (defaultDressIDs && !curDressIDs) || defaultDressIDs.length != curDressIDs.length)
            isEqual = false;
        else
        {
            for (let i:number = 0; i < defaultDressIDs.length; i++)
            {
                if (curDressIDs.indexOf(defaultDressIDs[i]) == -1)
                {
                    isEqual = false;
                    break;
                }
            }
        }
        this.saveBtn.enabled = !isEqual;
    }

    private checkChangeScene(sceneName:string):void//检查切换场景
    {
        if (this.saveBtn.enabled)//可以保存：表示非默认搭配
        {
            UIUtils.OpenPromptWin("","主人，切换界面将不会保存当前换装，是否前往该界面？",0,Laya.Handler.create(this,function(){
                SceneManager.GetInstance().EnterScene(sceneName);
            }));
        }
        else
            SceneManager.GetInstance().EnterScene(sceneName);
    }

    private onOpenCloseHandler(isOpen:boolean):void//打开关闭事件
    {
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        let gameWidth = SystemContext.gameWidth;
        let gameHeight = SystemContext.gameHeight;
        if (isOpen)//打开
        {
            Laya.Tween.to(this.dressAvatar,{scaleX:0.72,scaleY:0.72,x:(gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72,y:102},200);
            Laya.Tween.to(this.light,{y:374},200,null,Laya.Handler.create(this,this.onBottomOpenComplete));
        }
        else//关闭
        {
            //适配规则：最大放大到1，如人物距顶部小于80则计算可以放大的比例
            //103 为底部关闭后的高度
            //34 为人物脚与底部的预留高度
            let offsetY = this.dressAvatar.OffsetY;
            let offsetHeight = this.dressAvatar.OffsetHeight;
            let dressScale = 1;
            let dressAcatarY = (gameHeight - 103 - 34 - this.dressAvatar.height >> 1) - (offsetY + offsetHeight >> 1);
            if (dressAcatarY + offsetY < 80)
            {
                dressAcatarY = 80 - offsetY;
                dressScale = (gameHeight - 103 - 34 - dressAcatarY * 2) / this.dressAvatar.height;
            }
            Laya.Tween.to(this.dressAvatar,{scaleX:dressScale,scaleY:dressScale,x:(gameWidth - this.dressAvatar.width * dressScale >> 1) + Global.ModelOffsetX * dressScale,y:dressAcatarY},200);
            Laya.Tween.to(this.light,{y:dressAcatarY + this.dressAvatar.height * dressScale - 404},200);
            this.saveBtn.visible = this.skinColorTabGroup.visible = this.changeSkinText.visible = false;
        }
    }

    private onBottomOpenComplete():void//底部打开结束
    {
        this.saveBtn.visible = this.skinColorTabGroup.visible = this.changeSkinText.visible = true;
    }

    protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
	{
        super.onStageResize(event);

        UIUtils.BgAdaptation(this.bg);
        this.bottomView.StageResize();
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        let gameWidth = SystemContext.gameWidth;
        let gameHeight = SystemContext.gameHeight;
        if (this.bottomView.IsOpen)//打开状态
        {
            this.dressAvatar.pos((gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72,102);
            this.dressAvatar.scale(0.72,0.72);
            this.light.pos(134,374);
            this.saveBtn.visible = this.skinColorTabGroup.visible = true;
        }
        else
        {
            let offsetY = this.dressAvatar.OffsetY;
            let offsetHeight = this.dressAvatar.OffsetHeight;
            let dressScale = 1;
            let dressAcatarY = (gameHeight - 103 - 34 - this.dressAvatar.height >> 1) - (offsetY + offsetHeight >> 1);
            if (dressAcatarY + offsetY < 80)
            {
                dressAcatarY = 80 - offsetY;
                dressScale = (gameHeight - 103 - 34 - dressAcatarY * 2) / this.dressAvatar.height;
            }
            this.dressAvatar.pos((gameWidth - this.dressAvatar.width * dressScale >> 1) + Global.ModelOffsetX * dressScale,dressAcatarY);
            this.dressAvatar.scale(dressScale,dressScale);
            this.light.pos(134,dressAcatarY + this.dressAvatar.height * dressScale - 404);
        }
    }

    public destroy():void 
    {
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        GameManager.GetInstance().off(GameManager.COLLOCATION_SAVE_SUCC,this,this.onSaveSucc);
        super.destroy();
    }
}