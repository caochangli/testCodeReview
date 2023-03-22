import ToolTipBase from "./ToolTipBase";
import RES from "./../../res/RES";
import FontName from "./../../enum/FontName";
import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
import SgsTexture from "../controls/base/SgsTexture";
/*
* name;
*/
export default class ToolTips extends ToolTipBase
{
    protected bg:SgsTexture;
    protected msg:SgsHTMLDivElement;
    
    constructor()
    {
        super();
        this.bg = new SgsTexture(RES.GetRes("toolTipBg"));
        this.bg.sizeGrid = "11,11,11,11";
        this.bg.mouseEnabled = false
        this.addDrawChild(this.bg);

        this.msg = new SgsHTMLDivElement();
        this.msg.width = 236;
        this.msg.fontFamily = FontName.ST;
        this.msg.fontSize = 16;
        this.msg.color = "#ffffff";
        this.msg.leading = 8;
        this.msg.wordWrap = true;
        this.msg.mouseEnabled = false;
        this.msg.x = 10;
        this.msg.y = 10;
        this.addChild(this.msg);
    }

    public showMsg(str:string):void
    {
        if(str)
        {            
            this.msg.innerHTML = str;
            this.bg.size(this.msg.contextWidth + 20,this.msg.contextHeight - 8 + 20);
            this.size(this.bg.width,this.bg.height);
        }
        else
        {
            this.msg.innerHTML = "";
        }
    } 
}