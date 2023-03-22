import StorageUtils from "../../utils/StorageUtils";

/*
* name;
*/
export default class SgsSoundManager
{    
    public IsBgmStop:boolean = false;//是否停止播放背景声音

    constructor() 
    {
        this.IsBgmStop = StorageUtils.getBoolean("isBgmStop");
    }

    private static instance:SgsSoundManager;
    public static GetInstance():SgsSoundManager
    {
        if (SgsSoundManager.instance == null)
            SgsSoundManager.instance = new SgsSoundManager();
        return SgsSoundManager.instance;
    }

    //获取laya底层背景音乐url
    public static get LayaBgMusic():string
    {
        return Laya.SoundManager["_bgMusic"];
    }

    //播放背景声音
    public PlayBgm():void
    {
        Laya.SoundManager.playMusic("res/assets/runtime/voice/bgm.mp3");
    }

    //停止背景声音
    public StopBgm():void
    {
        this.IsBgmStop = true;
        StorageUtils.addBoolean("isBgmStop",this.IsBgmStop);
        Laya.SoundManager.stopMusic();
    }

    //更新背景声音状态
    public ChangeBgmState():void
    {
        this.IsBgmStop = !this.IsBgmStop;
        if (!this.IsBgmStop)//播放
            Laya.SoundManager.playMusic("res/assets/runtime/voice/bgm.mp3");
        else
            Laya.SoundManager.stopMusic();
        StorageUtils.addBoolean("isBgmStop",this.IsBgmStop);
    }

    public static PlaySound(url:string,loops?:number,completeHander?:Laya.Handler):Laya.SoundChannel
    {
        return Laya.SoundManager.playSound(url,loops,completeHander);
    }

    public static StopSound(url:string):void
    {
        Laya.SoundManager.stopSound(url);
    }
}