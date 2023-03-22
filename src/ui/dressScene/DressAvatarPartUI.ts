import DressPartVO from "../../vo/DressPartVO";
import DressVO from "../../vo/DressVO";
import SgsFlatImage from "../controls/base/SgsFlatImage";


//装扮形象部件
export default class DressAvatarPartUI extends SgsFlatImage
{
    protected dressVo:DressVO;
    protected dressPartVo:DressPartVO;

    constructor()
    {
        super();
    }

    public get DressVO():DressVO
    {
        return this.dressVo;
    }

    public get DressPartVO():DressPartVO
    {
        return this.dressPartVo;
    }

    public get DressID():number
    {
        return this.dressVo ? this.dressVo.DressID : 0;
    }

    public get DressType():number
    {
        return this.dressVo ? this.dressVo.DressType : 0;
    }

    public get Layer():number
    {
        return this.dressPartVo ? this.dressPartVo.Layer : 0;
    }

    public get IsLoaded():boolean
    {
        if (!this._skin) return false;
        return this.texture && this.texture.url == this._skin ? true : false;
    }

    public SetItemData(dressVo:DressVO,dressPartVo:DressPartVO):void
    {
        this.dressVo = dressVo;
        this.dressPartVo = dressPartVo;
        if (!dressPartVo)
        {
            this.skin = "";
            return;
        }
        if (dressPartVo.PartPos && dressPartVo.PartPos.length >= 2)
            this.pos(dressPartVo.PartPos[0],dressPartVo.PartPos[1]);
        else
            this.pos(0,0);
        this.skin = dressPartVo.ResourceUrl;
    }
    
    public clear(destroy:boolean = true):void 
    {
        super.clear(destroy);
        if (destroy)
        {
            this.dressVo = null;
            this.dressPartVo = null;   
        }
    }
}