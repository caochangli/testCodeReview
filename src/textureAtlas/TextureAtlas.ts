import AtlaserTexture from "./AtlaserTexture";

//动态图集类
export default class TextureAtlas
{
    public static atlasGridW:number = 16;

    protected texWidth:number = 0;
    protected texHeight:number = 0;
    protected texture:AtlaserTexture;
    protected atlasgrid:Laya.AtlasGrid;

    constructor(texWidth:number,texHeight:number) 
    {
        this.texWidth = texWidth;
        this.texHeight = texHeight;
        this.texture = null;
        this.texture = AtlaserTexture.getAtlaserTexture(this.texWidth, this.texHeight);
        if (this.texWidth / TextureAtlas.atlasGridW > 256)
            TextureAtlas.atlasGridW = Math.ceil(this.texWidth / 256);
        this.atlasgrid = new Laya.AtlasGrid(this.texWidth / TextureAtlas.atlasGridW, this.texHeight / TextureAtlas.atlasGridW, this.texture.id);
    }
    
    getAEmpty(w, h, pt) 
    {
        var find = this.atlasgrid.addRect(1, Math.ceil(w / TextureAtlas.atlasGridW), Math.ceil(h / TextureAtlas.atlasGridW), pt);
        if (find) {
            pt.x *= TextureAtlas.atlasGridW;
            pt.y *= TextureAtlas.atlasGridW;
        }
        return find;
    }
    
    public destroy() 
    {
        if (this.texture)
        {
            this.texture.destroy();
            this.texture = null;
        }
        this.atlasgrid = null;
    }
}