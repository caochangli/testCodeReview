import RES from "../../res/RES";
import SgsFlatButton from "../controls/base/SgsFlatButton";
import SgsTexture from "../controls/base/SgsTexture";

export default class ImageFlatButton extends SgsFlatButton
{
    protected textFlag:SgsTexture;

    constructor()
    {
        super();
    }

    protected initChilds():void
    {
        super.initChilds();
        if (!this.textFlag)
        {
            this.textFlag = new SgsTexture();
            this.addDrawChild(this.textFlag);
        }
    }

    public InitTextSkin(res:string):void
    {
        this.textFlag.texture = RES.GetRes(res);
        this.setLayoutChanged();
    }

    protected changeLayout():void
    {
        super.changeLayout();
        this.textFlag.pos(this.width - this.textFlag.width >> 1,this.height - this.textFlag.height >> 1);
    }
}