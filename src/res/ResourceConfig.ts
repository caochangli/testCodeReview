import ResourceItem from "./ResourceItem";
import RES from "./RES";
/*
* 资源管理 - 配置文件解析器
* Created by caochangli on 2017-11-15. 
*/
export default class ResourceConfig
{
    /**资源组字典*/
    public groupDic:any = {};

    /**资源字典*/
    public keyMap:any = {};

    /** 配置文件是否解析完 */
    public configComplete:boolean = false;

    constructor()
    {   
    }

    /** 获取单个资源加载项 */
    public getResourceItem(key:string):any
    {
        var data = this.keyMap[key];
        if (data) return data;
        //认为key为name未找到资源
        var url:string = this.getResourceUrl(key);
        for (var p in this.keyMap)
        {
            data = this.keyMap[p];
            if (data.url == url)
                return data;
        }
        return null;
    }

    /** 根据组名获取原始的组加载项列表 */
    public getRawGroupByName(name:string):Array<any>
    {
        if (this.groupDic[name])
            return this.groupDic[name];
        return null;
    }

    /** 根据组名获取组加载项列表 */
    public getGroupByName(name:string):Array<ResourceItem>
    {
        if (!this.groupDic[name])
            return null;
        
        var group = new Array();
        var list = this.groupDic[name];
        var length = list.length;
        for (var i = 0; i < length; i++) 
        {
            var obj = list[i];
            group.push(this.parseResourceItem(obj));
        }
        return group;
    }

    /** 获取资源完整路径 */
    public getResourceUrl(key:string):string
    {
        if (!key || key.length <= 0) return "";
        if (key.indexOf("/") == -1)//非路径：认为通过name访问
        {
            let item = this.keyMap[key];
            if (item)
            {
                if(item.compressTexture)//如果是压缩纹理 需要改格式名称获取压缩纹理的路径 sk文件也会走这里，目前是在getTextureCompressFomat里过滤掉sk了
                {
                    let format = Laya.Utils.getFileExtension(item.url);
                    let changType = Laya.Utils.getTextureCompressFormat(format)
                    if(format != changType)
                    {
                        return item.url.replace("." + format, "." + changType);
                    }
                }
                return item.url;
            }
            return "";
        }
        else//通过url访问
        {   
            if (RES.resourceRoot != "" && key.indexOf(RES.resourceRoot) == -1) {//缺少根目录
                key = RES.resourceRoot + key;
            }
        }
        return key;
    }

    /** 获取资源组名 - 根据资源url */
    public getGroupName(url:string):string
    {
        for (var p in this.groupDic)
        {
            var groupList = this.groupDic[p];
            var length = groupList.length;
            for (var i = 0; i < length; i++) 
            {
                if (groupList[i].url == url)
                {
                    return p;
                }
            }
        }
        return "";
    }

    /**
     * 追加资源组资源
     * @param groupName 追加的资源组组名。
     * @param keys 追加的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名。
     * */
    public addGroupKeys(groupName:string, keys:string[]):void
    {
        if (!this.groupDic[groupName] || !keys || keys.length == 0) return;
        
        let list = this.groupDic[groupName];
        let length = keys.length;
        let key = "";
        let gList:Array<any>;
        for (let i = 0; i < length; i++) 
        {
            key = keys[i];
            gList = this.groupDic[key];
            if (gList)//key是资源组 
            {
                var len = gList.length;
                for (var j = 0; j < len; j++) 
                {
                    var item = gList[j];
                    if (list.indexOf(item) == -1)
                    {
                        list.push(item);
                        this.addSkForPngItem(list,item);
                    }
                }
            }
            else 
            {
                var item = this.keyMap[key];
                if (item) 
                {
                    if (list.indexOf(item) == -1)
                    {
                        list.push(item);
                        this.addSkForPngItem(list,item);
                    }
                }
                else
                {
                    console.warn("创建自定义加载资源组，资源未在配置文件找到：", key);
                }
            }
        }
    }

    /**
     * 删除资源组资源
     * @param groupName 删除的资源组组名。
     * @param keys 删除的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名。
     * */
    public delGroupKeys(groupName:string, keys:string[]):void
    {
        if (!this.groupDic[groupName]) return;
        if (!keys || keys.length == 0)
        {
            this.groupDic[groupName] = [];
            return;
        }
        
        let list = this.groupDic[groupName];
        let length = keys.length;
        let key = "";
        let gList:Array<any>;
        let index:number = -1;
        for (let i = 0; i < length; i++) 
        {
            key = keys[i];
            gList = this.groupDic[key];
            if (gList)//key是资源组 
            {
                var len = gList.length;
                for (var j = 0; j < len; j++) 
                {
                    var item = gList[j];
                    index = list.indexOf(item);
                    if (index != -1)
                    {
                        list.splice(index,1);
                        this.delSkForPngItem(list,item);
                    }     
                }
            }
            else 
            {
                var item = this.keyMap[key];
                if (item) 
                {
                    index = list.indexOf(item);
                    if (index != -1)
                    {
                        list.splice(index,1);
                        this.delSkForPngItem(list,item);
                    } 
                }
            }
        }
    }

    /**
     * 创建自定义的加载资源组,注意：此方法仅在资源配置文件加载完成后执行才有效。
     * @param groupName 创建的资源组的组名。
     * @param keys 包含的键名列表，key 对应配置文件里的 name 属性或 sbuKeys 属性的一项或一个资源组名。
     * @param override 是否覆盖已经存在的同名资源组
     * @returns 是否创建成功。
     */
    public createGroup(groupName:string, keys:string[], override:boolean):boolean
    {
        if ((!override && this.groupDic[groupName]) || !keys || keys.length == 0)
            return false;

        let groupDic = this.groupDic;
        let group = [];
        let length = keys.length;
        let key = "";
        let gList:Array<any>;
        for (var i = 0; i < length; i++) 
        {
            key = keys[i];
            gList = groupDic[key];
            if (gList)//key是资源组 
            {
                var len = gList.length;
                for (var j = 0; j < len; j++) 
                {
                    var item = gList[j];
                    if (group.indexOf(item) == -1)
                    {
                        group.push(item);
                        this.addSkForPngItem(group,item);
                    }
                }
            }
            else 
            {
                var item = this.keyMap[key];
                if (item) 
                {
                    if (group.indexOf(item) == -1)
                    {
                        group.push(item);
                        this.addSkForPngItem(group,item);
                    }
                }
                else
                {
                    console.warn("创建自定义加载资源组，资源未在配置文件找到：", key);
                }
            }
        }
        if (group.length == 0)
            return false;
        this.groupDic[groupName] = group;
        return true;
    }

    /**
     * 追加resources
     * @param resources resources列表，格式{"url": "","type": "","name": ""}
    */
    public addResources(resources:Array<any>):void
    {
        if (!resources || resources.length == 0) return;
        
        let length = resources.length;
        let resourceItem:any;
        let gList:Array<any>;
        for (let i = 0; i < length; i++) 
        {
            resourceItem = resources[i];
            if (!this.keyMap[resourceItem.name]) 
                this.addItemToKeyMap(resourceItem);
        }
    }

    /**
     * 删除resources
     * @param resources resources列表，格式{"url": "","type": "","name": ""}
    */
    public delResources(resources:Array<any>):void
    {
        if (!resources || resources.length == 0) return;
        
        let length = resources.length;
        let resourceItem:any;
        for (let i = 0; i < length; i++) 
        {
            resourceItem = resources[i];
            let item = this.keyMap[resourceItem.name];
            if (item) 
                this.delItemToKeyMap(item);
        }
    }

    /**
     * 删除resources
     * @param names names列表
    */
    public delResourcesByName(names:Array<string>):void
    {
        if (!names || names.length == 0) return;
        
        let length = names.length;
        let name:any;
        for (let i = 0; i < length; i++) 
        {
            name = names[i];
            let item = this.keyMap[name];
            if (item) 
                this.delItemToKeyMap(item);
        }
    }

    /** 解析配置文件 */
    public parseConfig(data:any):void
    {
        if (!data) return;

        let resources = data["resources"];
        let item:any;
        if (resources) 
        {
            let length = resources.length;
            for (let i = 0; i < length; i++)
            {
                item = resources[i];
                if(!Laya.Browser.window.useLocalConfig){
                    // //外网发布，修改json的 url,类型；
                    // if(item.type == "json"){
                    //     item.type = "arraybuffer";
                    //     item.url = item.url.replace(".json",".sgs");
                    // }
                }
                this.addItemToKeyMap(item);
            }
        }
        let groups:Array<any> = data["groups"];
        if (groups)
        {
            let keyDic:any = {};
            let length = groups.length;
            let group;
            let keys;
            for (let i = 0; i < length; i++)
            {
                group = groups[i];
                keys = group.keys.split(",");
                let list = [];
                let len = keys.length;
                let key;
                for (let j = 0; j < len; j++)
                {
                    key = keys[j].trim();
                    list.push(key);
                }
                keyDic[group.name] = list;
            }

            for (let groupName in keyDic)
            {
                keys = keyDic[groupName];
                length = keys.length;
                let key;
                let list = [];
                for (let i = 0; i < length; i++)
                {
                    this.parseItems(list,keyDic,keys[i]);
                }
                this.groupDic[groupName] = list;
            }
        }
        this.configComplete = true;
    }

    private addItemToKeyMap(item):void 
    {
        if (!this.keyMap[item.name])
        {
            let url = item.url;
            if (url && url.indexOf("://") == -1 && url.indexOf(RES.resourceRoot) != 0)
                item.url = RES.resourceRoot + url;
            this.keyMap[item.name] = item;
            this.addSkForPngResource(item);
        }
    }
    
    private delItemToKeyMap(item):void 
    {
        if (this.keyMap[item.name])
        {
            delete this.keyMap[item.name];
            this.delSkForPngResource(item);
        }
    }

    private parseItems(list:Array<any>,keyDic:any,key:string):Array<any>
    {
        let gList:Array<any> = keyDic[key];
        if (gList)//key为资源组
        {
            var len = gList.length;
            for (var i = 0; i < len; i++) 
            {
                this.parseItems(list,keyDic,gList[i]);
            }
        }
        else
        {
            let item = this.keyMap[key];
            if (item && list.indexOf(item) == -1)
            {
                list.push(item);
                this.addSkForPngItem(list,item);
            } 
                
        }   
        return list;
    }

    private addSkForPngResource(item:any):void//添加.sk对应.png的resources配置
    {
        if (this.checkSkResource(item))
        {
            let urlIndex:number = item.url.lastIndexOf(".");
            let fortmat = "png";
            if(item.compressTexture)
            {
                fortmat = Laya.Utils.getTextureCompressFormat(fortmat);
            }
            let pngItem:any = {url:item.url.substr(0,urlIndex) + "." + fortmat,type:"image",name:this.getSkForPngKey(item.name)};
            if (!this.keyMap[pngItem.name])
                this.keyMap[pngItem.name] = pngItem;
        }
    }

    private delSkForPngResource(item:any):void//删除.sk对应.png的resources配置
    {
        if (this.checkSkResource(item))
        {
            let name:string = this.getSkForPngKey(item.name);
            if (this.keyMap[name])
                delete this.keyMap[name];
        }
    }

    private addSkForPngItem(list:Array<any>,item:any):void//添加.sk对应.png的加载项
    {
        if (this.checkSkResource(item))
        {
            let pngItem:any = this.keyMap[this.getSkForPngKey(item.name)];
            if (pngItem && list.indexOf(pngItem) == -1)
                list.push(pngItem);
        }
    }

    private delSkForPngItem(list:Array<any>,item:any):void//删除.sk对应.png的加载项
    {
        if (this.checkSkResource(item))
        {
            let pngItem:any = this.keyMap[this.getSkForPngKey(item.name)];
            let index:number = pngItem ? list.indexOf(pngItem) : -1;
            if (index != -1)
                list.splice(index,1);
        }
    }

    private checkSkResource(item:any):boolean//监测资源是否为.sk资源
    {   
        let urlIndex:number = item.url.lastIndexOf(".");
        let postfix:string = urlIndex == -1 ? "" : item.url.substr(urlIndex);
        if (postfix == ".sk" && item.type && item.type == "arraybuffer")
            return true;
        return false;
    }

    private getSkForPngKey(key:string):string//获取.sk资源对应的.png文件key
    {
        let index:number = key.lastIndexOf("_sk");
        let pngKey:string = index == -1 ? key + "_png" : key.substr(0,index) + "_png";
        return pngKey;
    }

    private parseResourceItem(data)//转换Object数据为ResourceItem对象 
    {
        var resItem = new ResourceItem(data.name, data.url, data.type);
        resItem.data = data;
        return resItem;
    }
}