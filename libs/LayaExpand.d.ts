/**
 * Created by caochangli on 2017-11-08.
 */
declare module Laya
{
    /**
     * 调用父类的setter属性，代替其他语言的写法，如 super.alpha = 1;
     * @param thisObj 当前对象。永远都this
     * @param currentClass 当前 class 类名，非字符串
     * @param type 需要调用的setter属性名称
     * @param values 传给父类的值
     *
     * @exmaple sgs.superSetter(sgs.Sprite, this, "alpha", 1);
     */
    function superSetter(currentClass: any, thisObj: any, type: string, ...values: any[]): any;
    
    /**
     * 获取父类的getter属性值。代替其他语言的写法，如 super.alpha;
     * @param thisObj 当前对象。永远都this
     * @param currentClass 当前 class 类名，非字符串
     * @param type 需要调用的setter属性名称
     * @returns {any} 父类返回的值
     *
     * @exmaple sgs.superGetter(sgs.Sprite, this, "alpha");
     */
    function superGetter(currentClass: any, thisObj: any, type: string): any;
}

declare function hideHtmlLoading():void;//掩藏htmlLoading
// declare function updateBgSize(width:number,height:number):void;
declare function callIFrame(wid:number,height:number,url:string,modal:boolean,type:string,closeBtn:string,closeTop?:number,closeRight?:number,alphaBg?:boolean):void;//打开Iframe
declare function closeIFrame():void;//关闭Iframe
// declare function cefVersion():string;//微端版本号
declare function callLinkImage(wid:number,height:number,imageUrl:string,linkUrl:string,modal:boolean,closeBtn:string):string;
declare function checkCanUseWebGL():boolean;//是否支持webGL
declare function callIFrame2(wid:number,height:number,url:string,modal:boolean):void;//打开Iframe

// declare function IsInAgoraRoom():boolean;//是否在语音房间
// declare function joinAgoraRoom(appid:string,channelId:string,userid:number):void;//加入语音房间
// declare function checkSystemRequirements():boolean;//检查浏览器是否支持语音（包括语音设备）
// declare function leaveAgoraRoom():void;//离开语音房间
// declare function openMic(value):boolean;//打开麦克风
// declare function openAudio(value):boolean;//打开听筒
// declare function getGameOpenTime():number;//获取打开游戏的时间
declare function getWebp():boolean;//是否支持webp格式

// declare function updateIgnoreAudio(list:Array<number>);//设置屏蔽语音的玩家

// declare function IsopenMic():boolean;//是否打开了麦克风
// declare function IsopenAudio():boolean;//是否打开听筒

declare function unZip(zipData:any,thisObj:any,callBack:Function):void
declare function isWinXin():boolean;//是否微信
declare function wxAuthorize():boolean;//微信授权
declare function wxConfig(appId:string,timestamp:number,nonceStr:string,signature:string,thisObj:any,callBack:Function):void;//微信接口配置
declare function wxShare(title:string,desc:string,link:string,imgUrl:string,thisObj:any,callBack:Function):void;//微信分享接口

declare module Zlib 
{
    export class Gunzip 
    {
        constructor(data:Uint8Array);
        decompress(): any;
     }
}

