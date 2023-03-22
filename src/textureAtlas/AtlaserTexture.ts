import RES from "../res/RES";

//动态图集纹理
export default class AtlaserTexture extends Laya.Resource
{
    protected texWidth:number = 0;
    protected texHeight:number = 0;
    
    protected _inAtlasTextureKey:Array<any>;
    protected _inAtlasTextureBitmapValue:Array<any>;
    protected _inAtlasTextureOriUVValue:Array<any>;
    protected _InAtlasWebGLImagesKey:any;
    protected _InAtlasWebGLImagesOffsetValue:Array<any>;

    protected _source:any;
    protected bitmap:any;

    constructor(texWidth, texHeight) 
    {
        super();
        
        this.bitmap = {id:0,_glTexture:null};
        this.texWidth = texWidth;
        this.texHeight = texHeight;
        this.bitmap.id = this.id;

        this._inAtlasTextureKey = [];
        this._inAtlasTextureBitmapValue = [];
        this._inAtlasTextureOriUVValue = [];
        this._InAtlasWebGLImagesKey = {};
        this._InAtlasWebGLImagesOffsetValue = [];

        this.lock = true;
    }

    static getAtlaserTexture(width:number, height:number) 
    {
        return new AtlaserTexture(width, height);
    }

    recreateResource() 
    {
        if (this._source)
            return;
        var gl = Laya["LayaGL"].instance;
        var glTex = this._source = gl.createTexture();
        this.bitmap._glTexture = glTex;
        Laya.WebGLContext["bindTexture"](gl, gl.TEXTURE_2D, glTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.texWidth, this.texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this["_setGPUMemory"](this.texWidth * this.texHeight * 4);
    }

    // findBitmapIsExist(bitmap)
    // {
    //     var webImage=bitmap;
    //     var sUrl=webImage.url;
    //     var object=this._InAtlasWebGLImagesKey[sUrl?sUrl:webImage.id]
    //     if (object)
    //         return object.offsetInfoID;
    // }

    //将bitmap数据写入图集中
    addToAtlasTexture(texture,offsetX,offsetY)
    {
        !this._source && this.recreateResource();
        var gl = Laya["LayaGL"].instance;
        // var preTarget = Laya.WebGLContext.curBindTexTarget;
        // var preTexture = Laya.WebGLContext.curBindTexValue;
        var sUrl = texture.url;
        var bitmap = texture.bitmap;
        this._InAtlasWebGLImagesKey[sUrl?sUrl:bitmap.id]={bitmap:bitmap,offsetInfoID:this._InAtlasWebGLImagesOffsetValue.length};
        this._InAtlasWebGLImagesOffsetValue.push([offsetX,offsetY]);

        Laya.WebGLContext["bindTexture"](gl, gl.TEXTURE_2D, this._source);
        !Laya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, bitmap.imageBitmap);
        !Laya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        // (preTarget && preTexture)&& (Laya.WebGLContext["bindTexture"](gl,preTarget,preTexture));
    }

    //记录纹理数据，并更新纹理uv和数据源
    addToAtlas(texture,offsetX,offsetY)
    {
        texture._atlasID = this._inAtlasTextureKey.length;
        var oriUV = texture.uv.slice();
        var oriBitmap = texture.bitmap;
        this._inAtlasTextureKey.push(texture);
        this._inAtlasTextureOriUVValue.push(oriUV);
        this._inAtlasTextureBitmapValue.push(oriBitmap);
        this.computeUVinAtlasTexture(texture,oriUV,offsetX,offsetY);
        texture.bitmap = this;
        texture["inMergeAltas"] = true;//标记已加入动态图集
    }

    //重新计算纹理在图集中的uv
    computeUVinAtlasTexture(texture,oriUV,offsetX,offsetY)
    {
        var _w = this.texWidth;
        var _h = this.texHeight;
        var u1 = offsetX / _w,v1=offsetY / _h,u2 = (offsetX+texture.bitmap.width)/ _w,v2 = (offsetY+texture.bitmap.height)/ _h;
        var inAltasUVWidth = texture.bitmap.width / _w,inAltasUVHeight = texture.bitmap.height / _h;
        texture.uv=[u1+oriUV[0] *inAltasUVWidth,v1+oriUV[1] *inAltasUVHeight,u2-(1-oriUV[2])*inAltasUVWidth,v1+oriUV[3] *inAltasUVHeight,u2-(1-oriUV[4])*inAltasUVWidth,v2-(1-oriUV[5])*inAltasUVHeight,u1+oriUV[6] *inAltasUVWidth,v2-(1-oriUV[7])*inAltasUVHeight];
    }

    //恢复纹理
    recoveryTextures()
    {
        var urls = [];
        for (var i=0,n=this._inAtlasTextureKey.length;i < n;i++)
        {
            this._inAtlasTextureKey[i].bitmap = this._inAtlasTextureBitmapValue[i];
            this._inAtlasTextureKey[i].uv = this._inAtlasTextureOriUVValue[i];
            this._inAtlasTextureKey[i]._atlasID = -1;
            this._inAtlasTextureKey[i]["inMergeAltas"] = false;//去掉已加入动态图集标记
            urls.push(this._inAtlasTextureKey[i].url);
        }
        this._inAtlasTextureKey.length = 0;
        this._inAtlasTextureBitmapValue.length = 0;
        this._inAtlasTextureOriUVValue.length = 0;
        this._InAtlasWebGLImagesKey = null;
        this._InAtlasWebGLImagesOffsetValue.length = 0;
        return urls;
    }

    _disposeResource() 
    {
        super._disposeResource();
        if (this.bitmap)
        {
            this.bitmap._glTexture = null;
            this.bitmap = null;
        }
        if (this._source)
        {
            var gl = Laya["LayaGL"].instance;
            gl.deleteTexture(this._source);
            this._source = null;
            this["_setGPUMemory"](0);
        }
    }
    
    destroy() 
    {
        let urls = this.recoveryTextures();
        super.destroy();
        if (urls && urls.length > 0)
        {
            var textureUrl;
            for (var i=0,n=urls.length;i < n;i++)
            {
                textureUrl = urls[i];
                if (RES.GetReference(textureUrl) <= 0)//没有引用：直接回收
                    RES.ClearResByUrl(textureUrl);
            }
            urls.length = 0;
            urls = null;
        }
    }
    
    get texture() 
    {
        return this;
    }

    get width()
    {
        return this.texWidth;
    }

    get height()
    {
        return this.texHeight;
    }
    
    _getSource() 
    {
        return this._source;
    }
}