import Global from "../Global";
import ConfigerBase from "./ConfigerBase";
/*
* name;
*/
export default class GlobalConfiger extends ConfigerBase
{
    constructor()
    {
        super("GlobalConfig_json");
    }

    static instance:GlobalConfiger;
    public static GetInstance():GlobalConfiger
    {
        if (GlobalConfiger.instance == null)
            GlobalConfiger.instance = new GlobalConfiger();
        if(GlobalConfiger.instance.data)
            GlobalConfiger.instance.ParseConfig(GlobalConfiger.instance.data);
        return GlobalConfiger.instance;
    }

    /** 解析配置 */
    public ParseConfig(data:any):any
    {
        data = super.ParseConfig(data);
        if (!data) return;

        Global.Init(data.ClientGlobalConf[0]);
    }
}