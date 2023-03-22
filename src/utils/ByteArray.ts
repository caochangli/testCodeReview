/*
* 封装ByteArray继承Laya.Byte 实现部分缺失功能
* Created by caochangli on 2017-11-07. 
*/
export default class ByteArray extends Laya.Byte
{
    constructor(data?: any)
    {
        super(data);
    }

    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
     * @param value	需要写入的 Int16 值。
     */
    public writeShort(value:number):void
	{
		this.writeInt16(value);
	}

    /**
     * 从字节流的当前字节偏移量位置处读取一个 Int16 值。
     * @return Int16 值。
     */
    public readShort():number
	{
		return this.getInt16();
	}

    /**
     * 在字节流的当前字节偏移量位置处写入 Uint32 值。
     * @param value 需要写入的 Uint32 值。
     */
    public writeUnsignedInt(value:number):void
	{
		this.writeUint32(value);
	}

    /**
     * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
     * @return Uint32 值。
     */
    public readUnsignedInt():number
	{
		return this.getUint32();
	}

    /**
     * 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
     * @return Uint16 值。
     */
    public readUnsignedShort():number
	{
		return this.getUint16();
	}

    public writeUnsignedShort(val:number):void{
        this.writeUint16(val);
    }

    /**
     * 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
     * @param value 需要写入的 Int32 值。
     */
    public writeInt(value:number):void
	{
		this.writeInt32(value);
	}

    /**
     * 从字节流的当前字节偏移量位置处读取一个 Int32 值。
     * @return Int32 值。
     */
    public readInt():number
	{
		return this.getInt32();
	}

    /**
     * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
     * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
     */
    public writeBoolean(value:boolean):void
	{
		this.writeByte(value ? 1 : 0);
	}

    /**
     * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
     * @return 如果字节不为零，则返回 true，否则返回 false
     */
	public readBoolean():boolean
	{
        return (this.readByte() != 0);
	}

    /**
     * 从字节流中读取无符号的字节
     * @return 介于 0 和 255 之间的 32 位无符号整数
     */
    public readUnsignedByte():number
	{
		return this.getUint8();
	}

     /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value 双精度（64 位）浮点数
     */
    public writeDouble(value:number):void
	{
		this.writeFloat64(value);
	}

    /**
     * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
     * @return 双精度（64 位）浮点数
     */
	public readDouble():number
	{
		return this.getFloat64();
	}

    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
     * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
     * @param bytes ByteArray 对象
     * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
     * @param length 一个无符号整数，表示在缓冲区中的写入范围
     */
    public writeBytes(bytes:ByteArray, offset:number = 0, length:number = 0):void 
    {
        if (offset < 0 || length < 0) throw "writeBytes error - Out of bounds";
        if (length == 0) length = bytes.length - offset;
        this["_ensureWrite"] (this._pos_ + length);
        this._u8d_.set(bytes._u8d_.subarray (offset, offset + length), this._pos_);
        this._pos_ += length;
    }

    /**
     * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
     * @param bytes 要将数据读入的 ByteArray 对象
     * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
     * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
     */
    public readBytes(bytes:ByteArray, offset:number = 0, length:number = 0):void
    {
        if (offset < 0 || length < 0) throw "Read error - Out of bounds";
        if (length == 0) length = this._length - this._pos_;
        bytes["_ensureWrite"] (offset + length);
        bytes._u8d_.set(this._u8d_.subarray(this._pos_, this._pos_ + length), offset);
        bytes.pos = offset;
        this._pos_ += length;
        if (bytes.pos + length > bytes.length) bytes.length = bytes.pos + length;
    }

    public writeStringByLength(value:string,length:number):void
	{
		// this.data.writeUTFBytes
		if(null == value)
		{
			value = "";
		}

		let stringBytes:ByteArray = new ByteArray();
		// if(value.length == 0)
		// {
		stringBytes.writeUTFBytes(value);
		// }
		let bomPos:number = this.GetBomPosition(stringBytes);
		if(bomPos > 0)
		{
			var bytes:ByteArray = new ByteArray();
			stringBytes.pos = bomPos;
			stringBytes.readBytes(bytes,bytes.pos,stringBytes.bytesAvailable);
			stringBytes = bytes;
		}
		stringBytes.pos = stringBytes.length;
		if(stringBytes.length < length)
		{
			var index:number = stringBytes.length;
			for(;index<length;index++)
			{
				if(index < length-1)
				{
					stringBytes.writeByte(0x00);
				}
				else
				{
					stringBytes.writeByte(0xCC);
				}
			}
		}
		else if(stringBytes.length > length)
		{
			stringBytes.length = length;
		}
		
		this.writeBytes(stringBytes);
	}

    public readStringByLength(length:number):string
	{
		let result:string = "";
		// 统计有效字符的长度
		var charCount:number = 0;
		var pos:number = this.pos;
		var byteValue:number;
		for(;charCount<length;charCount++)
		{
			byteValue = this.readByte();
			if(byteValue == 0)
			{
				break;
			}
		}
		
		// 读取字符串
		this.pos = pos;
		result = this.readUTFBytes(length);
		return result;
	}

    private GetBomPosition(bytes:ByteArray):number
	{
		var curPos:number = bytes.pos;
		
		bytes.pos = 0;
		var bom1:number = bytes.bytesAvailable?bytes.readUnsignedByte():0;
		var bom2:number = bytes.bytesAvailable?bytes.readUnsignedByte():0;
		var bom3:number = bytes.bytesAvailable?bytes.readUnsignedByte():0;
		
		var pos:number = 0;
		
		// 忽略 UTF-8 的 BOM 标记 EF BB BF
		if(bom1 == 0xEF && bom2 == 0xBB && bom3 == 0xBF)
		{
			pos = 3;
		}
		// Big-Endian
		else if(bom1 == 0xFE && bom2 == 0xFF)
		{
			pos = 2;
		}
		// Little-Endian
		else if(bom1 == 0xFF && bom2 == 0xFE)
		{
			pos = 2;
		}
		// Android 从输入框中输入的文本，前面会带有这个标记
		else if(bom1 == 0x3F)
		{
			pos = 1;
		}
		
		bytes.pos = curPos;
		
		return pos;
	}
}