import AnimateManager from "./mode/base/AnimateManager";
import SgsTemplet from "./ui/controls/base/SgsTemplet";
import Dictionary from "./utils/Dictionary";
import ObjUtil from "./utils/ObjUtil";


/*
* name;
*/
export default class Global1
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

}