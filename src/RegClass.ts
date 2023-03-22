import DressSaveScene from "./ui/base/dressSaveScene/DressSaveScene";
import DressScene from "./ui/dressScene/DressScene";
import HomeScene from "./ui/homeScene/HomeScene";
import MyDressScene from "./ui/myDressScene/MyDressScene";
import RankScene from "./ui/rankScene/RankScene";
import LookDressWindow from "./ui/window/LookDressWindow";
import PromptWindow from "./ui/window/PromptWindow";
import RuleWindow from "./ui/window/RuleWindow";
import SaveDressWindow from "./ui/window/SaveDressWindow";
// import SaveWindow from "./ui/window/SaveWindow";
import SharePromptWindow from "./ui/window/SharePromptWindow";
import VoteWorkInfoWindow from "./ui/window/VoteWorkInfoWindow";

export default class RegClass
{
    public static RegAllClass():void//注册所有反射类
    {
        //注册场景类
        this.regCls("HomeScene",HomeScene);
        this.regCls("DressScene",DressScene);
        this.regCls("MyDressScene",MyDressScene);
        this.regCls("RankScene",RankScene);
        this.regCls("DressSaveScene",DressSaveScene);
        
        
        //注册弹窗类
        // this.regCls("SaveWindow",SaveWindow);
        this.regCls("PromptWindow",PromptWindow);
        this.regCls("SharePromptWindow",SharePromptWindow);
        this.regCls("RuleWindow",RuleWindow);
        this.regCls("VoteWorkInfoWindow",VoteWorkInfoWindow);
        this.regCls("LookDressWindow",LookDressWindow);
        this.regCls("SaveDressWindow",SaveDressWindow);
    }

    public static GetInstanceClass(className:string):any//获取注册的反射类实例
    {
        return Laya.ClassUtils.getInstance(className);
    }
    public static GetRegClass(className:string):any//获取注册的反射类
    {
        return Laya.ClassUtils.getRegClass(className);
    }

    private static regCls(className:string,classDef:any):void
    {
        Laya.ClassUtils.regClass(className,classDef);
    }
}