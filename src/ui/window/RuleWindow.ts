import FontName from "../../enum/FontName";
import RES from "../../res/RES";
import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
import SgsText from "../controls/base/SgsText";
import CommonBaseWindow from "./CommonBaseWindow";
import RuleItemUI from "./RuleItemUI";

//规则窗口
export default class RuleWindow extends CommonBaseWindow
{
    private titleText:SgsText;
    private panel:Laya.Panel;

    private descY:number = 0;


    constructor()
    {
        super();
        
        this.modal = true;
        this.size(670,900);
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
        this.titleText.text = "【皮肤梦工厂】活动规则";
        this.addDrawChild(this.titleText);

        this.panel = new Laya.Panel();
        this.panel.pos(55,150);
        this.panel.size(583,690);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("blueVscroll");
        this.addChild(this.panel);
        //样式调整
        this.createTitleUI(this.descY,"【活动规则】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY,"①","玩家在创玩节期间共创魏阵营武将李婉皮肤，打造属于您心目中的最美样貌，<font color='#ff0000'>每个用户只能选择一个作品参赛</font>，一经选定确认后无法修改哦。");
        this.createItemUI(this.descY,"②","用户可通过游戏进行服装搭配并参赛投票，获得最高票数的搭配，<font color='#ff0000'>将会被官方采用制作李婉皮肤。</font>");
        this.createItemUI(this.descY,"③","用户在排行榜可使用桃气值进行投票，可以进行自投，<font color='#ff0000'>投票次数无限制。</font>");
        this.createItemUI(this.descY,"④","投票时间和截止时间：详见网页活动时间。");

        this.descY = this.descY + 10;
        this.createTitleUI(this.descY,"【桃气值】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY,"①","用户每天登录游戏即可获得<font color='#ff0000'>5</font>个桃气值。");
        this.createItemUI(this.descY,"②","用户每天分享本活动可多获得<font color='#ff0000'>3</font>个桃气值。");
        this.createItemUI(this.descY,"③","桃气值不会每日清空，请在活动截止前使用您的桃气值。");
        this.createItemUI(this.descY,"④","每名玩家每天最多获得<font color='#ff0000'>6</font>个桃气值</font>");

        this.descY = this.descY + 10;
        this.createTitleUI(this.descY,"【活动奖励】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY,"①","排行榜前20的玩家可获得<font color='#ff0000'>李婉武将*1。</font>");
        this.createItemUI(this.descY,"②","排行榜前21-50的玩家可获得<font color='#ff0000'>豪华皮肤包*1。</font>");
        this.createItemUI(this.descY,"③","排行榜51-100的玩家可获得<font color='#ff0000'>精致皮肤包*1。</font>");
    }

    private createTitleUI(y:number,desc:string):SgsHTMLDivElement
    {
        let descText = new SgsHTMLDivElement();
        descText.y = y;
        descText.width = 542;
        descText.fontFamily = FontName.HEITI;
        descText.fontSize = 28;
        descText.color = "#80B6A7";
        descText.wordWrap = true;
        descText.mouseEnabled = false;
        descText.innerHTML = desc;
        this.panel.addChild(descText);
        descText.height = descText.contextHeight;
        this.descY = this.descY + descText.contextHeight;
        return descText;
    }

    private createItemUI(y:number,code:string,desc:string):RuleItemUI
    {
        let ruleItemUI = new RuleItemUI();
        ruleItemUI.pos(12,y);
        ruleItemUI.SetDesc(542,code,desc);
        this.panel.addChild(ruleItemUI);
        this.descY = this.descY + ruleItemUI.height + 23;
        return ruleItemUI;
    }
}