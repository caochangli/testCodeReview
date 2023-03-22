
export default class DressVO 
{
    public DressID:number = 0;
    // public DressName:string = "";//装扮名称
    public DressType:number = 0;//装扮类型 - DressType
    public DressParts:Array<number>;//装扮部件
    public Resource:string = "";//资源
    public Sort:number = 0;//排序(越小越前面)

    constructor()
    {

    }

    public get ResourceUrl():string
    {
        if (this.Resource)
            return "res/assets/runtime/dress/" + this.Resource + ".png";
        return "";
    }
}