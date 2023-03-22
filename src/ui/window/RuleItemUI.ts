import FontName from "../../enum/FontName";
import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
import SgsSprite from "../controls/base/SgsSprite";
import SgsText from "../controls/base/SgsText";


//规则
export default class RuleItemUI extends SgsSprite
{
    private codeText:SgsText;
    private descText:SgsHTMLDivElement;

    constructor()
    {
        super();

        this.init();
    }

    protected init():void
    {
        this.codeText = new SgsText();
        this.codeText.font = FontName.HEITI;
        this.codeText.fontSize = 24;
        this.codeText.bold = true;
        this.codeText.color = "#80B6A7";
        this.addDrawChild(this.codeText);

        this.descText = new SgsHTMLDivElement();
        this.descText.x = 35;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 24;
        this.descText.color = "#80B6A7";
        this.descText.leading = 16;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.addChild(this.descText);
    }

    public SetDesc(width:number,code:string,desc:string):void
    {
        this.width = width;
        this.descText.width = this.width - this.descText.x;
        this.codeText.text = code;
        this.descText.innerHTML = desc;
        this.height = this.descText.contextHeight - 16;
    }
}