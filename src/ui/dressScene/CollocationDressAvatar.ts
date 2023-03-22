import DressConfiger from "../../config/DressConfiger";
import DressType from "../../enum/DressType";
import DressVO from "../../vo/DressVO";
import SgsText from "../controls/base/SgsText";
import SgsTexture from "../controls/base/SgsTexture";
import DressAvatar from "./DressAvatar";
import DressAvatarLoad from "./dressAvatarLoad";
import DressAvatarPartUI from "./DressAvatarPartUI";

//搭配装扮形象
export default class CollocationDressAvatar extends DressAvatar
{
    protected avatarLoads:Array<DressAvatarLoad>;
    protected avatarLoadPools:Array<DressAvatarLoad>;

    private dressIngFlag:SgsTexture;
    
    constructor()
    {
        super();

        this.avatarLoads = [];
        this.avatarLoadPools = [];
    }

    //是否装扮中
    public get IsDressIng():boolean
    {
        return this.avatarLoads.length > 0 ? true : false;
    }

    public SetDressIngFlag(flag:SgsTexture):void
    {
        this.dressIngFlag = flag;
    }

    //恢复指定类型的装扮为默认装扮
    public RecoveryDefaultByType(dressType:number):void
    {
        if (this.IsDressIng) return;//更衣中
        if (this.getDressIDIndexByType(dressType) == -1) return;//没有该类型装扮
        let dressConfig = DressConfiger.GetInstance();
        let self = this;
        if (dressType == DressType.DESSuit)//还原套装:穿上默认的上衣、下衣
        {
            this.delDressByType(dressType);
            addDefaultDress(DressType.DESJacket);
            addDefaultDress(DressType.DESLowerGarments);
        }
        else//穿上默认的本类型装扮
        {
            addDefaultDress(dressType);
        }

        function addDefaultDress(dressType:number):void
        {
            self.delDressByType(dressType);
            let defaultDressVo = dressConfig.GetDefaultDressVoByType(dressType);
            if (defaultDressVo)
            {
                if (self.dressIDs.indexOf(defaultDressVo.DressID) == -1)
                    self.dressIDs.push(defaultDressVo.DressID);
                self.addDressPartUIs(dressConfig,defaultDressVo);
            }
        }
        this.updateLayer();
        this.updateDressIngFlag(false);
    }

    //替换装扮：换掉同类型装扮
    public ReplaceDress(dressID:number):void
    {
        if (this.IsDressIng) return;//更衣中
        if (this.dressIDs.indexOf(dressID) >= 0) return;//已存在
        let dressConfig = DressConfiger.GetInstance();
        let dressVo:DressVO = dressConfig.GetDressByDressID(dressID);
        if (!dressVo) return;
        this.updateDressIngFlag(true);
        let vo:DressVO;
        for (let i:number = 0; i < this.dressIDs.length; i++)
        {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (dressVo.DressType == DressType.DESSuit)//穿上套装：脱掉套装、上衣、下衣
            {
                if (vo.DressType == dressVo.DressType || vo.DressType == DressType.DESJacket || vo.DressType == DressType.DESLowerGarments)
                {
                    this.cancelAvatarLoad(vo);//取消正在加载的
                    this.dressIDs.splice(i,1);
                    i--;
                }
            }
            else if (dressVo.DressType == DressType.DESJacket || dressVo.DressType == DressType.DESLowerGarments)//穿上上衣或下衣：脱掉上衣或下衣以及套装
            {
                if (vo.DressType == dressVo.DressType || vo.DressType == DressType.DESSuit)
                {
                    this.cancelAvatarLoad(vo);//取消正在加载的
                    this.dressIDs.splice(i,1);
                    i--;
                }
            }
            else if (vo.DressType == dressVo.DressType)//其他：脱掉同类型
            {
                this.cancelAvatarLoad(vo);//取消正在加载的
                this.dressIDs.splice(i,1);
                break;
            }
        }
        this.addDressID(dressID);
        this.createAvatarLoad(dressVo);
    }

    //重置：删除所有装扮恢复成裸体
    public Reset():void
    {
        let avatarLoad:DressAvatarLoad;
        while (this.avatarLoads.length > 0)
        {
            avatarLoad = this.avatarLoads.shift();
            avatarLoad.off(Laya.Event.COMPLETE,this,this.onAvatarLoadComplete);
            avatarLoad.CancelDressPartRes();
            this.avatarLoadPools.push(avatarLoad);
        }
        super.Reset();
    }

    protected delDressByType(dressType:number):void//按类型删除装扮:数据、ui同时删除
    {
        let dressConfig = DressConfiger.GetInstance();
        let vo:DressVO;
        for (let i:number = 0; i < this.dressIDs.length; i++)//删除数据
        {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (vo.DressType == dressType)
            {
                this.cancelAvatarLoad(vo);//取消正在加载的
                this.dressIDs.splice(i,1);
                break;
            }
        }

        let partUI:DressAvatarPartUI;
        for (let i:number = 0; i < this.partUIs.length; i++)//删除ui
        {
            partUI = this.partUIs[i];
            if (partUI.DressType == dressType)
            {
                this.partUIs.splice(i,1);
                partUI.off(Laya.Event.COMPLETE,this,this.onPartLoadComplete);
                this.removeDrawChild(partUI,false);
                this.partPools.push(partUI);
                i --;
            }
        }
    }
    
    protected createAvatarLoad(dressVo:DressVO):void//创建加载代理
    {
        if (!dressVo) return;
        let avatarLoad:DressAvatarLoad;
        if (this.avatarLoadPools.length > 0) 
            avatarLoad = this.avatarLoadPools.shift();
        else
            avatarLoad = new DressAvatarLoad();
        avatarLoad.on(Laya.Event.COMPLETE,this,this.onAvatarLoadComplete);
        this.avatarLoads.push(avatarLoad);
        avatarLoad.LoadDressPartRes(dressVo);
    }   

    protected onAvatarLoadComplete(avatarLoad:DressAvatarLoad):void//加载完成
    {
        avatarLoad.off(Laya.Event.COMPLETE,this,this.onAvatarLoadComplete);
        let index:number = this.avatarLoads.indexOf(avatarLoad);
        if (index >= 0) this.avatarLoads.splice(index,1);
        this.avatarLoadPools.push(avatarLoad);
        let dressVo = avatarLoad.DressVO;
        if (!dressVo || this.dressIDs.indexOf(dressVo.DressID) == -1) 
            return;
        let dressConfig = DressConfiger.GetInstance();
        let repairDressVo:DressVO;//需要补的装扮
        //移除原同类型部件
        this.delDressByType(dressVo.DressType);
        if (dressVo.DressType == DressType.DESSuit)//穿上套装
        {
            this.delDressByType(DressType.DESJacket);
            this.delDressByType(DressType.DESLowerGarments);
        }
        else if (dressVo.DressType == DressType.DESJacket)//穿上上衣
        {
            this.delDressByType(DressType.DESSuit);//如果原来是套装，则需要补上下衣
            let index:number = this.getDressIDIndexByType(DressType.DESLowerGarments);
            if (index == -1)//没有下衣：补上默认下衣
                repairDressVo = dressConfig.GetDefaultDressVoByType(DressType.DESLowerGarments);
        }  
        else if (dressVo.DressType == DressType.DESLowerGarments)//穿上下衣
        {
            this.delDressByType(DressType.DESSuit);//如果原来是套装，则需要补上上衣
            let index:number = this.getDressIDIndexByType(DressType.DESJacket);
            if (index == -1)//没有上衣：补上默认上衣
                repairDressVo = dressConfig.GetDefaultDressVoByType(DressType.DESJacket);
        } 
        //添加新装扮的部件
        this.addDressID(dressVo.DressID);
        this.addDressPartUIs(dressConfig,dressVo);
        if (repairDressVo)//需要补上的装扮
        {
            this.addDressID(repairDressVo.DressID);
            this.addDressPartUIs(dressConfig,repairDressVo);
        }
        this.updateLayer();
        this.updateDressIngFlag(false);
    }

    protected cancelAvatarLoad(dressVo:DressVO):void//取消加载代理
    {
        if (!dressVo) return;
        let avatarLoad:DressAvatarLoad;
        for (let i:number = 0; i < this.avatarLoads.length; i++)
        {
            avatarLoad = this.avatarLoads[i];
            if (avatarLoad.DressVO && avatarLoad.DressVO.DressID == dressVo.DressID)
            {
                avatarLoad.off(Laya.Event.COMPLETE,this,this.onAvatarLoadComplete);
                avatarLoad.CancelDressPartRes();
                this.avatarLoads.splice(i,1);
                this.avatarLoadPools.push(avatarLoad);
                break;
            }
        }
    }

    protected updateDressIngFlag(isShow:boolean):void
    {
        if (!this.dressIngFlag) return;
        Laya.timer.clear(this,this.onDelayShowDressIngFlag);
        if (isShow)
            Laya.timer.once(1000,this,this.onDelayShowDressIngFlag);//延迟显示：缓解”更衣中“闪现现象
        else
            this.dressIngFlag.visible = false;
    }

    protected onDelayShowDressIngFlag():void
    {
        this.dressIngFlag.visible = true;
    }

    public destroy():void 
    {
        Laya.timer.clear(this,this.onDelayShowDressIngFlag);
        let avatarLoad:DressAvatarLoad;
        while (this.avatarLoads.length > 0)
        {
            avatarLoad = this.avatarLoads.shift();
            avatarLoad.off(Laya.Event.COMPLETE,this,this.onAvatarLoadComplete);
            avatarLoad.CancelDressPartRes();
        }
        this.avatarLoadPools.length = 0;
        super.destroy();
        this.dressIngFlag = null;
    }

}