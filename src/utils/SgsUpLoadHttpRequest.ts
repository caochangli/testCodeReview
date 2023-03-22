import SgsHttpRequest from "./SgsHttpRequest";


export default class SgsUpLoadHttpRequest extends SgsHttpRequest
{
    constructor(callback:Function)
    {
        super(callback);
        this.on(Laya.Event.PROGRESS,this,this.onProgress);
    }

    public send(url:string,data:any=null,method:string="get", responseType:string="text", headers:any=null):void{
         super.send(url,data,method,responseType,headers);
            //  this._http.onprogress= function(e:any):void
            //  {
            //      //上传进度
            //      console.log('上传进度',e);
            //  }
            //  this._http.onerror= function(e:any):void
            //  {
            //      console.log('上传出错了',e);
            //  }
            //  this._http.onabort = function(e:any):void
            //  {
            //      console.log('上传中断',e);
            //  }
     }

     private onProgress(num:number):void{
            console.log('上传进度：'+num);
            this.event("onProgress", num);
     }

     public removeEvents():void
    {
        super.removeEvents();
        this.offAll(Laya.Event.PROGRESS);
    }
}