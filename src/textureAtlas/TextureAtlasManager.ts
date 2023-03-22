import TextureAtlas from "./TextureAtlas";

//动态图集管理类
export default class TextureAtlasManager
{
    public static Instance:TextureAtlasManager;

    protected atlasTextureWidth:number = 0;//动态图集尺寸
    protected atlasTextureHeight:number = 0;
    protected atlasLimitWidth:number = 0;//进入动态图集的纹理最大尺寸
    protected atlasLimitHeight:number = 0;
    protected maxAtlaserCount:number = 0;//动态图集最大数量
    protected atlasArray:Array<TextureAtlas>;
    protected tmpAtlasPos:Laya.Point;

    /**
     * @param atlasTextureWidth 动态图集宽度
     * @param atlasTextureHeight 动态图集高度
     * @param atlasLimitWidth 进入动态图集的纹理最大宽度
     * @param atlasLimitHeight 进入动态图集的纹理最大高度
     * @param maxAtlaserCount 动态图集最大数量
     */
    constructor(atlasTextureWidth:number = 2048,atlasTextureHeight:number = 2048,atlasLimitWidth:number = 512,atlasLimitHeight:number = 512,maxAtlaserCount:number = 2) 
    {
        this.atlasTextureWidth = atlasTextureWidth;
        this.atlasTextureHeight = atlasTextureHeight;
        this.atlasLimitWidth = atlasLimitWidth;
        this.atlasLimitHeight = atlasLimitHeight;
        this.maxAtlaserCount = maxAtlaserCount;
        this.atlasArray = [];
        this.tmpAtlasPos = new Laya.Point();
        TextureAtlasManager.Instance = this;
    }

    //需要加入动态图集
    public NeedPushAtlas(texture):void
    {
        //判断是否符合加入条件
        if (texture && texture.bitmap && texture.bitmap.imageBitmap && 
            texture.width <= this.atlasLimitWidth && texture.height <= this.atlasLimitHeight)
            texture["canMergeAltas"] = true;
    }

    //加入动态图集
    public PushAtlas(texture):boolean
    {
        if (texture["inMergeAltas"] || !texture["canMergeAltas"] || !texture.bitmap.imageBitmap)//已加入或不可以加入
            return false;
        // if (!texture.bitmap || !texture.bitmap.imageBitmap || 
        //     texture.width > this.atlasLimitWidth || texture.height > this.atlasLimitHeight)
        //     return false;
        var w = texture.width;
        var h = texture.height;
        var sz = this.atlasArray.length;
        var atlas;
        var find = false;
        for (var i = 0; i < sz; i++)
        {
            atlas = this.atlasArray[i];
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (find)
                break;
        }
        if (!find) 
        {
            atlas = new TextureAtlas(this.atlasTextureWidth,this.atlasTextureHeight);
            this.atlasArray.push(atlas);
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (!find) {
                throw 'err1';
            }
            // //超过动态图集上限，回收第一张
            // if (this.atlasArray.length > this.maxAtlaserCount)
            // {
            //     var delAtlas = this.atlasArray[0];
            //     this.atlasArray.splice(0,1);
            //     delAtlas.destroy();
            // }
        }
        if (find) 
        {
            atlas.texture.addToAtlasTexture(texture, this.tmpAtlasPos.x, this.tmpAtlasPos.y);
            atlas.texture.addToAtlas(texture, this.tmpAtlasPos.x, this.tmpAtlasPos.y);
            return true;
        }
    }

    //回收多余动态图集
    public GC():void
    {
        var n = this.atlasArray.length - this.maxAtlaserCount;
        if (n > 0)
        {
            for (var i = 0; i < n; i++)
            {
                this.atlasArray[i].destroy();
            }
            this.atlasArray.splice(0,n);
            console.log(">>>TextureAtlasManager GC : " + n);
        }
    }

    //释放全部动态图集
    public FreeAll(isClose:boolean = false):void
    {
        for (var i = 0; i < this.atlasArray.length; i++)
        {
            this.atlasArray[i].destroy();
        }
        this.atlasArray.length = 0;
        
        if (isClose)//关闭动态图集
            TextureAtlasManager.Instance = null;
    }
}
Laya.Browser.window.TextureAtlasManager = TextureAtlasManager;