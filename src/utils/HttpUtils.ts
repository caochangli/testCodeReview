import SgsHttpRequest from "./SgsHttpRequest";
import SgsUpLoadHttpRequest from "./SgsUpLoadHttpRequest";
/*
* name;
*/
export default class HttpUtils{
    constructor(){

    }

    public static Request(url:string,params:any,callback:Function,method:string="post",responseType:string ="text",headers?:any):void
    {
        try{
            let xhr:SgsHttpRequest = new SgsHttpRequest(callback);
            xhr.http.timeout = 10000;
            xhr.on("onComplete",this,this.onComplete);
            xhr.on("onError",this,this.onError);
            headers = headers || ["Content-Type", "application/x-www-form-urlencoded"];
            xhr.send(url,params,method,responseType,headers);
        }catch(event){
            console.log(event);
            //xml html script json jsonp text ajax 不支持arraybuffer;
            this.SendAjax(url,params,callback,method,responseType,headers?headers[0]:"");
        }
    }

    public static RequestWithProgress(url:string,params:any,callback:Function, proGressCB:Function, method:string="post",responseType:string ="text",headers?:any):any
    {
        let loadReq:any = null;
        try{
            let xhr:SgsUpLoadHttpRequest = new SgsUpLoadHttpRequest(callback);
            xhr.http.timeout = 10000;
            xhr.on("onComplete",this,this.onComplete);
            xhr.on("onError",this,this.onError);
            xhr.on("onProgress",this,proGressCB);
            if(!headers)
            {
                headers = [false, "Content-Type"];
            }
            xhr.send(url,params,method,responseType,headers);
            loadReq = xhr.http;
        }catch(event){
            console.log(event);
            //xml html script json jsonp text ajax 不支持arraybuffer;
            loadReq = this.SendAjaxWithProgress(url, params, callback, proGressCB, method, responseType, "", false);
        }

        return loadReq;
    }

    public static SendAjaxWithProgress(url:string,params:any,callback:Function,progressCB:Function, method:string = "",responseType:string ="text",contentType:string = "application/x-www-form-urlencoded",processData:boolean=true):any{
        if(Laya.Browser.window.sendAjax){
            return Laya.Browser.window.sendAjax({progressCB:progressCB, url:url,data:params,callback:callback,method:method,responseType:false,contentType:contentType,processData:processData});
        }

        return null;
    }

    public static SendAjax(url:string,params:any,callback:Function,method:string = "",responseType:string ="text",contentType:string = "application/x-www-form-urlencoded",processData:boolean=true):void{
        if(Laya.Browser.window.sendAjax){
            Laya.Browser.window.sendAjax({url:url,data:params,callback:callback,method:method,responseType:responseType,contentType:contentType,processData:processData});
        }
    }

    // public static onProgress(target:SgsHttpRequest, result:any):void
    // {
    //     target.progressCB && target.progressCB(result);
    // }

    public static onComplete(target:SgsHttpRequest,result:any):void
    {
        target.callback && target.callback(result);
        target.Clear();
        target.removeEvents();
    }

    public static onError(target:SgsHttpRequest,result:any):void
    {
        target.Clear();
        target.removeEvents();
    }

    // public static RequestUpload(url:string,params:any,callback:Function,method:string="post",responseType:string ="text",headers?:any):void
    // {
    //     try{
    //         let xhr:SgsUpLoadHttpRequest = new SgsUpLoadHttpRequest(callback);
    //         xhr.http.timeout = 10000;
    //         xhr.on("onComplete",this,this.onComplete);
    //         xhr.on("onError",this,this.onError);
    //         headers = headers || ["Content-Type", "application/x-www-form-urlencoded"];
    //         xhr.send(url,params,method,responseType,headers);
    //     }catch(event){
    //         console.log(event);            
    //         if(responseType == "arraybuffer"){
    //             if(Laya.Browser.window.JSZipUtils){
    //                 Laya.Browser.window.JSZipUtils.getBinaryContent(url,function(err,data){
    //                     if(err){
    //                         UIUtils.ShowTextPrompt("录像无法加载，建议使用谷歌浏览器1");
    //                     }else{                       
    //                         callback(data);
    //                     }                        
    //                 })
    //             }else{
    //                 UIUtils.ShowTextPrompt("录像无法加载，建议使用谷歌浏览器2");
    //             }
    //         }else{
    //             try{
    //                 this.SendAjax(url,params,callback,method,responseType,headers?headers[0]:"");
    //             }catch(event){
    //                 console.log("ajax error:",event);
    //             }
    //         }
            
    //     }
    // }

    // public static md5Param(params:any,key:string): string {
    //     let md5: MD5 = new MD5();
    //     params = this.sortKey(params);
    //     let str = key;
    //     for(let i in params)
    //     {
    //         str += (i + params[i]); 
    //     }
    //     let md5str: string = md5.hex_md5(str);
    //     return md5str;
    // }

    // public static sortKey(arys) { 
    //     //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    //     let newkey = Object.keys(arys).sort();　　 
    //     //console.log('newkey='+newkey);
    //     let newObj = {}; //创建一个新的对象，用于存放排好序的键值对
    //     for(let i = 0; i < newkey.length; i++) {
    //         //遍历newkey数组
    //         newObj[newkey[i]] = arys[newkey[i]]; 
    //         //向新创建的对象中按照排好的顺序依次增加键值对

    //     }
    //     return newObj; //返回排好序的新对象
    // }

    // public static formatUrlParams(params: any) {
    //     let str = "";
    //     for (let key in params) {
    //         str += key + "=" + encodeURIComponent(params[key]) + "&";
    //     }
    //     return str.substring(0, str.length - 1);
    // }

    // public static respResultHandler(result:any):boolean//php返回数据统一处理
    // {
    //     try {
    //         let msg:any = JSON.parse(result);
    //         if (msg && msg.code == 0) 
    //             return msg;   
    //         else  
    //         {
    //             if (msg && msg.msg)
    //                 UIUtils.ShowTextPrompt(msg.msg);
    //         }
    //     } catch (e) {
    //         console.log("返回结果不是json", e);
    //     }
    //     return null;
    // }

}