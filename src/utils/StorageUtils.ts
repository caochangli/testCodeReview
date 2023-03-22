/*
* 本地存储
*/
export default class StorageUtils
{
    constructor()
    {

    }

    /**添加Object数据存储*/
    public static addObject(key:string,data:any):void
    {
        if (typeof(data) == "object")
        {
            let obj:Object = new Object();
            obj[key] = data;
            this.addString(key,JSON.stringify(obj));   
        }
        else if (typeof(data) == "number")
        {
            this.addNumber(key,data);
        }
        else if (typeof(data) == "boolean")
        {
            this.addBoolean(key,data);
        }
        else if (typeof(data) == "string")
        {
            this.addString(key,data);
        }
    }

    /**获取Object数据存储*/
    public static getObject(key:string):any
    {
        let str:string = this.getString(key);
        if (str)
        {
            try
            {
                let data = JSON.parse(str);
                if (typeof(data) == "object" && data.hasOwnProperty(key))
                {
                    return data[key];
                }
            }
            catch(e)
            {
                console.log("获取本地存储数据错误");
            }
        }
        return null;
    }

    /**添加number数据存储*/
    public static addNumber(key:string,data:number):void
    {
        this.addString(key,data.toString());
    }

    /**获取number数据存储*/
    public static getNumber(key:string):number
    {
        if (this.getString(key) != "")
        {
            return Number(this.getString(key));
        }
        return 0;
    }

    /**添加boolean数据存储*/
    public static addBoolean(key:string,data:boolean):void
    {
        this.addString(key,data ? "1" : "0");
    }

    /**获取boolean数据存储*/
    public static getBoolean(key:string):boolean
    {
        if (this.getString(key) != "")
        {
            return this.getString(key) == "1" ? true : false;
        }
        return false;
    }

    /**添加string数据存储*/
    public static addString(key:string,data:string):void
    {
        // if(UserData.Self){
        //     key = UserData.Self.ClientId + key;
        // }
        Laya.LocalStorage.setItem(key,data);
    }

    /**获取string数据存储*/
    public static getString(key:string):string
    {
        // if(UserData.Self){
        //     key = UserData.Self.ClientId + key;
        // }
        if (Laya.LocalStorage.getItem(key))
        {
            return Laya.LocalStorage.getItem(key);
        }
        return "";
    }

    /**删除存储**/
    public static delStorage(key:string):void
    {
        // if(UserData.Self){
        //     key = UserData.Self.ClientId + key;
        // }
        if (Laya.LocalStorage.getItem(key))
        {
            Laya.LocalStorage.removeItem(key);
        }
    }

    /**清空所有存储**/
    public static clearStorage():void
    {
        Laya.LocalStorage.clear();
    }

    // public static AddWindowStorage(key:string,val:string):void{
    //     if(!key) return;
    //     if(Laya.Browser.window.canUseStorage)
    //         Laya.Browser.window.localStorage.setItem(key,val);
    // }

    // public static GetWindowStorage(key:string):string{
    //     if(!key) return "";
    //     if(Laya.Browser.window.canUseStorage)
    //         return Laya.Browser.window.localStorage.getItem(key);
    //     return "";
    // }

    // public static DelWindowStorage(key:string):string{
    //     if(!key) return;
    //     if(Laya.Browser.window.canUseStorage)
    //         return Laya.Browser.window.localStorage.removeItem(key);
    //     return "";
    // }

    // /**获取Object数据存储*/
    // public static GetWindowStorgeObject(key:string):any
    // {
    //     let str:string = this.GetWindowStorage(key);
    //     if (str)
    //     {
    //         try
    //         {
    //             let data = JSON.parse(str);
    //             return data;
    //         }
    //         catch(e)
    //         {
    //             console.log("获取本地存储数据错误");
    //         }
    //     }
    //     return null;
    // }

    // /**添加Object数据存储*/
    // public static AddWindowStorgeObject(key:string,data:any):void
    // {
    //     if (typeof(data) == "object")
    //     {
    //         this.AddWindowStorage(key,JSON.stringify(data));   
    //     }
    // }
}