import RES from "../../res/RES";
import SgsSpriteButton from "../controls/base/SgsSpriteButton";
import SgsTexture from "../controls/base/SgsTexture";

export default class ImageSpriteButton extends SgsSpriteButton
{
    protected textFlag:SgsTexture;

    constructor()
    {
        super();
    }

    protected createChildren():void
    {
        super.createChildren();
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