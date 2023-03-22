import DressConfiger from "../../config/DressConfiger";
import Global from "../../Global";
import RES from "../../res/RES";
import DressPartVO from "../../vo/DressPartVO";
import DressVO from "../../vo/DressVO";
import SgsSprite from "../controls/base/SgsSprite";
import SgsTexture from "../controls/base/SgsTexture";
import DressAvatarPartUI from "./DressAvatarPartUI";


//装扮形象:尺寸为裸模尺寸(裸模图中脚不在中心)
//部件坐标可能是负数
//
export default class DressAvatar extends SgsSprite
{
    public static LOAD_COMPLETE:string = "LOAD_COMPLETE";//资源加载完

    protected model:SgsTexture;
    protected partUIs:Array<DressAvatarPartUI>;
    protected partPools:Array<DressAvatarPartUI>;

    public autoClear:boolean = true;//自动清理纹理
    public onlyDestroyClear:boolean = false;//是否仅destroy时清理资源

    protected modelType:number = 0;//模型类型-肤色
    protected dressIDs:Array<number>;//搭配数组
    protected offsetX:number = 0;
    protected offsetY:number = 0;
    protected offsetWidth:number = 0;
    protected offsetHeight:number = 0;

    constructor()
    {
        super();

        this.size(Global.ModelWidth,Global.ModelHeight);
        this.createModel();
        this.partUIs = [];
        this.partPools = [];
        this.dressIDs = [];
    }

    protected createModel():void
    {
        this.model = new SgsTexture();
        this.addDrawChild(this.model);
    }

    public get ModelType():number
    {
        return this.modelType;
    }

    public get DressIDs():Array<number>
    {
        return this.dressIDs;
    }

    //全量更新形象: 先恢复成裸体再显示本次装扮
    public UpdateAll(modelType:number,dressIDs:Array<number>):void
    {
        this.Reset();
        if (dressIDs && dressIDs.length > 0)
        {
            this.UpdateModel(modelType);
            let dressConfig = DressConfiger.GetInstance();
            let dressVo:DressVO;
            dressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo)
                {
                    this.dressIDs.push(dressID);
                    this.addDressPartUIs(dressConfig,dressVo);
                }
            });
            this.updateLayer();
        }
    }

    //更新模型
    public UpdateModel(modelType:number):void
    {
        if (!modelType || modelType < 1 || modelType > 3)
            modelType = 1;
        this.modelType = modelType;
        if (this.model)
            this.model.texture = RES.GetRes("modelAvatar" + modelType);
    }

    //重置：删除所有装扮恢复成裸体
    public Reset():void
    {
        this.modelType = 0;
        this.dressIDs.length = 0;
        this.model.texture = null;
        let partUI:DressAvatarPartUI;
        while (this.partUIs.length > 0)
        {
            partUI = this.partUIs.shift();
            partUI.off(Laya.Event.COMPLETE,this,this.onPartLoadComplete);
            this.removeDrawChild(partUI,false);
            this.partPools.push(partUI);
        }
    }

    // //获取保存数据
    // public get SaveData():{width:number,height:number,base64:string}
    // {
    //     let oldX:number = this.x;
    //     let oldY:number = this.y;
    //     let oldScale:number = this.scaleX;
    //     this.pos(0,0);
    //     this.scale(1,1);

    //     //真实尺寸
    //     let realWidth:number = -this.offsetX + this.width + this.offsetWidth;
    //     let realHeight:number = -this.offsetY + this.height + this.offsetHeight;

    //     var htmlC:Laya.HTMLCanvas = this.drawToCanvas(realWidth,realHeight,-this.offsetX,-this.offsetY);
    //     var base64:string = htmlC.toBase64("image/png",1);
        
    //     this.pos(oldX,oldY);
    //     this.scale(oldScale,oldScale);
    //     htmlC.destroy();

    //     return {width:realWidth,height:realHeight,base64:base64};
    // }

    public get OffsetX():number
    {
        return this.offsetX;
    }

    public get OffsetY():number
    {
        return this.offsetY;
    }

    public get OffsetWidth():number
    {
        return this.offsetWidth;
    }

    public get OffsetHeight():number
    {
        return this.offsetHeight;
    }

    protected addDressID(dressID:number):void
    {
        if (this.dressIDs.indexOf(dressID) == -1)
            this.dressIDs.push(dressID);
    }

    protected getDressIDIndexByType(dressType:number):number//按类型获取装扮索引
    {
        let dressConfig = DressConfiger.GetInstance();
        let vo:DressVO;
        for (let i:number = 0; i < this.dressIDs.length; i++)
        {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (vo && vo.DressType == dressType)
                return i;
        }
        return -1;
    }

    protected addDressPartUIs(dressConfig:DressConfiger,dressVo:DressVO):void//添加装扮的部件UI列表
    {
        if (!dressVo || this.checkPartUIByDressID(dressVo.DressID)) return;
        let dressParts:Array<DressPartVO> = dressConfig.GetDresPartsByDressID(dressVo.DressID);
        if (dressParts && dressParts.length > 0)
        {
            let partUI:DressAvatarPartUI;
            dressParts.forEach(dressPartVo => {
                if (this.partPools.length > 0)
                    partUI = this.partPools.shift();
                else
                    partUI = new DressAvatarPartUI();
                partUI.autoClear = Global.AutoClearRes && this.autoClear;
                partUI.onlyDestroyClear = this.onlyDestroyClear;
                partUI.on(Laya.Event.COMPLETE,this,this.onPartLoadComplete);
                this.partUIs.push(partUI);
                partUI.SetItemData(dressVo,dressPartVo);
            });
        }
    }

    protected checkPartUIByDressID(dressID:number):boolean//按装扮id检查装扮ui是否已存在
    {
        if (!this.partUIs || this.partUIs.length <= 0)
            return false;
        for (let i:number = 0; i < this.partUIs.length; i++)
        {
            if (this.partUIs[i].DressID == dressID)
                return true;
        }
        return false;
    }

    protected updateLayer():void//更新层级
    {
        if (!this.partUIs || this.partUIs.length <= 0)
            return;
        //排序
        this.partUIs.sort(function(aUI:DressAvatarPartUI,bUI:DressAvatarPartUI):number{
            return aUI.Layer - bUI.Layer;
        });
        //移除
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetWidth = 0;
        this.offsetHeight = 0;
        let partVo:DressPartVO;
        this.partUIs.forEach((partUI:DressAvatarPartUI) => {
            if (partUI.drawed)
                this.removeDrawChild(partUI,false);
            partVo = partUI.DressPartVO;
            if (partVo && partVo.PartPos && partVo.PartPos.length >= 2 && partVo.PartSize && partVo.PartSize.length >= 2)
            {
                this.offsetX = Math.min(this.offsetX,partVo.PartPos[0]);
                this.offsetY = Math.min(this.offsetY,partVo.PartPos[1]);
                this.offsetWidth = Math.max(this.offsetWidth,partVo.PartPos[0] + partVo.PartSize[0] - this.width);
                this.offsetHeight = Math.max(this.offsetHeight,partVo.PartPos[1] + partVo.PartSize[1] - this.height);
            }
        });
        if (this.model.drawed)
            this.removeDrawChild(this.model,false);
        //按层级添加
        let partUI:DressAvatarPartUI;
        for (let i:number = 0; i < this.partUIs.length; i++)
        {
            partUI = this.partUIs[i];
            if (partUI.Layer >= 10 && !this.model.drawed)//模特前面的部件：先添加模特，再添加部件
                this.addDrawChild(this.model);
            this.addDrawChild(partUI);
        }
        if (!this.model.drawed)
            this.addDrawChild(this.model);
    }

    protected invalidCheckLoadedFlag:boolean = false;
    protected onPartLoadComplete(partUI:DressAvatarPartUI):void//部件加载完成
    {
        if (!this.invalidCheckLoadedFlag)
        {
            this.invalidCheckLoadedFlag = true;
            Laya.timer.callLater(this,this.checkPartAllLoaded);
        }
    }

    protected checkPartAllLoaded():void
    {
        this.invalidCheckLoadedFlag = false;
        if (this.destroyed) return;
        let isAllLoaded:boolean = true;
        for (let i:number = 0; i < this.partUIs.length; i++)
        {
            if (!this.partUIs[i].IsLoaded)
            {
                isAllLoaded = false;
                break;
            }
        }
        if (isAllLoaded)//已全部加载完
            this.event(DressAvatar.LOAD_COMPLETE,this);
    }

    public destroy():void 
    {
        let partUI:DressAvatarPartUI;
        while (this.partPools.length > 0)
        {
            partUI = this.partPools.shift();
            partUI.off(Laya.Event.COMPLETE,this,this.onPartLoadComplete);
            this.removeDrawChild(partUI,true);
        }
        this.partUIs.length = 0;
        super.destroy();
        this.modelType = 0;
        this.dressIDs.length = 0;
    }
}