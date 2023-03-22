
export default class DressPartVO 
{
    public PartID:number = 0;
    // public PartName:string = "";//部件名称
    public PartPos:Array<number>;//部件坐标
    public PartSize:Array<number>;//部件尺寸
    public Resource:string = "";//部件资源
    public Layer:number = 0;//层级(越大越前面)

    constructor()
    {

    }

    public get ResourceUrl():string
    {
        if (this.Resource)
            return "res/assets/runtime/dressPart/" + this.Resource + ".png";
        return "";
    }
}