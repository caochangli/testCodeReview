import DressType from "../enum/DressType";
import Global from "../Global";
import RES from "../res/RES";
import Dictionary from "../utils/Dictionary";
import ObjUtil from "../utils/ObjUtil";
import DressPartVO from "../vo/DressPartVO";
import DressVO from "../vo/DressVO";
import ConfigerBase from "./ConfigerBase";

export default class DressConfiger extends ConfigerBase
{
    private dressDic:Dictionary;
    private dressByTypeDic:Dictionary;
    private dressPartDic:Dictionary;
    private dressTypeTabs:Array<{label:string,value:number}>;
    private defaultDressIDDic:Dictionary;//默认搭配:dressType->dressID

    constructor()
    {
        super("DressConfig_json");
        this.dressDic = new Dictionary();
        this.dressByTypeDic = new Dictionary();
        this.dressPartDic = new Dictionary();
        this.dressTypeTabs = [];
    }

    static instance:DressConfiger;
    public static GetInstance():DressConfiger
    {
        if (DressConfiger.instance == null)
            DressConfiger.instance = new DressConfiger();
        if(DressConfiger.instance.data)
            DressConfiger.instance.ParseConfig(DressConfiger.instance.data);
        return DressConfiger.instance;
    }

    public get DressDic():Dictionary
    {
        return this.dressDic;
    }

    public get DressPartDic():Dictionary
    {
        return this.dressPartDic;
    }

    //获取装扮类型tab数组
    public get DressTypeTabs():Array<{label:string,value:number}> 
    {
        return this.dressTypeTabs;
    }

    //获取装扮数据
    public GetDressByDressID(dressID:number):DressVO 
    {
        if (this.dressDic && this.dressDic.has(dressID))
            return this.dressDic.getNumberKey(dressID);
        return null;
    }

    //根据装扮类型获取装扮列表
    public GetDresssByDressType(dressType:number):Array<DressVO> 
    {
        if (this.dressByTypeDic && this.dressByTypeDic.has(dressType))
            return this.dressByTypeDic.getNumberKey(dressType);
        return null;
    }

    //获取装扮部件数据
    public GetDressPartByPartID(partID:number):DressPartVO 
    {
        if (this.dressPartDic && this.dressPartDic.has(partID))
            return this.dressPartDic.getNumberKey(partID);
        return null;
    }

    //根据装扮ID获取装扮部件列表
    public GetDresPartsByDressID(dressID:number):Array<DressPartVO>
    {
        let dressVo = this.GetDressByDressID(dressID);
        if (!dressVo || !dressVo.DressParts || dressVo.DressParts.length <= 0)
            return null;
        let result = [];
        let dressPartVo;
        dressVo.DressParts.forEach(partID => {
            dressPartVo = this.GetDressPartByPartID(partID);
            if (dressPartVo)
                result.push(dressPartVo);
        });
        return result;
    }

    //获取搭配挂件临时资源组 - 需要提前加载单个搭配资源时使用
    public GetDressPartTempGroup(dressIDs:Array<number>):boolean
    {
        RES.DelGroupKeys("dressPartTemp");
        //预加载搭配部件图，保证界面打开时所需资源都已加载好
        if (dressIDs && dressIDs.length > 0)
        {
            let dressConfig = DressConfiger.GetInstance();
            let dressVo:DressVO;
            let dressParts:Array<DressPartVO>;
            let resources:Array<any> = [];
			let keys:Array<string> = [];
            let resourceUrl:string = "";
            dressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo)
                {
                    dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
                    if (dressParts && dressParts.length > 0)
                    {
                        dressParts.forEach(element => {
                            resourceUrl = element.ResourceUrl;
                            if (resourceUrl)
                            {
                                resources.push({"url":resourceUrl,"type":"image","name":"runtime_dressPart_image" + element.Resource});
                                keys.push("runtime_dressPart_image" + element.Resource);
                            }
                        });
                    }
                }
            });
            if (resources.length > 0)
			{
				RES.AddResources(resources);
				RES.AddGroupKeys("dressPartTemp",keys);
                return true;
			}
        }
        return false;
    }

    //默认搭配
    public get DefaultDressIDs():Array<number>
    {
        return Global.DefaultDressIDs;
    }

    //根据搭配类型获取默认搭配ID
    public GetDefaultDressIDByType(dressType:number):number
    {
        let defaultDressIDs:Array<number> = this.DefaultDressIDs;
        if (!defaultDressIDs || defaultDressIDs.length <= 0)
            return 0;
        if (!this.defaultDressIDDic)
        {
            this.defaultDressIDDic = new Dictionary();
            let dressVo:DressVO;
            defaultDressIDs.forEach(dressID => {
                dressVo = this.GetDressByDressID(dressID);
                if (dressVo)
                    this.defaultDressIDDic.addNumberKey(dressVo.DressType,dressID);
            });
        }
        if (this.defaultDressIDDic.has(dressType))
            return this.defaultDressIDDic.getNumberKey(dressType);
        return 0;
    }

    //根据搭配类型获取默认搭配
    public GetDefaultDressVoByType(dressType:number):DressVO
    {
        let dressID:number = this.GetDefaultDressIDByType(dressType);
        return this.GetDressByDressID(dressID);
    }

    //默认搭配的部件资源数组
    public get DefaultDressPartResources():Array<string>
    {
        let defaultDressIDs:Array<number> = this.DefaultDressIDs;
        if (defaultDressIDs && defaultDressIDs.length > 0)
        {
            let dressConfig = DressConfiger.GetInstance();
            let dressVo:DressVO;
            let dressParts:Array<DressPartVO>;
            let resources:Array<string> = [];
            let resourceUrl:string = "";
            defaultDressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo)
                {
                    dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
                    if (dressParts && dressParts.length > 0)
                    {
                        dressParts.forEach(element => {
                            resourceUrl = element.ResourceUrl;
                            if (resourceUrl)
                                resources.push(resourceUrl);
                        });
                    }
                }
            });
            return resources;
        }
        return null;
    }

    /** 解析配置 */
    public ParseConfig(data:any):any
    {
        data = super.ParseConfig(data);
        if (!data) return;

        let dressConf = data.DressConf;
        if (dressConf) {
            let saveedTypes = [];
            let vo:DressVO;
            dressConf.forEach(element => {
                vo = new DressVO();
                ObjUtil.copyObj(element, vo);
                this.dressDic.addNumberKey(vo.DressID, vo);
                if (this.dressByTypeDic.has(vo.DressType))
                    this.dressByTypeDic.getNumberKey(vo.DressType).push(vo);
                else
                    this.dressByTypeDic.addNumberKey(vo.DressType, [vo]);
                if (saveedTypes.indexOf(vo.DressType) == -1) {
                    saveedTypes.push(vo.DressType);
                    this.dressTypeTabs.push({ label: DressType.GetDressTypeName(vo.DressType), value: vo.DressType });
                }
            });
        }
        let dressPartConf = data.DressPartConf;
        if (dressPartConf) {
            let vo:DressPartVO;
            dressPartConf.forEach(element => {
                vo = new DressPartVO();
                ObjUtil.copyObj(element, vo);
                this.dressPartDic.addNumberKey(vo.PartID, vo);
            });
        }
        if (this.dressTypeTabs.length > 0) {
            this.dressTypeTabs.sort(function (a, b) {
                return DressType.GetDressTypeSort(a.value) - DressType.GetDressTypeSort(b.value);
            });
        }
    }
}