import ByteArray from "../utils/ByteArray";

/*
* aes加密解密;
*/
export default class AESUtils
{
    private encryptCounter:aesjs.Counter;
    private decryptCounter:aesjs.Counter;
    private encrypt:aesjs.ModeOfOperation.ctr;
    private decrypt:aesjs.ModeOfOperation.ctr;
    private jofb:aesjs.ModeOfOperation.cfb;
    constructor(){

    }
    /**
     * 密钥和向量初始化
     */
    public Init():void{
        var myKey = new Uint8Array([
            0x47, 0x72, 0x45, 0x6b, 0x55, 0x50, 0x37, 0x78,
            0x61, 0x4e, 0x3f, 0x26, 0x72, 0x65, 0x51, 0x3d,
            0x6a, 0x45, 0x66, 0x72, 0x61, 0x74, 0x68, 0x65,
            0x77, 0x35, 0x65, 0x47, 0x35, 0x51, 0x45, 0x64,
	    ]);
        let iv1 = new Uint8Array([
            0x74, 0x65, 0x42, 0x37, 0x24, 0x46, 0x35, 0x53,
            0x23, 0x75, 0x66, 0x61, 0x6d, 0x55, 0x6d, 0x42,
        ]);
        let iv2 = new Uint8Array([
            0x74, 0x65, 0x42, 0x37, 0x24, 0x46, 0x35, 0x53,
            0x23, 0x75, 0x66, 0x61, 0x6d, 0x55, 0x6d, 0x42,
        ]);
        
        this.encryptCounter = new aesjs.Counter(iv1,1);
        this.decryptCounter = new aesjs.Counter(iv2,2);
        this.encrypt = new aesjs.ModeOfOperation.ctr(myKey, this.encryptCounter);
        this.decrypt = new aesjs.ModeOfOperation.ctr(myKey, this.decryptCounter);
    }

    /**重置*/
    public Reset():void
    {
        this.Init();
    }

    /**加密*/
    public Encrypt(buffer:ArrayBuffer):Uint8Array
    {
        if(this.encrypt){
            let uint8:Uint8Array = this.encrypt.encrypt(new Uint8Array(buffer));
            return  uint8;
        }
        return null;
    }

    /** 解密*/
    public Decrypt(buffer:ArrayBuffer):Uint8Array
    {
        if(this.decrypt){
            let uint8:Uint8Array = this.decrypt.decrypt(new Uint8Array(buffer));
            return  uint8;
        }
        return null;
    }

    protected InitOfb():void{
        var cbck = [ 0x14, 0x33, 0x45, 0x6b, 0x55, 0x5e, 0x37, 0x78,
    			0x61, 0x4e, 0x3f, 0x2d, 0x72, 0x65, 0x51, 0x3d ];
        var cbciv:Float32Array = new Float32Array([ 0x89, 0x65, 0x3e, 0x37, 0x24, 0x46, 0x56, 0x45,
				0x23, 0x75, 0x43, 0x21, 0x6d, 0x55, 0x61, 0xe1 ]);
        this.jofb = new aesjs.ModeOfOperation.cfb(cbck, cbciv,16);
    }

    /**json解密*/
    public Ofb_Dec(buffer:ArrayBuffer):Uint8Array{
        if (!this.jofb) this.InitOfb();
        //解密数据要用Uint8Array//nodejs加密不用啊。。。。
        let uData:ByteArray = new ByteArray();
        let len:number = buffer.byteLength;
        uData.writeArrayBuffer(buffer);
        let count:number = 16 - len % 16;
        uData.length = count + len;
        let result:Uint8Array = this.jofb.decrypt(new Uint8Array(uData.buffer));
        return result.slice(0,len);
    }
}