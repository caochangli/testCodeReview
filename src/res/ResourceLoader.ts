
import ResourceEvent from "./ResourceEvent";
import ResourceConfig from "./ResourceConfig";
import RES from "./RES";
import SgsText from "../ui/controls/base/SgsText";
import SgsTexture from "../ui/controls/base/SgsTexture";
import SgsFlatContainer from "../ui/controls/base/SgsFlatContainer";
/*
* 资源管理 - 加载器
* Created by caochangli on 2017-11-15. 
*/
export default class ResourceLoader
{
    private resConfig:ResourceConfig;

    /** 资源组加载优先级队列,key为priority，value为groupName列表 */
    private priorityQueue:any = {};

    /** 等待或正在加载的资源组,key为groupName，value为groupList列表 */
    private itemListDic:any = {};

    /** 已加载资源组(内存中删除后会清除) */
    private loadedGroups:Array<string> = [];

    /** 已下载到本地资源 */
    private loadedLocalRess:Array<string> = [];

    /** 延迟加载队列,存放需要异步加载的资源 **/
    private lazyLoadList:Array<any> = [];

    /** 异步获取资源参数缓存字典 */
    private asyncDic:any = {};

    /** 图集子项字典,key为子项名字，value为url */
    private atlasSubitemDic:any = {};

    constructor(resConfig:ResourceConfig)
    {
        this.resConfig = resConfig;

        // //资源加版本号：重构url方法
        // Laya.URL.customFormat = function (url:string):string 
        // {
        //     if (!Laya.Render.isConchApp && url.indexOf("?v=") == -1)
        //         url = url + RES.GetVersion();
		// 	return url;
        // }
    }

    /**
     * 加载配置文件并解析。
     * @param url 配置文件路径(resource.json的路径)。
     */
    public loadConfig(url:string):void
    {
        Laya.loader.load(url,Laya.Handler.create(this, function(data:any):void{
            if (!data) {//加载配置文件失败
                RES.dispatchResourceEvent(ResourceEvent.CONFIG_LOAD_ERROR);
                return;
            }
            if (!data.hasOwnProperty("groups") || !data.hasOwnProperty("resources")) {
                console.warn("配置文件数据错误");
                RES.dispatchResourceEvent(ResourceEvent.CONFIG_LOAD_ERROR);
                return;
            }
            this.resConfig.parseConfig(data);
            RES.dispatchResourceEvent(ResourceEvent.CONFIG_COMPLETE);
        }));
    }

    /** 加载组资源 */
    public loadGroup(groupName:string, groupList:Array<any>, priority:number):void
    {
        if (this.priorityQueue[priority]) {
            this.priorityQueue[priority].push(groupName);
        }
        else{
            this.priorityQueue[priority] = [groupName];
        }
        this.addGroupInLoading(groupName,groupList);

        var maxPriority:number = this.getMaxPriority();
        if (priority >= maxPriority) {//本组优先级为最大优先级：优先加载
            this.loadNext();
        }
        else {
            //do nothing 待优先级高加载完成后会自动开始加载
        }
    }

    /** 停止资源组加载(仅能停止未开始加载的内容) */
    public stopGroup(groupName:string):boolean
    {
        //itemListDic中保存的是等待加载和正在加载的资源组(已加载完的会从中删除掉)
        //正在加载的资源组对应的加载项长度为0
        let groupList:Array<any> = this.itemListDic[groupName];
        if (groupList)//该资源组在加载队列中
        {
            this.delPriorityGroupName(groupName);
            this.delGroupInLoading(groupName);
            if (groupList.length <= 0)//该资源组正在加载中
            {
                //停掉资源组中还未加载的资源
                groupList = this.resConfig.getGroupByName(groupName);
                let cancelUrls:Array<string> = [];
                if (groupList && groupList.length > 0) 
                {
                    for (let i:number = 0; i < groupList.length; i++)
                    {
                        if (!this.isResInLoadingGroup(groupList[i].url))
                            cancelUrls.push(groupList[i].url);
                    }
                    Laya.loader.cancelLoadByUrls(cancelUrls);
                }
                return false;
            }
        }
        return true;
    }

    /** 加载单个资源 */
    public loadItem(url:string, type:string, key:string, compFunc:Function, thisObject:any, args:any):void
    {
        var param = {url:url,type:type,key:key,compFunc:compFunc,thisObject:thisObject,args:args};
        if (this.asyncDic[url]) {
            this.asyncDic[url].push(param);
        }
        else {
            this.asyncDic[url] = [param];
            this.lazyLoadList.push(param);

            if (this.isAllGroupLoaded()) {//所有组资源已加载完
                this.loadNext();
            }
            else {
                //do nothing 待优先级队列加载完成会自动开始加载
            }
        }
    }

    /**停止未加载的资源*/
    public stopLoadItem(url:string, compFunc:Function, thisObject:any):void
    {
        if (!url || !compFunc || !thisObject) return;
        let param:any;
        let argsList:Array<any> = this.asyncDic[url];
        if (argsList && argsList.length)
        {
            for (let i:number = 0; i < argsList.length; i++)
            {
                param = argsList[i];
                if (!param || !param.compFunc || !param.thisObject) continue;
                if (param.compFunc == compFunc && param.thisObject == thisObject)
                {
                    argsList.splice(i,1);
                    break;
                }
            }
        }
        if (!argsList || argsList.length <= 0)
        {   
            delete this.asyncDic[url];
            for (let i:number = 0; i < this.lazyLoadList.length; i++)
            {
                param = this.lazyLoadList[i];
                if (!param || !param.compFunc || !param.thisObject) continue;
                if (param.url == url && param.compFunc == compFunc && param.thisObject == thisObject)
                {
                    this.lazyLoadList.splice(i,1);
                    break;
                }
            }
            Laya.loader.cancelLoadByUrl(url);
        }
    }

    /** 加载下一项 */
    private loadNext():void
    {
        //加载顺序：先加载组资源(组资源按优先级顺序加载)、再加载异步资源(异步资源同时加载)
        var length:number = 0;
        var i:number = 0;
        var nextResources:Array<any> = this.getNextGroup();
        if (nextResources && nextResources.length > 0)//存在需要加载的组：加载组资源
        {   
            length = nextResources.length;
            var nextResource:any;
            for (i = 0; i < length; i++)
            {
                nextResource = nextResources[i];
                this.loadOneGroup(nextResource.groupName,nextResource.groupList);
                //进入加载后:该组资源列表清空，防止再次加载
                nextResource.groupList.length = 0;
            }
        }
        else if (this.isAllGroupLoaded())//所有组资源都已加载完
        {
            if (this.lazyLoadList && this.lazyLoadList.length > 0)//存在需要异步加载资源：加载异步资源
            {
                length = this.lazyLoadList.length;
                for (i = 0; i < length; i++)
                {
                    this.loadAsync(this.lazyLoadList.shift());
                }
            }
        }
    }

    /** 获取组优先级队列中最大级别 priority */
    private getMaxPriority():number
    {
        var maxPriority:number = Number.NEGATIVE_INFINITY;
        for (var p in this.priorityQueue) {
            maxPriority = Math.max(maxPriority, parseInt(p));
        }
        return maxPriority;
    }

    /** 检测是否所有组资源都已加载完 */
    private isAllGroupLoaded():boolean
    {
        var maxPriority:number = this.getMaxPriority();//最大优先级
        //组资源加载完成后，会从组优先级队列中移除
        return maxPriority >= 0 ? false : true;
    } 

    /** 获取下一组待加载组(同优先级组同时加载)
     *  返回null不代表所有组都加载完了，只能表示所有组都已开始加载或加载完成了
     */
    private getNextGroup():Array<any>
    {
        var maxPriority:number = this.getMaxPriority();//最大优先级
        var queue:Array<any> = this.priorityQueue[maxPriority];
        if (!queue || queue.length == 0) return null;       

        var list:Array<any> = [];
        var length:number = queue.length;
        var groupName:string = "";
        var groupList:Array<any> = [];
        for (var i:number = 0; i < length; i++)
        {
            groupName = queue[i];
            groupList = this.itemListDic[groupName];
            if (groupList && groupList.length > 0) {//还未开始加载(已开始加载的数组长度会被清零)
                list.push({groupName:groupName,groupList:groupList});
            }
        }
        if (list.length > 0)
            return list;
        return null;
    }

    /** 开始加载一组资源 */
    private loadOneGroup(groupName:string, groupList:Array<any>):void
    {
        if (!Laya.loader.hasListener(Laya.Event.ERROR)) {
            Laya.loader.on(Laya.Event.ERROR,this,onResourceLoadError);
        }
        Laya.loader.load(groupList,Laya.Handler.create(this, onComplete, [[...groupList]]),Laya.Handler.create(this,onProgress,null,false));

        function onComplete(groupList:Array<any>,success:boolean):void
        {
            if (!this.isGroupInLoading(groupName)) {//加载完发现该组不在加载队列中：中途停止了
                this.loadNext();
                return;
            }
            this.delPriorityGroupName(groupName);
            this.delGroupInLoading(groupName);
            if (this.isAllGroupLoaded()) {//所有组资源都已加载完
                Laya.loader.off(Laya.Event.ERROR,this,onResourceLoadError);
            }
            
            if (success == false) {//资源组加载失败
                RES.dispatchResourceEvent(ResourceEvent.GROUP_LOAD_ERROR,groupName);
                this.loadNext();
                return;
            }
            
            this.addGroupLoaded(groupName);
            this.addResLoadedLocal(groupName,groupList);
            this.parseGroupAtlas(groupName,groupList);
            RES.dispatchResourceEvent(ResourceEvent.GROUP_COMPLETE,groupName);
            this.loadNext();
        }
        function onProgress(progress:number):void
        {
            RES.dispatchResourceEvent(ResourceEvent.GROUP_PROGRESS,groupName,progress);
        }
        function onResourceLoadError(error:string):void
        {
            RES.dispatchResourceEvent(ResourceEvent.ITEM_LOAD_ERROR,"",0,error);
        }
    }

    /** 根据图集子项名获取子项访问url */
    public getAtlasSubitemByName(name:string):string
    {
        var url:string = this.atlasSubitemDic[name];
        return url ? url : "";
    }

    /** 开始加载异步资源 */
    private loadAsync(resItem:any):void
    {
        Laya.loader.load(resItem.url,Laya.Handler.create(this, function(argItem:any,data:any):void{
            var argsList:Array<any> = this.asyncDic[argItem.url];
            delete this.asyncDic[argItem.url];
            if (data && argItem.type == "atlas") {
                this.parseAtlas(argItem.url);
            }
            if (!argsList) return;
            let length = argsList.length;
            let param:any;
            let key:string = "";
            for (var i:number = 0; i < length; i++)
            {
                param = argsList[i];
                key = param.key != "" ? param.key : param.url;
                if (param.thisObject instanceof Laya.Sprite && param.thisObject.destroyed)//回调对象已被销毁
                    continue;
                if ((param.thisObject instanceof SgsText || param.thisObject instanceof SgsTexture || param.thisObject instanceof SgsFlatContainer)
                     && param.thisObject.destroyed)//回调对象已被销毁
                    continue;
                if (param.args)
                    param.compFunc && param.compFunc.call(param.thisObject,data,key,param.args);
                else
                    param.compFunc && param.compFunc.call(param.thisObject,data,key);
            }
        },[resItem]),null,resItem.type);
    }

    /** 检查指定的组是否正在加载中 */
    public isGroupInLoading(groupName:string):boolean
    {
        return this.itemListDic[groupName] !== undefined;
    }

    /** 添加指定的组到正在加载中 */
    private addGroupInLoading(groupName:string,groupList:Array<any>):void
    {
        this.itemListDic[groupName] = groupList;
    }

    /** 从正在加载中移除指定组 */
    private delGroupInLoading(groupName:string):void
    {
        delete this.itemListDic[groupName];
    }

    /** 检查指定的组是否已加载 */
    public isGroupLoaded(groupName:string):boolean
    {
        return this.loadedGroups.indexOf(groupName) != -1 ? true : false;
    }

    /** 添加指定的组到已加载列表 */
    private addGroupLoaded(groupName:string):void
    {
        if (this.loadedGroups.indexOf(groupName) == -1)
            this.loadedGroups.push(groupName);
    }

    /** 从已加载列表移除指定组 */
    public delGroupLoaded(groupName:string):void
    {
        var index:number = this.loadedGroups.indexOf(groupName);
        if (index != -1)
            this.loadedGroups.splice(index,1);
    }

    /** 检查资源是否已下载到本地 */
    public isResLoadedLocal(groupName:string):boolean
    {
        return this.loadedLocalRess.indexOf(groupName) != -1 ? true : false;
    }

    /** 添加资源到已下载本地列表 */
    private addResLoadedLocal(groupName:string,groupList:Array<any>):void
    {
        // if (!groupName || groupName.length <= 0) return;
        // var groupList:Array<any> = this.resConfig.getRawGroupByName(groupName);
        // if (!groupList || groupList.length <= 0) return;
        if (!groupName || groupName.length <= 0 || !groupList || groupList.length <= 0) return;
        var length:number = groupList.length;
        var resItem:any;
        for (var i:number = 0; i < length; i++)
        {
            var resItem = groupList[i];
            if (resItem && this.loadedLocalRess.indexOf(resItem.url) == -1)
                this.loadedLocalRess.push(resItem.url);
        }
    }

    /** 移除已加载资源组中包含该资源的资源组 */
    public delLoadedGroupsByItemName(url:string):void
    {
        var loadedGroups = this.loadedGroups;
        var loadedGroupLength = loadedGroups.length;
        for (var i = 0; i < loadedGroupLength; i++) 
        {
            var group = this.resConfig.getRawGroupByName(loadedGroups[i]);
            var length = group.length;
            for (var j = 0; j < length; j++) 
            {
                var item = group[j];
                if (item.url == url) {
                    loadedGroups.splice(i, 1);
                    i--;
                    loadedGroupLength = loadedGroups.length;
                    break;
                }
            }
        }
    }

    /** 检查指定资源是否在已加载组中 */
    public isResInLoadedGroup(url:string):boolean
    {
        var loadedGroups = this.loadedGroups;
        var loadedGroupLength = loadedGroups.length;
        for (var i = 0; i < loadedGroupLength; i++) 
        {
            var group = this.resConfig.getRawGroupByName(loadedGroups[i]);
            var length = group ? group.length : 0;
            for (var j = 0; j < length; j++) 
            {
                var item = group[j];
                if (item.url == url)
                    return true;
            }
        }
        return false;
    }

    /** 检查指定资源是否正在加载或等待加载组中 */
    public isResInLoadingGroup(url:string):boolean
    {
        var groupList;
        var result = false;
        for (var groupName in this.itemListDic)
        {
            groupList = this.resConfig.getRawGroupByName(groupName);
            if (groupList)
            {
                for (var i = 0; i < groupList.length; i++) 
                {
                    var item = groupList[i];
                    if (item.url == url)
                    {
                        result = true;
                        break;
                    }   
                }
            }
            
            if (result) break;
        }
        return result;
    }

    /** 从优先级队列中移除指定的组名 */
    private delPriorityGroupName(groupName:string):void 
    {
        for (var p in this.priorityQueue) 
        {
            var queue = this.priorityQueue[p];
            var index = 0;
            var found = false;
            var length = queue.length;
            for (var i = 0; i < length; i++) 
            {
                var name_2 = queue[i];
                if (name_2 == groupName) {
                    queue.splice(index, 1);
                    found = true;
                    break;
                }
                index++;
            }
            if (found) 
            {
                if (queue.length == 0) {
                    delete this.priorityQueue[p];
                }
                break;
            }
        }
    }

    /** 处理组资源里图集对应关系 */
    private parseGroupAtlas(groupName:string,groupList:Array<any>):void
    {
        // if (!groupName || groupName.length <= 0) return;
        // var groupList:Array<any> = this.resConfig.getRawGroupByName(groupName);
        // if (!groupList || groupList.length <= 0) return;
        if (!groupName || groupName.length <= 0 || !groupList || groupList.length <= 0) return;
        var length:number = groupList.length;
        var resItem:any;
        for (var i:number = 0; i < length; i++)
        {
            var resItem = groupList[i];
            if (resItem.type == "atlas") {//图集
                this.parseAtlas(resItem.url);
            }
        }
    }

    /** 处理图集资源url对应name关系 */
    private parseAtlas(atlasUrl:string):void
    {
        var atlasJson:any = RES.GetRes(atlasUrl);
        if (!atlasJson) return;
        var frames:any = atlasJson.frames;
        var cleanUrl:string = atlasUrl.split("?")[0];
        var directory:string = (atlasJson.meta && atlasJson.meta.prefix)? atlasJson.meta.prefix : cleanUrl.substring(0,cleanUrl.lastIndexOf(".")) + "/";//所属图集名
        var key:string = "";
        for (var name in frames)
        {
            key = name.substring(0,name.lastIndexOf("."));
            this.atlasSubitemDic[key] = directory + name;
        }
    }   

    /** 清理图集资源对应关系 */
    public delAtlas(url:string):void
    {
        var atlasList:Array<any> = Laya.Loader.getAtlas(url);
        if (!atlasList || atlasList.length <= 0) return;
        var length:number = atlasList.length;
        var atlasSubItemUrl:string = "";
        for (var i:number = 0; i < length; i++)
        {
            atlasSubItemUrl = atlasList[i];
            atlasSubItemUrl = atlasSubItemUrl.substring(atlasSubItemUrl.lastIndexOf("/") + 1,atlasSubItemUrl.lastIndexOf("."));
            if (atlasSubItemUrl != "")
                delete this.atlasSubitemDic[atlasSubItemUrl];
        }
    }
}