import AnimateManager from "./mode/base/AnimateManager";
import SgsTemplet from "./ui/controls/base/SgsTemplet";
import Dictionary from "./utils/Dictionary";
import ObjUtil from "./utils/ObjUtil";


/*
* name;
*/
export default class Global 
{
    public static LongClickTime:number = 750;//长按时间(毫秒)
    public static OperationFastTime:number = 2000;//操作过快时间保护(毫秒)
    public static ConsoleLog:any;//log函数

    public static BgWidth:number = 750;//背景图宽度
    public static BgHeight:number = 1496;//背景图宽度
    public static ModelWidth:number = 548;//模特宽度
    public static ModelHeight:number = 940;//模特宽度
    public static ModelOffsetX:number = 306 - 242 >> 1;//模特水平偏移量(模特图上模特脚不在切图中间，为了看起来脚在屏幕中心需要加上这个偏移量)

    public static IsDebug:boolean = true;//是否debug
    public static AutoClearRes:boolean = true;//自动回收资源
    public static ServerUrl:string = "";//服务地址 http://10.225.10.63:8082 https://553j5w3600.zicp.fun
    public static ShareJsSdk:string = "";//分享参数地址
    public static GameDownLoadUrl:string = "";//游戏下载地址
    public static DefaultDressIDs:Array<number>;//默认搭配
    public static CollocationMax:number = 0;//搭配最大数量

    public static Init(data:any) {
        if (data)
            ObjUtil.copyObj(data, this);
    }
    
    //游戏地址
    public static get GameUrl():string
    {
        return Laya.Browser.window.gameUrl;
    }

    //游戏地址
    public static get AppID():string
    {
        testCR
        return Laya.Browser.window.appid;
    }
    
    //游戏下载
    public static DownLoadGame():void
    {
        window.open(Global.GameDownLoadUrl);
    }

    //打印已加载资源
    public static logRes():void
    {
        // Loader.loadedMap; //所有(但不包括图集散图) 其中图片存储类型为Laya.Texture2D
        // Loader.atlasMap; //图集atlas
        // Loader.textureMap; //纹理字典：图集散图+单图+spine纹理 存储类型为Laya.Texture
        // Laya.Texture; 纹理对象，其内部bitmap对象为Laya.Texture2D
        //图集
        //动画资源：纹理、sk、模板
        //其他资源：配置、3d资源等
        let atlasMap = Laya.Loader["atlasMap"];//所有图集
        let logAtlas:Array<string> = [];
        if (atlasMap)
        {
            for (let key in atlasMap)
            {
                logAtlas.push(key);
            }
        }
        
        let loadedMap = Laya.Loader.loadedMap;
        let others:Array<any> = [];
        let spines:Array<string> = [];
        if (loadedMap)
        {   
            let destroyed:boolean = false;
            let suffixIndex:number = -1;
            let skUrl:string = "";
            let skelUrl:string = "";
            let loadedItem:any;
            for (let key in loadedMap)
            {
                loadedItem = loadedMap[key];
                if (loadedItem == undefined)
                    continue;

                if (logAtlas.indexOf(key) >= 0)//图集atlas文件
                    continue;

                if (key.lastIndexOf(".mp3") >= 0)//mp3
                    continue;
                
                if (key.lastIndexOf(".ttf") >= 0)//ttf
                    continue;

                if (key.lastIndexOf(".sk") >= 0 || key.lastIndexOf(".skel") >= 0)//sk、skel文件
                {
                    spines.push(key);
                    continue;
                }

                destroyed = false;
                if (loadedItem instanceof Laya.Texture2D)//纹理
                {
                    destroyed = loadedItem.destroyed;
                    suffixIndex = key.lastIndexOf(".");
                    skUrl = key.substring(0,suffixIndex)+'.sk';
                    if (loadedMap[skUrl])//spine动画纹理
                        continue;
                    else
                    {
                        skelUrl = key.substring(0,suffixIndex)+'.skel';
                        if (loadedMap[skelUrl])//spine动画纹理
                            continue;
                    }
                }
                else if (key.lastIndexOf(".atlas") >= 0 && typeof(loadedItem) == "string")//文本
                {
                    suffixIndex = key.lastIndexOf(".");
                    skelUrl = key.substring(0,suffixIndex)+'.skel';
                    if (loadedMap[skelUrl])//spine动画atlas
                        continue;
                }
                others.push({url:key,destroyed:destroyed});
            }
        }

        let dic:Dictionary = AnimateManager.GetInstane().AnimateDic;
        let templets:Array<string> = [];
        if (dic)
        {
            dic.forEach((url:string,templet:SgsTemplet) => {
                templets.push(url);
            });
        }


        console.warn("图集：");
        console.warn({logAtlas:logAtlas});
        console.warn("spine资源：");
        console.warn({spines:spines});
        console.warn("AnimateManager中spine数据模板：");
        console.warn({templets:templets});
        console.warn("其他资源：");
        console.warn({others:others});
    }
}