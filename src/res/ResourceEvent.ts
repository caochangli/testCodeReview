/*
* 资源管理 - 事件
* Created by caochangli on 2017-11-14. 
*/
export default class ResourceEvent
{
    /** 配置文件加载并解析完成事件。注意：若有配置文件加载失败，将不会抛出此事件，若要处理配置加载失败，请同时监听 CONFIG_LOAD_ERROR 事件。*/
    public static CONFIG_COMPLETE:string = "configComplete";

    /** 配置文件加载失败事件。*/
    public static CONFIG_LOAD_ERROR:string = "configLoadError";

    /** 加载组资源加载进度事件。*/
    public static GROUP_PROGRESS:string = "groupProgress";
    
    /** 加载组资源加载完成事件。注意：若组内有资源项加载失败，将不会抛出此事件，若要处理组加载失败，请同时监听 GROUP_LOAD_ERROR 事件。*/
    public static GROUP_COMPLETE:string = "groupComplete";
    
    /** 一个加载项加载失败事件。*/
    public static ITEM_LOAD_ERROR:string = "itemLoadError";

    /** 加载组资源加载失败事件。*/
    public static GROUP_LOAD_ERROR:string = "groupLoadError";

    /** 资源组名。*/
    public groupName:string = "";
    
    /** 加载进度。*/
    public progress:number = 0;

    /** 加载错误的文件url。*/
    public errorUrl:string = "";

    constructor(groupName:string = "", progress:number = 0, errorUrl:string = "")
    {
        this.groupName = groupName;
        this.progress = progress;
        this.errorUrl = errorUrl;
    }
}