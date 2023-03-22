import RES from "../../../res/RES";
import Global from "../../../Global";


/*
* 加载texture：管理引用计数和资源回收
*/
export default class SgsLoadTexture
{
    protected _url:string = "";
    protected _complete:Laya.Handler;
    protected _texture:Laya.Texture;

    public isThorough:boolean = false;//是否彻底清理(调用RES.ClearRes)

    constructor(complete:Laya.Handler)
    {
        this._complete = complete;
    }

    public completeFun(complete:Laya.Handler):void
    {
        this._complete = complete;
    }

    public loadTexture(value:string):void
    {
        if (this._url == value)
        {
            if (this._texture && this._texture.url == value)
            {
                this.runComplete(this._texture);
            }
            return;
        }
        this._texture = null;
        this.clearTexure();//清理之前的加载
        this._url = value;
        if (this._url == "" || this._url == null) 
            return;
        RES.AddReference(value);
        RES.GetResByUrl(value,this,this.loadComplete,"image");
    }

    public get url():string
    {
        return this._url;
    }

    public get texture():Laya.Texture
    {
        return this._texture;
    }

    public set texture(value:Laya.Texture)
    {
        this._texture = value;
        this.clearTexure();//清理之前的加载
        this._url = null;
    }

    public get width():number
    {
        return this._texture ? this._texture.width : 0;
    }

    public get height():number
    {
        return this._texture ? this._texture.height : 0;
    }

    protected loadComplete(texture:Laya.Texture,key:string):void
    {
        if (this._url != key) return;
        if (!texture)//加载失败 
        {
			this._texture = null;
            this.runComplete(null);
        }
		else
		{
			this._texture = texture;
			this.runComplete(this._texture);
		}
    }

    protected runComplete(texture:Laya.Texture):void
    {
        if (this._complete)
            this._complete.runWith(texture);
    }

    protected clearTexure():void
    {
        if (this._url)
        {
            RES.DelReference(this._url);
            RES.CancelGetResByUrl(this._url,this,this.loadComplete);
            RES.ClearResByUrl(this._url);
        }
    }

    public clear():void
    {
        this._complete = null;
        this._texture = null;
        this.clearTexure();
        this._url = null;
    }
}