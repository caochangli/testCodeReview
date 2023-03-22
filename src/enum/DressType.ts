
export default class DressType
{
    public static DESDefault:number = 0;
    public static DESSuit:number = 1; //套装
    public static DESHairstyle:number = 2; //发型
    public static DESEye:number = 3; //眼睛
    public static DESJacket:number = 4; //上衣
    public static DESLowerGarments:number = 5; //下衣
    public static DESOrnaments:number = 6; //饰品
    public static DESArms:number = 7;//武器
    public static DESShoes:number = 8;//鞋子

    private static typeNames = ["", "套装", "发型", "眼睛", "上衣", "下衣", "饰品", "武器","鞋子"];
    private static typeSorts = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //从小到大

    //获取装扮类型名称
    public static GetDressTypeName(dressType:number):string 
    {
        return dressType >= 0 && dressType < this.typeNames.length ? this.typeNames[dressType] : "";
    }

    //获取装扮类型排序
    public static GetDressTypeSort(dressType:number):number 
    {
        return dressType >= 0 && dressType < this.typeSorts.length ? this.typeSorts[dressType] : 0;
    }
}