import SgsSpriteButton from "./SgsSpriteButton";
import FontName from "../../../enum/FontName";

export default class ComboboxRenderItem extends SgsSpriteButton
{
     constructor()
     {
        super();
       
        this.height = 26;
        this.labelSize = 14;
        this.labelFont = FontName.ST;
        this.labelColors = "#FAEDD9,#FAEDD9,#FAEDD9,gray";
        this.labelAlign = "left";
        this.labelPadding = "0,3,0,3";
        this.InitSkin('EmptyImg',"ComboBoxItemOver","ComboBoxItemOver");
    }

    public set dataSource(obj:any)
    {
        if (obj)
        {
            this.width = (this.parent.parent as Laya.List).width;
            this.label = obj.label;
        }
        else
        {
            this.label = "";
        }
    }
}