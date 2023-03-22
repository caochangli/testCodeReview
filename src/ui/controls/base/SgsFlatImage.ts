import RES from "../../../res/RES";
import TextureAtlasManager from "../../../textureAtlas/TextureAtlasManager";
import SgsTexture from "./SgsTexture";

/*
* 扁平图片组件：可根据Laya.Event.COMPLETE、Laya.Event.ERROR事件监听加载成功、失败
*/
export default class SgsFlatImage extends SgsTexture 
{
    protected _skin:string = "";
    protected loadedSkins:Array<string>;//已加载的皮肤地址数组

    public autoClear:boolean = true;//自动清理纹理(laya2默认自动回收)
    public onlyDestroyClear:boolean = false;//是否仅destroy时清理资源
    public isMergeAtlas:boolean = true;//是否合并进动态图集
    // public isThorough:boolean = false;//是否彻底清理(调用RES.ClearRes)(laya2采用引用计数回收不再需要保留壳的回收方式)

    constructor(texture:Laya.Texture = null)
    {
        super(texture);
    }

    public set skin(value:string)
    {
        if (this._skin == value) 
        {
            if (this.texture && this.texture.url == value)
                this.event(Laya.Event.COMPLETE,this);
            return;
        }
        if (this._skin)//停止之前的加载
        {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin,this,this.loadSkinComplete);
        }
        this.texture = null;
        this._skin = value;
        this.clearLoadedSkins(false);
        if (!this._skin) 
            return;
        RES.AddReference(value);
        this.addLoadSkin(value);
        this.loadSkin();
    }

    public get skin():string
    {
        return this._skin;
    }

    protected loadSkin():void
    {
        RES.GetResByUrl(this._skin,this,this.loadSkinComplete,"image",this._skin);
    }

    protected loadSkinComplete(texture:Laya.Texture,key:string):void
    {
        if (this._skin != key) return;
        if (!texture)//加载失败 
        {
			this.texture = null;
            this.event(Laya.Event.ERROR,this);
        }
		else
		{
            if (this.isMergeAtlas && TextureAtlasManager.Instance)
                TextureAtlasManager.Instance.NeedPushAtlas(texture);
			this.texture = texture;
			this.event(Laya.Event.COMPLETE,this);
		}
    }

    protected addLoadSkin(url:string):void
    {
        if (!this.loadedSkins)
            this.loadedSkins = [];
        if (url && this.loadedSkins.indexOf(url) == -1)
            this.loadedSkins.push(url);
    }

    protected clearLoadedSkins(destroy:boolean = true):void
    {
        if (!this.autoClear) return;
        if (this.onlyDestroyClear && !destroy) return;
        if (!this.loadedSkins || this.loadedSkins.length <= 0) return;
        let url:string;
        for (let i:number = 0; i < this.loadedSkins.length; i++)
        {
            url = this.loadedSkins[i];
            if (!destroy && url == this._skin) continue;
            RES.ClearResByUrl(url);
        }
        this.loadedSkins.length = 0;
        if (!destroy && this._skin)
            this.loadedSkins.push(this._skin);
    }

    public clear(destroy:boolean = true)
    {
        if (destroy && this._skin)
        {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin,this,this.loadSkinComplete);
        }
        super.clear(destroy);
        this.clearLoadedSkins(destroy);
        if (destroy)
            this._skin = null;
    }
}