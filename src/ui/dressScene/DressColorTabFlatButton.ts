import RES from "../../res/RES";
import SgsTexture from "../controls/base/SgsTexture";
import SgsTabFlatButton from "../controls/SgsTabFlatButton";

export default class DressColorTabFlatButton extends SgsTabFlatButton
{
    constructor()
    {
        super();

        this.size(116,84);
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
        if (!this._enabled)
        {
        }
        else if (this._selected)
        {
            this.background.texture = RES.GetRes("dressSkinBtn" + this._value + "_select");
        }
        else
        {
            this.background.texture = RES.GetRes("dressSkinBtn" + this._value);
        }
    }
}