import ResourceLoader from "./ResourceLoader";
import ResourceItem from "./ResourceItem";
import ResourceEvent from "./ResourceEvent";
import ResourceConfig from "./ResourceConfig";
/*
* 资源管理类
* Created by caochangli on 2017-11-14. 
*/
export default class RES extends Laya.EventDispatcher
{
    /** 资源根目录 */
    public static resourceRoot:string = "";

    /** 配置解析器 */
    private static resConfig:ResourceConfig = new ResourceConfig();

    /** 资源加载器 */
    private static resLoader:ResourceLoader = new ResourceLoader(RES.resConfig);

    /** 资源引用 */
    private static referenceDic:any = {};

    constructor()
    {
        super();
    }

    private static _res:RES;
    private static GetInstance():RES
    {
        if (!RES._res)
        {
            RES._res = new RES();
        }
        return RES._res;
    }

    /** 加载出错后的重试次数，默认重试一次*/
    public static set RetryNum(retryNum:number)
    {
        Laya.loader.retryNum = retryNum;
    }

    /** 延迟时间多久再进行错误重试，默认立即重试*/
    public static set RetryDelay(retryDelay:number)
    {
        Laya.loader.retryDelay = retryDelay;
    }

    /** 最大下载线程，默认为5个*/
    public static set MaxLoader(maxLoader:number)
    {
        Laya.loader.maxLoader = maxLoader;
    }

    // /** 资源版本号*/
    // private static _version:string = "";
    // public static set Version(version:string)
    // {
    //     RES._version = version;
    // }

    // public static get Version():string
    // {
    //     return RES._version;
    // }

    // public static GetVersion():string
    // {
    //     if (RES.Version == "")
    //         return "";
    //     return "?v=" + RES.Version;
    // }

    /**
     * 添加侦听器
     * @param type 事件的类型。
     * @param thisObject 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    public static AddEventListener(type:string, thisObject:any, listener:Function):void
    {
        RES.GetInstance().on(type,thisObject,listener);
    }

    /**
     * 删除侦听器
     * @param type 事件的类型。
     * @param thisObject 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    public static RemoveEventListener(type:string, thisObject:any, listener:Function):void
    {
        RES.GetInstance().off(type,thisObject,listener);
    }

    /**
     * 加载配置文件并解析。
     * @param url 配置文件路径(resource.json的路径)。
     * @param resourceRoot 资源根路径。配置中的所有url都是这个路径的相对值。最终url是这个字符串与配置里资源项的url相加的值。
     */
    public static LoadConfig(url:string, resourceRoot:string = ""):void
    {
        RES.resourceRoot = resourceRoot;

        if (!url || url.length <= 0) {//配置文件url为空
            console.warn("配置文件url为空");
            return;
        }

        RES.resLoader.loadConfig(url);
    }

    /**
     * 根据组名加载一组资源。
     * @param groupName 要加载资源组的组名。
     * @param priority 加载优先级，低优先级的组必须等待高优先级组完全加载结束才能开始，同一优先级的组会同时加载，默认值为 0。
     */
    public static LoadGroup(groupName:string, priority:number = 0): void
    {
        if (!groupName || groupName.length <= 0) {//资源组名不能为空
            console.warn("加载的资源组名称不能为空");
            return;
        }
        if (!RES.resConfig.configComplete) {//配置文件未加载完
             console.warn("配置文件未加载完，请先加载配置文件");
             return;
        }
        if (RES.resLoader.isGroupLoaded(groupName)) {//资源组已加载过
            RES.dispatchResourceEvent(ResourceEvent.GROUP_COMPLETE,groupName);
            return;
        }
        if (RES.resLoader.isGroupInLoading(groupName))//资源组正在加载中
            return;
        var groupList:Array<any> = RES.resConfig.getGroupByName(groupName);
        if (!groupList || groupList.length <= 0) {
            console.warn("加载不存在的资源组或资源组中无资源:" + groupName);
            return;
        }

        RES.resLoader.loadGroup(groupName,groupList,priority);
    }


    /**
     * 加载一组静默资源
     */
    public static LoadSilenceGroup(groupName:string, groupList:Array<any>, priority:number = 0): void
    {
        if (!groupName || groupName.length <= 0) {//资源组名不能为空
            console.warn("加载的资源组名称不能为空");
            return;
        }
        if (!RES.resConfig.configComplete) {//配置文件未加载完
             console.warn("配置文件未加载完，请先加载配置文件");
             return;
        }
        if (RES.resLoader.isGroupInLoading(groupName))//资源组正在加载中
            return;
        if (!groupList || groupList.length <= 0) {
            console.warn("加载不存在的资源组或资源组中无资源:" + groupName);
            return;
        }

        RES.resLoader.loadGroup(groupName,groupList,priority);
    }


    /** 停止资源组加载(仅能停止未开始加载的内容)。*/
    public static StopGroup(groupName:string):boolean
    {
        return RES.resLoader.stopGroup(groupName);
    }

    /** 检查某个资源组是否已经加载完成。*/
    public static IsGroupLoaded(groupName:string):boolean
    {
        return RES.resLoader.isGroupLoaded(groupName);
    }

    /** 检查资源是否已下载到本地 */
    public static IsResLoadedLocal(groupName:string):boolean
    {
        return RES.resLoader.isResLoadedLocal(groupName);
    }

    /** 根据组名获取组加载项列表。 */
    public static GetGroupByName(groupName:string):Array<ResourceItem>
    {
        return RES.resConfig.getGroupByName(groupName);
    }

    /**
     * 追加资源组资源
     * @param groupName 追加的资源组组名。
     * @param keys 追加的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名。
     * */
    public static AddGroupKeys(groupName:string, keys:string[]):void
    {
        RES.resLoader.delGroupLoaded(groupName);//将原资源组设置为未加载
        RES.resConfig.addGroupKeys(groupName,keys);
    }

    /**
     * 删除资源组资源
     * @param groupName 删除的资源组组名。
     * @param keys 删除的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名(空表示删除资源组下全部key)。
     * */
    public static DelGroupKeys(groupName:string, keys?:string[]):void
    {
        RES.resConfig.delGroupKeys(groupName,keys);
    }

    /**
     * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
     * @param groupName 创建的加载资源组的组名。
     * @param keys 包含的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名。
     * @param override 是否覆盖已经存在的同名资源组,默认 false。
     * @returns 是否创建成功。
     */
    public static CreateGroup(groupName:string, keys:string[], override:boolean = false):boolean
    {
        if (override) {//覆盖已存在同名资源组：将原资源组设置为未加载
            this.resLoader.delGroupLoaded(groupName);
        }
        return RES.resConfig.createGroup(groupName,keys,override);
    }

    /**
     * 追加resources
     * @param resources resources列表，格式{"url": "","type": "","name": ""}
    */
    public static AddResources(resources:Array<any>):void
    {
        RES.resConfig.addResources(resources);
    }

    /**
     * 删除resources
     * @param resources resources列表，格式{"url": "","type": "","name": ""}
    */
    public static DelResources(resources:Array<any>):void
    {
        RES.resConfig.delResources(resources);
    }

    /**
     * 删除resources
     * @param names names列表
    */
    public static DelResourcesByName(names:Array<string>):void
    {
        RES.resConfig.delResourcesByName(names);
    }

    /** 
     * 检查配置文件里指定的资源是否已加载。
     * @param key 可以是配置文件中对应的name；也可以是url地址(推荐使用name)。如果访问的是图集子项须使用子项名(不需要扩展名)
    */
    public static HasRes(key:string):boolean
    {     
        return RES.GetRes(key) != null;
    }

    /** 检查指定资源是否在已加载组中 */
    public static IsResInLoadedGroup(url:string):boolean
    {
        return RES.resLoader.isResInLoadedGroup(url);
    }

    /** 
     * 同步方式获取缓存的已经加载成功的资源。
     * @param key 可以是配置文件中对应的name；也可以是url地址(推荐使用name)。如果访问的是图集子项须使用子项名(不需要扩展名)
    */
    public static GetRes(key:string):any
    {
        var atlasUrl:string = RES.resLoader.getAtlasSubitemByName(key);
        if (atlasUrl != "")//资源为图集子项
            return Laya.loader.getRes(atlasUrl);
        
        var url:string = RES.resConfig.getResourceUrl(key);
        return url == "" ? null : Laya.loader.getRes(url);
    }

    /** 
     * 同步方式获取缓存的已经加载成功的图集子资源。
     * @param url 所属图集/子项名.后缀名(比如：testAtlas/CreateRoom_btnZi.png)
    */
    public static GetAtlasRes(url:string):any
    {
        return Laya.loader.getRes(url);
    }

    /** 
     * 获取缓存的已经加载成功的图集子资源url。
     * @param name 图集子资源名称
    */
    public static GetAtlasUrl(name:string):string
    {
        var atlasUrl:string = RES.resLoader.getAtlasSubitemByName(name);
        return atlasUrl;
    }

     /**
     * 异步方式获取配置里的资源。只要是配置文件里存在的资源，都可以通过异步方式获取。
     * @param key 可以是配置文件中对应的name；也可以是url地址(推荐使用name)。
     * @param thisObject 回调函数的 this 引用。
     * @param compFunc 回调函数。示例：compFunc(data,key,args):void，返回值data若为null表示加载失败。若没有设置args值，则回调函数compFunc(data,key):void
     * @param args 回调参数。
     */
    public static GetResAsync(key:string, thisObject:any, compFunc:Function, args?:any):void
    {
        var resourceItem:any = RES.resConfig.getResourceItem(key);
        if (!resourceItem) {
            compFunc && compFunc.call(thisObject,null,key);
            return;
        }
        var res:any = RES.GetRes(key);
        if (res) {
            compFunc && compFunc.call(thisObject,res,key);
            return;
        }
        RES.resLoader.loadItem(resourceItem.url,resourceItem.type,key,compFunc,thisObject,args);
    }

    /**
     * 通过完整URL方式获取外部资源。
     * @param url 要加载文件的路径。
     * @param thisObject 回调函数的 this 引用。
     * @param compFunc 回调函数。示例：compFunc(data,key,args):void，返回值data若为null表示加载失败。若没有设置args值，则回调函数compFunc(data,key):void
     * @param type 文件类型(可选)。请使用 ResourceItem 类中定义的静态常量。若不设置将根据文件扩展名生成。
     * @param args 回调参数。
     */
    public static GetResByUrl(url:string, thisObject:any, compFunc:Function, type?:string, args?:any):void
    {
        if (url && url.indexOf("://") == -1) {//非http、https
            url = RES.resConfig.getResourceUrl(url);
        }
        var res:any = Laya.loader.getRes(url);
        if (res) {
            if (compFunc) {
                if (args)
                    compFunc && compFunc.call(thisObject,res,url,args);
                else
                    compFunc && compFunc.call(thisObject,res,url);
            }
            return;
        }
        RES.resLoader.loadItem(url,type,"",compFunc,thisObject,args);
    }

    /**取消通过完整URL方式获取外部资源(停止加载)*/
    public static CancelGetResByUrl(url:string, thisObject:any, compFunc:Function):void
    {
        RES.resLoader.stopLoadItem(url,compFunc,thisObject);
    }  

    /**
     * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
     * @param url 文件路径。
     */
    public static ClearTextureRes(url:string):void
    {
        Laya.loader.clearTextureRes(url);
    }
    /**
     * 清理指定资源缓存。
     * @param key 可以是配置文件中对应的name；也可以是url地址(推荐使用name)。清理图集请清理对应的json文件(不支持单独清理图集中单个资源)。
     * @param forceDispose 是否强制销毁，有些资源是采用引用计数方式销毁，如果forceDispose=true，则忽略引用计数，直接销毁，比如Texture，默认为false
     */
    public static ClearRes(key:string, forceDispose:boolean = true):void
    {
        var url:string = RES.resConfig.getResourceUrl(key);
        if (url == "") return;
        if (!Laya.SoundManager.autoReleaseSound) {//不自动回收音频
            let item:any = RES.resConfig.getResourceItem(key);
            if (item && item.type == "sound") return;
        }
        RES.resLoader.delAtlas(url);
        Laya.loader.clearRes(url,forceDispose);
        if (forceDispose || !RES.HasRes(url)) {//强制回收或该资源不存在
            //将已加载组中包含该资源的资源组设置为未加载(防止后续再次加载该资源组时不加载)
            RES.resLoader.delLoadedGroupsByItemName(url);
        }
    }

    /**
     * 清理指定缓存资源(通过url异步加载资源)
     * @param url 文件路径。
     * @param forceDispose 是否强制销毁，有些资源是采用引用计数方式销毁，如果forceDispose=true，则忽略引用计数，直接销毁，比如Texture，默认为false
     */
    public static ClearResByUrl(url:string, forceDispose:boolean = true):void
    {
        this.delayClearRunTimeRes(url);
    }

    /** 
     * 根据分组清理资源。
     * @param groupName 资源组的组名。
     * @param force 其他资源组有同样资源情况资源是否会被删除，默认值 false。
     * @param forceDispose 是否强制销毁，有些资源是采用引用计数方式销毁，如果forceDispose=true，则忽略引用计数，直接销毁，比如Texture，默认为false
     */
    public static ClearResByGroup(groupName:string, force:boolean = false, forceDispose:boolean = true): void
    {
        var groupList:Array<any> = RES.resConfig.getRawGroupByName(groupName);
        if (groupList && groupList.length > 0)
        {
            RES.resLoader.delGroupLoaded(groupName);
            var length:number = groupList.length;
            for (var i:number = 0; i < length; i++) 
            {
                var item:any = groupList[i];
                if (!force && (RES.resLoader.isResInLoadedGroup(item.url) || RES.resLoader.isResInLoadingGroup(item.url))) {
                }
                else 
                {
                    if (!Laya.SoundManager.autoReleaseSound && item.type == "sound") {//不自动回收音频
                    }
                    else
                    {
                        RES.ClearRes(item.url,forceDispose);
                    }
                }
            }
        }
    }

     /** 
     * 清理静默资源。
     * @param groupName 资源组的组名。
     * @param force 其他资源组有同样资源情况资源是否会被删除，默认值 false。
     * @param forceDispose 是否强制销毁，有些资源是采用引用计数方式销毁，如果forceDispose=true，则忽略引用计数，直接销毁，比如Texture，默认为false
     */
    public static ClearSilenceResByGroup(groupName:string, groupList:Array<any>, force:boolean = false, forceDispose:boolean = true): void
    {
        if (groupList && groupList.length > 0)
        {
            RES.resLoader.delGroupLoaded(groupName);
            var length:number = groupList.length;
            for (var i:number = 0; i < length; i++) 
            {
                var item:any = groupList[i];
                if (!force && (RES.resLoader.isResInLoadedGroup(item.url) || RES.resLoader.isResInLoadingGroup(item.url))) {
                }
                else 
                {
                    if (!Laya.SoundManager.autoReleaseSound && item.type == "sound") {//不自动回收音频
                    }
                    else
                    {
                        RES.ClearRes(item.url,forceDispose);
                    }
                }
            }
        }
    }

    /** 
     * 获取单个资源加载项
     * @param key 可以是配置文件中对应的name
     */
    public static GetResourceItem(key:string):any
    {
        return RES.resConfig.getResourceItem(key);
    }

    /** 派发事件 */
    public static dispatchResourceEvent(type:string, groupName:string = "", progress:number = 0, errorUrl:string = ""):void
    {
        RES.GetInstance().event(type,new ResourceEvent(groupName,progress,errorUrl));
    }


    //////////////////////////////////////处理runtime中运行时加载资源回收//////////////////////////////////////

    /**添加资源引用*/
    public static AddReference(url:string):void
    {
        if (!url || url.length <= 0) return;
        let reference:number = 1;
        if (this.referenceDic[url])
        {
            reference = this.referenceDic[url];
            reference ++;
        }
        this.referenceDic[url] = reference;
        //console.log("添加引用：" + url + " : " + reference);
    }

    /**删除资源引用*/
    public static DelReference(url:string):void
    {
        if (!url || url.length <= 0) return;
        if (this.referenceDic[url])
        {
            let reference:number = this.referenceDic[url];
            if (reference <= 1)
                delete this.referenceDic[url];
            else
                this.referenceDic[url] = reference - 1;
            //console.log("删除引用：" + url + " : " + (reference-1));
        }
    }

    /**获取资源引用*/
    public static GetReference(url:string):number
    {
        if (!url || url.length <= 0) return 0;
        if (this.referenceDic[url])
            return this.referenceDic[url];
        return 0;
    }

    /**清理runtimer资源*/
    private static waitClearResDic:any = {};//待回收资源字典
    private static clearResIng:boolean = false;//是否清理中
    private static delayClearRunTimeRes(url:string):void
    {
        if (!url || url.length <= 0 || this.GetReference(url) > 0) return;
        this.waitClearResDic[url] = Laya.Browser.now();
        if (!this.clearResIng)//不在清理中
        {
            this.clearResIng = true;
            Laya.timer.once(5000,this,this.clearRunTimeRes);//延迟5秒后清理
        }
    }

    private static clearRunTimeRes():void
    {
        this.onLoopClearRunTimeRes(false);
    }

    private static onLoopClearRunTimeRes(isFrameLoop:boolean):void//逐帧清理
    {
        let frameTm:number = Laya.stage.getFrameTm();//本帧开始时间
        let curTime:number = 0;//当前时间
        let isAllClear:boolean = true;//是否已全部清理
        let url:string = "";
        for (url in this.waitClearResDic)
        {
            curTime = Laya.Browser.now();
            if (curTime - this.waitClearResDic[url] < 5000)//距离回收时间未超过5秒
            {
                isAllClear = false;
                continue;
            }
            else if (curTime - frameTm > 20)//本帧所用时间过长:50帧了 
            {
                isAllClear = false;
                break;
            }
            else
            {
                delete this.waitClearResDic[url];
                if (this.GetReference(url) <= 0)
                    Laya.loader.clearRes(url,true);
            }
        }
        if (isAllClear)//已全部清理
        {
            Laya.timer.clear(this,this.onLoopClearRunTimeRes);
            this.clearResIng = false;
        }
        else
        {
            if (!isFrameLoop)//启动逐帧清理
                Laya.timer.frameLoop(5,this,this.onLoopClearRunTimeRes,[true]);
        }
    }

    private static referenceDebugDic:any = {};
    public static AddDebugReference(url:string,clsName:string):void
    {
        if (!url || url.length <= 0 || !clsName || clsName.length <= 0) return;
        if (this.referenceDebugDic[url])
        {
            let referenceDic = this.referenceDebugDic[url];
            let reference = 1;
            if (referenceDic[clsName])
            {
                reference = referenceDic[clsName];
                reference ++;
            }
            referenceDic[clsName] = reference;
        }
        else
        {
            this.referenceDebugDic[url] = {};
            this.referenceDebugDic[url][clsName] = 1;
        }
    }

    public static DelDebugReference(url:string,clsName:string):void
    {
        if (!url || url.length <= 0 || !clsName || clsName.length <= 0) return;
        if (this.referenceDebugDic[url])
        {
            let referenceDic = this.referenceDebugDic[url];
            if (referenceDic[clsName])
            {
                let reference = referenceDic[clsName];
                if (reference <= 1)
                {
                    delete referenceDic[clsName];
                    let keys = Object.keys(referenceDic);
                    if (!keys || keys.length <= 0)
                        delete this.referenceDebugDic[url];
                }
                else
                    referenceDic[clsName] = reference - 1;
            }
        }
    }
}
Laya.Browser.window.RES = RES;