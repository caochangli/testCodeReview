/*
* spine动画模板重构：解决资源加载完已被destroyed报错问题
*/
export default class SgsTemplet extends Laya.Templet
{
    // protected bindSkeletons:Array<SgsSkeleton>;//绑定的Skeleton

    constructor()
    {
        super();
    }

    protected _textureComplete():void//纹理加载完成
    {
        if (this["_isDestroyed"]) {
			this.destroy();
            return;
		}
        Laya.Templet.prototype["_textureComplete"].call(this);
    }

    protected _parsePublicExtData():void//解析数据
    {
        if (this["_isDestroyed"]) {
			this.destroy();
            return;
		}
        Laya.Templet.prototype["_parsePublicExtData"].call(this);
    }

    public getAnimationCount():number
    {
        if (!this["_anis"]) return 0;
        return super.getAnimationCount();
    }

    public getNodes(aniIndex:number):any
    {
        if (!this["_anis"] || this["_anis"].length <= aniIndex) return null;
        return super.getNodes(aniIndex);
    }

    public getGrahicsDataWithCache(aniIndex: number, frameIndex: number):Laya.Graphics
    {
        if (!this["_graphicsCache"] || this["_graphicsCache"].length <= aniIndex || this["_graphicsCache"][aniIndex].length <= frameIndex) {
            return null;
        }
        return super.getGrahicsDataWithCache(aniIndex,frameIndex);
    }

    public setGrahicsDataWithCache(aniIndex: number, frameIndex: number, graphics:Laya.Graphics):void
    {
        if (!this["_graphicsCache"] || this["_graphicsCache"].length <= aniIndex) return;
        super.setGrahicsDataWithCache(aniIndex,frameIndex,graphics);
    }

    public getOriginalData(aniIndex: number, originalData: Float32Array, nodesFrameIndices: Array<any>, frameIndex: number, playCurTime: number):void
    {
        if (!this["_anis"] || this["_anis"].length <= aniIndex) return;
        super.getOriginalData(aniIndex,originalData,nodesFrameIndices,frameIndex,playCurTime);
    }

    public set skBufferUrl(val:string)
    {
    }

    public get skBufferUrl():string
    {
        return this["_skBufferUrl"];
    }

    //检查模板资源
    public checkTempletRes():boolean
    {
        if (!this.getPublicExtData())
            return false;
        let mainTexture = this["_mainTexture"];
        if (!mainTexture || mainTexture.destroyed)
            return false;
        let textureDic = this["_textureDic"];
        if (!textureDic) 
            return false;
        let textureExist = false;//纹理是否存在
        for (let key in textureDic) 
        { 
            if (!key) continue;
            textureExist = true;
            if (!textureDic[key] || textureDic[key].destroyed) 
                return false;
        }
        return textureExist;
    }

    //是否是该模板资源
    public hasTempletRes(url:string):boolean
    {
        if (this["_skBufferUrl"] == url)
            return true;
        let loadList = this["_loadList"];
        if (loadList && loadList.length > 0)
        {
            for (let i:number = 0; i < loadList.length; i++)
            {
                if (loadList[i] == url)
                    return true;
            }
        }
        return false;
    }

    // public addBindSkeleton(val:SgsSkeleton)//skeleton中对templet的持有太多了不好处理
    // {
    //     if (!this.bindSkeletons)
    //         this.bindSkeletons = [];
    //     if (this.bindSkeletons.indexOf(val) == -1)
    //         this.bindSkeletons.push(val);
    // }

    // public delBindSkeleton(val:SgsSkeleton)
    // {
    //     if (!this.bindSkeletons) return;
    //     let index:number = this.bindSkeletons.indexOf(val);
    //     if (index != -1)
    //         this.bindSkeletons.splice(index,1);
    // }

    // public destroy(clearSk:boolean = true):void
    // {
        // //模板销毁时，对持有此模板的UI进行模板置空处理
        // //比如：Skeleton回收到对象池后，模板回收了，而在对象池中的Skeleton还持有着模板
        // if (this.bindSkeletons && this.bindSkeletons.length > 0)
        // {
        //     let templet:Laya.Templet;
        //     this.bindSkeletons.forEach(element => {
        //         templet = element ? element.templet : null;
        //         if (templet && templet === this)
        //         {
        //             //光处理这个没有用，因为还有很多其他引用
        //             templet["_removeReference"](1);
        //             element["_templet"] = null;
        //         }
        //     });
        //     this.bindSkeletons.length = 0;
        // }

        // super.destroy();

        // if (clearSk && this["_skBufferUrl"])//清理对应sk资源
        // {
        //     RES.ClearResByUrl(this["_skBufferUrl"]);
        // }
    // }
}