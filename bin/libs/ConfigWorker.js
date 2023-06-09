


// 方式2用worker做 二进制转字符串 字符串转json
// onmessage = function (e) {
//     // var data = e.data.buffer;
//     var data = e.data.buffer;
//     console.log("before send to main---%s----%d", e.data.name, data.byteLength);    
//     var time = new Date().getTime();
//     var result = new Byte();
//     result.endian = Byte.LITTLE_ENDIAN;
//     result.writeArrayBuffer(data);
//     result.pos = 0;
//     var str = result.readUTFBytes();
//     console.log("读写数据消耗：---%s-----%d",e.data.name,new Date().getTime() - time);
//     time = new Date().getTime();
//     if (str) {        
//         let obj = JSON.parse(str);
//         console.log("json转换消耗：---%s-----%d",e.data.name,new Date().getTime() - time);
//         // console.log("before send to main---%s----%d", e.data.name, data.byteLength);
//         postMessage(obj, [data]);
//         // console.log("after send to main---%s----%d", e.data.name, data.byteLength);
//     }
//     else {
//         postMessage(null);
//     }
// }

onmessage = function (e) {
    // var data = e.data.buffer;
    var data = e.data.buffer;
    // console.log("before send to main---%s----%d", e.data.name, data.byteLength);    
    var time = new Date().getTime();
    if (FileReader) {
        var reader = new FileReader();
        reader.readAsText(new Blob([data]), "utf8");
        reader.onload = function () {
            // console.log("读写数据消耗：---%s-----%d", e.data.name, new Date().getTime() - time);
            time = new Date().getTime();
            var str = this.result;
            if (str) {
                var obj = JSON.parse(str);
                // console.log("json转换消耗：---%s-----%d", e.data.name, new Date().getTime() - time);
                postMessage(obj, [data]);
                // console.log("after send to main---%s----%d", e.data.name, data.byteLength);
            }
            else {
                postMessage(null);
            }
        }
    } else {
        var result = new Byte();
        result.endian = Byte.LITTLE_ENDIAN;
        result.writeArrayBuffer(data);
        result.pos = 0;
        var str = result.readUTFBytes();
        // console.log("读写数据消耗：---%s-----%d", e.data.name, new Date().getTime() - time);
        time = new Date().getTime();
        if (str) {
            var obj = JSON.parse(str);
            // console.log("json转换消耗：---%s-----%d", e.data.name, new Date().getTime() - time);
            postMessage(obj, [data]);
            // console.log("after send to main---%s----%d", e.data.name, data.byteLength);
        }
        else {
            postMessage(null);
        }
    }

}

// 方式2 变种 用worker做 二进制转字符串
// onmessage = function(e) {
//     var data = e.data;
//     // console.log("解析");
//     // var str = data.readUTFBytes(data.length);
//     // postMessage("test1");
//     var result = new Byte();
//     result.endian = Byte.LITTLE_ENDIAN;
//     result.writeArrayBuffer(data);
//     result.pos = 0;
//     var str = result.readUTFBytes(result.length);
//     postMessage(str)
// }
var __propun = { writable: true, enumerable: false, configurable: true };
/**
*<p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
*<p><b>注意：</b> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
*/
//class laya.utils.Byte
var Byte = (function () {
    function Byte(data) {
		/**
		*@private
		*是否为小端数据。
		*/
        this._xd_ = true;
        this._allocated_ = 8;
		/**
		*@private
		*原始数据。
		*/
        //this._d_=null;
		/**
		*@private
		*DataView
		*/
        //this._u8d_=null;
        /**@private */
        this._pos_ = 0;
        /**@private */
        this._length = 0;
        if (data) {
            this._u8d_ = new Uint8Array(data);
            this._d_ = new DataView(this._u8d_.buffer);
            this._length = this._d_.byteLength;
        } else {
            this.___resizeBuffer(this._allocated_);
        }
    }
    var __proto = Byte.prototype;
    /**@private */
    __proto.___resizeBuffer = function (len) {
        try {
            var newByteView = new Uint8Array(len);
            if (this._u8d_ != null) {
                if (this._u8d_.length <= len) newByteView.set(this._u8d_);
                else newByteView.set(this._u8d_.subarray(0, len));
            }
            this._u8d_ = newByteView;
            this._d_ = new DataView(newByteView.buffer);
        } catch (err) {
            throw "___resizeBuffer err:" + len;
        }
    }

	/**
	*@private
	*读取指定长度的 UTF 型字符串。
	*@param len 需要读取的长度。
	*@return 读取的字符串。
	*/
    __proto.rUTF = function (len) {
        var v = "", max = this._pos_ + len, c = 0, c2 = 0, c3 = 0, f = String.fromCharCode;
        var u = this._u8d_, i = 0;
        while (this._pos_ < max) {
            c = u[this._pos_++];
            if (c < 0x80) {
                if (c != 0) {
                    v += f(c);
                }
            } else if (c < 0xE0) {
                v += f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
            } else if (c < 0xF0) {
                c2 = u[this._pos_++];
                v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
            } else {
                c2 = u[this._pos_++];
                c3 = u[this._pos_++];
                v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[this._pos_++] & 0x7F));
            }
            i++;
        }
        return v;
    }

	/**
	*@private
	*读取 <code>len</code> 参数指定的长度的字符串。
	*@param len 要读取的字符串的长度。
	*@return 指定长度的字符串。
	*/
    __proto.getCustomString = function (len) {
        var v = "", ulen = 0, c = 0, c2 = 0, f = String.fromCharCode;
        var u = this._u8d_, i = 0;
        while (len > 0) {
            c = u[this._pos_];
            if (c < 0x80) {
                v += f(c);
                this._pos_++;
                len--;
            } else {
                ulen = c - 0x80;
                this._pos_++;
                len -= ulen;
                while (ulen > 0) {
                    c = u[this._pos_++];
                    c2 = u[this._pos_++];
                    v += f((c2 << 8) | c);
                    ulen--;
                }
            }
        }
        return v;
    }

	/**
	*清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
	*/
    __proto.clear = function () {
        this._pos_ = 0;
        this.length = 0;
    }

	/**
	*@private
	*获取此对象的 ArrayBuffer 引用。
	*@return
	*/
    __proto.__getBuffer = function () {
        return this._d_.buffer;
    }

	/**
	*<p>将 UTF-8 字符串写入字节流。类似于 writeUTF()方法，但 writeUTFBytes()不使用 16 位长度的字为字符串添加前缀。</p>
	*<p>对应的读取方法为： getUTFBytes 。</p>
	*@param value 要写入的字符串。
	*/
    __proto.writeUTFBytes = function (value) {
        value = value + "";
        for (var i = 0, sz = value.length; i < sz; i++) {
            var c = value.charCodeAt(i);
            if (c <= 0x7F) {
                this.writeByte(c);
            } else if (c <= 0x7FF) {
                this.ensureWrite(this._pos_ + 2);
                this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 2;
            } else if (c <= 0xFFFF) {
                this.ensureWrite(this._pos_ + 3);
                this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 3;
            } else {
                this.ensureWrite(this._pos_ + 4);
                this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 4;
            }
        }
    }

	/**
	*<p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
	*<p>对应的读取方法为： getUTFString 。</p>
	*@param value 要写入的字符串值。
	*/
    __proto.writeUTFString = function (value) {
        var tPos = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        var dPos = this.pos - tPos - 2;
        if (dPos >= 65536) {
            throw "writeUTFString byte len more than 65536";
        }
        this._d_.setUint16(tPos, dPos, this._xd_);
    }

	/**
	*@private
	*读取 UTF-8 字符串。
	*@return 读取的字符串。
	*/
    __proto.readUTFString = function () {
        return this.readUTFBytes(this.getUint16());
    }

	/**
	*<p>从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。</p>
	*<p>对应的写入方法为： writeUTFString 。</p>
	*@return 读取的字符串。
	*/
    __proto.getUTFString = function () {
        return this.readUTFString();
    }

	/**
	*@private
	*读字符串，必须是 writeUTFBytes 方法写入的字符串。
	*@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	*@return 读取的字符串。
	*/
    __proto.readUTFBytes = function (len) {
        (len === void 0) && (len = -1);
        if (len == 0) return "";
        var lastBytes = this.bytesAvailable;
        if (len > lastBytes) throw "readUTFBytes error - Out of bounds";
        len = len > 0 ? len : lastBytes;
        return this.rUTF(len);
    }

	/**
	*<p>从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。</p>
	*<p>一般读取的是由 writeUTFBytes 方法写入的字符串。</p>
	*@param len 要读的buffer长度，默认将读取缓冲区全部数据。
	*@return 读取的字符串。
	*/
    __proto.getUTFBytes = function (len) {
        (len === void 0) && (len = -1);
        return this.readUTFBytes(len);
    }

	/**
	*<p>在字节流中写入一个字节。</p>
	*<p>使用参数的低 8 位。忽略高 24 位。</p>
	*@param value
	*/
    __proto.writeByte = function (value) {
        this.ensureWrite(this._pos_ + 1);
        this._d_.setInt8(this._pos_, value);
        this._pos_ += 1;
    }

	/**
	*@private
	*从字节流中读取带符号的字节。
	*/
    __proto.readByte = function () {
        if (this._pos_ + 1 > this._length) throw "readByte error - Out of bounds";
        return this._d_.getInt8(this._pos_++);
    }

	/**
	*<p>从字节流中读取带符号的字节。</p>
	*<p>返回值的范围是从-128 到 127。</p>
	*@return 介于-128 和 127 之间的整数。
	*/
    __proto.getByte = function () {
        return this.readByte();
    }

	/**
	*<p>保证该字节流的可用长度不小于 <code>lengthToEnsure</code> 参数指定的值。</p>
	*@param lengthToEnsure 指定的长度。
	*/
    __proto.ensureWrite = function (lengthToEnsure) {
        if (this._length < lengthToEnsure) this._length = lengthToEnsure;
        if (this._allocated_ < lengthToEnsure) this.length = lengthToEnsure;
    }

	/**
	*<p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
	*<p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
	*<p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
	*$NEXTBIG 由于没有判断length和arraybuffer的合法性，当开发者填写了错误的length值时，会导致写入多余的空白数据甚至内存溢出，为了避免影响开发者正在使用此方法的功能，下个重大版本会修复这些问题。
	*@param arraybuffer 需要写入的 Arraybuffer 对象。
	*@param offset Arraybuffer 对象的索引的偏移量（以字节为单位）
	*@param length 从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
	*/
    __proto.writeArrayBuffer = function (arraybuffer, offset, length) {
        (offset === void 0) && (offset = 0);
        (length === void 0) && (length = 0);
        if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
        if (length == 0) length = arraybuffer.byteLength - offset;
        this.ensureWrite(this._pos_ + length);
        var uint8array = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }

	/**
	*获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
	*/
    __getset(0, __proto, 'buffer', function () {
        var rstBuffer = this._d_.buffer;
        if (rstBuffer.byteLength == this.length) return rstBuffer;
        return rstBuffer.slice(0, this.length);
    });

	/**
	*<p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
	*<p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
	*<p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
	*<code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
	*/
    __getset(0, __proto, 'endian', function () {
        return this._xd_ ? "littleEndian" : "bigEndian";
    }, function (endianStr) {
        this._xd_ = (endianStr == "littleEndian");
    });

	/**
	*<p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
	*<p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
	*<p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
	*/
    __getset(0, __proto, 'length', function () {
        return this._length;
    }, function (value) {
        if (this._allocated_ < value)
            this.___resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
        else if (this._allocated_ > value)
            this.___resizeBuffer(this._allocated_ = value);
        this._length = value;
    });

	/**
	*移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
	*/
    __getset(0, __proto, 'pos', function () {
        return this._pos_;
    }, function (value) {
        this._pos_ = value;
    });

	/**
	*可从字节流的当前位置到末尾读取的数据的字节数。
	*/
    __getset(0, __proto, 'bytesAvailable', function () {
        return this._length - this._pos_;
    });

    Byte.getSystemEndian = function () {
        if (!Byte._sysEndian) {
            var buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? /*CLASS CONST:laya.utils.Byte.LITTLE_ENDIAN*/"littleEndian" :/*CLASS CONST:laya.utils.Byte.BIG_ENDIAN*/"bigEndian";
        }
        return Byte._sysEndian;
    }

    Byte.BIG_ENDIAN = "bigEndian";
    Byte.LITTLE_ENDIAN = "littleEndian";
    Byte._sysEndian = null;
    return Byte;
})()

function __getset(isStatic, o, name, getfn, setfn) {
    if (!isStatic) {
        getfn && un(o, '_$get_' + name, getfn);
        setfn && un(o, '_$set_' + name, setfn);
    }
    else {
        getfn && (o['_$GET_' + name] = getfn);
        setfn && (o['_$SET_' + name] = setfn);
    }
    if (getfn && setfn)
        Object.defineProperty(o, name, { get: getfn, set: setfn, enumerable: false, configurable: true });
    else {
        getfn && Object.defineProperty(o, name, { get: getfn, enumerable: false, configurable: true });
        setfn && Object.defineProperty(o, name, { set: setfn, enumerable: false, configurable: true });
    }
}

function un(obj, name, value) {
    value || (value = obj[name]);
    __propun.value = value;
    Object.defineProperty(obj, name, __propun);
    return value;
}