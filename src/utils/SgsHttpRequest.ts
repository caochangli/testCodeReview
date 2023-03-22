

export default class SgsHttpRequest extends Laya.HttpRequest
{
    public callback:Function;
    public progressCB:Function;
    constructor(callback:Function, progressCB:Function=null)
    {
        super();

        if (!window["XMLHttpRequest"]) {
            this._http = new ActiveXObject("MSXML2.XMLHTTP");
            console.log("使用MSXML2.XMLHTTP")
        }else{
            console.log("使用XMLHttpRequest")
        }

        this.callback = callback;
        this.progressCB = progressCB;
        this.on(Laya.Event.COMPLETE,this,this.onComplete);
        this.on(Laya.Event.ERROR,this,this.onError);
    }

    public Clear():void
    {
        super.clear();
        this.callback = null;
    }

    public removeEvents():void
    {
        this.offAll("onComplete");
        this.offAll("onError");
        this.offAll(Laya.Event.COMPLETE);
        this.offAll(Laya.Event.ERROR);
    }

    public onComplete(result:any):void
    {
        this.event("onComplete",[this,result]);
    }

    public onError(result:any):void
    {
        this.event("onError",[this,result]);
    }
}