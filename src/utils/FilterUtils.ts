/*
* name;
*/
export default class FilterUtils
{
    private static grayFilter:Array<Laya.Filter>;
    private static blackWhiteFilter:Array<Laya.Filter>;
    private static blackSilhouette:Array<Laya.Filter>;
    
    constructor(){

    }

    //发光滤镜
    public static GlowFilter(color:string,blur?:number,offX?:number,offY?:number):Laya.GlowFilter
    {
        return new Laya.GlowFilter(color,blur,offX,offY);
    }
    
    //灰色
    public static GetGrayFilter():Array<Laya.Filter>
    {
        if(!FilterUtils.grayFilter)
        {
            FilterUtils.grayFilter = [];
            var colorMatrix:Array<number> = 
            [0.3086, 0.6094,0.0820, 0, 0, //R
             0.3086, 0.6094,0.0820, 0, 0, //G
             0.3086, 0.6094,0.0820, 0, 0, //B
             0, 0, 0, 1, 0,//A
            ];
            FilterUtils.grayFilter.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.grayFilter;

    }

    //黑白
    public static GetBlackWhiteFilter():Array<Laya.Filter>
    {
        if(!FilterUtils.blackWhiteFilter)
        {
            FilterUtils.blackWhiteFilter = [];
            var colorMatrix:Array<number> = 
            [0.2,0.6,0,0,0,  
             0.2,0.6,0,0,0,  
             0.2,0.6,0,0,0,  
             0,1,0,1,0];
            FilterUtils.blackWhiteFilter.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.blackWhiteFilter;
    }

    //黑色剪影
    public static GetBlackSilhouetteFilter():Array<Laya.Filter>
    {
        if(!FilterUtils.blackSilhouette)
        {
            FilterUtils.blackSilhouette = [];
            var colorMatrix:Array<number> = 
            [0,0,0,0,0,  
             0,0,0,0,0,  
             0,0,0,0,0,  
             0,1,0,1,0];
            FilterUtils.blackSilhouette.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.blackSilhouette;
    }
}