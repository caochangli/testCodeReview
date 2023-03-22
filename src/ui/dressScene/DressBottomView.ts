import DressConfiger from "../../config/DressConfiger";
import LayoutEnum from "../../enum/base/LayoutEnum";
import RES from "../../res/RES";
import SystemContext from "../../SystemContext";
import DressVO from "../../vo/DressVO";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsImage from "../controls/base/SgsImage";
import SgsSprite from "../controls/base/SgsSprite";
import SgsTexture from "../controls/base/SgsTexture";
import SgsFlatPanel from "../controls/SgsFlatPanel";
import SgsTabButtonGroup from "../controls/SgsTabButtonGroup";
import DressPanelFlatItem from "./DressPanelFlatItem";
import DressTabFlatButton from "./DressTabFlatButton";
import DressTabPanel from "./DressTabPanel";


//装扮
export default class DressBottomView extends SgsSprite
{
    private openBtn:SgsFlatButton;
    private closeBtn:SgsFlatButton;
    private delBtn:SgsFlatButton;
    private leftBtn:SgsFlatButton;
    private rightBtn:SgsFlatButton;
    private tabPanel:DressTabPanel;
    private tabGroup:SgsTabButtonGroup;
    private dressBg:SgsTexture;
    private dressPanel:SgsFlatPanel;
    private dressRightBg:SgsImage;

    private tabList:Array<any> = [{label:"",value:1},{label:"",value:2},{label:"",value:3},{label:"",value:4},
                                {label:"",value:5},{label:"",value:6},{label:"",value:7},{label:"",value:8}];
    private resetDressVo:DressVO;
    private openHeight:number = 0;//打开时的高度：根据屏幕计算
    private isOpen:boolean = true;//是否打开状态
    private openCloseIng:boolean = false;//打开关闭效果中
    private panelMaxHeight:number = 132 * 4 + (10 * 3);//最多显示四行

    constructor()
    {
        super();

        this.width = SystemContext.gameWidth;
        this.addDrawClick();
        this.initChilds();
    }

    private initChilds():void
    {
        this.dressBg = new SgsTexture(RES.GetRes("dressPanelBg"));
        this.dressBg.pos(0,103);
        this.dressBg.sizeGrid = "30,127,140,52";
        this.dressBg.width = SystemContext.gameWidth;
        this.addDrawChild(this.dressBg);

        this.openBtn = new SgsFlatButton();
        this.openBtn.pos(29,0);
        this.openBtn.InitSkin("dressUpBtn");
        this.openBtn.visible = !this.isOpen;
        this.openBtn.on(Laya.Event.CLICK,this,this.onOpenHandler);
        this.addDrawChild(this.openBtn);

        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(29,0);
        this.closeBtn.InitSkin("dressDownBtn");
        this.closeBtn.visible = this.isOpen;
        this.closeBtn.on(Laya.Event.CLICK,this,this.onCloseHandler);
        this.addDrawChild(this.closeBtn);

        this.delBtn = new SgsFlatButton();
        this.delBtn.pos(647,0);
        this.delBtn.InitSkin("dressDelBtn");
        this.delBtn.on(Laya.Event.CLICK,this,this.onDelHandler);
        this.addDrawChild(this.delBtn);

        this.leftBtn = new SgsFlatButton();
        this.leftBtn.pos(0,103);
        this.leftBtn.InitSkin("dressLeftBtn","dressLeftBtn","dressLeftBtn","dressLeftBtnDisable");
        this.leftBtn.on(Laya.Event.CLICK,this,this.onLeftHandler);
        this.addDrawChild(this.leftBtn);

        this.rightBtn = new SgsFlatButton();
        this.rightBtn.pos(705,103);
        this.rightBtn.InitSkin("dressRightBtn","dressRightBtn","dressRightBtn","dressRightBtnDisable");
        this.rightBtn.on(Laya.Event.CLICK,this,this.onRightHandler);
        this.addDrawChild(this.rightBtn);

        this.tabPanel = new DressTabPanel();
        this.tabPanel.pos(49,103);
        this.tabPanel.size(652,75);
        this.tabPanel.hScrollBarSkin = "";
        this.tabPanel.on("scrollChange",this,this.onScrollChange);
        this.addChild(this.tabPanel);

        this.tabGroup = new SgsTabButtonGroup(this.tabList,1,false,4,DressTabFlatButton);
        this.tabGroup.on(SgsTabButtonGroup.TAP_CLICKED,this,this.onTabClick);
        this.tabPanel.addChild(this.tabGroup);

        this.dressPanel = new SgsFlatPanel(DressPanelFlatItem,1,-1);
        this.dressPanel.pos(30,this.dressBg.y + 86);
        this.dressPanel.width = SystemContext.gameWidth - 36;
        this.dressPanel.vScrollBarSkin = RES.GetAtlasUrl("whiteVscroll");
        this.dressPanel.SetLayout(LayoutEnum.TileLayout, 10, 7, 5);
        this.dressPanel.on(SgsFlatPanel.ITEM_CLICK,this,this.onItemClick);
        this.addChild(this.dressPanel);

        this.dressRightBg = new SgsImage();
        this.dressRightBg.x = 585;
        this.dressRightBg.source = RES.GetRes("dressPanelRightBg");
        this.addChild(this.dressRightBg);

        this.tabGroup.SelectedValue = 1;
    }

    public get IsOpen():boolean
    {
        return this.isOpen;
    }

    public StageResize():void
    {
        if (this.openCloseIng)//正在打开关闭中
        {
            Laya.Tween.clearAll(this);
            this.openCloseIng = false;
        }   
        let maxHeight:number = this.dressBg.y + 86 + this.panelMaxHeight + 40;//最大高度：panel起点+panel最大高度(最多显示四行)+panel距底部距离
        let height:number = SystemContext.gameHeight - 840;//屏幕上方至少预留800高度
        if (height > maxHeight) height = maxHeight;
        this.openHeight = height;
        this.dressBg.height = height - this.dressBg.y;
        this.dressPanel.height = this.dressBg.height - 86 - 40;
        this.dressRightBg.y = this.dressPanel.y + this.dressPanel.height - 26;
        if (this.isOpen)//打开状态：立即改变高度
        {
            this.height = height;
        }
        this.y = SystemContext.gameHeight - this.height;
    }

    private onOpenHandler():void//打开
    {
        if (this.openCloseIng) return;
        this.openCloseIng = true;
        this.isOpen = true;
        this.openBtn.visible = !this.isOpen;
        this.closeBtn.visible = this.isOpen;
        this.leftBtn.visible = this.rightBtn.visible = this.tabPanel.visible = this.dressPanel.visible = true;
        this.height = this.openHeight;
        Laya.Tween.to(this,{y:SystemContext.gameHeight - this.height},200,null,Laya.Handler.create(this,this.onOpenCloseComplete));
        this.event("openCloseEvent",this.isOpen);
    }

    private onCloseHandler():void//关闭
    {
        if (this.openCloseIng) return;
        this.openCloseIng = true;
        this.isOpen = false;
        this.openBtn.visible = !this.isOpen;
        this.closeBtn.visible = this.isOpen;
        this.height = this.tabPanel.y;
        Laya.Tween.to(this,{y:SystemContext.gameHeight - this.height},200,null,Laya.Handler.create(this,this.onOpenCloseComplete));
        this.event("openCloseEvent",this.isOpen);
    }

    private onOpenCloseComplete():void
    {
        this.openCloseIng = false;
        if (!this.isOpen)//关闭结束：掩藏超出屏幕的UI
            this.leftBtn.visible = this.rightBtn.visible = this.tabPanel.visible = this.dressPanel.visible = false;
    }

    private onLeftHandler():void
    {
        this.tabPanel.scrollTo(this.tabPanel.hScrollBar.value - 164,0);
    }

    private onRightHandler():void
    {
        this.tabPanel.scrollTo(this.tabPanel.hScrollBar.value + 164,0);
    }

    private onTabClick():void//切换分类
    {
        let list:Array<DressVO> = [];
        if (!this.resetDressVo)
        {
            this.resetDressVo = new DressVO();
            this.resetDressVo.DressID = 0;
        }
        this.resetDressVo.DressType = this.tabGroup.SelectedValue;
        list.push(this.resetDressVo);
        let config = DressConfiger.GetInstance();
        let dressVos = config.GetDresssByDressType(this.tabGroup.SelectedValue);
        this.dressPanel.scrollTo(0,0);
        if (dressVos && dressVos.length > 0)
        {
            let defaultDressIDs = config.DefaultDressIDs;
            dressVos.forEach(dressVo => {
                if (!defaultDressIDs || defaultDressIDs.indexOf(dressVo.DressID) == -1)//过滤默认搭配
                    list.push(dressVo);
            });
            this.dressPanel.DataProvider = list;
        }
        else
            this.dressPanel.DataProvider = [this.resetDressVo];
    }

    private onItemClick(index:number,data:DressVO,itemUI:DressPanelFlatItem):void//选中部件
    {
        this.event("changeDress",data);
    }

    private onDelHandler():void//清空搭配
    {
        this.event("delDress");
    }

    private onScrollChange():void
    {
        this.updateLeftRightBtn();
    }

    private updateLeftRightBtn():void
    {
        this.leftBtn.enabled = this.tabPanel.hScrollBar.value > 0;
        this.rightBtn.enabled = this.tabPanel.hScrollBar.value < this.tabPanel.hScrollBar.max; 
    }

    public destroy():void 
    {
        Laya.Tween.clearAll(this);
        super.destroy();
        this.resetDressVo = null;
    }
}