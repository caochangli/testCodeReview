import Crypt from "../net/Crypt";
import ByteArray from "./../utils/ByteArray";
import ConfigerManager from "./ConfigerManager";
/*
* 配置文件解析基类
*/
export default class ConfigerBase extends Laya.EventDispatcher 
{
    /** 配置名称 */
    public configName: string = "";

    // protected aesUtils: AESUtils;
    protected crypt:Crypt;

    public promptlyParse:boolean = false;

    public data:any;

    constructor(configName:string) 
    {
        super();
        this.configName = configName;
    }

    /** 解析配置 */
    public WorkParse(data:any,worker:any):void  
    {
        if (!data)  {
            console.log("配置解析出错：" + this.configName);
        }
        if (data instanceof ArrayBuffer)  {
            // if (!this.aesUtils)
            //     this.aesUtils = new AESUtils();
            // // let baseData = CtrUtil.Ctr.Ofb_Dec(data);
            // let baseData = this.aesUtils.Ofb_Dec(data);
            if (!this.crypt)
                this.crypt = Crypt.GetInstance();
            let baseData = this.crypt.Ofb_Dec(data);
            let inflate = new Zlib.Gunzip(baseData);
            let plain: Uint8Array = inflate.decompress();
            if(worker){
                worker.onmessage = function (e) {
                    if(this.promptlyParse)
                    {
                        this.ParseConfig(e.data);
                    }
                    else
                    {
                        this.data = e.data;
                    }
                    this.event(ConfigerManager.CONFIG_PARSE_COMPLETE,worker);
                }.bind(this);
                worker.postMessage({name:this.configName,buffer:plain.buffer},[plain.buffer]);
            }else{
                let result: ByteArray = new ByteArray();
                result.endian = Laya.Byte.LITTLE_ENDIAN;
                result.writeArrayBuffer(plain.buffer);
                result.pos = 0;
                let str: string = result.readUTFBytes(result.length);
                try {
                    data = JSON.parse(str);
                } catch (e) {
                    console.log("json解析出错:" + this.configName, e);
                }
                
                if(this.promptlyParse)
                {
                    this.ParseConfig(data);
                }
                else
                {
                    this.data = data;
                }
                // this.ParseConfig(data);
            }
            
        } else {
            if(this.promptlyParse)
            {
                this.ParseConfig(data);
            }
            else
            {
                this.data = data;
            }
            // this.ParseConfig(data);
        }
        return data;
    }

    /**解析二进制文件 - 部分单独解析文件使用*/
    protected parseBuffer(data: any): any  
    {
        if (data instanceof ArrayBuffer)  {
            // if (!this.aesUtils)
            //     this.aesUtils = new AESUtils();
            // let baseData = CtrUtil.Ctr.Ofb_Dec(data);
            // let baseData = this.aesUtils.Ofb_Dec(data);
            if (!this.crypt)
                this.crypt = Crypt.GetInstance();
            let baseData = this.crypt.Ofb_Dec(data);
            let inflate = new Zlib.Gunzip(baseData);
            let plain: Uint8Array = inflate.decompress();
            let result: ByteArray = new ByteArray();
            result.endian = Laya.Byte.LITTLE_ENDIAN;
            result.writeArrayBuffer(plain.buffer);
            result.pos = 0;
            let str: string = result.readUTFBytes(result.length);
            try {
                data = JSON.parse(str);
            } catch (e) {
                console.log("json解析出错:" + this.configName, e);
            }
        }
        return data;
    }

    /** 解析配置 */
    public ParseConfig(data: any): any  {
        if (!data)  {
            console.log("配置解析出错：" + this.configName);
        }

        this.data = null;
        return data;
    }

    public toString(): string  {
        return this.configName;
    }
}