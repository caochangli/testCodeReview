import RES from "../../res/RES";
import SgsTexture from "../controls/base/SgsTexture";
import SgsTabFlatButton from "../controls/SgsTabFlatButton";

export default class DressTabFlatButton extends SgsTabFlatButton
{
    private textFlag:SgsTexture;

    constructor()
    {
        super();

        this.size(160,75);
    }

    public init():void
    {
        super.InitSkin("dressTabButtonNormal","dressTabButtonNormal","dressTabButtonNormal","dressTabButtonNormal","dressTabButtonSelect");
    }

    public set value(val:number)
    {
        this._value = val;
        this.changeState();
    }

    public get value():number
    {
        return this._value;
    }

    protected changeState():void//状态变化
    {
        super.changeState();
        if (!this.textFlag)
        {
            this.textFlag = new SgsTexture();
            this.addDrawChild(this.textFlag);
        }
        if (!this._enabled)
        {
        }
        else if (this._selected)
        {
            this.textFlag.texture = RES.GetRes("dressTabText" + this._value + "_select");
        }
        else
        {
            this.textFlag.texture = RES.GetRes("dressTabText" + this._value);
        }
        this.textFlag.pos(this.width - this.textFlag.width >> 1,this.height - this.textFlag.height >> 1);
    }
}