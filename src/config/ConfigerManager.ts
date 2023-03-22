import RES from "./../res/RES";
import ConfigerBase from "./ConfigerBase";
import GameEventDispatcher from "../event/GameEventDispatcher";
import DressConfiger from "./DressConfiger";

/*
* name;
*/
export default class ConfigerManager 
{
    public static CONFIG_PARSE_COMPLETE:string = "CONFIG_PARSE_COMPLETE";
    private zipFiles:Array<any>;
    //预加载配置解析器列表
    private preloadConfigerList: Array<ConfigerBase> = [
        DressConfiger.GetInstance()
    ];
    
    static instance:ConfigerManager;
    public static GetInstance():ConfigerManager 
    {
        if (ConfigerManager.instance == null)
            ConfigerManager.instance = new ConfigerManager();
        return ConfigerManager.instance;
    }

    constructor() 
    {

    }

    /**解析预加载配置*/
    public ParsePreloadConfig():void 
    {
        if (Laya.Browser.window.useLocalConfig) 
        {
            this.parseConfig();
        }
        else {
            unZip(RES.GetRes("Config_sgs"), this, function (zipFiles: Array<any>) {
                this.zipFiles = zipFiles;
                if (this.zipFiles && this.zipFiles.length) {
                    this.parseConfig();
                } else {
                    console.log("解压Config.sgs异常");
                }
            });
        }
    }

    private configLen:number = 0;
    private parseIndex:number = 0;
    private time:number;
    private workerList:Worker[] = [];
    private parseConfig(): void 
    {
        this.configLen = this.preloadConfigerList.length;
        this.parseIndex = 0;
        this.time = Laya.Browser.now();
        console.log("配置解析开始");
        var length: number = this.configLen = this.preloadConfigerList.length;
        if (Laya.Browser.window.useLocalConfig) 
        {
            for (var i: number = 0; i < length; i++) 
            {
                let configer: ConfigerBase = this.preloadConfigerList[i];
                let configerData: any = RES.GetRes(configer.configName);

                if(configer.promptlyParse)
                {
                    configer.ParseConfig(configerData ? configerData : null);
                }
                else
                {
                    configer.data = configerData;
                }
                // configer.ParseConfig(configerData ? configerData : null);
                //解析完，将配置数据从内存删除
                RES.ClearRes(configer.configName);
            }
            this.preloadConfigParsed();
        } 
        else 
        {            
            if(!Laya.WorkerLoader.workerSupported)
            {
                for (var i: number = 0; i < length; i++) 
                {
                    let configer: ConfigerBase = this.preloadConfigerList[i];
                    let configerData: any = RES.GetRes(configer.configName);
                    configer.WorkParse(this.getZipConfigData(configer.configName),null);
                    RES.ClearRes(configer.configName);
                }
                this.preloadConfigParsed();
            }else
            {
                //开3个worker
                for(let i:number = 0 ; i < 3;i++){
                    let w:Worker =  new Worker("libs/min/ConfigWorker.min.js?v=2020071301");
                    this.workerList.push(w);
                    this.parseIndex = i;
                    this.parseConfigIndex(i,w);
                }
            }
        }
    }

    private parseComplete(worker:Worker): void 
    {
        this.configLen--;
        if (this.configLen <= 0) {
            this.preloadConfigParsed();
        } else {
            this.parseIndex++;
            this.parseConfigIndex(this.parseIndex,worker);
        }
    }

    private parseConfigIndex(index: number,woker:Worker): void 
    {
        let configer: ConfigerBase = this.preloadConfigerList[index];
        if (configer) 
        {
            configer.on(ConfigerManager.CONFIG_PARSE_COMPLETE, this, this.parseComplete);
            configer.WorkParse(this.getZipConfigData(configer.configName),woker);
        }
    }

    private getZipConfigData(configName:string):any 
    {
        let resItem: any = RES.GetResourceItem(configName);
        if (resItem && resItem.url) {
            let url: string = resItem.url;
            let name: string = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".")) + ".sgs";

            if (this.zipFiles && this.zipFiles.length) 
            {
                let len: number = this.zipFiles.length;
                for (let i: number = 0; i < len; i++) 
                {
                    if (this.zipFiles[i].name == name)
                        return this.zipFiles[i].data;
                }
            }
        }
        return null;
    }
    //预加载配置解析完成
    private preloadConfigParsed(): void  {
        if (!Laya.Browser.window.useLocalConfig) {
            //解析完，将配置数据从内存删除            
            this.workerList.forEach(w=>{
                w.terminate();
            })
            this.preloadConfigerList.forEach(cf => {
                cf.off(ConfigerManager.CONFIG_PARSE_COMPLETE, this, this.parseComplete);
            })
            this.workerList.length = 0;
            RES.ClearRes("Config_sgs");
            this.zipFiles = null;
        }
        
        //配置解析完
        GameEventDispatcher.GetInstance().event("PARSE_CONFIGED");
        console.log("配置解析完成时间：" + (Laya.Browser.now() - this.time));
    }
}