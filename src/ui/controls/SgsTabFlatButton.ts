import FontName from "../../enum/FontName";
import SgsFlatButton from "./base/SgsFlatButton";
import SgsSprite from "./base/SgsSprite";
/*
* name;
*/
export default class SgsTabFlatButton extends SgsFlatButton
{    
    protected _value:number = 0;
    protected enableTip:string = "";
    
    //额外层：如传入额外层，则额外第0层为文字层，第1层为红点层
    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);
    }

    public set value(val:number)
    {
        this._value = val;
    }

    public get value():number
    {
        return this._value;
    }

    public get EnableTip():string
    {
        return this.enableTip;
    }

    public set EnableTip(value:string)
    {
        this.enableTip = value;
    }
    
    public init(...arg):void
    {
        if(arg && arg.length)
            this.InitSkin(arg[0],arg.length >1&& arg[1]?arg[1]:"",arg.length >2&& arg[2]?arg[2]:"",arg.length >3&& arg[3]?arg[3]:"",arg.length >4&& arg[4]?arg[4]:"");
        else
            this.InitSkin("tabButtonGeneral_Normal","tabButtonGeneral_Overt","tabButtonGeneral_Overt","tabButtonGeneral_Overt","tabButtonGeneral_Select");
        this.labelFont = FontName.ST;
        this.labelSize = 16;
        this.labelColors = "#291400,#291400,#291400";
    }

    public ClearDraw(destroy:boolean = true):void
    {
        super.ClearDraw(destroy);
    }
}