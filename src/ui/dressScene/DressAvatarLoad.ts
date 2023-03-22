import DressConfiger from "../../config/DressConfiger";
import RES from "../../res/RES";
import DressPartVO from "../../vo/DressPartVO";
import DressVO from "../../vo/DressVO";

export default class DressAvatarLoad extends Laya.EventDispatcher
{
    private resources:Array<string>;
    private loadedCount:number = 0;

    private dressVo:DressVO;

    constructor()
    {
        super();

        this.resources = [];
    }

    public get DressVO():DressVO
    {
        return this.dressVo;
    }

    public LoadDressPartRes(dressVo:DressVO):void
    {
        this.CancelDressPartRes();
        this.dressVo = dressVo;
        let dressConfig:DressConfiger = DressConfiger.GetInstance();
        let dressParts:Array<DressPartVO> = dressConfig.GetDresPartsByDressID(dressVo.DressID);
        if (dressParts && dressParts.length > 0)
        {
            let resourceUrl:string = "";
            dressParts.forEach(dressPartVo => {
                resourceUrl = dressPartVo.ResourceUrl;
                if (resourceUrl) 
                    this.resources.push(resourceUrl);
            });
        }
        if (this.resources.length > 0)
        {
            this.resources.forEach(element => {
                RES.AddReference(element);
                RES.GetResByUrl(element,this,this.onLoadComplete,"image");
            });
        }
        else
        {
            this.event(Laya.Event.COMPLETE,this);
            this.dressVo = null;
        }
    }

    public CancelDressPartRes():void
    {
        if (this.resources.length > 0)
        {
            this.resources.forEach(element => {
                RES.DelReference(element);
                RES.CancelGetResByUrl(element,this,this.onLoadComplete);
                RES.ClearResByUrl(element);
            });
            this.resources.length = 0;
        }
        this.loadedCount = 0;
        this.dressVo = null;
    }

    private onLoadComplete(texture:Laya.Texture,key:string):void
    {
        if (this.resources.indexOf(key) == -1) return;
        this.loadedCount ++;
        if (this.loadedCount >= this.resources.length)//加载完
        {
            this.event(Laya.Event.COMPLETE,this);//先派发事件给外面创建搭配UI，从而将资源引用上
            this.resources.forEach(element => {
                RES.DelReference(element);
                RES.ClearResByUrl(element);
            });
            this.resources.length = 0;
            this.loadedCount = 0;
            this.dressVo = null;
        }
    }
}