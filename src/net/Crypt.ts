
import RES from "../res/RES";
import AESUtils from "./AESUtils";

export default class Crypt extends AESUtils
{
    constructor()
    {
        super();
    }

    public static GetInstance():any
    {
        // if (!this.IsWasmCrypt)
            return new Crypt();
        // else
        //     return CtrUtil.Ctr;
    }

    /**是否采用wasm加解密*/
    public static get IsWasmCrypt():boolean
    {
        // if (!Laya.Browser.window.WebAssembly || ChannelUtils.IsQQ || ChannelUtils.IsQQLobby)
        //     return false;
        // return true;
        return false;
    }

    /**切换加解密资源*/
    public static SwitchCryptRes(groupName:string):void
    {
        let item = RES.GetResourceItem(groupName);
        if (!item) return;
        let repl:string = this.IsWasmCrypt ? ".sgs" : "_a.sgs";
        if (item.type != "arraybuffer")//原始资源切换(ViewTipConfig_json)
        {
            item.type = "arraybuffer";
            item.url = item.url.replace(".json", repl);
        }
        else//Config_sgs、Proto_sgs
        {
            item.url = item.url.replace(".sgs", repl);
        }
    }
}