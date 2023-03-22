class DressVO {
    constructor() {
        this.DressID = 0;
        this.DressType = 0;
        this.Resource = "";
        this.Sort = 0;
    }
    get ResourceUrl() {
        if (this.Resource)
            return "res/assets/runtime/dress/" + this.Resource + ".png";
        return "";
    }
}

class DressPartVO {
    constructor() {
        this.PartID = 0;
        this.Resource = "";
        this.Layer = 0;
    }
    get ResourceUrl() {
        if (this.Resource)
            return "res/assets/runtime/dressPart/" + this.Resource + ".png";
        return "";
    }
}

//import SystemContext from "../SystemContext";
//import Global from "../Global";
//import ImageFlatButton from "../ui/window/ImageFlatButton";
//import ImageSpriteButton from "../ui/window/ImageSpriteButton";
//import WindowManager from "../mode/base/WindowManager";
//import PromptWindow from "../ui/window/PromptWindow";
//import PromptLayer from "../ui/layer/PromptLayer";
class UIUtils {
    constructor() {
    }
    static BgAdaptation(bg) {
        let gameWidth = SystemContext.gameWidth;
        let gameHeight = SystemContext.gameHeight;
        let bgWidth = Global.BgWidth;
        let bgHeight = Global.BgHeight;
        if (gameHeight == bgHeight) {
            bg.size(gameWidth, gameHeight);
        }
        else if (gameHeight > bgHeight) {
            let per = gameHeight / bgHeight;
            bg.size(Math.ceil(bgWidth * per), gameHeight);
        }
        else {
            bg.size(bgWidth, bgHeight);
        }
        bg.pos(gameWidth - bg.width >> 1, 0);
    }
    static CreateImageFlatButton(bgRes, textRes) {
        let btn = new ImageFlatButton();
        btn.InitSkin(bgRes);
        btn.InitTextSkin(textRes);
        return btn;
    }
    static CreateImageSpriteButton(bgRes, textRes) {
        let btn = new ImageSpriteButton();
        btn.InitSkin(bgRes);
        btn.InitTextSkin(textRes);
        return btn;
    }
    static ShowTextPrompt(msg, time = 5000) {
        if (msg)
            PromptLayer.GetInstance().ShowTextPrompt(msg, time);
    }
    static ClearTextPrompt() {
        PromptLayer.GetInstance().ClearTextPrompt();
    }
    static OpenPromptWin(title, desc, descPaddingLeft = 140, okHandler = null, cancelHandler = null, btnType = PromptWindow.BTN_TYPE1) {
        WindowManager.GetInstance().OpenWindow("PromptWindow", title, desc, descPaddingLeft, okHandler, cancelHandler, btnType);
    }
}

class StringUtils {
    constructor() {
    }
    static Format(str, ...params) {
        if (!str)
            return "";
        let len = params.length;
        let args;
        if (len == 1 && params[0] instanceof Array) {
            args = params[0];
            len = args.length;
        }
        else {
            args = params;
        }
        for (let i = 0; i < len; i++) {
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        }
        return str;
    }
    static replace(p_string, p_search, p_replace) {
        if (!p_search || p_search.length <= 0)
            return "";
        return p_string.replace(new RegExp(p_search, "gm"), p_replace);
    }
}

class StorageUtils {
    constructor() {
    }
    static addObject(key, data) {
        if (typeof (data) == "object") {
            let obj = new Object();
            obj[key] = data;
            this.addString(key, JSON.stringify(obj));
        }
        else if (typeof (data) == "number") {
            this.addNumber(key, data);
        }
        else if (typeof (data) == "boolean") {
            this.addBoolean(key, data);
        }
        else if (typeof (data) == "string") {
            this.addString(key, data);
        }
    }
    static getObject(key) {
        let str = this.getString(key);
        if (str) {
            try {
                let data = JSON.parse(str);
                if (typeof (data) == "object" && data.hasOwnProperty(key)) {
                    return data[key];
                }
            }
            catch (e) {
                console.log("获取本地存储数据错误");
            }
        }
        return null;
    }
    static addNumber(key, data) {
        this.addString(key, data.toString());
    }
    static getNumber(key) {
        if (this.getString(key) != "") {
            return Number(this.getString(key));
        }
        return 0;
    }
    static addBoolean(key, data) {
        this.addString(key, data ? "1" : "0");
    }
    static getBoolean(key) {
        if (this.getString(key) != "") {
            return this.getString(key) == "1" ? true : false;
        }
        return false;
    }
    static addString(key, data) {
        Laya.LocalStorage.setItem(key, data);
    }
    static getString(key) {
        if (Laya.LocalStorage.getItem(key)) {
            return Laya.LocalStorage.getItem(key);
        }
        return "";
    }
    static delStorage(key) {
        if (Laya.LocalStorage.getItem(key)) {
            Laya.LocalStorage.removeItem(key);
        }
    }
    static clearStorage() {
        Laya.LocalStorage.clear();
    }
}

class SgsHttpRequest extends Laya.HttpRequest {
    constructor(callback, progressCB = null) {
        super();
        if (!window["XMLHttpRequest"]) {
            this._http = new ActiveXObject("MSXML2.XMLHTTP");
            console.log("使用MSXML2.XMLHTTP");
        }
        else {
            console.log("使用XMLHttpRequest");
        }
        this.callback = callback;
        this.progressCB = progressCB;
        this.on(Laya.Event.COMPLETE, this, this.onComplete);
        this.on(Laya.Event.ERROR, this, this.onError);
    }
    Clear() {
        super.clear();
        this.callback = null;
    }
    removeEvents() {
        this.offAll("onComplete");
        this.offAll("onError");
        this.offAll(Laya.Event.COMPLETE);
        this.offAll(Laya.Event.ERROR);
    }
    onComplete(result) {
        this.event("onComplete", [this, result]);
    }
    onError(result) {
        this.event("onError", [this, result]);
    }
}

class ObjUtil {
    static copyObj(copyFrom, copyTo) {
        if (!copyFrom || !copyTo)
            return copyTo;
        const keysTo = Object.keys(copyFrom);
        for (const key of keysTo) {
            if (copyFrom[key] !== undefined) {
                copyTo[key] = copyFrom[key];
            }
        }
        return copyTo;
    }
    static deepCopy(copyFrom, copyTo) {
        if (!copyFrom || !copyTo)
            return copyTo;
        const keysTo = Object.keys(copyFrom);
        for (const key of keysTo) {
            if (copyFrom[key] !== undefined) {
                if (typeof copyFrom[key] === 'object') {
                    if (copyFrom[key] == null) {
                        copyTo[key] = null;
                    }
                    else {
                        copyTo[key] = Array.isArray(copyFrom[key]) ? [] : {};
                        copyTo[key] = this.deepCopy(copyFrom[key], copyTo[key]);
                    }
                }
                else {
                    copyTo[key] = copyFrom[key];
                }
            }
        }
        return copyTo;
    }
}

//import SgsHttpRequest from "./SgsHttpRequest";
//import SgsUpLoadHttpRequest from "./SgsUpLoadHttpRequest";
class HttpUtils {
    constructor() {
    }
    static Request(url, params, callback, method = "post", responseType = "text", headers) {
        try {
            let xhr = new SgsHttpRequest(callback);
            xhr.http.timeout = 10000;
            xhr.on("onComplete", this, this.onComplete);
            xhr.on("onError", this, this.onError);
            headers = headers || ["Content-Type", "application/x-www-form-urlencoded"];
            xhr.send(url, params, method, responseType, headers);
        }
        catch (event) {
            console.log(event);
            this.SendAjax(url, params, callback, method, responseType, headers ? headers[0] : "");
        }
    }
    static RequestWithProgress(url, params, callback, proGressCB, method = "post", responseType = "text", headers) {
        let loadReq = null;
        try {
            let xhr = new SgsUpLoadHttpRequest(callback);
            xhr.http.timeout = 10000;
            xhr.on("onComplete", this, this.onComplete);
            xhr.on("onError", this, this.onError);
            xhr.on("onProgress", this, proGressCB);
            if (!headers) {
                headers = [false, "Content-Type"];
            }
            xhr.send(url, params, method, responseType, headers);
            loadReq = xhr.http;
        }
        catch (event) {
            console.log(event);
            loadReq = this.SendAjaxWithProgress(url, params, callback, proGressCB, method, responseType, "", false);
        }
        return loadReq;
    }
    static SendAjaxWithProgress(url, params, callback, progressCB, method = "", responseType = "text", contentType = "application/x-www-form-urlencoded", processData = true) {
        if (Laya.Browser.window.sendAjax) {
            return Laya.Browser.window.sendAjax({ progressCB: progressCB, url: url, data: params, callback: callback, method: method, responseType: false, contentType: contentType, processData: processData });
        }
        return null;
    }
    static SendAjax(url, params, callback, method = "", responseType = "text", contentType = "application/x-www-form-urlencoded", processData = true) {
        if (Laya.Browser.window.sendAjax) {
            Laya.Browser.window.sendAjax({ url: url, data: params, callback: callback, method: method, responseType: responseType, contentType: contentType, processData: processData });
        }
    }
    static onComplete(target, result) {
        target.callback && target.callback(result);
        target.Clear();
        target.removeEvents();
    }
    static onError(target, result) {
        target.Clear();
        target.removeEvents();
    }
}

class HtmlUtils {
    constructor() {
    }
    static HtmlEscape(str) {
        var s = "";
        if (str == null)
            return "";
        if (str.length == 0)
            return "";
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        return s;
    }
    static HtmlUnEscape(str) {
        var s = "";
        if (str == null)
            return "";
        if (str.length == 0)
            return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
    static GetHtmlImgUrl(str) {
        let urlArr = [];
        if (!str) {
            return urlArr;
        }
        let imgReg = /<img.*?(?:>|\/>)/gi;
        let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        let arr = str.match(imgReg);
        console.log('所有已成功匹配图片的数组：' + arr);
        for (var i = 0; i < arr.length; i++) {
            var src = arr[i].match(srcReg);
            if (src[1]) {
                urlArr.push(src[1]);
            }
        }
        return urlArr;
    }
}

class FilterUtils {
    constructor() {
    }
    static GlowFilter(color, blur, offX, offY) {
        return new Laya.GlowFilter(color, blur, offX, offY);
    }
    static GetGrayFilter() {
        if (!FilterUtils.grayFilter) {
            FilterUtils.grayFilter = [];
            var colorMatrix = [0.3086, 0.6094, 0.0820, 0, 0,
                0.3086, 0.6094, 0.0820, 0, 0,
                0.3086, 0.6094, 0.0820, 0, 0,
                0, 0, 0, 1, 0,
            ];
            FilterUtils.grayFilter.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.grayFilter;
    }
    static GetBlackWhiteFilter() {
        if (!FilterUtils.blackWhiteFilter) {
            FilterUtils.blackWhiteFilter = [];
            var colorMatrix = [0.2, 0.6, 0, 0, 0,
                0.2, 0.6, 0, 0, 0,
                0.2, 0.6, 0, 0, 0,
                0, 1, 0, 1, 0];
            FilterUtils.blackWhiteFilter.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.blackWhiteFilter;
    }
    static GetBlackSilhouetteFilter() {
        if (!FilterUtils.blackSilhouette) {
            FilterUtils.blackSilhouette = [];
            var colorMatrix = [0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 1, 0, 1, 0];
            FilterUtils.blackSilhouette.push(new Laya.ColorFilter(colorMatrix));
        }
        return FilterUtils.blackSilhouette;
    }
}

//import SgsSkeletonEffect from "../ui/controls/base/SgsSkeletonEffect";
class EffectUtils {
    constructor() {
    }
    static GetSkeletonEffect(autoRecoverSelf = false, autoClearTemplet = false, clearTempletFollow = "", forceFllowTarget = null, poolSign = "", clearPoolFollow = "", poolCount = 0) {
        let effect;
        if (poolSign) {
            effect = Laya.Pool.getItemByClass(poolSign, SgsSkeletonEffect);
            effect.poolStrategy(poolSign, clearPoolFollow, poolCount);
        }
        else {
            effect = new SgsSkeletonEffect();
        }
        effect.autoRecoverSelf = autoRecoverSelf;
        effect.forceFllowTarget = forceFllowTarget;
        effect.autoClearTemplet = autoClearTemplet;
        effect.clearTempletFollow = clearTempletFollow;
        return effect;
    }
    static ClearSkeletonEffectPool(poolSign) {
        let pools = Laya.Pool.getPoolBySign(poolSign);
        if (!pools)
            return;
        let length = pools.length;
        if (length > 0) {
            let effect;
            for (let i = 0; i < length; i++) {
                effect = pools[i];
                if (effect)
                    effect.destroy();
            }
            pools = null;
            Laya.Pool.clearBySign(poolSign);
        }
        let dic = Laya.Pool["_poolDic"];
        if (dic)
            delete dic[poolSign];
    }
}

class Dictionary {
    constructor(list) {
        this._count = 0;
        this._maps = {};
        this._objKeys = [];
        this._objDatum = [];
        if (list != null) {
            this.addList(list);
        }
    }
    get Maps() {
        return this._maps;
    }
    addList(list) {
        let length = list.length;
        let value;
        for (let i = 0; i < length; i++) {
            value = list[i];
            this.add(value.key, value.data);
        }
    }
    addNumberKey(key, data) {
        if (null == this._maps[key]) {
            this._count++;
        }
        this._maps[key] = data;
    }
    getNumberKey(key) {
        return this._maps[key];
    }
    addStringKey(key, data) {
        if (null == this._maps[key]) {
            this._count++;
        }
        this._maps[key] = data;
    }
    getStringKey(key) {
        return this._maps[key];
    }
    add(key, data) {
        if (typeof (key) != "object") {
            if (null == this._maps[key]) {
                this._count++;
            }
            this._maps[key] = data;
        }
        else {
            var index = this._objKeys.lastIndexOf(key);
            if (index == -1) {
                this._objKeys.push(key);
                this._objDatum.push(data);
                this._count++;
            }
            else {
                this._objDatum[index] = data;
            }
        }
    }
    del(key) {
        var index;
        if (typeof (key) != "object") {
            if (null != this._maps[key]) {
                delete this._maps[key];
                this._count--;
            }
        }
        else {
            index = this._objKeys.lastIndexOf(key);
            if (index != -1) {
                this._objKeys.splice(index, 1);
                this._objDatum.splice(index, 1);
                this._count--;
            }
        }
    }
    get(key) {
        if (typeof (key) != "object") {
            return this._maps[key];
        }
        else {
            var index = this._objKeys.lastIndexOf(key);
            if (index != -1) {
                return this._objDatum[index];
            }
            return null;
        }
    }
    has(key) {
        if (typeof (key) != "object") {
            return this._maps[key] ? true : false;
        }
        else {
            var index = this._objKeys.lastIndexOf(key);
            if (index != -1) {
                return true;
            }
            return false;
        }
    }
    get count() {
        return this._count;
    }
    forEach(callback, thisObject = null) {
        var name, arr;
        for (name in this._maps) {
            callback.call(thisObject, name, this._maps[name]);
        }
        for (var j = 0; j < this._objKeys.length; j++) {
            var key = this._objKeys[j];
            callback.call(thisObject, this._objKeys[j], this._objDatum[j]);
            if (key != this._objKeys[j]) {
                j--;
            }
        }
    }
    breakForEach(callback, thisObject = null) {
        var name, arr, isBreak;
        for (name in this._maps) {
            let result = callback.call(thisObject, name, this._maps[name]);
            if (result) {
                isBreak = true;
                break;
            }
        }
        if (!isBreak) {
            for (var j = 0; j < this._objKeys.length; j++) {
                var key = this._objKeys[j];
                let result = callback.call(thisObject, this._objKeys[j], this._objDatum[j]);
                if (key != this._objKeys[j]) {
                    j--;
                }
                if (result) {
                    break;
                }
            }
        }
    }
    get elements() {
        var _list = [];
        var name, arr;
        for (name in this._maps) {
            _list.push({ key: name, data: this._maps[name] });
        }
        var len = this._objKeys.length;
        for (var j = 0; j < len; j++) {
            _list.push({ key: this._objKeys[j], data: this._objDatum[j] });
        }
        return _list;
    }
    get keys() {
        var _list = [];
        var name;
        for (name in this._maps) {
            _list.push(name);
        }
        _list = _list.concat(this._objKeys);
        return _list;
    }
    get datum() {
        var _list = [];
        var name;
        for (name in this._maps) {
            _list.push(this._maps[name]);
        }
        _list = _list.concat(this._objDatum);
        return _list;
    }
    destroy() {
        if (this._count <= 0)
            return;
        this._maps = {};
        this._objKeys.length = 0;
        this._objDatum.length = 0;
        this._count = 0;
    }
    dump() {
        var name, arr;
        for (name in this._maps) {
            console.log("key:", name, "---> data:", this._maps[name]);
        }
        var len = this._objKeys.length;
        for (var j = 0; j < len; j++) {
            console.log("key:", typeof (this._objKeys[j]), " ---> data:", this._objDatum[j]);
        }
    }
    getValueByIndex(index) {
        return this.datum[index];
    }
    getKeyByIndex(index) {
        return this.keys[index];
    }
}

//import StringUtils from "./StringUtils";
class DateUtils {
    constructor() {
    }
    static DateFormat(date, format = "yyyy-MM-dd") {
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return format;
    }
    static TimeFormat(time, format = "yyyy-MM-dd hh:mm:ss") {
        return DateUtils.DateFormat(new Date(time * 1000), format);
    }
    static TimeStrFormat(timeStr, format = "yyyy-MM-dd hh:mm:ss") {
        let date = DateUtils.StringFormatToDate(timeStr);
        return DateUtils.DateFormat(new Date(date.getTime()), format);
    }
    static StringFormatToDate(format = "YYYY-MM-DD JJ:NN:SS") {
        format = StringUtils.replace(format, "-", "/");
        let date = new Date(format);
        return date;
    }
}

class ByteArray extends Laya.Byte {
    constructor(data) {
        super(data);
    }
    writeShort(value) {
        this.writeInt16(value);
    }
    readShort() {
        return this.getInt16();
    }
    writeUnsignedInt(value) {
        this.writeUint32(value);
    }
    readUnsignedInt() {
        return this.getUint32();
    }
    readUnsignedShort() {
        return this.getUint16();
    }
    writeUnsignedShort(val) {
        this.writeUint16(val);
    }
    writeInt(value) {
        this.writeInt32(value);
    }
    readInt() {
        return this.getInt32();
    }
    writeBoolean(value) {
        this.writeByte(value ? 1 : 0);
    }
    readBoolean() {
        return (this.readByte() != 0);
    }
    readUnsignedByte() {
        return this.getUint8();
    }
    writeDouble(value) {
        this.writeFloat64(value);
    }
    readDouble() {
        return this.getFloat64();
    }
    writeBytes(bytes, offset = 0, length = 0) {
        if (offset < 0 || length < 0)
            throw "writeBytes error - Out of bounds";
        if (length == 0)
            length = bytes.length - offset;
        this["_ensureWrite"](this._pos_ + length);
        this._u8d_.set(bytes._u8d_.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }
    readBytes(bytes, offset = 0, length = 0) {
        if (offset < 0 || length < 0)
            throw "Read error - Out of bounds";
        if (length == 0)
            length = this._length - this._pos_;
        bytes["_ensureWrite"](offset + length);
        bytes._u8d_.set(this._u8d_.subarray(this._pos_, this._pos_ + length), offset);
        bytes.pos = offset;
        this._pos_ += length;
        if (bytes.pos + length > bytes.length)
            bytes.length = bytes.pos + length;
    }
    writeStringByLength(value, length) {
        if (null == value) {
            value = "";
        }
        let stringBytes = new ByteArray();
        stringBytes.writeUTFBytes(value);
        let bomPos = this.GetBomPosition(stringBytes);
        if (bomPos > 0) {
            var bytes = new ByteArray();
            stringBytes.pos = bomPos;
            stringBytes.readBytes(bytes, bytes.pos, stringBytes.bytesAvailable);
            stringBytes = bytes;
        }
        stringBytes.pos = stringBytes.length;
        if (stringBytes.length < length) {
            var index = stringBytes.length;
            for (; index < length; index++) {
                if (index < length - 1) {
                    stringBytes.writeByte(0x00);
                }
                else {
                    stringBytes.writeByte(0xCC);
                }
            }
        }
        else if (stringBytes.length > length) {
            stringBytes.length = length;
        }
        this.writeBytes(stringBytes);
    }
    readStringByLength(length) {
        let result = "";
        var charCount = 0;
        var pos = this.pos;
        var byteValue;
        for (; charCount < length; charCount++) {
            byteValue = this.readByte();
            if (byteValue == 0) {
                break;
            }
        }
        this.pos = pos;
        result = this.readUTFBytes(length);
        return result;
    }
    GetBomPosition(bytes) {
        var curPos = bytes.pos;
        bytes.pos = 0;
        var bom1 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0;
        var bom2 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0;
        var bom3 = bytes.bytesAvailable ? bytes.readUnsignedByte() : 0;
        var pos = 0;
        if (bom1 == 0xEF && bom2 == 0xBB && bom3 == 0xBF) {
            pos = 3;
        }
        else if (bom1 == 0xFE && bom2 == 0xFF) {
            pos = 2;
        }
        else if (bom1 == 0xFF && bom2 == 0xFE) {
            pos = 2;
        }
        else if (bom1 == 0x3F) {
            pos = 1;
        }
        bytes.pos = curPos;
        return pos;
    }
}

//import SystemContext from "./../../SystemContext";
//import GameEventDispatcher from "./../../event/GameEventDispatcher";
class LayerBase extends Laya.Sprite {
    constructor(layerOrder) {
        super();
        this.zOrder = layerOrder;
        this.on(Laya.Event.ADDED, this, this.onAddToStage);
        this.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }
    get LayerOrder() {
        return this.zOrder;
    }
    onAddToStage(event) {
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onGameResize);
        GameEventDispatcher.GetInstance().on(GameEventDispatcher.GAME_ADAPTATION, this, this.onGameAdaptation);
        this.onGameResize();
        this.onGameAdaptation();
    }
    onRemoveToStage(event) {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onGameResize);
        GameEventDispatcher.GetInstance().off(GameEventDispatcher.GAME_ADAPTATION, this, this.onGameAdaptation);
    }
    addChild(child) {
        var addChild = super.addChild(child);
        this.addChildToLayer();
        return addChild;
    }
    addChildAt(node, index) {
        var addChild = super.addChildAt(node, index);
        this.addChildToLayer();
        return addChild;
    }
    addChildren(...args) {
        super.addChildren(...args);
        this.addChildToLayer();
    }
    removeChild(child) {
        var removeChild = super.removeChild(child);
        this.removeChildToLayer();
        return removeChild;
    }
    removeChildAt(index) {
        var removeChild = super.removeChildAt(index);
        this.removeChildToLayer();
        return removeChild;
    }
    removeChildByName(name) {
        var removeChild = super.removeChildByName(name);
        this.removeChildToLayer();
        return removeChild;
    }
    removeChildren(beginIndex, endIndex) {
        var removeChild = super.removeChildren(beginIndex, endIndex);
        this.removeChildToLayer();
        return removeChild;
    }
    addChildToLayer() {
        if (this && !this.parent && this.numChildren > 0)
            Laya.stage.addChild(this);
    }
    removeChildToLayer() {
        if (this && this.parent && this.numChildren <= 0)
            Laya.stage.removeChild(this);
    }
    onGameResize() {
        if (!this.scrollRect) {
            this.scrollRect = new Laya.Rectangle(0, 0, SystemContext.gameWidth, SystemContext.gameHeight);
        }
        else {
            this.scrollRect.width = SystemContext.gameWidth;
            this.scrollRect.height = SystemContext.gameHeight;
        }
    }
    onGameAdaptation() {
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class BottomLayer extends LayerBase {
    constructor() {
        super(LayerOrder.BottomLayer);
    }
    static GetInstance() {
        if (null == BottomLayer.instance) {
            BottomLayer.instance = new BottomLayer();
        }
        return BottomLayer.instance;
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class BackgroundLayer extends LayerBase {
    constructor() {
        super(LayerOrder.BackgroundLayer);
    }
    static GetInstance() {
        if (null == BackgroundLayer.instance) {
            BackgroundLayer.instance = new BackgroundLayer();
        }
        return BackgroundLayer.instance;
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class AnimationLayer extends LayerBase {
    constructor() {
        super(LayerOrder.AnimationLayer);
    }
    static GetInstance() {
        if (null == AnimationLayer.instance) {
            AnimationLayer.instance = new AnimationLayer();
        }
        return AnimationLayer.instance;
    }
}

class DressTabPanel extends Laya.Panel {
    constructor() {
        super();
    }
    onScrollBarChange(scrollBar) {
        super.onScrollBarChange(scrollBar);
        this.event("scrollChange");
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import RES from "../../res/RES";
class DressAvatarLoad extends Laya.EventDispatcher {
    constructor() {
        super();
        this.loadedCount = 0;
        this.resources = [];
    }
    get DressVO() {
        return this.dressVo;
    }
    LoadDressPartRes(dressVo) {
        this.CancelDressPartRes();
        this.dressVo = dressVo;
        let dressConfig = DressConfiger.GetInstance();
        let dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
        if (dressParts && dressParts.length > 0) {
            let resourceUrl = "";
            dressParts.forEach(dressPartVo => {
                resourceUrl = dressPartVo.ResourceUrl;
                if (resourceUrl)
                    this.resources.push(resourceUrl);
            });
        }
        if (this.resources.length > 0) {
            this.resources.forEach(element => {
                RES.AddReference(element);
                RES.GetResByUrl(element, this, this.onLoadComplete, "image");
            });
        }
        else {
            this.event(Laya.Event.COMPLETE, this);
            this.dressVo = null;
        }
    }
    CancelDressPartRes() {
        if (this.resources.length > 0) {
            this.resources.forEach(element => {
                RES.DelReference(element);
                RES.CancelGetResByUrl(element, this, this.onLoadComplete);
                RES.ClearResByUrl(element);
            });
            this.resources.length = 0;
        }
        this.loadedCount = 0;
        this.dressVo = null;
    }
    onLoadComplete(texture, key) {
        if (this.resources.indexOf(key) == -1)
            return;
        this.loadedCount++;
        if (this.loadedCount >= this.resources.length) {
            this.event(Laya.Event.COMPLETE, this);
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

class ViewStack {
    constructor(render) {
        this._x = 0;
        this._y = 0;
        this._selectedIndex = -1;
        this.render = render;
        if (this.render)
            this.render.on("destroyEvent", this, this.onFollowDestroy);
    }
    set x(value) {
        this.pos(value, this._y);
    }
    get x() {
        return this._x;
    }
    set y(value) {
        this.pos(this._x, value);
    }
    get y() {
        return this._y;
    }
    pos(x, y) {
        if (this._x == x && this._y == y)
            return;
        this._x = x >> 0;
        this._y = y >> 0;
        this.resetChildsPos();
    }
    set childList(value) {
        this.clearChilds();
        if (!value || value.length <= 0)
            return;
        this._childList = [];
        this._childUIList = [];
        for (let i = 0; i < value.length; i++) {
            this._childList.push(value[i]);
            this._childUIList.push(null);
        }
    }
    set childInitDataList(value) {
        if (!value || value.length <= 0)
            return;
        this._childInitDataList = [];
        for (let i = 0; i < value.length; i++) {
            this._childInitDataList.push(value[i]);
        }
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this.selectedIndex == value)
            return;
        this._selectedIndex = value;
        this.updataView();
    }
    get selectedChild() {
        return this.getChildAt(this.selectedIndex);
    }
    getChildAt(index) {
        if (!this._childUIList)
            return null;
        if (index < 0 || index >= this._childUIList.length)
            return null;
        return this._childUIList[index];
    }
    updataView() {
        if (!this.render)
            return;
        if (!this._childList || this.selectedIndex < 0) {
            this.selectedIndex = -1;
            return;
        }
        if (this.selectedIndex >= this._childList.length)
            this.selectedIndex = this._childList.length - 1;
        let showChild;
        let child;
        for (let i = 0; i < this._childUIList.length; i++) {
            child = this._childUIList[i];
            if (!child)
                continue;
            if (child.destroyed) {
                child = this._childList[i] = null;
                continue;
            }
            if (i == this.selectedIndex) {
                if (!child.parent) {
                    this.render.addChild(child);
                    child.Reset();
                }
                showChild = child;
            }
            else {
                if (child.parent) {
                    this.render.removeChild(child);
                    child.Remove();
                }
            }
        }
        if (!showChild) {
            let childClass = this._childList[this.selectedIndex];
            if (childClass == "")
                return;
            let initData = this._childInitDataList ? this._childInitDataList[this.selectedIndex] : null;
            if (initData != undefined)
                showChild = new childClass(initData);
            else
                showChild = new childClass();
            if (showChild) {
                showChild.pos(this._x, this._y);
                this.render.addChild(showChild);
                showChild.StartLoadRes();
                this._childUIList[this.selectedIndex] = showChild;
            }
        }
    }
    resetChildsPos() {
        if (this._childUIList && this._childUIList.length > 0) {
            this._childUIList.forEach((child) => {
                if (child && !child.destroyed)
                    child.pos(this._x, this._y);
            });
        }
    }
    readyCloseChilds() {
        if (this._childUIList) {
            let len = this._childUIList.length;
            let child;
            for (let i = 0; i < len; i++) {
                child = this._childUIList[i];
                if (child && !child.destroyed)
                    child.ReadyClose();
            }
        }
    }
    clearChilds() {
        this._childList = null;
        if (this._childUIList) {
            let child;
            while (this._childUIList.length > 0) {
                child = this._childUIList.pop();
                if (child)
                    child.destroy();
            }
            this._childUIList = null;
        }
    }
    ReadyClose() {
        this.readyCloseChilds();
    }
    destroy() {
        this.clearChilds();
        this._childInitDataList = null;
        if (this.render) {
            this.render.off("destroyEvent", this, this.onFollowDestroy);
            this.render = null;
        }
    }
    onFollowDestroy(target) {
        this.destroy();
    }
}

class SgsPanel extends Laya.Panel {
    constructor() {
        super();
        this.curPage = 0;
        this.totalPage = 0;
        this.reqIng = false;
        this.isLeaveDrawClear = false;
        this.scrollClearValue = 0;
    }
    SetScrollClearRes(isLeaveDrawClear, scrollClearValue = 0) {
        this.isLeaveDrawClear = isLeaveDrawClear;
        this.scrollClearValue = scrollClearValue;
    }
    SetPage(curPage, totalPage) {
        this.curPage = curPage;
        this.totalPage = totalPage;
        this.reqIng = false;
    }
    UpdateDrawContent() {
        if (this.vScrollBar)
            this.virtualDraw(this.vScrollBar);
        if (this.hScrollBar)
            this.virtualDraw(this.hScrollBar);
    }
    onScrollBarChange(scrollBar) {
        super.onScrollBarChange(scrollBar);
        this.virtualDraw(scrollBar);
        if (scrollBar.value == scrollBar.max) {
            this.event(SgsPanel.SCROLL_MAX);
            if (!this.reqIng && this.totalPage > this.curPage) {
                this.reqIng = true;
                this.event("reqNextPage", this.curPage + 1);
            }
        }
    }
    virtualDraw(scrollBar) {
        let isVertical = scrollBar.isVertical;
        let start = scrollBar.value;
        let numChildren = this.numChildren;
        let item;
        if (isVertical) {
            let scrollClearValue = this.scrollClearValue ? this.scrollClearValue : this.height;
            for (let i = 0; i < numChildren; i++) {
                item = this.getChildAt(i);
                item["isLeaveDrawClear"] = this.isLeaveDrawClear;
                if (item.y + item.height >= start && item.y <= start + this.height)
                    !item.Drawed && item.EnterDraw();
                else {
                    item.Drawed && item.LeaveDraw();
                    if (this.isLeaveDrawClear && item.Inited && item.Dataed && item.NeedLeaveDrawClear) {
                        if ((item.y + item.height < start - scrollClearValue) || (item.y > start + this.height + scrollClearValue))
                            item.LeaveDrawClear();
                    }
                }
            }
        }
        else {
            let scrollClearValue = this.scrollClearValue ? this.scrollClearValue : this.width;
            for (let i = 0; i < numChildren; i++) {
                item = this.getChildAt(i);
                item["isLeaveDrawClear"] = this.isLeaveDrawClear;
                if (item.x + item.width >= start && item.x <= start + this.width)
                    !item.Drawed && item.EnterDraw();
                else {
                    item.Drawed && item.LeaveDraw();
                    if (this.isLeaveDrawClear && item.Inited && item.Dataed && item.NeedLeaveDrawClear) {
                        if ((item.x + item.width < start - scrollClearValue) || (item.x > start + this.width + scrollClearValue))
                            item.LeaveDrawClear();
                    }
                }
            }
        }
    }
}
SgsPanel.SCROLL_MAX = "SCROLL_MAX";

//import LayoutEnum from "../../enum/base/LayoutEnum";
//import Dictionary from "./../../utils/Dictionary";
//import SgsSprite from "./base/SgsSprite";
//import SgsFlatPanelItemBase from "./SgsFlatPanelItemBase";
class SgsFlatPanel extends Laya.Panel {
    constructor(itemRenderer = SgsFlatPanelItemBase, otherLayerNum = 0, eventLayerIndex = -2) {
        super();
        this.eventLayerIndex = -2;
        this.layoutType = 0;
        this.vGap = 0;
        this.hGap = 0;
        this.col = 0;
        this.paddingLeft = 0;
        this.paddingTop = 0;
        this.scrollStopUpdate = false;
        this.isLeaveDrawClear = false;
        this.scrollClearValue = 0;
        this.setScrollClearValue = 0;
        this.itemWidth = 0;
        this.itemHeight = 0;
        this.itemMaxCountChanged = true;
        this.itemMaxCount = 0;
        this.startIndex = -1;
        this.endIndex = -1;
        this.itemRenderer = itemRenderer;
        this.eventLayerIndex = eventLayerIndex;
        this.itemUIDic = {};
        this.itemPools = [];
        this.invalidItemUIs = [];
        this.itemLoadStatusDic = new Dictionary();
        this.contentSp = new SgsSprite();
        this.addChild(this.contentSp);
        if (eventLayerIndex == -1) {
            this.contentSp.addDrawClick();
            this.contentSp.addDrawMouseEvent();
        }
        if (otherLayerNum > 0) {
            this.otherRenders = [];
            let layerSp;
            for (let i = 0; i < otherLayerNum; i++) {
                layerSp = new SgsSprite();
                this.addChild(layerSp);
                if (eventLayerIndex == i) {
                    layerSp.addDrawClick();
                    layerSp.addDrawMouseEvent();
                }
                this.otherRenders.push(layerSp);
            }
        }
        let itemUI = new this.itemRenderer(this.otherRenders);
        itemUI.RendererIndex = -1;
        this.itemPools.push(itemUI);
        this.itemWidth = itemUI.width;
        this.itemHeight = itemUI.height;
    }
    set width(val) {
        if (val == this.width)
            return;
        this.itemMaxCountChanged = true;
        Laya.superSetter(SgsFlatPanel, this, "width", val);
    }
    get width() {
        return this["_width"];
    }
    set height(val) {
        if (val == this.height)
            return;
        this.itemMaxCountChanged = true;
        Laya.superSetter(SgsFlatPanel, this, "height", val);
    }
    get height() {
        return this["_height"];
    }
    SetScrollClearRes(isLeaveDrawClear, scrollClearValue = 0) {
        this.isLeaveDrawClear = isLeaveDrawClear;
        this.setScrollClearValue = scrollClearValue;
        this.itemMaxCountChanged = true;
    }
    SetLayout(layoutType = LayoutEnum.VerticalLayout, vGap = 0, hGap = 0, col = 0, paddingLeft = 0, paddingTop = 0) {
        this.layoutType = layoutType;
        this.vGap = vGap;
        this.hGap = hGap;
        this.col = col;
        this.paddingLeft = paddingLeft;
        this.paddingTop = paddingTop;
        if (this.layoutType == LayoutEnum.VerticalLayout)
            this.layoutFun = this.setVerticalLayout;
        else if (this.layoutType == LayoutEnum.HorizontalLayout)
            this.layoutFun = this.setHorizontalLayout;
        else if (this.layoutType == LayoutEnum.TileLayout)
            this.layoutFun = this.setTileLayout;
    }
    set ItemCreateFunction(val) {
        this.itemCreateFunction = val;
        if (val.once)
            val.once = false;
        let length = this.itemPools ? this.itemPools.length : 0;
        if (length > 0 && this.itemCreateFunction) {
            let itemUI;
            for (let i = 0; i < length; i++) {
                itemUI = this.itemPools[i];
                if (itemUI && itemUI.RendererIndex == -1) {
                    this.itemCreateFunction.runWith([itemUI]);
                    break;
                }
            }
        }
    }
    set ItemRendererFunction(val) {
        this.itemRendererFunction = val;
        if (val.once)
            val.once = false;
    }
    GetIndexByProperty(val, property) {
        if (property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return -1;
        for (let i = 0; i < this.dataProvider.length; i++) {
            if (this.dataProvider[i][property] == val)
                return i;
        }
        return -1;
    }
    get DataProvider() {
        return this.dataProvider;
    }
    set DataProvider(value) {
        Laya.timer.clear(this, this.onDelayLoacation);
        this.dataProvider = value;
        if (this.selectedIndexs)
            this.selectedIndexs.length = 0;
        let length = this.dataProvider ? this.dataProvider.length : 0;
        let itemUI;
        if (length <= 0) {
            for (let index in this.itemUIDic) {
                itemUI = this.itemUIDic[index];
                itemUI.off(Laya.Event.CLICK, this, this.onItemUIClick);
                itemUI.off(SgsFlatPanel.ITEM_CUSTOM_EVENT, this, this.onItemUICustomEvent);
                this.contentSp.removeDrawChild(itemUI, false);
                this.itemPools.push(itemUI);
            }
            this.itemUIDic = {};
            this.updateLayerSize(0, 0);
            return;
        }
        if (this.layoutType == LayoutEnum.VerticalLayout)
            this.updateLayerSize(this.width, this.paddingTop + this.itemHeight * length + this.vGap * (length - 1));
        else if (this.layoutType == LayoutEnum.HorizontalLayout)
            this.updateLayerSize(this.paddingLeft + this.itemWidth * length + this.hGap * (length - 1), this.height);
        else if (this.layoutType == LayoutEnum.TileLayout)
            this.updateLayerSize(this.width, this.paddingTop + Math.floor((length - 1) / this.col) * (this.itemHeight + this.vGap) + this.itemHeight);
        for (let index in this.itemUIDic) {
            itemUI = this.itemUIDic[index];
            if (this.isLeaveDrawClear && itemUI.RendererData)
                itemUI.LeaveDrawClear();
            itemUI.ResetRendererData();
        }
        if (this.itemPools.length > 0) {
            this.itemPools.forEach(element => {
                if (this.isLeaveDrawClear && element.RendererData)
                    element.LeaveDrawClear();
                element.ResetRendererData();
            });
        }
        this.startIndex = -1;
        this.endIndex = -1;
        this.updateRenderers();
    }
    get SelectedCount() {
        return this.selectedIndexs ? this.selectedIndexs.length : 0;
    }
    get SelectedIndexs() {
        return this.selectedIndexs;
    }
    GetSelected(index) {
        return this.selectedIndexs && this.selectedIndexs.indexOf(index) != -1 ? true : false;
    }
    GetSelectedItemUI() {
        if (!this.itemUIDic || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        return this.itemUIDic[this.selectedIndexs[0]];
    }
    GetSelectedItemUIs() {
        if (!this.itemUIDic || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        let result = [];
        let selectedLength = this.selectedIndexs.length;
        let itemUI;
        for (let i = 0; i < selectedLength; i++) {
            itemUI = this.itemUIDic[this.selectedIndexs[i]];
            if (itemUI)
                result.push(itemUI);
        }
        return result;
    }
    GetSelectedData(property = "") {
        if (!this.dataProvider || this.dataProvider.length <= 0 || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        if (property)
            return this.dataProvider[this.selectedIndexs[0]][property];
        else
            return this.dataProvider[this.selectedIndexs[0]];
    }
    GetSelectedDatas(property = "") {
        if (!this.dataProvider || this.dataProvider.length <= 0 || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        let selectedLength = this.selectedIndexs.length;
        let dataLength = this.dataProvider.length;
        let result = [];
        let selectedIndex = -1;
        let data;
        for (let i = 0; i < selectedLength; i++) {
            selectedIndex = this.selectedIndexs[i];
            data = selectedIndex >= 0 && selectedIndex < dataLength ? this.dataProvider[selectedIndex] : null;
            if (data) {
                if (property)
                    result.push(data[property]);
                else
                    result.push(data);
            }
        }
        return result;
    }
    SetSelectedDatas(val, property) {
        if (!val || val.length <= 0 || property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return;
        let index = -1;
        val.forEach(element => {
            index = this.GetIndexByProperty(element, property);
            if (index >= 0)
                this.SetSelected(index, true, true);
        });
    }
    set SelectedIndexs(val) {
        this.selectedIndexs = val;
        if (this.itemUIDic) {
            let itemUI;
            let selected = false;
            for (let index in this.itemUIDic) {
                selected = this.selectedIndexs && this.selectedIndexs.indexOf(Number(index)) != -1 ? true : false;
                itemUI = this.itemUIDic[index];
                if (itemUI && itemUI.Selected != selected)
                    itemUI.Selected = selected;
            }
        }
    }
    SetSelected(index, selected, multiSelect = false) {
        if (!this.selectedIndexs)
            this.selectedIndexs = [];
        if (multiSelect) {
            let itemUI;
            let selectedIndex = this.selectedIndexs.indexOf(index);
            if (selected) {
                if (selectedIndex == -1) {
                    this.selectedIndexs.push(index);
                    itemUI = this.itemUIDic ? this.itemUIDic[index] : null;
                    if (itemUI && !itemUI.Selected)
                        itemUI.Selected = true;
                }
            }
            else {
                if (selectedIndex != -1) {
                    this.selectedIndexs.splice(selectedIndex, 1);
                    itemUI = this.itemUIDic ? this.itemUIDic[index] : null;
                    if (itemUI && itemUI.Selected)
                        itemUI.Selected = false;
                }
            }
        }
        else {
            this.selectedIndexs.length = 0;
            if (selected)
                this.selectedIndexs.push(index);
            this.SelectedIndexs = this.selectedIndexs;
        }
    }
    SetLocationData(val, property) {
        if (!val || property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return;
        let index = this.GetIndexByProperty(val, property);
        if (index <= -1)
            return;
        if (!this.vScrollBar && !this.hScrollBar)
            return;
        Laya.timer.clear(this, this.onDelayLoacation);
        Laya.timer.frameOnce(2, this, this.onDelayLoacation, [index]);
    }
    onDelayLoacation(index) {
        let scrollX = this.hScrollBar ? this.hScrollBar.value : 0;
        let scrollY = this.vScrollBar ? this.vScrollBar.value : 0;
        if (this.layoutType == LayoutEnum.TileLayout) {
            if (this.vScrollBar)
                scrollY = this.paddingTop + Math.floor(index / this.col) * (this.itemHeight + this.vGap);
            else
                scrollX = this.paddingLeft + Math.ceil(index % this.col) * (this.itemWidth + this.hGap);
        }
        else if (this.layoutType == LayoutEnum.VerticalLayout)
            scrollY = this.paddingTop + index * (this.itemHeight + this.vGap);
        else if (this.layoutType == LayoutEnum.HorizontalLayout)
            scrollX = this.paddingLeft + index * (this.itemWidth + this.hGap);
        let vScrollBarMax = this.vScrollBar ? this.vScrollBar.max : 0;
        let hScrollBarMax = this.hScrollBar ? this.hScrollBar.max : 0;
        if (scrollX > hScrollBarMax)
            scrollX = hScrollBarMax;
        if (scrollY > vScrollBarMax)
            scrollY = vScrollBarMax;
        this.scrollTo(scrollX, scrollY);
    }
    SetContentSize(width, height) {
        this.updateLayerSize(width, height);
    }
    get CurDrawRenderers() {
        if (!this.itemUIDic)
            return null;
        let result = [];
        for (let index in this.itemUIDic) {
            result.push(this.itemUIDic[index]);
        }
        return result.sort(this.itemUIsSort);
    }
    GetDrawRenderer(index) {
        if (this.itemUIDic && this.itemUIDic[index])
            return this.itemUIDic[index];
        return null;
    }
    updateRenderers() {
        let dataLength = this.dataProvider ? this.dataProvider.length : 0;
        if (dataLength <= 0)
            return;
        this.updateItemMaxCount();
        let vStart = this.vScrollBar ? -this.paddingTop + this.vScrollBar.value : -this.paddingTop;
        let hStart = this.hScrollBar ? -this.paddingLeft + this.hScrollBar.value : -this.paddingLeft;
        this.drawRenderers(vStart, hStart);
    }
    drawRenderers(vStart, hStart) {
        let dataLength = this.dataProvider ? this.dataProvider.length : 0;
        let startIndex = -1;
        let endIndex = -1;
        if (this.layoutType == LayoutEnum.VerticalLayout)
            startIndex = Math.floor((vStart - this.scrollClearValue) / (this.itemHeight + this.vGap));
        else if (this.layoutType == LayoutEnum.HorizontalLayout)
            startIndex = Math.floor((hStart - this.scrollClearValue) / (this.itemWidth + this.hGap));
        else if (this.layoutType == LayoutEnum.TileLayout)
            startIndex = Math.floor((vStart - this.scrollClearValue) / (this.itemHeight + this.vGap)) * this.col;
        if (startIndex < 0)
            startIndex = 0;
        endIndex = startIndex + this.itemMaxCount - 1;
        if (endIndex >= dataLength)
            endIndex = dataLength - 1;
        if (startIndex == this.startIndex && endIndex == this.endIndex)
            return;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.invalidItemUIs.length = 0;
        let itemUI;
        for (let index in this.itemUIDic) {
            itemUI = this.itemUIDic[index];
            if (itemUI.RendererIndex < startIndex || itemUI.RendererIndex > endIndex)
                this.invalidItemUIs.push(itemUI);
        }
        let itemData;
        let selected = false;
        for (let index = startIndex; index <= endIndex; index++) {
            itemData = this.dataProvider[index];
            itemUI = this.itemUIDic[index];
            if (itemUI) {
            }
            else if (this.invalidItemUIs.length > 0) {
                itemUI = this.invalidItemUIs.shift();
                delete this.itemUIDic[itemUI.RendererIndex];
                this.itemUIDic[index] = itemUI;
            }
            else {
                if (this.itemPools.length > 0) {
                    itemUI = this.itemPools.shift();
                }
                else {
                    itemUI = new this.itemRenderer(this.otherRenders);
                    if (this.itemCreateFunction)
                        this.itemCreateFunction.runWith([itemUI]);
                }
                this.itemUIDic[index] = itemUI;
                this.contentSp.addDrawChild(itemUI);
            }
            this.layoutFun(index, itemUI);
            if (this.isLeaveDrawClear && itemUI.RendererData && itemUI.RendererData != itemData)
                itemUI.LeaveDrawClear();
            itemUI.RendererIndex = index;
            itemUI.ItemRendererFunction = this.itemRendererFunction;
            itemUI.ParentPanel = this;
            itemUI.RendererData = itemData;
            selected = this.selectedIndexs && this.selectedIndexs.indexOf(Number(index)) != -1 ? true : false;
            if (itemUI.Selected != selected)
                itemUI.Selected = selected;
            itemUI.on(Laya.Event.CLICK, this, this.onItemUIClick);
            itemUI.on(SgsFlatPanel.ITEM_CUSTOM_EVENT, this, this.onItemUICustomEvent);
        }
        let invalidLength = this.invalidItemUIs.length;
        if (invalidLength) {
            for (let i = 0; i < invalidLength; i++) {
                itemUI = this.invalidItemUIs[i];
                delete this.itemUIDic[itemUI.RendererIndex];
                itemUI.off(Laya.Event.CLICK, this, this.onItemUIClick);
                itemUI.off(SgsFlatPanel.ITEM_CUSTOM_EVENT, this, this.onItemUICustomEvent);
                this.contentSp.removeDrawChild(itemUI, false);
                this.itemPools.push(itemUI);
            }
        }
        this.invalidItemUIs.length = 0;
    }
    setVerticalLayout(index, itemUI) {
        itemUI.pos(this.paddingLeft, this.paddingTop + index * (this.itemHeight + this.vGap));
    }
    setHorizontalLayout(index, itemUI) {
        itemUI.pos(this.paddingLeft + index * (this.itemWidth + this.hGap), this.paddingTop);
    }
    setTileLayout(index, itemUI) {
        itemUI.pos(this.paddingLeft + Math.ceil(index % this.col) * (this.itemWidth + this.hGap), this.paddingTop + Math.floor(index / this.col) * (this.itemHeight + this.vGap));
    }
    updateItemMaxCount() {
        if (!this.itemMaxCountChanged)
            return;
        this.itemMaxCountChanged = false;
        this.scrollClearValue = 0;
        if (this.layoutType == LayoutEnum.VerticalLayout) {
            if (this.isLeaveDrawClear) {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.height;
                this.itemMaxCount = Math.ceil((this.height + this.scrollClearValue * 2) / (this.itemHeight + this.vGap));
            }
            else
                this.itemMaxCount = Math.ceil(this.height / (this.itemHeight + this.vGap)) + 1;
        }
        else if (this.layoutType == LayoutEnum.HorizontalLayout) {
            if (this.isLeaveDrawClear) {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.width;
                this.itemMaxCount = Math.ceil((this.width + this.scrollClearValue * 2) / (this.itemWidth + this.hGap));
            }
            else
                this.itemMaxCount = Math.ceil(this.width / (this.itemWidth + this.hGap)) + 1;
        }
        else if (this.layoutType == LayoutEnum.TileLayout) {
            if (this.isLeaveDrawClear) {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.height;
                this.itemMaxCount = this.col * Math.ceil((this.height + this.scrollClearValue * 2) / (this.itemHeight + this.vGap));
            }
            else
                this.itemMaxCount = this.col * (Math.ceil(this.height / (this.itemHeight + this.vGap)) + 1);
        }
    }
    updateLayerSize(width, height, isDelayRefresh = true) {
        let sizeSp;
        if (this.eventLayerIndex <= -1) {
            this.contentSp.size(width, height);
            sizeSp = this.contentSp;
        }
        if (this.otherRenders) {
            for (let i = 0; i < this.otherRenders.length; i++) {
                if (this.eventLayerIndex == i) {
                    this.otherRenders[i].size(width, height);
                    sizeSp = this.otherRenders[i];
                }
            }
        }
        if (isDelayRefresh) {
            if (sizeSp)
                sizeSp.event(Laya.Event.RESIZE, this.contentSp);
        }
        else
            this.refresh();
    }
    onScrollBarChange(scrollBar) {
        super.onScrollBarChange(scrollBar);
        if (!this.scrollStopUpdate)
            this.updateRenderers();
        this.event("scrollChange");
    }
    onItemUIClick(event) {
        this.event(SgsFlatPanel.ITEM_CLICK, [event.RendererIndex, event.RendererData, event]);
    }
    onItemUICustomEvent(event, customData) {
        this.event(SgsFlatPanel.ITEM_CUSTOM_EVENT, [event.RendererIndex, event.RendererData, event, customData]);
    }
    itemUIsSort(a, b) {
        return a.RendererIndex - b.RendererIndex;
    }
    UpdateItemLoadStatus(rendererIndex, loadStatus) {
        if (this.itemLoadStatusDic) {
            if (loadStatus == 0)
                this.itemLoadStatusDic.del(rendererIndex);
            else
                this.itemLoadStatusDic.addNumberKey(rendererIndex, loadStatus);
        }
    }
    GetItemLoadStatus(rendererIndex) {
        if (this.itemLoadStatusDic && this.itemLoadStatusDic.has(rendererIndex))
            return this.itemLoadStatusDic.getNumberKey(rendererIndex);
        return 0;
    }
    destroy() {
        Laya.timer.clear(this, this.onDelayLoacation);
        if (this.itemPools) {
            this.itemPools.forEach(element => {
                this.contentSp.removeDrawChild(element, true);
            });
            this.itemPools = null;
        }
        super.destroy();
        this.itemUIDic = null;
        this.itemRenderer = null;
        this.otherRenders = null;
        this.invalidItemUIs = null;
        this.layoutFun = null;
        this.itemCreateFunction = null;
        this.itemRendererFunction = null;
        this.dataProvider = null;
        this.selectedIndexs = null;
        this.itemLoadStatusDic = null;
    }
}
SgsFlatPanel.ITEM_CLICK = "ITEM_CLICK";
SgsFlatPanel.ITEM_CUSTOM_EVENT = "ITEM_CUSTOM_EVENT";

//import Global from "../../../Global";
//import EventExpand from "../../../event/EventExpand";
//import TipsManager from "../../../mode/base/TipsManager";
class SgsTexture extends Laya.EventDispatcher {
    constructor(texture = null) {
        super();
        this.name = "";
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._alpha = 1;
        this._color = "";
        this._gray = false;
        this._visible = true;
        this._mouseEnabled = false;
        this._destroyed = false;
        this.cmds = null;
        this._longDowned = false;
        this.tipTriggerType = "";
        this.toolTip = "";
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.invalidateUpdateFlag = false;
        this.texture = texture ? texture : SgsTexture.EmptyTexture;
    }
    get Render() {
        return this.render;
    }
    set Cmds(value) {
        this.cmds = value;
    }
    get Cmds() {
        return this.cmds;
    }
    set x(value) {
        if (this._x == value)
            return;
        this._x = value;
        this.invalidateUpdate();
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y == value)
            return;
        this._y = value;
        this.invalidateUpdate();
    }
    get y() {
        return this._y;
    }
    pos(x, y) {
        this.x = x >> 0;
        this.y = y >> 0;
    }
    get renderX() {
        return this.parentContainer ? this.parentContainer.renderX + this.x * this.parentContainer.renderScaleX : this.x;
    }
    get renderY() {
        return this.parentContainer ? this.parentContainer.renderY + this.y * this.parentContainer.renderScaleY : this.y;
    }
    resetPos() {
        if (this.cmds)
            this.drawTexture();
    }
    set width(value) {
        if (this._width == value)
            return;
        this._width = value;
        this.invalidateUpdate();
    }
    get width() {
        if (this._width != 0)
            return this._width;
        if (this._texture)
            return this._texture.width;
        return 0;
    }
    set height(value) {
        if (this._height == value)
            return;
        this._height = value;
        this.invalidateUpdate();
    }
    get height() {
        if (this._height != 0)
            return this._height;
        if (this._texture)
            return this._texture.height;
        return 0;
    }
    size(width, height) {
        let isChange = false;
        if (this._width != width) {
            this._width = width;
            isChange = true;
        }
        if (this._height != height) {
            this._height = height;
            isChange = true;
        }
        if (isChange)
            this.invalidateUpdate();
    }
    set scaleX(value) {
        if (this._scaleX == value)
            return;
        this._scaleX = value;
        this.invalidateUpdate();
    }
    get scaleX() {
        return this._scaleX;
    }
    set scaleY(value) {
        if (this._scaleY == value)
            return;
        this._scaleY = value;
        this.invalidateUpdate();
    }
    get scaleY() {
        return this._scaleY;
    }
    set scale(value) {
        this.scaleX = value;
        this.scaleY = value;
    }
    get renderScaleX() {
        return this.parentContainer ? this.parentContainer.renderScaleX * this._scaleX : this._scaleX;
    }
    get renderScaleY() {
        return this.parentContainer ? this.parentContainer.renderScaleY * this._scaleY : this._scaleY;
    }
    resetScale() {
        if (this.cmds)
            this.drawTexture();
    }
    get renderWidth() {
        return this.width * this.renderScaleX;
    }
    get renderHeight() {
        return this.height * this.renderScaleY;
    }
    set sizeGrid(value) {
        if (value && value.length > 0) {
            this._sizeGrid = value.split(",");
            if (this._sizeGrid && this._sizeGrid.length >= 4) {
                if (this._sizeGrid[0] == "0")
                    this._sizeGrid[0] = "1";
                if (this._sizeGrid[1] == "0")
                    this._sizeGrid[1] = "1";
                if (this._sizeGrid[2] == "0")
                    this._sizeGrid[2] = "1";
                if (this._sizeGrid[3] == "0")
                    this._sizeGrid[3] = "1";
            }
            this.changeGridTextures();
        }
        else {
            this._sizeGrid = null;
            this.clearGridTextures();
        }
        this.invalidateUpdate();
    }
    set texture(value) {
        if (!value)
            value = SgsTexture.EmptyTexture;
        if (this._texture == value)
            return;
        this._texture = value;
        this.changeGridTextures();
        this.invalidateUpdate();
    }
    get texture() {
        return this._texture;
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (this._visible == value)
            return;
        this._visible = value;
        this.invalidateUpdate();
    }
    get renderVisible() {
        if (this.parentContainer && !this.parentContainer.renderVisible)
            return false;
        return this._visible;
    }
    resetVisible() {
        if (this.cmds)
            this.drawTexture();
    }
    get mouseEnabled() {
        return this._mouseEnabled;
    }
    set mouseEnabled(value) {
        this._mouseEnabled = value;
    }
    set matrix(value) {
        if (this._matrix == value)
            return;
        this._matrix = value;
        this.invalidateUpdate();
    }
    get matrix() {
        return this._matrix;
    }
    set alpha(value) {
        if (this._alpha == value)
            return;
        this._alpha = value;
        this.invalidateUpdate();
    }
    get alpha() {
        return this._alpha;
    }
    set color(value) {
        if (this._color == value)
            return;
        this._color = value;
        this.invalidateUpdate();
    }
    get color() {
        return this._color;
    }
    set gray(value) {
        if (this._gray == value)
            return;
        this._gray = value;
        this.invalidateUpdate();
    }
    get gray() {
        return this._gray;
    }
    get textureWidth() {
        if (this._texture)
            return this._texture.width;
        return 0;
    }
    get textureHeight() {
        if (this._texture)
            return this._texture.height;
        return 0;
    }
    get drawed() {
        return this.cmds ? true : false;
    }
    get displayedInStage() {
        if (!this.drawed)
            return false;
        if (!this.render)
            return false;
        return this.render.displayedInStage;
    }
    get destroyed() {
        return this._destroyed;
    }
    get globalPoint() {
        if (!this._globalPoint)
            this._globalPoint = new Laya.Point();
        if (this.render && this.drawed) {
            this._globalPoint.setTo(this.renderX, this.renderY);
            this._globalPoint = this.render.localToGlobal(this._globalPoint);
        }
        else {
            this._globalPoint.setTo(0, 0);
        }
        return this._globalPoint;
    }
    get startIndex() {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        return this.getCmdIndex(this.cmds[0]);
    }
    get endIndex() {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        return this.getCmdIndex(this.cmds[this.cmds.length - 1]);
    }
    set index(index) {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return;
        let graphicsCmds = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0)
            return;
        graphicsCmds.splice(this.startIndex, this.cmds.length);
        for (let i = 0; i < this.cmds.length; i++) {
            graphicsCmds.splice(index, 0, this.cmds[i]);
            index++;
        }
    }
    draw(sgsSprite, index = -1) {
        this.render = sgsSprite;
        if (!this._texture)
            return;
        this.drawTexture(index);
    }
    clear(destroy = true) {
        if (this.render && this.cmds) {
            let graphicsCmds = this.render.graphics.cmds;
            let cmd;
            let index = -1;
            while (this.cmds.length > 0) {
                cmd = this.cmds.shift();
                if (graphicsCmds && graphicsCmds.length > 0) {
                    index = graphicsCmds.indexOf(cmd);
                    if (index > -1) {
                        graphicsCmds.splice(index, 1);
                        cmd.recover();
                        if (!graphicsCmds || graphicsCmds.length <= 0)
                            this.render.graphics.clear();
                    }
                }
                else if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd)
                    this.render.graphics.clear();
            }
            this.render = null;
            this.cmds = null;
        }
        if (destroy) {
            this._destroyed = true;
            this.parentContainer = null;
            this._texture = null;
            this.clearGridTextures();
            Laya.timer.clear(this, this.onLongTimer);
            this.removeSelfEvent();
            this.ToolTip = null;
            this.offAll();
        }
    }
    contains(x, y) {
        if (this.renderX <= x && this.renderY <= y && this.renderX + this.renderWidth >= x && this.renderY + this.renderHeight >= y)
            return true;
        return false;
    }
    update() {
        this.invalidateUpdateFlag = false;
        if (!this.render || !this._texture)
            return;
        this.drawTexture();
    }
    drawTexture(index = -1) {
        let cmdsLength = this.cmds ? this.cmds.length : 0;
        if (this._sizeGrid && this._sizeGrid.length >= 4) {
            var top = parseInt(this._sizeGrid[0]);
            var right = parseInt(this._sizeGrid[1]);
            var bottom = parseInt(this._sizeGrid[2]);
            var left = parseInt(this._sizeGrid[3]);
        }
        if (!this.gridTextures || this.gridTextures.length < 9
            || this._width == 0 || this._height == 0
            || this._width < left + right || this._height < top + bottom) {
            this.delDrawCmd(1);
            cmdsLength = this.cmds ? this.cmds.length : 0;
            if (cmdsLength > 0)
                this.updateSingleTexture(this.cmds[0], this._texture, this.renderX, this.renderY, this.width, this.height);
            else
                this.drawSingleTexture(this._texture, this.renderX, this.renderY, this.width, this.height, index);
            return;
        }
        if (cmdsLength <= 0) {
            if (index == -1) {
                let graphicsCmds = this.render.graphics.cmds;
                if (graphicsCmds && graphicsCmds.length > 0)
                    index = graphicsCmds.length;
                else if (this.render.graphics["_one"])
                    index = 1;
                else
                    index = 0;
            }
        }
        else {
            let lastIndex = this.getCmdIndex(this.cmds[this.cmds.length - 1]);
            index = lastIndex + 1;
        }
        index = this.drawGrid(0, this.renderX + left * this.renderScaleX, this.renderY, this._width - left - right, top, index);
        index = this.drawGrid(1, this.renderX + (this._width - right) * this.renderScaleX, this.renderY, right, top, index);
        index = this.drawGrid(2, this.renderX + (this._width - right) * this.renderScaleX, this.renderY + top * this.renderScaleY, right, this._height - top - bottom, index);
        index = this.drawGrid(3, this.renderX + (this._width - right) * this.renderScaleX, this.renderY + (this._height - bottom) * this.renderScaleY, right, bottom, index);
        index = this.drawGrid(4, this.renderX + left * this.renderScaleX, this.renderY + (this._height - bottom) * this.renderScaleY, this._width - left - right, bottom, index);
        index = this.drawGrid(5, this.renderX, this.renderY + (this._height - bottom) * this.renderScaleY, left, bottom, index);
        index = this.drawGrid(6, this.renderX, this.renderY + top * this.renderScaleY, left, this._height - top - bottom, index);
        index = this.drawGrid(7, this.renderX, this.renderY, left, top, index);
        index = this.drawGrid(8, this.renderX + left * this.renderScaleX, this.renderY + top * this.renderScaleY, this._width - left - right, this._height - top - bottom, index);
    }
    drawGrid(gridNumber, x, y, width, height, index) {
        let cmdsLength = this.cmds ? this.cmds.length : 0;
        if (cmdsLength >= gridNumber + 1) {
            this.updateSingleTexture(this.cmds[gridNumber], this.gridTextures[gridNumber], x, y, width, height);
            return index;
        }
        else {
            this.drawSingleTexture(this.gridTextures[gridNumber], x, y, width, height, index);
            return index + 1;
        }
    }
    drawSingleTexture(texture, x, y, width, height, index = -1) {
        let drwaAlpha = Math.max(this._alpha, 0.01);
        let drawCmd = this.render.graphics.drawTexture(texture, x, y, this.getDrawSize(width, true), this.getDrawSize(height, false), this._matrix, drwaAlpha, this._color, null, null, this._gray);
        if (!drawCmd)
            return;
        if (!this.cmds)
            this.cmds = [];
        let graphicsCmds = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0) {
            this.cmds.push(this.render.graphics["_one"]);
        }
        else {
            this.cmds.push(graphicsCmds[graphicsCmds.length - 1]);
            if (index >= 0 && index < graphicsCmds.length) {
                let cmd = graphicsCmds.pop();
                graphicsCmds.splice(index, 0, cmd);
            }
        }
    }
    updateSingleTexture(cmd, texture, x, y, width, height) {
        if (!cmd || !texture)
            return;
        let oldColor = cmd.color;
        let oldGray = cmd.gray;
        if (cmd.texture)
            cmd.texture["_removeReference"]();
        cmd.texture = texture;
        cmd.texture["_addReference"]();
        cmd.x = x;
        cmd.y = y;
        cmd.width = this.getDrawSize(width, true);
        cmd.height = this.getDrawSize(height, false);
        cmd.matrix = this._matrix;
        cmd.alpha = this._alpha;
        cmd.color = this._color;
        cmd.gray = this._gray;
        if (cmd.color || cmd.gray) {
            if (!cmd.colorFlt)
                cmd.colorFlt = new Laya.ColorFilter();
            if (cmd.color) {
                if (oldColor != cmd.color)
                    cmd.colorFlt.setColor(cmd.color);
            }
            else if (oldGray != cmd.gray)
                cmd.colorFlt.gray();
        }
        else
            cmd.colorFlt = null;
    }
    delDrawCmd(retainCount) {
        if (!this.render || !this.render.graphics.cmds || !this.cmds)
            return;
        let graphicsCmds = this.render.graphics.cmds;
        let cmd;
        while (this.cmds.length > retainCount) {
            cmd = this.cmds.pop();
            if (graphicsCmds && graphicsCmds.length > 0) {
                let index = graphicsCmds.indexOf(cmd);
                if (index > -1) {
                    graphicsCmds.splice(index, 1);
                    cmd.recover();
                }
            }
        }
    }
    getDrawSize(value, isWidth) {
        if (!this.renderVisible || this._texture === SgsTexture.EmptyTexture)
            return 0.01;
        let drawSize = isWidth ? value * this.renderScaleX : value * this.renderScaleY;
        if (drawSize == 0)
            return 0.01;
        return drawSize;
    }
    changeGridTextures() {
        this.clearGridTextures();
        if (!this._texture)
            return;
        if (!this._sizeGrid || this._sizeGrid.length < 4)
            return;
        let sw = this._texture.width;
        let sh = this._texture.height;
        let top = parseInt(this._sizeGrid[0]);
        let right = parseInt(this._sizeGrid[1]);
        let bottom = parseInt(this._sizeGrid[2]);
        let left = parseInt(this._sizeGrid[3]);
        if (top + bottom >= sh || left + right >= sw)
            return;
        if (!this.gridTextures)
            this.gridTextures = [];
        this.gridTextures.push(this.createTextrue(left, 0, sw - left - right, top));
        this.gridTextures.push(this.createTextrue(sw - right, 0, right, top));
        this.gridTextures.push(this.createTextrue(sw - right, top, right, sh - top - bottom));
        this.gridTextures.push(this.createTextrue(sw - right, sh - bottom, right, bottom));
        this.gridTextures.push(this.createTextrue(left, sh - bottom, sw - left - right, bottom));
        this.gridTextures.push(this.createTextrue(0, sh - bottom, left, bottom));
        this.gridTextures.push(this.createTextrue(0, top, left, sh - top - bottom));
        this.gridTextures.push(this.createTextrue(0, 0, left, top));
        this.gridTextures.push(this.createTextrue(left, top, sw - left - right, sh - top - bottom));
    }
    clearGridTextures() {
        if (!this.gridTextures)
            return;
        let texture;
        while (this.gridTextures.length > 0) {
            texture = this.gridTextures.shift();
            texture = null;
        }
        this.gridTextures = null;
    }
    getCmdIndex(cmd) {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        let index = -1;
        let graphicsCmds = this.render.graphics.cmds;
        if (graphicsCmds && graphicsCmds.length > 0)
            index = graphicsCmds.indexOf(cmd);
        else if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd)
            index = 0;
        return index;
    }
    invalidateUpdate() {
        if (!this.render)
            return;
        if (this.drawed) {
            if (!this.invalidateUpdateFlag) {
                this.invalidateUpdateFlag = true;
                Laya.timer.callLater(this, this.update);
            }
        }
        else {
            this.update();
        }
    }
    createTextrue(x, y, width, height) {
        if (!this._texture)
            return null;
        let texture;
        texture = Laya.Texture.createFromTexture(this._texture, x, y, width, height);
        return texture;
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this.toolTip;
    }
    set ToolTip(val) {
        if (this.toolTip == val)
            return;
        this.toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
}

//import TipsManager from "../../../mode/base/TipsManager";
//import Global from "../../../Global";
//import EventExpand from "../../../event/EventExpand";
class SgsTextField extends Laya.Text {
    constructor() {
        super();
        this._longDowned = false;
        this.tipTriggerType = "";
        this._toolTip = "";
    }
    pos(x, y) {
        return super.pos(x >> 0, y >> 0, true);
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this._toolTip;
    }
    set ToolTip(val) {
        if (this._toolTip == val)
            return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event.currentTarget]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
    destroy(destroyChild = true) {
        Laya.timer.clear(this, this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        super.destroy(destroyChild);
    }
}

//import Global from "../../../Global";
//import EventExpand from "../../../event/EventExpand";
//import TipsManager from "../../../mode/base/TipsManager";
class SgsText extends Laya.EventDispatcher {
    constructor(text = "") {
        super();
        this.name = "";
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._italic = false;
        this._bold = false;
        this._fontSize = Laya.Text.defaultFontSize;
        this._font = Laya.Text.defaultFont;
        this._color = "#000000";
        this._stroke = 0;
        this._strokeColor = "#000000";
        this._wordWrap = false;
        this._leading = 0;
        this._align = "left";
        this._valign = "top";
        this._text = "";
        this._visible = true;
        this._mouseEnabled = false;
        this._destroyed = false;
        this._textWidth = 0;
        this._textHeight = 0;
        this._ctxFont = "";
        this._typesetChanged = false;
        this._fontChanged = false;
        this.cmds = null;
        this._longDowned = false;
        this.tipTriggerType = "";
        this.toolTip = "";
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.invalidateUpdateFlag = false;
        this._lines = [];
        this._lineWidths = [];
        this._charSize = {};
        this.text = text;
    }
    static measureText(txt, font, fontSize, bold = false, italic = false) {
        let ctxFont = (italic ? "italic " : "") + (bold ? "bold " : "") + fontSize + "px " + font;
        if (Laya.Browser.context.font != ctxFont)
            Laya.Browser.context.font = ctxFont;
        return Laya.Browser.context.measureText(txt);
    }
    static measureTextWidth(txt, font, fontSize, bold = false, italic = false) {
        return this.measureText(txt, font, fontSize, bold, italic).width;
    }
    get Render() {
        return this.render;
    }
    set Cmds(value) {
        this.cmds = value;
    }
    get Cmds() {
        return this.cmds;
    }
    set x(value) {
        if (this._x == value)
            return;
        this._x = value;
        this.invalidateUpdate();
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y == value)
            return;
        this._y = value;
        this.invalidateUpdate();
    }
    get y() {
        return this._y;
    }
    pos(x, y) {
        this.x = x >> 0;
        this.y = y >> 0;
    }
    get renderX() {
        return this.parentContainer ? this.parentContainer.renderX + this.x : this.x;
    }
    get renderY() {
        return this.parentContainer ? this.parentContainer.renderY + this.y : this.y;
    }
    resetPos() {
        if (this.cmds)
            this.drawText();
    }
    set width(value) {
        if (this._width == value)
            return;
        this._width = value;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get width() {
        if (this._width != 0)
            return this._width;
        return this.textWidth;
    }
    set height(value) {
        if (this._height == value)
            return;
        this._height = value;
        this.invalidateUpdate();
    }
    get height() {
        if (this._height != 0)
            return this._height;
        return this.textHeight;
    }
    size(width, height) {
        let isChange = false;
        if (this._width != width) {
            this._width = width;
            this._typesetChanged = true;
            isChange = true;
        }
        if (this._height != height) {
            this._height = height;
            isChange = true;
        }
        if (isChange)
            this.invalidateUpdate();
    }
    get renderWidth() {
        return this.width * this.renderScaleX;
    }
    get renderHeight() {
        return this.height * this.renderScaleY;
    }
    get alpha() {
        return 1;
    }
    get renderScaleX() {
        return 1;
    }
    get renderScaleY() {
        return 1;
    }
    resetScale() {
    }
    set italic(value) {
        if (this._italic == value)
            return;
        this._italic = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get italic() {
        return this._italic;
    }
    set bold(value) {
        if (this._bold == value)
            return;
        this._bold = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get bold() {
        return this._bold;
    }
    set fontSize(value) {
        if (this._fontSize == value)
            return;
        this._fontSize = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get fontSize() {
        return this._fontSize;
    }
    set font(value) {
        if (this._font == value)
            return;
        this._font = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get font() {
        return this._font;
    }
    get renderFont() {
        if (!this._ctxFont || this._fontChanged)
            this._ctxFont = (this._italic ? "italic " : "") + (this._bold ? "bold " : "") + this._fontSize + "px " + this._font;
        this._fontChanged = false;
        return this._ctxFont;
    }
    set color(value) {
        if (this._color == value)
            return;
        this._color = value;
        this.invalidateUpdate();
    }
    get color() {
        return this._color;
    }
    set strokeColor(value) {
        if (this._strokeColor == value)
            return;
        this._strokeColor = value;
        this.invalidateUpdate();
    }
    get strokeColor() {
        return this._strokeColor;
    }
    set stroke(value) {
        if (this._stroke == value)
            return;
        this._stroke = value;
        this.invalidateUpdate();
    }
    get stroke() {
        return this._stroke;
    }
    set wordWrap(value) {
        if (this._wordWrap == value)
            return;
        this._wordWrap = value;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get wordWrap() {
        return this._wordWrap;
    }
    set leading(value) {
        if (this._leading == value)
            return;
        this._leading = value;
        this.invalidateUpdate();
    }
    get leading() {
        return this._leading;
    }
    set align(value) {
        if (this._align == value)
            return;
        this._align = value;
        this.invalidateUpdate();
    }
    get align() {
        return this._align;
    }
    set valign(value) {
        if (this._valign == value)
            return;
        this._valign = value;
        this.invalidateUpdate();
    }
    get valign() {
        return this._valign;
    }
    set text(value) {
        if (this._text == value)
            return;
        this._text = value + "";
        this._typesetChanged = true;
        this.invalidateUpdate();
    }
    get text() {
        return this._text;
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (this._visible == value)
            return;
        this._visible = value;
        this.invalidateUpdate();
    }
    get renderVisible() {
        if (this.parentContainer && !this.parentContainer.renderVisible)
            return false;
        return this._visible;
    }
    resetVisible() {
        if (this.cmds)
            this.drawText();
    }
    get mouseEnabled() {
        return this._mouseEnabled;
    }
    set mouseEnabled(value) {
        this._mouseEnabled = value;
    }
    get drawed() {
        return this.cmds ? true : false;
    }
    get displayedInStage() {
        if (!this.drawed)
            return false;
        if (!this.render)
            return false;
        return this.render.displayedInStage;
    }
    get destroyed() {
        return this._destroyed;
    }
    get globalPoint() {
        if (!this._globalPoint)
            this._globalPoint = new Laya.Point();
        if (this.render && this.drawed) {
            this._globalPoint.setTo(this.renderX, this.renderY);
            this._globalPoint = this.render.localToGlobal(this._globalPoint);
        }
        else {
            this._globalPoint.setTo(0, 0);
        }
        return this._globalPoint;
    }
    get startIndex() {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        return this.getCmdIndex(this.cmds[0]);
    }
    get endIndex() {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        return this.getCmdIndex(this.cmds[this.cmds.length - 1]);
    }
    set index(index) {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return;
        let graphicsCmds = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0)
            return;
        graphicsCmds.splice(this.startIndex, this.cmds.length);
        for (let i = 0; i < this.cmds.length; i++) {
            graphicsCmds.splice(index, 0, this.cmds[i]);
            index++;
        }
    }
    get textWidth() {
        if (this._typesetChanged)
            this.typeset();
        return this._textWidth;
    }
    get textHeight() {
        let lines = this.lines;
        if (lines) {
            if (lines.length > 1)
                return this._textHeight + (lines.length - 1) * this._leading;
            return this._textHeight;
        }
        return 0;
    }
    get lineNum() {
        let lines = this.lines;
        return lines ? lines.length : 0;
    }
    get lines() {
        if (this._typesetChanged)
            this.typeset();
        return this._lines;
    }
    get lineHeight() {
        let lines = this.lines;
        if (lines) {
            if (lines.length > 1)
                return this._textHeight / lines.length;
            return this._textHeight;
        }
        return 0;
    }
    draw(sgsSprite, index = -1) {
        this.render = sgsSprite;
        this.drawText(index);
    }
    clear(destroy = true) {
        if (this.render && this.cmds) {
            let graphicsCmds = this.render.graphics.cmds;
            let cmd;
            let index = -1;
            while (this.cmds.length > 0) {
                cmd = this.cmds.shift();
                if (graphicsCmds && graphicsCmds.length > 0) {
                    index = graphicsCmds.indexOf(cmd);
                    if (index > -1) {
                        graphicsCmds.splice(index, 1);
                        cmd.recover();
                        if (!graphicsCmds || graphicsCmds.length <= 0)
                            this.render.graphics.clear();
                    }
                }
                else if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd)
                    this.render.graphics.clear();
            }
            this.render = null;
            this.cmds = null;
        }
        if (destroy) {
            this._destroyed = true;
            this.parentContainer = null;
            this._lines = null;
            this._lineWidths = null;
            this._charSize = null;
            Laya.timer.clear(this, this.onLongTimer);
            this.removeSelfEvent();
            this.ToolTip = null;
            this.offAll();
        }
    }
    contains(x, y) {
        if (this.renderX <= x && this.renderY <= y && this.renderX + this.renderWidth >= x && this.renderY + this.renderHeight >= y)
            return true;
        return false;
    }
    update() {
        this.invalidateUpdateFlag = false;
        if (!this.render)
            return;
        this.drawText();
    }
    drawText(index = -1) {
        if (!this.lines)
            return;
        let graphicsCmds = this.render.graphics.cmds;
        let cmdsLength = this.cmds ? this.cmds.length : 0;
        let lines = this.lines;
        let length = lines.length;
        let lineHeight = this.lineHeight;
        if (length == 0) {
            this.delDrawCmd(1);
            cmdsLength = this.cmds ? this.cmds.length : 0;
            if (cmdsLength > 0)
                this.updateLineText(this.cmds[0], this.text, this.renderX, this.renderY);
            else
                this.drawLineText(this.text, this.renderX, this.renderY, "", index);
            return;
        }
        let curAlign = this.align;
        let sx = this.renderX;
        let sy = this.renderY;
        if (this._width > 0) {
            if (this.align == "center")
                sx += this._width * 0.5;
            else if (this.align == "right")
                sx += this._width;
        }
        else {
            curAlign = "left";
        }
        if (this._height > 0) {
            if (this.valign == "middle")
                sy += (this._height - this.textHeight >> 1);
            else if (this.valign == "bottom")
                sy += (this._height - this.textHeight);
        }
        if (cmdsLength > length) {
            this.delDrawCmd(length);
            cmdsLength = this.cmds ? this.cmds.length : 0;
        }
        if (cmdsLength <= 0) {
            if (index == -1) {
                let graphicsCmds = this.render.graphics.cmds;
                if (graphicsCmds && graphicsCmds.length > 0)
                    index = graphicsCmds.length;
                else if (this.render.graphics["_one"])
                    index = 1;
                else
                    index = 0;
            }
        }
        else {
            let lastIndex = this.getCmdIndex(this.cmds[this.cmds.length - 1]);
            index = lastIndex + 1;
        }
        for (var i = 0; i < length; i++) {
            if (i < cmdsLength) {
                this.updateLineText(this.cmds[i], lines[i], sx, sy, curAlign);
            }
            else {
                this.drawLineText(lines[i], sx, sy, curAlign, index);
                if (index >= 0)
                    index++;
            }
            sy += lineHeight + this.leading;
        }
    }
    drawLineText(text, x, y, align = "", index = -1) {
        if (this.stroke > 0) {
            this.render.graphics.fillBorderText(this.renderVisible ? text : "", x, y, this.renderFont, this.color, align, this.stroke, this.strokeColor);
        }
        else {
            this.render.graphics.fillText(this.renderVisible ? text : "", x, y, this.renderFont, this.color, align);
        }
        if (!this.cmds)
            this.cmds = [];
        let graphicsCmds = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0) {
            this.cmds.push(this.render.graphics["_one"]);
        }
        else {
            this.cmds.push(graphicsCmds[graphicsCmds.length - 1]);
            if (index >= 0 && index < graphicsCmds.length) {
                let cmd = graphicsCmds.pop();
                graphicsCmds.splice(index, 0, cmd);
            }
        }
    }
    updateLineText(cmd, text, x, y, align = "") {
        if (!cmd)
            return;
        cmd.text = this.renderVisible ? text : "";
        cmd.x = x;
        cmd.y = y;
        cmd.font = this.renderFont;
        cmd.color = this.color;
        cmd.textAlign = align;
        cmd["_lineWidth"] = this.stroke;
        cmd["_borderColor"] = this.strokeColor;
    }
    delDrawCmd(retainCount) {
        if (!this.render || !this.render.graphics.cmds || !this.cmds)
            return;
        let graphicsCmds = this.render.graphics.cmds;
        let cmd;
        while (this.cmds.length > retainCount) {
            cmd = this.cmds.pop();
            if (graphicsCmds && graphicsCmds.length > 0) {
                let index = graphicsCmds.indexOf(cmd);
                if (index > -1) {
                    graphicsCmds.splice(index, 1);
                    cmd.recover();
                }
            }
        }
    }
    getCmdIndex(cmd) {
        if (!this.render || !this.cmds || this.cmds.length <= 0)
            return -1;
        let index = -1;
        let graphicsCmds = this.render.graphics.cmds;
        if (graphicsCmds && graphicsCmds.length > 0)
            index = graphicsCmds.indexOf(cmd);
        else if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd)
            index = 0;
        return index;
    }
    invalidateUpdate() {
        if (!this.render)
            return;
        if (this.drawed) {
            if (!this.invalidateUpdateFlag) {
                this.invalidateUpdateFlag = true;
                Laya.timer.callLater(this, this.update);
            }
        }
        else {
            this.update();
        }
    }
    typeset() {
        this._typesetChanged = false;
        this._textWidth = this._textHeight = 0;
        if (!this._lines || !this._lineWidths)
            return;
        this._lines.length = 0;
        this._lineWidths.length = 0;
        if (!this._text)
            return;
        let lastCtxFont = this._ctxFont;
        let ctxFont = this.renderFont;
        Laya.Browser.context.font = ctxFont;
        if (!this._charSize.width || lastCtxFont != ctxFont) {
            let measureResult = Laya.Browser.measureYouText(ctxFont);
            this._charSize.width = measureResult.width;
            this._charSize.height = (measureResult.height || this._fontSize);
        }
        this.parseLines(this._text);
        this.evalTextSize();
    }
    parseLines(text) {
        var needWordWrapOrTruncate = this._wordWrap;
        if (needWordWrapOrTruncate)
            var wordWrapWidth = this.getWordWrapWidth();
        var lines = text.replace(/\r\n/g, "\n").split("\n");
        var line;
        for (var i = 0, n = lines.length; i < n; i++) {
            line = lines[i];
            if (needWordWrapOrTruncate)
                this.parseLine(line, wordWrapWidth);
            else {
                this._lineWidths.push(this.getTextWidth(line));
                this._lines.push(line);
            }
        }
    }
    parseLine(line, wordWrapWidth) {
        var ctx = Laya.Browser.context;
        var lines = this._lines;
        var maybeIndex = 0;
        var execResult;
        var charsWidth = NaN;
        var wordWidth = NaN;
        var startIndex = 0;
        charsWidth = this.getTextWidth(line);
        if (charsWidth <= wordWrapWidth) {
            lines.push(line);
            this._lineWidths.push(charsWidth);
            return;
        }
        charsWidth = this._charSize.width;
        maybeIndex = Math.floor(wordWrapWidth / charsWidth);
        (maybeIndex == 0) && (maybeIndex = 1);
        charsWidth = this.getTextWidth(line.substring(0, maybeIndex));
        wordWidth = charsWidth;
        for (var j = maybeIndex, m = line.length; j < m; j++) {
            charsWidth = this.getTextWidth(line.charAt(j));
            wordWidth += charsWidth;
            if (wordWidth > wordWrapWidth) {
                if (this._wordWrap) {
                    var newLine = line.substring(startIndex, j);
                    if (newLine.charCodeAt(newLine.length - 1) < 255) {
                        execResult = /(?:\w|-)+$/.exec(newLine);
                        if (execResult) {
                            j = execResult.index + startIndex;
                            if (execResult.index == 0)
                                j += newLine.length;
                            else
                                newLine = line.substring(startIndex, j);
                        }
                    }
                    else if (Laya.Text.RightToLeft) {
                        execResult = /([\u0600-\u06FF])+$/.exec(newLine);
                        if (execResult) {
                            j = execResult.index + startIndex;
                            if (execResult.index == 0)
                                j += newLine.length;
                            else
                                newLine = line.substring(startIndex, j);
                        }
                    }
                    lines.push(newLine);
                    this._lineWidths.push(wordWidth - charsWidth);
                    startIndex = j;
                    if (j + maybeIndex < m) {
                        j += maybeIndex;
                        charsWidth = this.getTextWidth(line.substring(startIndex, j));
                        wordWidth = charsWidth;
                        j--;
                    }
                    else {
                        lines.push(line.substring(startIndex, m));
                        this._lineWidths.push(this.getTextWidth(lines[lines.length - 1]));
                        startIndex = -1;
                        break;
                    }
                }
            }
        }
        if (this._wordWrap && startIndex != -1) {
            lines.push(line.substring(startIndex, m));
            this._lineWidths.push(this.getTextWidth(lines[lines.length - 1]));
        }
    }
    evalTextSize() {
        var nw = NaN, nh = NaN;
        nw = Math.max.apply(this, this._lineWidths);
        nh = this._lines.length * this._charSize.height;
        this._textWidth = nw;
        this._textHeight = nh;
    }
    getTextWidth(text) {
        return Laya.Browser.context.measureText(text).width;
    }
    getWordWrapWidth() {
        var w = this._width;
        if (w <= 0)
            w = this._wordWrap ? 100 : Laya.Browser.width;
        w <= 0 && (w = 100);
        return w;
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this.toolTip;
    }
    set ToolTip(val) {
        if (this.toolTip == val)
            return;
        this.toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
}

class SgsTemplet extends Laya.Templet {
    constructor() {
        super();
    }
    _textureComplete() {
        if (this["_isDestroyed"]) {
            this.destroy();
            return;
        }
        Laya.Templet.prototype["_textureComplete"].call(this);
    }
    _parsePublicExtData() {
        if (this["_isDestroyed"]) {
            this.destroy();
            return;
        }
        Laya.Templet.prototype["_parsePublicExtData"].call(this);
    }
    getAnimationCount() {
        if (!this["_anis"])
            return 0;
        return super.getAnimationCount();
    }
    getNodes(aniIndex) {
        if (!this["_anis"] || this["_anis"].length <= aniIndex)
            return null;
        return super.getNodes(aniIndex);
    }
    getGrahicsDataWithCache(aniIndex, frameIndex) {
        if (!this["_graphicsCache"] || this["_graphicsCache"].length <= aniIndex || this["_graphicsCache"][aniIndex].length <= frameIndex) {
            return null;
        }
        return super.getGrahicsDataWithCache(aniIndex, frameIndex);
    }
    setGrahicsDataWithCache(aniIndex, frameIndex, graphics) {
        if (!this["_graphicsCache"] || this["_graphicsCache"].length <= aniIndex)
            return;
        super.setGrahicsDataWithCache(aniIndex, frameIndex, graphics);
    }
    getOriginalData(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime) {
        if (!this["_anis"] || this["_anis"].length <= aniIndex)
            return;
        super.getOriginalData(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime);
    }
    set skBufferUrl(val) {
    }
    get skBufferUrl() {
        return this["_skBufferUrl"];
    }
    checkTempletRes() {
        if (!this.getPublicExtData())
            return false;
        let mainTexture = this["_mainTexture"];
        if (!mainTexture || mainTexture.destroyed)
            return false;
        let textureDic = this["_textureDic"];
        if (!textureDic)
            return false;
        let textureExist = false;
        for (let key in textureDic) {
            if (!key)
                continue;
            textureExist = true;
            if (!textureDic[key] || textureDic[key].destroyed)
                return false;
        }
        return textureExist;
    }
    hasTempletRes(url) {
        if (this["_skBufferUrl"] == url)
            return true;
        let loadList = this["_loadList"];
        if (loadList && loadList.length > 0) {
            for (let i = 0; i < loadList.length; i++) {
                if (loadList[i] == url)
                    return true;
            }
        }
        return false;
    }
}

//import SgsFlatContainer from "./SgsFlatContainer";
//import Global from "../../../Global";
//import EventExpand from "../../../event/EventExpand";
//import TipsManager from "../../../mode/base/TipsManager";
class SgsSprite extends Laya.Sprite {
    constructor() {
        super();
        this._realDraw = true;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.startAlpha = 1;
        this.endAlpha = 1;
        this._longDowned = false;
        this.tipTriggerType = "";
        this._toolTip = "";
        this.drawContaniers = [];
        this.textureList = [];
    }
    getGraphicBounds(realSize) {
        if (!this._realDraw) {
            return super.getGraphicBounds(realSize);
        }
        else {
            let localP = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            localP = this.globalToLocal(localP);
            let hitRect = Laya.MouseManager.instance ? Laya.MouseManager.instance["_rect"] : null;
            if (hitRect) {
                hitRect.setTo(0, 0, this.width, this.height);
                if (!hitRect.contains(localP.x, localP.y))
                    return hitRect;
            }
            let rect = new Laya.Rectangle();
            let sgsTexture = this.getTextureByPosition(Laya.stage.mouseX, Laya.stage.mouseY);
            if (sgsTexture) {
                rect.setTo(localP.x - 1, localP.y - 1, 2, 2);
            }
            else {
                rect.setTo(localP.x + 1, localP.y + 1, 0, 0);
            }
            return rect;
        }
    }
    addDrawChild(child) {
        if (child instanceof SgsFlatContainer) {
            if (this.drawContaniers.indexOf(child) == -1)
                this.drawContaniers.push(child);
            child.Draw(this);
        }
        else {
            if (this.textureList.indexOf(child) == -1)
                this.textureList.push(child);
            child.draw(this);
        }
    }
    addDrawChildAt(child, index) {
        if (child instanceof SgsFlatContainer) {
            if (this.drawContaniers.indexOf(child) == -1)
                this.drawContaniers.splice(index, 0, child);
            child.Draw(this, index);
        }
        else {
            if (this.textureList.indexOf(child) == -1)
                this.textureList.splice(index, 0, child);
            child.draw(this, index);
        }
    }
    removeDrawChild(child, destroy = true) {
        if (child instanceof SgsFlatContainer) {
            child.ClearDraw(destroy);
            if (!this.drawContaniers || this.drawContaniers.length <= 0)
                return;
            let index = this.drawContaniers.indexOf(child);
            if (index > -1) {
                this.drawContaniers.splice(index, 1);
            }
        }
        else {
            child.clear(destroy);
            if (!this.textureList || this.textureList.length <= 0)
                return;
            let index = this.textureList.indexOf(child);
            if (index > -1) {
                this.textureList.splice(index, 1);
            }
        }
    }
    getDrawChildStartIndex(child) {
        return child.startIndex;
    }
    getDrawChildEndIndex(child) {
        return child.endIndex;
    }
    setDrawChildIndex(child, index) {
        child.index = index;
    }
    get drawCount() {
        let graphicsCmds = this.graphics.cmds;
        if (graphicsCmds) {
            return graphicsCmds.length;
        }
        else if (this.graphics["_one"]) {
            return 1;
        }
        return 0;
    }
    set realDraw(value) {
        this._realDraw = value;
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this._toolTip;
    }
    set ToolTip(val) {
        if (this._toolTip == val)
            return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    get StartX() {
        return this.startX;
    }
    set StartX(val) {
        this.startX = val;
    }
    get EndX() {
        return this.endX;
    }
    set EndX(val) {
        this.endX = val;
    }
    get StartY() {
        return this.startY;
    }
    set StartY(val) {
        this.startY = val;
    }
    get EndY() {
        return this.endY;
    }
    set EndY(val) {
        this.endY = val;
    }
    set StartAlpha(val) {
        this.startAlpha = val;
    }
    set EndAlpha(val) {
        this.endAlpha = val;
    }
    get StartAlpha() {
        return this.startAlpha;
    }
    get EndAlpha() {
        return this.endAlpha;
    }
    addDrawClick() {
        this.on(Laya.Event.CLICK, this, this.onClick);
    }
    removeDrawClick() {
        this.off(Laya.Event.CLICK, this, this.onClick);
    }
    addDrawMouseEvent() {
        this.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.on(Laya.Event.ROLL_OUT, this, this.onRollOut);
        this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
    }
    removeDrawMouseEvent() {
        this.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.off(Laya.Event.ROLL_OUT, this, this.onRollOut);
        this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
    }
    onRollOut(e) {
        if (this.lastRolloverTexute) {
            this.lastRolloverTexute.event(Laya.Event.ROLL_OUT, this.lastRolloverTexute);
            this.lastRolloverTexute = null;
        }
    }
    onMouseMove(event) {
        let target = event.currentTarget;
        if (target && target instanceof SgsSprite) {
            let tex = target.getTextureByPosition(event.stageX, event.stageY);
            if (this.lastRolloverTexute != tex) {
                if (this.lastRolloverTexute && !this.isInOverlap(this.lastRolloverTexute, event.stageX, event.stageY)) {
                    this.lastRolloverTexute.event(Laya.Event.ROLL_OUT, this.lastRolloverTexute);
                    this.lastRolloverTexute = null;
                }
                if (tex) {
                    tex.event(Laya.Event.ROLL_OVER, tex);
                    this.lastRolloverTexute = tex;
                }
            }
            if (tex) {
                tex.event(Laya.Event.MOUSE_MOVE, tex);
            }
        }
    }
    isInOverlap(tex1, sx, sy) {
        let flag = false;
        let localP = new Laya.Point(sx, sy);
        localP = this.globalToLocal(localP);
        if (tex1.renderX + tex1.renderWidth > localP.x && localP.x >= tex1.renderX && tex1.renderY + tex1.renderHeight > localP.y && localP.y >= tex1.renderY) {
            flag = true;
        }
        return flag;
    }
    onMouseDown(event) {
        let target = event.currentTarget;
        if (target && target instanceof SgsSprite) {
            let tex = target.getTextureByPosition(event.stageX, event.stageY);
            if (tex) {
                tex.event(Laya.Event.MOUSE_DOWN, tex);
                this.lastRolloverTexute = tex;
            }
        }
    }
    onMouseUp(event) {
        let target = event.currentTarget;
        if (target && target instanceof SgsSprite) {
            let tex = target.getTextureByPosition(event.stageX, event.stageY);
            if (tex) {
                tex.event(Laya.Event.MOUSE_UP, tex);
                this.lastRolloverTexute = tex;
            }
        }
    }
    onClick(event) {
        let target = event.currentTarget;
        if (target && target instanceof SgsSprite) {
            let tex = target.getTextureByPosition(event.stageX, event.stageY);
            if (tex) {
                tex.event(Laya.Event.CLICK, tex);
            }
        }
    }
    getTextureByPosition(x, y) {
        let result = null;
        let cmds = this.graphics.cmds;
        cmds = cmds ? cmds : [this.graphics["_one"]];
        if (cmds) {
            let length = this.textureList.length;
            let tex;
            let localP = new Laya.Point(x, y);
            localP = this.globalToLocal(localP);
            for (let i = length - 1; i > -1; i--) {
                tex = this.textureList[i];
                if (tex.mouseEnabled && tex.renderVisible && tex.alpha >= 0.01 && tex.renderX <= localP.x && tex.renderY <= localP.y && tex.renderX + tex.renderWidth >= localP.x && tex.renderY + tex.renderHeight >= localP.y) {
                    tex.mouseOffsetX = localP.x - tex.renderX;
                    tex.mouseOffsetY = localP.y - tex.renderY;
                    result = tex;
                    break;
                }
            }
        }
        return result;
    }
    RemoveDrawChildren() {
        this.drawContaniers.forEach(child => {
            child.ClearDraw();
        });
        this.textureList.forEach(child => {
            child.clear();
        });
        this.drawContaniers.length = 0;
        this.textureList.length = 0;
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event.currentTarget]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
    destroy(destroyChild = true) {
        Laya.timer.clear(this, this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        Laya.Tween.clearTween(this);
        this.RemoveDrawChildren();
        this.lastRolloverTexute = null;
        this.removeDrawClick();
        this.removeDrawMouseEvent();
        super.destroy(destroyChild);
    }
}

//import SgsSprite from "./SgsSprite";
//import SgsTexture from "./SgsTexture";
//import RES from "../../../res/RES";
//import SgsSpriteButton from "./SgsSpriteButton";
//import FilterUtils from "../../../utils/FilterUtils";
class SgsSlider extends SgsSprite {
    constructor(isVertical = false) {
        super();
        this._value = 0;
        this._minValue = 0;
        this._maxValue = 100;
        this._enabled = true;
        this._isVertical = false;
        this._isVertical = isVertical;
        this.trackBg = new SgsTexture();
        this.addDrawChild(this.trackBg);
        this.trackBar = new SgsTexture();
        this.addDrawChild(this.trackBar);
        this.trackBtn = new SgsSpriteButton();
        this.addChild(this.trackBtn);
        this.trackBtn.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    set width(val) {
        Laya.superSetter(SgsSlider, this, "width", val);
        this.trackBg.width = val;
        this.trackBar.width = val;
        this.layoutTrackBtn();
    }
    get width() {
        return Laya.superGetter(SgsSlider, this, "width");
    }
    set height(val) {
        Laya.superSetter(SgsSlider, this, "height", val);
        this.trackBg.height = val;
        this.trackBar.height = val;
        this.layoutTrackBtn();
    }
    get height() {
        return Laya.superGetter(SgsSlider, this, "height");
    }
    set bgSkin(val) {
        this.trackBg.texture = RES.GetRes(val);
        if (this.width <= 0)
            this.width = this.trackBg.width;
        if (this.height <= 0)
            this.height = this.trackBg.height;
    }
    set bgSizeGrid(val) {
        this.trackBg.sizeGrid = val;
    }
    set barSkin(val) {
        this.trackBar.texture = RES.GetRes(val);
    }
    set barSizeGrid(val) {
        this.trackBar.sizeGrid = val;
    }
    setBtnSkin(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "", selectedDisableSkin = "") {
        this.trackBtn.InitSkin(upSkin, overSkin, downSkin, disableSkin, selectedSkin, selectedDisableSkin);
        this.layoutTrackBtn();
    }
    setSlider(min, max, value) {
        this._minValue = min;
        this._maxValue = max;
        this.value = value;
    }
    set value(val) {
        this._value = val;
        this.updateView();
    }
    get value() {
        return this._value;
    }
    set enabled(val) {
        if (this._enabled == val)
            return;
        this._enabled = val;
        this.mouseEnabled = val;
        this.filters = val ? null : FilterUtils.GetGrayFilter();
        if (!this._enabled) {
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.trackBtn.stopDrag();
        }
    }
    get enabled() {
        return this._enabled;
    }
    onMouseDown(e) {
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        let rect;
        if (this._isVertical)
            rect = new Laya.Rectangle(this.width - this.trackBtn.width >> 1, -(this.trackBtn.height >> 1), 0, this.height);
        else
            rect = new Laya.Rectangle(-(this.trackBtn.width >> 1), this.height - this.trackBtn.height >> 1, this.width, 0);
        this.trackBtn.startDrag(rect);
    }
    onMouseMove(e) {
        this.updateValue();
    }
    updateValue() {
        let oldValue = this._value;
        let num = this._maxValue - this._minValue;
        if (this._isVertical)
            this._value = ((this.trackBtn.y >> 0) + (this.trackBtn.height >> 1)) / this.height * num + this._minValue;
        else
            this._value = ((this.trackBtn.x >> 0) + (this.trackBtn.width >> 1)) / this.width * num + this._minValue;
        if (this._value < this._minValue)
            this._value = this._minValue;
        else if (this._value > this._maxValue)
            this._value = this._maxValue;
        if (oldValue != this._value) {
            this.updateView();
            this.event(Laya.Event.CHANGE, this);
        }
    }
    updateView() {
        let num = this._maxValue - this._minValue;
        let barValue = 0;
        if (this._isVertical) {
            barValue = this.height * (this._value - this._minValue) / num >> 0;
            this.trackBtn.x = barValue - (this.trackBtn.height >> 1);
            this.trackBar.height = barValue;
        }
        else {
            barValue = this.width * (this._value - this._minValue) / num >> 0;
            this.trackBtn.x = barValue - (this.trackBtn.width >> 1);
            this.trackBar.width = barValue;
        }
        this.trackBar.visible = barValue > 0 ? true : false;
    }
    onMouseUp(e) {
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.trackBtn.stopDrag();
        this.updateValue();
        e.stopPropagation();
    }
    layoutTrackBtn() {
        if (this._isVertical)
            this.trackBtn.x = this.width - this.trackBtn.width >> 1;
        else
            this.trackBtn.y = this.height - this.trackBtn.height >> 1;
    }
    destroy() {
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.trackBtn.stopDrag();
        super.destroy();
    }
}

//import EventExpand from "../../../event/EventExpand";
//import Global from "../../../Global";
//import TipsManager from "../../../mode/base/TipsManager";
class SgsSkeleton extends Laya.Skeleton {
    constructor(temp, mode) {
        super(temp, mode);
        this._longDowned = false;
        this.tipTriggerType = "";
        this._toolTip = "";
        this.playLoop = false;
        this.buttonMode = false;
        this._playbackRate = 1;
    }
    init(temp, mode) {
        if (this.destroyed || !temp || temp.destroyed)
            return;
        if (this["_templet"]) {
            this["_templet"]["_removeReference"](1);
            this["_templet"] = null;
        }
        if (this["_player"]) {
            this["_player"]["offAll"]();
            this["_player"] = null;
        }
        this["_pathDic"] = null;
        this["_curOriginalData"] = null;
        this["_boneSlotDic"] = null;
        this["_bindBoneBoneSlotDic"] = null;
        this["_boneSlotArray"] = null;
        if (this["_boneMatrixArray"])
            this["_boneMatrixArray"].length = 0;
        if (this["_soundChannelArr"].length > 0) {
            this["_onAniSoundStoped"](true);
        }
        super.init(temp, mode);
        if (this._playbackRate != 1)
            super.playbackRate(this._playbackRate);
    }
    play(nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
        if (this.destroyed || !this.templet || this.templet.destroyed)
            return;
        super.play(nameOrIndex, loop, force, start, end, freshSkin, playAudio);
    }
    playbackRate(value) {
        this._playbackRate = value;
        super.playbackRate(value);
    }
    GetPlaybackRate() {
        return this._playbackRate;
    }
    _update(autoKey) {
        if (this.destroyed || !this["_templet"] || this["_templet"]["_isDestroyed"]) {
            this.offAll(Laya.Event.STOPPED);
            super.stop();
            return;
        }
        Laya.Skeleton.prototype["_update"].call(this, autoKey);
    }
    _createGraphics(_clipIndex) {
        if (this.destroyed || !this["_templet"] || this["_templet"]["_isDestroyed"]) {
            this.offAll(Laya.Event.STOPPED);
            super.stop();
            return;
        }
        Laya.Skeleton.prototype["_createGraphics"].call(this, _clipIndex);
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this._toolTip;
    }
    set ToolTip(val) {
        if (this._toolTip == val)
            return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event.currentTarget]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
    destroy(destroyChild = true) {
        Laya.timer.clear(this, this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        this.offAll(Laya.Event.STOPPED);
        super.stop();
        this.removeSelf();
        this.removeChildren();
        let templet = this.templet;
        super.destroy(destroyChild);
        let graphicsCache = templet && !templet["_isDestroyed"] && templet["_graphicsCache"];
        if (graphicsCache) {
            for (var i = 0, n = graphicsCache.length; i < n; i++) {
                for (var j = 0, len = graphicsCache[i].length; j < len; j++) {
                    var gp = graphicsCache[i][j];
                    if (gp && gp._sp && gp._sp === this)
                        gp._sp = null;
                }
            }
        }
        templet = null;
    }
}

//import SgsSpriteRadio from "./SgsSpriteRadio";
//import SgsFlatRadio from "./SgsFlatRadio";
//import SgsSprite from "./SgsSprite";
class SgsRadioGroup extends Laya.EventDispatcher {
    constructor(render, isFlat = false, otherRenders = null) {
        super();
        this._x = 0;
        this._y = 0;
        this._space = 10;
        this._rowledge = 10;
        this._direction = SgsRadioGroup.HORIZONTAL;
        this._visible = true;
        this._enabled = true;
        this._upSkin = "";
        this._overSkin = "";
        this._downSkin = "";
        this._disableSkin = "";
        this._selectedSkin = "";
        this._enabledField = "enabled";
        this._labelField = "label";
        this._labelColors = "";
        this._labelSize = Laya.Text.defaultFontSize;
        this._labelFont = Laya.Text.defaultFont;
        this._strokeColors = "";
        this._labelStroke = 0;
        this._labelBold = false;
        this._labelItalic = false;
        this._labelPadding = "";
        this._selectedIndex = -1;
        this._isCreate = false;
        this.isFlat = false;
        this._lineLength = 10000;
        this._linefeed = false;
        this._styleChanged = false;
        this.render = render;
        if (this.render)
            this.render.on("destroyEvent", this, this.onFollowDestroy);
        this.isFlat = isFlat;
        this.otherRenders = otherRenders;
    }
    set x(value) {
        if (this._x == value)
            return;
        this._x = value;
        this.layout();
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y == value)
            return;
        this._y = value;
        this.layout();
    }
    get y() {
        return this._y;
    }
    set LineLength(value) {
        if (value > 0 && value % 1 === 0)
            this._lineLength = value;
    }
    get LineLength() {
        return this._lineLength;
    }
    set Linefeed(value) {
        this._linefeed = value;
    }
    get Linefeed() {
        return this._linefeed;
    }
    set enabled(value) {
        this._enabled = value;
        if (this._radioList) {
            let radio;
            for (let i = 0; i < this._radioList.length; i++) {
                radio = this._radioList[i];
                radio.enabled = this._enabled;
            }
        }
    }
    get enabled() {
        return this._enabled;
    }
    set visible(value) {
        this._visible = value;
        if (this._radioList) {
            let radio;
            for (let i = 0; i < this._radioList.length; i++) {
                radio = this._radioList[i];
                radio.visible = this._visible;
            }
        }
    }
    get visible() {
        return this._visible;
    }
    set space(value) {
        this._space = value;
        this.layout();
    }
    set Rowledge(value) {
        this._rowledge = value;
        this.layout();
    }
    set direction(value) {
        this._direction = value;
        this.layout();
    }
    set childList(value) {
        this.removeChilds();
        if (!value || value.length <= 0)
            return;
        this._childList = [];
        for (let i = 0; i < value.length; i++) {
            this._childList.push(value[i]);
        }
        this.createChilds();
    }
    Clear() {
        this.removeChilds();
        if (this.render) {
            this.render.off("destroyEvent", this, this.onFollowDestroy);
            this.render = null;
        }
        this.otherRenders = null;
        this.offAll();
    }
    InitSkin(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "") {
        this._upSkin = upSkin;
        this._overSkin = overSkin;
        this._downSkin = downSkin;
        this._disableSkin = disableSkin;
        this._selectedSkin = selectedSkin;
        this.createChilds();
    }
    get SelectedValue() {
        if (!this._childList || this._childList.length <= 0)
            return -1;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._childList.length)
            return -1;
        return this._childList[this._selectedIndex].value;
    }
    set SelectedValue(value) {
        this.selectedIndex = this.getIndexByValue(value);
        this.updateRadioState();
    }
    getIndexByValue(value) {
        if (!this._childList || this._childList.length <= 0)
            return -1;
        let result = -1;
        let data;
        for (let i = 0; i < this._childList.length; i++) {
            data = this._childList[i];
            if (typeof (data) == "object") {
                if (this._childList[i].value == value) {
                    result = i;
                    break;
                }
            }
        }
        return result;
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        this._selectedIndex = value;
        this.updateRadioState();
    }
    get selectedItem() {
        if (!this._childList || this._childList.length <= 0)
            return null;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._childList.length)
            return null;
        return this._childList[this._selectedIndex];
    }
    get selectedRadio() {
        if (!this._radioList || this._radioList.length <= 0)
            return null;
        if (this._selectedIndex < 0 || this._selectedIndex >= this._radioList.length)
            return null;
        return this._radioList[this._selectedIndex];
    }
    set labelField(value) {
        this._labelField = value;
    }
    set labelColors(value) {
        this._labelColors = value;
        this.styleChanged();
    }
    set labelSize(value) {
        this._labelSize = value;
        this.styleChanged();
    }
    set labelFont(value) {
        this._labelFont = value;
        this.styleChanged();
    }
    set strokeColors(value) {
        this._strokeColors = value;
        this.styleChanged();
    }
    set labelStroke(value) {
        this._labelStroke = value;
        this.styleChanged();
    }
    set labelBold(value) {
        this._labelBold = value;
        this.styleChanged();
    }
    set labelItalic(value) {
        this._labelItalic = value;
        this.styleChanged();
    }
    set labelPadding(value) {
        this._labelPadding = value;
        this.styleChanged();
    }
    RemoveChildByValue(val) {
        let index = this.getIndexByValue(val);
        let radio = this._radioList[index];
        if (radio) {
            this._radioList.splice(index, 1);
            if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite) {
                this.render.removeDrawChild(radio);
            }
            else if (radio instanceof SgsSprite) {
                if (radio.parent)
                    radio.parent.removeChild(radio);
            }
            this.layout();
        }
    }
    RemoveChildWithoutValue(val) {
        let index = this.getIndexByValue(val);
        let radio = this._radioList[index];
        for (let i = 0; i < this._radioList.length; i++) {
            let radio1 = this._radioList[i];
            if (radio1 != radio) {
                this._radioList.splice(i, 1);
                if (radio1 instanceof SgsFlatRadio && this.render instanceof SgsSprite) {
                    this.render.removeDrawChild(radio1);
                }
                else if (radio1 instanceof SgsSprite) {
                    if (radio1.parent)
                        radio1.parent.removeChild(radio1);
                }
                i--;
            }
        }
        this.layout();
    }
    createChilds() {
        if (!this.render)
            return;
        if (!this._childList || this._childList.length <= 0)
            return;
        if (this._upSkin == "")
            return;
        if (this._isCreate)
            return;
        this._isCreate = true;
        this._radioList = [];
        let radio;
        let data;
        for (let i = 0; i < this._childList.length; i++) {
            data = this._childList[i];
            if (this.isFlat)
                radio = new SgsFlatRadio(this.otherRenders);
            else
                radio = new SgsSpriteRadio();
            radio.name = i.toString();
            radio.enabled = this._enabled;
            radio.visible = this._visible;
            radio.InitSkin(this._upSkin, this._overSkin, this._downSkin, this._disableSkin, this._selectedSkin);
            radio.on(Laya.Event.CHANGE, this, this.onChange);
            if (typeof (data) == "string") {
                radio.label = data;
            }
            else if (typeof (data) == "number") {
                radio.label = data.toString();
            }
            else {
                radio.label = data[this._labelField];
            }
            if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite)
                this.render.addDrawChild(radio);
            else
                this.render.addChild(radio);
            this._radioList.push(radio);
        }
        this.updateRadioState();
        this.styleChanged();
    }
    removeChilds() {
        if (!this.render)
            return;
        if (this._childList) {
            while (this._childList.length > 0) {
                this._childList.pop();
            }
            this._childList = null;
        }
        if (this._radioList) {
            let radio;
            while (this._radioList.length > 0) {
                radio = this._radioList.pop();
                radio.off(Laya.Event.CHANGE, this, this.onChange);
                if (radio instanceof SgsFlatRadio && this.render instanceof SgsSprite) {
                    this.render.removeDrawChild(radio);
                }
                else if (radio instanceof SgsSprite) {
                    if (radio.parent)
                        radio.parent.removeChild(radio);
                }
            }
            this._radioList = null;
        }
        this._isCreate = false;
        this._styleChanged = false;
    }
    onChange(event) {
        let index = -1;
        if (event instanceof SgsFlatRadio)
            index = parseInt(event.name);
        else if (event instanceof Laya.Event)
            index = parseInt(event.currentTarget.name);
        this._selectedIndex = index;
        this.updateRadioState();
        this.event(Laya.Event.CHANGE, this);
    }
    updateRadioState() {
        if (!this._radioList || this._radioList.length <= 0)
            return;
        let radio;
        for (let i = 0; i < this._radioList.length; i++) {
            radio = this._radioList[i];
            radio.selected = i == this._selectedIndex ? true : false;
        }
    }
    styleChanged() {
        if (!this._styleChanged) {
            this._styleChanged = true;
            Laya.timer.callLater(this, this.changeChanged);
        }
    }
    changeChanged() {
        if (!this._radioList || this._radioList.length <= 0)
            return;
        let radio;
        for (let i = 0; i < this._radioList.length; i++) {
            radio = this._radioList[i];
            if (this._labelColors != "")
                radio.labelColors = this._labelColors;
            radio.labelSize = this._labelSize;
            radio.labelFont = this._labelFont;
            if (this._strokeColors != "")
                radio.strokeColors = this._strokeColors;
            radio.labelStroke = this._labelStroke;
            radio.labelBold = this._labelBold;
            radio.labelItalic = this._labelItalic;
            if (this._labelPadding != "")
                radio.labelPadding = this._labelPadding;
        }
        this.layout();
    }
    layout() {
        if (!this._radioList || this._radioList.length <= 0)
            return;
        let lastRadio;
        let radio;
        for (let i = 0; i < this._radioList.length; i++) {
            radio = this._radioList[i];
            if (this._direction == SgsRadioGroup.HORIZONTAL) {
                if (this._linefeed && this._lineLength > 0) {
                    if (i % this._lineLength === 0) {
                        radio.x = this._x;
                    }
                    else {
                        radio.x = lastRadio ? lastRadio.x + lastRadio.width + this._space : this._x;
                    }
                    radio.y = this._y + Math.floor(i / this._lineLength) * this._rowledge;
                }
                else {
                    radio.x = lastRadio ? lastRadio.x + lastRadio.width + this._space : this._x;
                    radio.y = this._y;
                }
            }
            else {
                if (this._linefeed && this._lineLength > 0) {
                }
                else {
                    radio.y = lastRadio ? lastRadio.y + lastRadio.height + this._space : this._y;
                    radio.x = this._x;
                }
            }
            lastRadio = radio;
        }
    }
    onFollowDestroy(target) {
        this.Clear();
    }
}
SgsRadioGroup.HORIZONTAL = "horizontal";
SgsRadioGroup.VERTICAL = "vertical";

//import RES from "../../../res/RES";
class SgsLoadTexture {
    constructor(complete) {
        this._url = "";
        this.isThorough = false;
        this._complete = complete;
    }
    completeFun(complete) {
        this._complete = complete;
    }
    loadTexture(value) {
        if (this._url == value) {
            if (this._texture && this._texture.url == value) {
                this.runComplete(this._texture);
            }
            return;
        }
        this._texture = null;
        this.clearTexure();
        this._url = value;
        if (this._url == "" || this._url == null)
            return;
        RES.AddReference(value);
        RES.GetResByUrl(value, this, this.loadComplete, "image");
    }
    get url() {
        return this._url;
    }
    get texture() {
        return this._texture;
    }
    set texture(value) {
        this._texture = value;
        this.clearTexure();
        this._url = null;
    }
    get width() {
        return this._texture ? this._texture.width : 0;
    }
    get height() {
        return this._texture ? this._texture.height : 0;
    }
    loadComplete(texture, key) {
        if (this._url != key)
            return;
        if (!texture) {
            this._texture = null;
            this.runComplete(null);
        }
        else {
            this._texture = texture;
            this.runComplete(this._texture);
        }
    }
    runComplete(texture) {
        if (this._complete)
            this._complete.runWith(texture);
    }
    clearTexure() {
        if (this._url) {
            RES.DelReference(this._url);
            RES.CancelGetResByUrl(this._url, this, this.loadComplete);
            RES.ClearResByUrl(this._url);
        }
    }
    clear() {
        this._complete = null;
        this._texture = null;
        this.clearTexure();
        this._url = null;
    }
}

//import EventExpand from "../../../event/EventExpand";
//import Global from "../../../Global";
//import TipsManager from "../../../mode/base/TipsManager";
//import RES from "../../../res/RES";
//import TextureAtlasManager from "../../../textureAtlas/TextureAtlasManager";
class SgsImage extends Laya.Image {
    constructor(skin = "") {
        super(skin);
        this._longDowned = false;
        this.tipTriggerType = "";
        this._toolTip = "";
        this.autoClear = true;
        this.onlyDestroyClear = false;
        this.isMergeAtlas = true;
    }
    set skin(value) {
        if (this._skin == value) {
            if (this.source && this.source.url == value)
                this.event(Laya.Event.COMPLETE, this);
            return;
        }
        if (this._skin) {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin, this, this.loadSkinComplete);
        }
        this.source = null;
        this._skin = value;
        this.clearLoadedSkins(false);
        if (!this._skin)
            return;
        RES.AddReference(value);
        this.addLoadSkin(value);
        this.loadSkin();
    }
    get skin() {
        return Laya.superGetter(SgsImage, this, "skin");
    }
    set source(value) {
        Laya.superSetter(SgsImage, this, "source", value);
    }
    get source() {
        if (!this["_bitmap"])
            return null;
        return Laya.superGetter(SgsImage, this, "source");
    }
    set TipTriggerType(val) {
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
            this.addSelfEvent();
    }
    get ToolTip() {
        return this._toolTip;
    }
    set ToolTip(val) {
        if (this._toolTip == val)
            return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val, this.tipTriggerType, this);
    }
    loadSkin() {
        RES.GetResByUrl(this._skin, this, this.loadSkinComplete, "image", this._skin);
    }
    loadSkinComplete(texture, key) {
        if (this._skin != key)
            return;
        if (!texture) {
            this.source = null;
            this.event(Laya.Event.ERROR, this);
        }
        else {
            if (this.isMergeAtlas && TextureAtlasManager.Instance)
                TextureAtlasManager.Instance.NeedPushAtlas(texture);
            this.setSource(key, texture);
            this.event(Laya.Event.COMPLETE, this);
        }
    }
    addLoadSkin(url) {
        if (!this.loadedSkins)
            this.loadedSkins = [];
        if (url && this.loadedSkins.indexOf(url) == -1)
            this.loadedSkins.push(url);
    }
    clearLoadedSkins(destroy = true) {
        if (!this.autoClear)
            return;
        if (this.onlyDestroyClear && !destroy)
            return;
        if (!this.loadedSkins || this.loadedSkins.length <= 0)
            return;
        let url;
        for (let i = 0; i < this.loadedSkins.length; i++) {
            url = this.loadedSkins[i];
            if (!destroy && url == this._skin)
                continue;
            RES.ClearResByUrl(url);
        }
        this.loadedSkins.length = 0;
        if (!destroy && this._skin)
            this.loadedSkins.push(this._skin);
    }
    get longDowned() {
        return this._longDowned;
    }
    addSelfEvent() {
        this.on(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    removeSelfEvent() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onSelfUp);
    }
    onSelfDown(event) {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime, this, this.onLongTimer, [event.currentTarget]);
    }
    onSelfUp(event) {
        Laya.timer.clear(this, this.onLongTimer);
    }
    onLongTimer(event) {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN, event);
    }
    destroy(destroyChild = true) {
        if (this._skin) {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin, this, this.loadSkinComplete);
        }
        Laya.timer.clear(this, this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        super.destroy(destroyChild);
        this.clearLoadedSkins(true);
        this._skin = null;
    }
}

class SgsHTMLDivElement extends Laya.HTMLDivElement {
    constructor() {
        super();
        this.needRelayout = false;
        this.on(Laya.Event.LINK, this, this.onLink);
    }
    get element() {
        return this["_element"];
    }
    get styleHeight() {
        return this.height;
    }
    set styleHeight(val) {
        this.height = val;
    }
    get fontFamily() {
        return this.style.family;
    }
    set fontFamily(value) {
        this.style.family = value;
    }
    get fontSize() {
        return this.style.fontSize;
    }
    set fontSize(value) {
        this.style.fontSize = value;
    }
    get color() {
        return this.style.color;
    }
    set color(value) {
        this.style.color = value;
    }
    get strokeColor() {
        return this.style.strokeColor;
    }
    set strokeColor(value) {
        this.style.strokeColor = value;
    }
    get leading() {
        return this.style.leading;
    }
    set leading(val) {
        this.style.leading = val;
    }
    get letterSpacing() {
        return this.style.letterSpacing;
    }
    set letterSpacing(val) {
        this.style.letterSpacing = val;
    }
    set italic(value) {
        this.style.italic = value;
    }
    get italic() {
        return this.style.italic;
    }
    get bold() {
        return this.style.bold;
    }
    set bold(val) {
        this.style.bold = val;
    }
    get wordWrap() {
        return this.style.wordWrap;
    }
    set wordWrap(val) {
        this.style.wordWrap = val;
    }
    get align() {
        return this.style.align;
    }
    set align(val) {
        this.style.align = val;
    }
    get valign() {
        return this.style.valign;
    }
    set valign(val) {
        this.style.valign = val;
    }
    set NeedRelayout(val) {
        this.needRelayout = val;
    }
    set innerHTML(text) {
        Laya.superSetter(SgsHTMLDivElement, this, "innerHTML", text);
        if (this.style && !this.style.textDecoration) {
            this.style.textDecoration = "none";
        }
        if (this["_element"] && this["_element"]["_children"]) {
            let childs = this["_element"]["_children"];
            let length = childs.length;
            let htmlItem;
            for (let i = 0; i < length; ++i) {
                htmlItem = childs[i];
                if (htmlItem && htmlItem.style)
                    if (!htmlItem.style.textDecoration)
                        htmlItem.style.textDecoration = "none";
            }
        }
    }
    onLink(href) {
        let target = this.parent;
        while (target) {
            target.event(Laya.Event.LINK, [href]);
            target = target.parent;
        }
    }
    repaint() {
        super.repaint();
        if (this.needRelayout) {
            this.event(SgsHTMLDivElement.HTML_REPAINT, this);
        }
    }
}
SgsHTMLDivElement.HTML_REPAINT = "HTML_REPAINT";

//import RES from "../../../res/RES";
//import TextureAtlasManager from "../../../textureAtlas/TextureAtlasManager";
//import SgsTexture from "./SgsTexture";
class SgsFlatImage extends SgsTexture {
    constructor(texture = null) {
        super(texture);
        this._skin = "";
        this.autoClear = true;
        this.onlyDestroyClear = false;
        this.isMergeAtlas = true;
    }
    set skin(value) {
        if (this._skin == value) {
            if (this.texture && this.texture.url == value)
                this.event(Laya.Event.COMPLETE, this);
            return;
        }
        if (this._skin) {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin, this, this.loadSkinComplete);
        }
        this.texture = null;
        this._skin = value;
        this.clearLoadedSkins(false);
        if (!this._skin)
            return;
        RES.AddReference(value);
        this.addLoadSkin(value);
        this.loadSkin();
    }
    get skin() {
        return this._skin;
    }
    loadSkin() {
        RES.GetResByUrl(this._skin, this, this.loadSkinComplete, "image", this._skin);
    }
    loadSkinComplete(texture, key) {
        if (this._skin != key)
            return;
        if (!texture) {
            this.texture = null;
            this.event(Laya.Event.ERROR, this);
        }
        else {
            if (this.isMergeAtlas && TextureAtlasManager.Instance)
                TextureAtlasManager.Instance.NeedPushAtlas(texture);
            this.texture = texture;
            this.event(Laya.Event.COMPLETE, this);
        }
    }
    addLoadSkin(url) {
        if (!this.loadedSkins)
            this.loadedSkins = [];
        if (url && this.loadedSkins.indexOf(url) == -1)
            this.loadedSkins.push(url);
    }
    clearLoadedSkins(destroy = true) {
        if (!this.autoClear)
            return;
        if (this.onlyDestroyClear && !destroy)
            return;
        if (!this.loadedSkins || this.loadedSkins.length <= 0)
            return;
        let url;
        for (let i = 0; i < this.loadedSkins.length; i++) {
            url = this.loadedSkins[i];
            if (!destroy && url == this._skin)
                continue;
            RES.ClearResByUrl(url);
        }
        this.loadedSkins.length = 0;
        if (!destroy && this._skin)
            this.loadedSkins.push(this._skin);
    }
    clear(destroy = true) {
        if (destroy && this._skin) {
            RES.DelReference(this._skin);
            RES.CancelGetResByUrl(this._skin, this, this.loadSkinComplete);
        }
        super.clear(destroy);
        this.clearLoadedSkins(destroy);
        if (destroy)
            this._skin = null;
    }
}

//import SgsTexture from "./SgsTexture";
//import SgsText from "./SgsText";
class SgsFlatContainer extends Laya.EventDispatcher {
    constructor(otherRenders = null) {
        super();
        this.invalidateDisplayListFlag = false;
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._name = "";
        this._visible = true;
        this._scaleX = 1;
        this._scaleY = 1;
        this._mouseEnabled = false;
        this._destroyed = false;
        this.otherRenders = otherRenders;
        if (this.otherRenders) {
            this.otherChilds = [];
            let length = this.otherRenders.length;
            for (let i = 0; i < length; i++) {
                this.otherChilds.push([]);
            }
        }
        this.childs = [];
    }
    get Render() {
        return this.render;
    }
    set x(value) {
        this.pos(value, this._y);
    }
    get x() {
        return this._x;
    }
    set y(value) {
        this.pos(this._x, value);
    }
    get y() {
        return this._y;
    }
    get renderX() {
        return this.parentContainer ? this.parentContainer.renderX + this.x * this.parentContainer.renderScaleX : this.x;
    }
    get renderY() {
        return this.parentContainer ? this.parentContainer.renderY + this.y * this.parentContainer.renderScaleY : this.y;
    }
    get destroyed() {
        return this._destroyed;
    }
    get globalPoint() {
        if (!this._globalPoint)
            this._globalPoint = new Laya.Point();
        if (this.render && this.drawed) {
            this._globalPoint.setTo(this.renderX, this.renderY);
            this._globalPoint = this.render.localToGlobal(this._globalPoint);
        }
        else {
            this._globalPoint.setTo(0, 0);
        }
        return this._globalPoint;
    }
    set width(value) {
        this.size(value, this._height);
    }
    get width() {
        return this._width;
    }
    set height(value) {
        this.size(this._width, value);
    }
    get height() {
        return this._height;
    }
    set name(value) {
        this._name = value;
    }
    get name() {
        return this._name;
    }
    Draw(render, index = -1) {
        if (!render)
            return;
        this.render = render;
        let startIndex = index;
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                if (startIndex < 0) {
                    this.render.addDrawChild(child);
                }
                else {
                    this.render.addDrawChildAt(child, startIndex);
                    startIndex = child.endIndex + 1;
                }
            });
        }
        if (this.otherChilds && this.otherChilds.length > 0) {
            let spStartIndex = -1;
            let i = 0;
            let otherRender;
            this.otherChilds.forEach((childs) => {
                startIndex = index;
                spStartIndex = index;
                if (childs && this.otherRenders && this.otherRenders.length > i) {
                    otherRender = this.otherRenders[i];
                    if (otherRender) {
                        childs.forEach((child) => {
                            if (child instanceof Laya.Sprite) {
                                this.oherChildScale(child, child.scaleX, child.scaleY);
                                this.oherChildVisible(child, child.visible);
                                if (spStartIndex < 0)
                                    otherRender.addChild(child);
                                else {
                                    otherRender.addChildAt(child, spStartIndex);
                                    spStartIndex++;
                                }
                            }
                            else {
                                if (startIndex < 0) {
                                    otherRender.addDrawChild(child);
                                }
                                else {
                                    otherRender.addDrawChildAt(child, startIndex);
                                    startIndex = child.endIndex + 1;
                                }
                            }
                        });
                    }
                }
                i++;
            });
        }
    }
    set index(index) {
        if (!this.render)
            return;
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                child.index = index;
                index = child.endIndex + 1;
            });
        }
    }
    ClearDraw(destroy = true) {
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                this.removeChildMouseEvent(child);
                if (this.render)
                    this.render.removeDrawChild(child, destroy);
                else if (child instanceof SgsFlatContainer)
                    child.ClearDraw(destroy);
                else
                    child.clear(destroy);
            });
        }
        this.render = null;
        if (this.otherChilds && this.otherChilds.length > 0) {
            let i = 0;
            let otherRender;
            this.otherChilds.forEach((childs) => {
                if (childs && this.otherRenders && this.otherRenders.length > i) {
                    otherRender = this.otherRenders[i];
                    if (otherRender) {
                        childs.forEach((child) => {
                            if (child instanceof Laya.Sprite) {
                                if (destroy) {
                                    child["parentContainer"] = null;
                                    child["otherRenderIndex"] = -1;
                                    child.destroy();
                                }
                                else
                                    otherRender.removeChild(child);
                            }
                            else
                                otherRender.removeDrawChild(child, destroy);
                        });
                    }
                }
                i++;
            });
        }
        if (destroy) {
            this._destroyed = true;
            this.childs = [];
            this.otherRenders = null;
            this.otherChilds = null;
            this.offAll();
        }
    }
    addText(child) {
        this.addDrawChild(child);
    }
    removeText(child, destroy = true) {
        this.removeDrawChild(child, destroy);
    }
    addTexture(child) {
        this.addDrawChild(child);
    }
    addTextureAt(child, index) {
        this.addDrawChildAt(child, index);
    }
    removeTexture(child, destroy = true) {
        this.removeDrawChild(child, destroy);
    }
    addDrawChild(child) {
        if (this.childs.indexOf(child) != -1)
            return;
        child.parentContainer = this;
        if (this.render) {
            let endIndex = this.endIndex;
            if (endIndex >= 0 && endIndex < this.render.drawCount) {
                this.render.addDrawChildAt(child, endIndex + 1);
            }
            else {
                this.render.addDrawChild(child);
            }
        }
        this.childs.push(child);
        if (child instanceof SgsTexture || child instanceof SgsText) {
            if (this._mouseEnabled) {
                child.mouseEnabled = true;
                this.addChildMouseEvent(child);
            }
        }
    }
    addDrawChildAt(child, index = 0) {
        if (this.childs.indexOf(child) != -1)
            return;
        if (index < 0)
            return;
        child.parentContainer = this;
        if (this.render)
            this.render.addDrawChildAt(child, index);
        this.childs.splice(index, 0, child);
        if (child instanceof SgsTexture || child instanceof SgsText) {
            if (this._mouseEnabled) {
                child.mouseEnabled = true;
                this.addChildMouseEvent(child);
            }
        }
    }
    removeDrawChild(child, destroy = true) {
        let index = this.childs.indexOf(child);
        if (index == -1) {
            if (destroy && !child.drawed) {
                if (child instanceof SgsFlatContainer)
                    child.ClearDraw(destroy);
                else
                    child.clear(destroy);
            }
            return;
        }
        child.parentContainer = null;
        this.childs.splice(index, 1);
        if (this.render)
            this.render.removeDrawChild(child, destroy);
        if (child instanceof SgsTexture || child instanceof SgsText) {
            if (this._mouseEnabled) {
                child.mouseEnabled = false;
                this.removeChildMouseEvent(child);
            }
        }
    }
    addOtherChild(otherRenderIndex, child) {
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex)
            return;
        let otherRender = this.otherRenders[otherRenderIndex];
        if (!otherRender || this.otherChilds[otherRenderIndex].indexOf(child) != -1)
            return;
        if (child instanceof Laya.Sprite) {
            child["parentContainer"] = this;
            child["otherRenderIndex"] = otherRenderIndex;
        }
        else
            child.parentContainer = this;
        if (this.render) {
            if (child instanceof Laya.Sprite) {
                this.oherChildScale(child, child.scaleX, child.scaleY);
                this.oherChildVisible(child, child.visible);
                let endIndex = this.getOtherEndIndex(otherRenderIndex, true);
                if (endIndex >= 0 && endIndex < otherRender.numChildren)
                    otherRender.addChildAt(child, endIndex + 1);
                else
                    otherRender.addChild(child);
            }
            else {
                let endIndex = this.getOtherEndIndex(otherRenderIndex, false);
                if (endIndex >= 0 && endIndex < otherRender.drawCount)
                    otherRender.addDrawChildAt(child, endIndex + 1);
                else
                    otherRender.addDrawChild(child);
            }
        }
        this.otherChilds[otherRenderIndex].push(child);
    }
    addOtherChildAt(otherRenderIndex, child, index = 0) {
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex)
            return;
        let otherRender = this.otherRenders[otherRenderIndex];
        if (!otherRender || this.otherChilds[otherRenderIndex].indexOf(child) != -1 || index < 0)
            return;
        if (child instanceof Laya.Sprite) {
            child["parentContainer"] = this;
            child["otherRenderIndex"] = otherRenderIndex;
        }
        else
            child.parentContainer = this;
        if (this.render) {
            if (child instanceof Laya.Sprite) {
                this.oherChildScale(child, child.scaleX, child.scaleY);
                this.oherChildVisible(child, child.visible);
                otherRender.addChildAt(child, index);
            }
            else
                otherRender.addDrawChildAt(child, index);
        }
        this.otherChilds[otherRenderIndex].splice(index, 0, child);
    }
    removeOherChild(otherRenderIndex, child, destroy = true) {
        let isInvalid = false;
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex)
            isInvalid = true;
        let otherRender = !isInvalid ? this.otherRenders[otherRenderIndex] : null;
        if (!otherRender)
            isInvalid = true;
        let index = !isInvalid ? this.otherChilds[otherRenderIndex].indexOf(child) : -1;
        if (index == -1)
            isInvalid = true;
        if (isInvalid) {
            if (destroy) {
                if (child instanceof Laya.Sprite) {
                    if (!child.parent) {
                        child["parentContainer"] = null;
                        child["otherRenderIndex"] = -1;
                        child.destroy();
                    }
                }
                else {
                    if (!child.drawed) {
                        child.parentContainer = null;
                        if (child instanceof SgsFlatContainer)
                            child.ClearDraw(destroy);
                        else
                            child.clear(destroy);
                    }
                }
            }
            return;
        }
        if (child instanceof Laya.Sprite) {
            child["parentContainer"] = null;
            child["otherRenderIndex"] = -1;
        }
        else
            child.parentContainer = null;
        this.otherChilds[otherRenderIndex].splice(index, 1);
        if (this.render) {
            if (child instanceof Laya.Sprite) {
                if (destroy)
                    child.destroy();
                else
                    otherRender.removeChild(child);
            }
            else
                otherRender.removeDrawChild(child, destroy);
        }
    }
    oherChildPos(child, x, y) {
        if (!child)
            return;
        child["oherX"] = x;
        child["oherY"] = y;
        if (child["parentContainer"]) {
            let parentContainer = child["parentContainer"];
            child.pos(parentContainer.renderX + x * parentContainer.renderScaleX, parentContainer.renderY + y * parentContainer.renderScaleY);
        }
        else
            child.pos(x, y);
    }
    oherChildScale(child, scaleX, scaleY) {
        if (!child)
            return;
        child["oherScaleX"] = scaleX;
        child["oherScaleY"] = scaleY;
        if (child["parentContainer"]) {
            let parentContainer = child["parentContainer"];
            child.scale(parentContainer.renderScaleX * scaleX, parentContainer.renderScaleY * scaleY);
            this.oherChildPos(child, this.getOherChildX(child), this.getOherChildY(child));
        }
        else
            child.scale(scaleX, scaleY);
    }
    oherChildVisible(child, visible) {
        if (!child)
            return;
        child["oherVisible"] = visible;
        if (child["parentContainer"])
            child.visible = !child["parentContainer"].renderVisible ? false : visible;
        else
            child.visible = visible;
    }
    getOherChildX(child) {
        if (!child)
            return 0;
        if (child.hasOwnProperty("oherX"))
            return child["oherX"];
        return child.x;
    }
    getOherChildY(child) {
        if (!child)
            return 0;
        if (child.hasOwnProperty("oherY"))
            return child["oherY"];
        return child.y;
    }
    getOherChildScaleX(child) {
        if (!child)
            return 0;
        if (child.hasOwnProperty("oherScaleX"))
            return child["oherScaleX"];
        return child.scaleX;
    }
    getOherChildScaleY(child) {
        if (!child)
            return 0;
        if (child.hasOwnProperty("oherScaleY"))
            return child["oherScaleY"];
        return child.scaleY;
    }
    getOherChildVisible(child) {
        if (!child)
            return false;
        if (child.hasOwnProperty("oherVisible"))
            return child["oherVisible"];
        return child.visible;
    }
    set visible(value) {
        if (this._visible == value)
            return;
        this._visible = value;
        this.resetChildsVisible();
    }
    get visible() {
        return this._visible;
    }
    get renderVisible() {
        if (this.parentContainer && !this.parentContainer.renderVisible)
            return false;
        return this._visible;
    }
    set scaleX(value) {
        if (this._scaleX == value)
            return;
        this._scaleX = value;
        this.resetChildsScale();
    }
    get scaleX() {
        return this._scaleX;
    }
    set scaleY(value) {
        if (this._scaleY == value)
            return;
        this._scaleY = value;
        this.resetChildsScale();
    }
    get scaleY() {
        return this._scaleY;
    }
    get renderScaleX() {
        return this.parentContainer ? this.parentContainer.renderScaleX * this._scaleX : this._scaleX;
    }
    get renderScaleY() {
        return this.parentContainer ? this.parentContainer.renderScaleY * this._scaleY : this._scaleY;
    }
    set mouseEnabled(value) {
        if (this._mouseEnabled == value)
            return;
        this._mouseEnabled = value;
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                if (child instanceof SgsTexture || child instanceof SgsText) {
                    child.mouseEnabled = this._mouseEnabled;
                    if (this._mouseEnabled)
                        this.addChildMouseEvent(child);
                    else
                        this.removeChildMouseEvent(child);
                }
            });
        }
    }
    get mouseEnabled() {
        return this._mouseEnabled;
    }
    get drawed() {
        return this.render ? true : false;
    }
    get startIndex() {
        if (this.childs && this.childs.length > 0) {
            return this.childs[0].startIndex;
        }
        return -1;
    }
    get endIndex() {
        if (this.childs && this.childs.length > 0) {
            return this.childs[this.childs.length - 1].endIndex;
        }
        return -1;
    }
    getOtherEndIndex(otherRenderIndex, isSprite) {
        if (!this.otherChilds || this.otherChilds.length <= otherRenderIndex)
            return -1;
        let childs = this.otherChilds[otherRenderIndex];
        if (childs) {
            let length = childs.length;
            let child;
            for (let i = length - 1; i >= 0; i--) {
                if (isSprite) {
                    if (childs[i] instanceof Laya.Sprite) {
                        child = childs[i];
                        break;
                    }
                }
                else {
                    if (!(childs[i] instanceof Laya.Sprite)) {
                        child = childs[i];
                        break;
                    }
                }
            }
            if (child) {
                if (isSprite) {
                    let otherRender = this.otherRenders && this.otherRenders.length > otherRenderIndex ? this.otherRenders[otherRenderIndex] : null;
                    return otherRender && !otherRender.destroyed ? otherRender.getChildIndex(child) : -1;
                }
                else
                    return child.endIndex;
            }
        }
        return -1;
    }
    pos(x, y) {
        if (this._x == x && this._y == y)
            return;
        this._x = x >> 0;
        this._y = y >> 0;
        this.resetChildsPos();
    }
    size(width, height) {
        this._width = width;
        this._height = height;
        this.invalidateDisplayList();
    }
    addChildMouseEvent(child) {
        child.on(Laya.Event.CLICK, this, this.onTextureClick);
        child.on(Laya.Event.ROLL_OVER, this, this.onSomeTextureOver);
        child.on(Laya.Event.ROLL_OUT, this, this.onSomeTextureOut);
    }
    removeChildMouseEvent(child) {
        child.off(Laya.Event.CLICK, this, this.onTextureClick);
        child.off(Laya.Event.ROLL_OVER, this, this.onSomeTextureOver);
        child.off(Laya.Event.ROLL_OUT, this, this.onSomeTextureOut);
    }
    onTextureClick(textTure) {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_CLICK, { target: textTure, currentTarget: this });
    }
    onSomeTextureOver(textTure) {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_OVER, { target: textTure, currentTarget: this });
    }
    onSomeTextureOut(textTure) {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_OUT, { target: textTure, currentTarget: this });
    }
    resetChildsPos() {
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                if (child instanceof SgsFlatContainer)
                    child.resetChildsPos();
                else
                    child.resetPos();
            });
        }
        if (this.otherChilds && this.otherChilds.length > 0) {
            this.otherChilds.forEach((childs) => {
                if (childs) {
                    childs.forEach((child) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildPos(child, this.getOherChildX(child), this.getOherChildY(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsPos();
                        else
                            child.resetPos();
                    });
                }
            });
        }
    }
    resetChildsVisible() {
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                if (child instanceof SgsFlatContainer)
                    child.resetChildsVisible();
                else
                    child.resetVisible();
            });
        }
        if (this.otherChilds && this.otherChilds.length > 0) {
            this.otherChilds.forEach((childs) => {
                if (childs) {
                    childs.forEach((child) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildVisible(child, this.getOherChildVisible(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsVisible();
                        else
                            child.resetVisible();
                    });
                }
            });
        }
    }
    resetChildsScale() {
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach((child) => {
                if (child instanceof SgsFlatContainer)
                    child.resetChildsScale();
                else
                    child.resetScale();
            });
        }
        if (this.otherChilds && this.otherChilds.length > 0) {
            this.otherChilds.forEach((childs) => {
                if (childs) {
                    childs.forEach((child) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildScale(child, this.getOherChildScaleX(child), this.getOherChildScaleY(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsScale();
                        else
                            child.resetScale();
                    });
                }
            });
        }
    }
    ResetDrawPos() {
        this.resetChildsPos();
    }
    ResetDrawVisible() {
        this.resetChildsVisible();
    }
    ResetDrawScale() {
        this.resetChildsScale();
    }
    invalidateDisplayList() {
        if (!this.invalidateDisplayListFlag) {
            this.invalidateDisplayListFlag = true;
            Laya.timer.callLater(this, this.updateDisplayList, [this.width, this.height]);
        }
    }
    updateDisplayList(unscaledWidth, unscaledHeight) {
        this.invalidateDisplayListFlag = false;
        this.layout();
    }
    layout() {
    }
}
SgsFlatContainer.SGSFLATCONTAINER_CLICK = "sgsFlatContainerClick";
SgsFlatContainer.SGSFLATCONTAINER_OVER = "sgsFlatContainerOver";
SgsFlatContainer.SGSFLATCONTAINER_OUT = "sgsFlatContainerOut";

//import SgsFlatContainer from "./SgsFlatContainer";
//import SgsTexture from "./SgsTexture";
//import SgsText from "./SgsText";
//import RES from "../../../res/RES";
//import ButtonPhaseEnum from "../../../enum/base/ButtonPhaseEnum";
class SgsFlatButton extends SgsFlatContainer {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.phase = 0;
        this._selected = false;
        this._enabled = true;
        this._text = "";
        this._stateChanged = false;
        this._layoutChanged = false;
        this.selectedEnabled = true;
        this.redPointIsShow = false;
        this.labelColors = "#ffffff,#ffffff,#ffffff,#ffffff,#ffffff";
        this.strokeColors = "#000000,#000000,#000000,#000000,#000000";
        this.labelPadding = "0,0,0,0";
        this.initChilds();
    }
    set alpha(value) {
        this.background.alpha = value;
    }
    set width(value) {
        Laya.superSetter(SgsFlatButton, this, "width", value);
    }
    get width() {
        return this.background.width;
    }
    set height(value) {
        Laya.superSetter(SgsFlatButton, this, "height", value);
    }
    get height() {
        return this.background.height;
    }
    size(width, height) {
        super.size(width, height);
        this.background.width = width;
        this.background.height = height;
        this.setLayoutChanged();
    }
    initChilds() {
        this.background = new SgsTexture();
        this.background.mouseEnabled = true;
        this.addDrawChild(this.background);
        this.textField = new SgsText();
        this.textField.wordWrap = false;
        this.textField.align = "center";
        this.textField.valign = "middle";
        if (this.otherRenders && this.otherRenders.length)
            this.addOtherChild(0, this.textField);
        else
            this.addDrawChild(this.textField);
    }
    InitSkin(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "", selectedDisableSkin = "", selectedOverSkin = "") {
        this.skins = new Array();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        if (selectedOverSkin.length > 0) {
            this.skins.push(selectedOverSkin);
        }
        this.background.texture = RES.GetRes(upSkin);
        this.setStateChanged();
        this.setLayoutChanged();
    }
    InitSkinUrl(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "", selectedDisableSkin = "", selectedOverSkin = "") {
        this.skins = new Array();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        if (selectedOverSkin.length > 0) {
            this.skins.push(selectedOverSkin);
        }
        if (!this._loadSkins)
            this._loadSkins = [];
        else {
            this.clearLoadSkins();
            this._loadSkins.length = 0;
        }
        let url = "";
        for (let i = 0; i < this.skins.length; i++) {
            url = this.skins[i];
            if (url) {
                if (this._loadSkins.indexOf(url) == -1) {
                    this._loadSkins.push(url);
                    RES.AddReference(url);
                    RES.GetResByUrl(url, this, this.onSkinLoaded, "", url);
                }
            }
        }
    }
    ReloadSkin() {
        if (!this.skins || this.skins.length <= 0)
            return;
        if (this.skins[0].indexOf("/") == -1)
            return;
        let url = "";
        for (let i = 0; i < this.skins.length; i++) {
            url = this.skins[i];
            if (url) {
                RES.GetResByUrl(url, this, this.onSkinLoaded, "", url);
            }
        }
    }
    onSkinLoaded(texture, url) {
        if (this.skins && this.skins.indexOf(url) != -1) {
            this.changeState();
            this.changeLayout();
        }
    }
    Draw(render, index = -1) {
        super.Draw(render, index);
        this.background.on(Laya.Event.MOUSE_UP, this, this.onUp);
        this.background.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.background.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        this.background.on(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.background.on(Laya.Event.CLICK, this, this.onClick);
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        this.background.off(Laya.Event.MOUSE_UP, this, this.onUp);
        this.background.off(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.background.off(Laya.Event.MOUSE_DOWN, this, this.onDown);
        this.background.off(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.background.off(Laya.Event.CLICK, this, this.onClick);
        if (destroy) {
            this.clearLoadSkins();
            this._loadSkins = null;
        }
    }
    set sizeGrid(value) {
        this.background.sizeGrid = value;
    }
    set label(value) {
        this._text = value;
        this.textField.text = value;
    }
    get labelWidth() {
        if (this.textField) {
            return this.textField.textWidth;
        }
        return 0;
    }
    set labelWidth(width) {
        if (this.textField) {
            this.textField.width = width;
        }
    }
    get label() {
        return this._text;
    }
    set labelColors(value) {
        if (value) {
            this._labelColors = value.split(",");
            this.setStateChanged();
        }
    }
    set labelSize(value) {
        this.textField.fontSize = value;
    }
    set labelFont(value) {
        this.textField.font = value;
    }
    set labelWordWrap(value) {
        this.textField.wordWrap = value;
    }
    set labelLeading(value) {
        this.textField.leading = value;
    }
    set labelAlign(value) {
        this.textField.align = value;
    }
    set labelValign(value) {
        this.textField.valign = value;
    }
    set strokeColors(value) {
        if (value) {
            this._strokeColors = value.split(",");
            this.setStateChanged();
        }
    }
    set labelStroke(value) {
        this.textField.stroke = value;
    }
    set labelBold(value) {
        this.textField.bold = value;
    }
    set labelItalic(value) {
        this.textField.italic = value;
    }
    set labelPadding(value) {
        if (value) {
            this._labelPadding = value.split(",");
            this.setLayoutChanged();
        }
    }
    set enabled(value) {
        this._enabled = value;
        this.setStateChanged();
    }
    get enabled() {
        return this._enabled;
    }
    set selected(value) {
        this._selected = value;
        this.setStateChanged();
    }
    get selected() {
        return this._selected;
    }
    set TipTriggerType(val) {
        this.background.TipTriggerType = val;
    }
    set ToolTip(value) {
        this.background.ToolTip = value;
    }
    get ToolTip() {
        return this.background.ToolTip;
    }
    onUp(event) {
        this.phase = ButtonPhaseEnum.over;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_UP, this);
    }
    onOver(event) {
        this.phase = ButtonPhaseEnum.over;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_OVER, this);
    }
    onDown(event) {
        this.phase = ButtonPhaseEnum.down;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_DOWN, this);
    }
    onOut(event) {
        this.phase = ButtonPhaseEnum.up;
        this.setStateChanged();
        this.event(Laya.Event.MOUSE_OUT, this);
    }
    onClick(event) {
        if (!this.enabled)
            return;
        if (this.selected && !this.selectedEnabled)
            return;
        this.event(Laya.Event.CLICK, this);
    }
    setStateChanged() {
        if (!this._stateChanged) {
            this._stateChanged = true;
            Laya.timer.callLater(this, this.changeState);
        }
    }
    changeState() {
        this._stateChanged = false;
        if (!this.skins || this.skins.length < 6)
            return;
        let curSkin = "";
        let textColor = "";
        let strokeColor = "";
        if (!this._enabled) {
            curSkin = this._selected ? this.skins[5] : this.skins[3];
            textColor = this._labelColors[3];
            strokeColor = this._strokeColors[3];
        }
        else if (this._selected) {
            let skinIndex = 4;
            if (this.skins.length == 7 && this.phase == ButtonPhaseEnum.over) {
                skinIndex = 6;
            }
            curSkin = this.skins[skinIndex];
            textColor = this._labelColors[skinIndex];
            strokeColor = this._strokeColors[skinIndex];
        }
        else {
            curSkin = this.skins[this.phase];
            textColor = this._labelColors[this.phase];
            strokeColor = this._strokeColors[this.phase];
        }
        if (curSkin == "" || !RES.GetRes(curSkin))
            curSkin = this.skins[0];
        if (!textColor)
            textColor = "#ffffff";
        if (!strokeColor)
            strokeColor = "#000000";
        this.background.texture = RES.GetRes(curSkin);
        this.textField.color = textColor;
        this.textField.strokeColor = strokeColor;
    }
    setLayoutChanged() {
        if (!this._layoutChanged) {
            this._layoutChanged = true;
            Laya.timer.callLater(this, this.changeLayout);
        }
    }
    changeLayout() {
        this._layoutChanged = false;
        let left = parseInt(this._labelPadding[3]);
        let right = parseInt(this._labelPadding[1]);
        let top = parseInt(this._labelPadding[0]);
        let bottom = parseInt(this._labelPadding[2]);
        this.textField.x = left;
        this.textField.y = top;
        this.textField.width = this.width - left - right;
        this.textField.height = this.height - top - bottom;
    }
    ShowRedPoint(res = "TopRedPoint", x = 0, y = 0) {
        if (!this.redPointFlag) {
            let tex = RES.GetRes(res);
            if (!tex)
                return;
            this.redPointFlag = new SgsTexture(tex);
            let redPoint = this.RedPoint;
            if (x)
                redPoint.x = x;
            if (y)
                redPoint.y = y;
            this.redPointFlag.x = redPoint.x;
            this.redPointFlag.y = redPoint.y;
            if (this.otherRenders && this.otherRenders.length > 1)
                this.addOtherChild(1, this.redPointFlag);
            else
                this.addDrawChild(this.redPointFlag);
        }
        else {
            this.redPointFlag.visible = true;
        }
        this.redPointIsShow = true;
    }
    RemoveRedPoint() {
        if (this.redPointFlag)
            this.redPointFlag.visible = false;
        this.redPointIsShow = false;
    }
    RedPointIsShow() {
        return this.redPointIsShow;
    }
    get RedPoint() {
        return { x: this.width - 14, y: -4 };
    }
    clearLoadSkins() {
        if (this._loadSkins && this._loadSkins.length) {
            this._loadSkins.forEach(url => {
                RES.DelReference(url);
                RES.CancelGetResByUrl(url, this, this.onSkinLoaded);
                RES.ClearResByUrl(url);
            });
            this._loadSkins.length = 0;
        }
    }
}

//import FontName from "../../../enum/FontName";
//import RES from "../../../res/RES";
//import ComboboxRenderItem from "./ComboboxRenderItem";
//import TopUILayer from "../../layer/TopUILayer";
//import SystemContext from "../../../SystemContext";
class SgsComboBox extends Laya.ComboBox {
    constructor(skin, labels) {
        super(skin, labels);
        this._listSkin = "";
        this._listSizeGrid = "";
        this._scrollBarHide = false;
        this._scrollBarAutoHide = false;
        this._gap = 0;
        this.labelColors = "#FAEDD9,#FAEDD9,#FAEDD9,gray";
        this.labelSize = 16;
        this.itemSize = 16;
        this.visibleNum = 10;
        this.labelFont = FontName.ST;
        this.scrollBarSkin = RES.GetAtlasUrl("hscrollMin");
        this.autoSize = false;
        this.sizeGrid = "10,25,10,10,0";
        this.itemRender = ComboboxRenderItem;
        this.Width = this.width;
    }
    set listSkin(value) {
        this._listSkin = value;
    }
    set listSizeGrid(value) {
        this._listSizeGrid = value;
    }
    set scrollBarHide(value) {
        this._scrollBarHide = value;
    }
    set scrollBarAutoHide(value) {
        this._scrollBarAutoHide = value;
    }
    set gap(value) {
        this._gap = value;
    }
    set data(data) {
        this._data = data;
        let labels = "";
        data.forEach((item) => {
            labels += item.label + ",";
        });
        this.labels = labels.slice(0, labels.length - 1);
    }
    set isOpen(value) {
        Laya.superSetter(SgsComboBox, this, "isOpen", value);
        if (this._isOpen) {
            if (this._list) {
                if (this._list.scrollBar) {
                    this._list.scrollBar.hide = this._scrollBarHide;
                    this._list.scrollBar.autoHide = this._scrollBarAutoHide;
                }
                this._list.removeSelf();
                TopUILayer.GetInstance().addChild(this._list);
                let p = this.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                p = TopUILayer.GetInstance().globalToLocal(p);
                var py = p.y + this._button.height + this._gap;
                py = py + this._listHeight <= SystemContext.gameHeight ? py : p.y - this._gap - this._listHeight;
                this._list.pos(p.x, py);
            }
        }
    }
    set Width(value) {
        this.width = value;
        this.list.width = value;
    }
    get SelectedValue() {
        return this._data[this.selectedIndex.toString()].value;
    }
    set SelectedValue(value) {
        this.selectedIndex = this.getIndexByValue(value);
    }
    getIndexByValue(value) {
        let result = 0;
        for (let i = 0; i < this._data.length; i++) {
            if (this._data[i].value == value) {
                result = i;
                break;
            }
        }
        return result;
    }
    changeItem() {
        super.changeItem();
        let box = this.list.getCell(0);
        if (box) {
            if (!this.labels || this.labels.length <= 0)
                box.width = this.list.width;
            this._listHeight = Math.min(this._visibleNum, this._labels.length) * box.height;
            if (!this._listHeight)
                this._listHeight = this._itemHeight;
            this.drawListSkin(box.width, this._listHeight);
            Laya.timer.callLater(this, this.resetListHeightHandler);
        }
    }
    resetListHeightHandler() {
        this._list.height = this._listHeight;
    }
    drawListSkin(width, height) {
        if (!this.list)
            return;
        this.list.graphics.clear();
        let tex = RES.GetRes(this._listSkin);
        if (!tex)
            return;
        if (this._listSizeGrid && this._listSizeGrid.length >= 4) {
            let grid = this._listSizeGrid.split(",");
            if (grid[0] == "0")
                grid[0] = "1";
            if (grid[1] == "0")
                grid[1] = "1";
            if (grid[2] == "0")
                grid[2] = "1";
            if (grid[3] == "0")
                grid[3] = "1";
            let sw = tex.width;
            let sh = tex.height;
            let top = parseInt(grid[0]);
            let right = parseInt(grid[1]);
            let bottom = parseInt(grid[2]);
            let left = parseInt(grid[3]);
            let tempTex = Laya.Texture.createFromTexture(tex, left, 0, sw - left - right, top);
            this.list.graphics.drawTexture(tempTex, left, 0, width - left - right, top);
            tempTex = Laya.Texture.createFromTexture(tex, sw - right, 0, right, top);
            this.list.graphics.drawTexture(tempTex, width - right, 0, right, top);
            tempTex = Laya.Texture.createFromTexture(tex, sw - right, top, right, sh - top - bottom);
            this.list.graphics.drawTexture(tempTex, width - right, top, right, height - top - bottom);
            tempTex = Laya.Texture.createFromTexture(tex, sw - right, sh - bottom, right, bottom);
            this.list.graphics.drawTexture(tempTex, width - right, height - bottom, right, bottom);
            tempTex = Laya.Texture.createFromTexture(tex, left, sh - bottom, sw - left - right, bottom);
            this.list.graphics.drawTexture(tempTex, left, height - bottom, width - left - right, bottom);
            tempTex = Laya.Texture.createFromTexture(tex, 0, sh - bottom, left, bottom);
            this.list.graphics.drawTexture(tempTex, 0, height - bottom, left, bottom);
            tempTex = Laya.Texture.createFromTexture(tex, 0, top, left, sh - top - bottom);
            this.list.graphics.drawTexture(tempTex, 0, top, left, height - top - bottom);
            tempTex = Laya.Texture.createFromTexture(tex, 0, 0, left, top);
            this.list.graphics.drawTexture(tempTex, 0, 0, left, top);
            tempTex = Laya.Texture.createFromTexture(tex, left, top, sw - left - right, sh - top - bottom);
            this.list.graphics.drawTexture(tempTex, left, top, width - left - right, height - top - bottom);
        }
        else {
            this.list.graphics.drawTexture(tex, width, height);
        }
    }
    destroy() {
        this.isOpen = false;
        var eventEmpty = Laya.Event.EMPTY;
        if (eventEmpty) {
            if (eventEmpty.currentTarget === this)
                eventEmpty.currentTarget = null;
            if (eventEmpty.target === this)
                eventEmpty.target = null;
        }
        super.destroy();
    }
}

//import SgsSprite from "../controls/base/SgsSprite";
//import WindowLayer from "../layer/WindowLayer";
//import SystemContext from "../../SystemContext";
//import GameEventDispatcher from "../../event/GameEventDispatcher";
//import WindowManager from "../../mode/base/WindowManager";
//import SilenceResManager from "../../mode/base/SilenceResManager";
//import LoadingManager from "../../mode/base/LoadingManager";
//import RES from "../../res/RES";
//import ResourceEvent from "../../res/ResourceEvent";
//import AnimateManager from "../../mode/base/AnimateManager";
//import EffectUtils from "../../utils/EffectUtils";
class WindowBase extends SgsSprite {
    constructor() {
        super();
        this.autoRecover = true;
        this.autoRecoverRes = true;
        this.canAutoClose = true;
        this.hideOtherView = false;
        this.modal = false;
        this.modalAlpha = 0.5;
        this.needInAnimate = false;
        this.needOutAnimate = false;
        this.opening = false;
        this.closeing = false;
        this.closeed = false;
        this.loading = false;
        this.eventAdded = false;
        this.openSound = "window_open_sound";
        this.totalCount = 0;
        this.loadedCount = 0;
        this.parentLayer = WindowLayer.GetInstance();
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
    }
    get ModalBg() {
        return this.modalBg;
    }
    get Loading() {
        return this.loading;
    }
    get Opening() {
        return this.opening;
    }
    get Closeing() {
        return this.closeing;
    }
    get CanAutoClose() {
        return this.canAutoClose;
    }
    get AutoRecover() {
        return this.autoRecover;
    }
    get HideOtherView() {
        return this.hideOtherView;
    }
    size(width, height) {
        super.size(width, height);
        this.clearAnimateTween();
        this.scale(1, 1);
        this.pos(SystemContext.gameWidth - this.width >> 1, SystemContext.gameHeight - this.height >> 1);
        return this;
    }
    Open(...args) {
        this.closeed = false;
        this.windowData = args;
        if (!this.resNames || this.resNames.length <= 0) {
            this.init();
            this.enterWindow(...this.windowData);
        }
        else
            this.startLoadRes();
    }
    Close(ignoreCloseAnimate = false) {
        if (this.loading) {
            this.closeEnd(WindowBase.CLOSE_NORMAL);
            return;
        }
        if (this.opening) {
            this.clearAnimateTween();
            this.opening = false;
        }
        if (this.closeing) {
            if (ignoreCloseAnimate) {
                this.clearAnimateTween();
                this.closeEnd(WindowBase.CLOSE_NORMAL);
            }
            return;
        }
        if (this.needOutAnimate && !ignoreCloseAnimate && this.parent)
            this.outAnimate(WindowBase.CLOSE_NORMAL);
        else
            this.closeEnd(WindowBase.CLOSE_NORMAL);
    }
    Show() {
        if (this.loading || this.opening)
            return;
        this.closeed = false;
        if (this.closeing) {
            this.clearAnimateTween();
            this.closeing = false;
        }
        this.showHandler();
    }
    Hide() {
        if (this.loading) {
            this.closeEnd(WindowBase.CLOSE_NORMAL);
            return;
        }
        if (this.closeing || !this.parent)
            return;
        if (this.opening) {
            this.clearAnimateTween();
            this.opening = false;
        }
        if (this.needOutAnimate)
            this.outAnimate(WindowBase.CLOSE_HIDE);
        else
            this.closeEnd(WindowBase.CLOSE_HIDE);
    }
    ResetOpen(data) {
        this.closeed = false;
        this.windowData = data;
        this.enterWindow(...this.windowData);
    }
    init() {
    }
    enterWindow(...args) {
        if (!this.closeed)
            this.showHandler();
        if (!this.eventAdded)
            this.addEventListener();
    }
    showHandler() {
        if (this.modal) {
            if (!this.modalBg) {
                this.modalBg = new Laya.Sprite();
                this.modalBg.alpha = this.modalAlpha;
                this.modalBg.on(Laya.Event.CLICK, this, this.onModalClick);
            }
            this.modalBg.graphics.clear();
            this.modalBg.graphics.drawRect(0, 0, SystemContext.gameWidth, SystemContext.gameHeight, "#000000");
            this.modalBg.size(SystemContext.gameWidth, SystemContext.gameHeight);
            if (!this.modalBg.parent)
                this.parentLayer.addChild(this.modalBg);
            else
                this.parent.setChildIndex(this, this.parent.numChildren - 1);
            this.modalBg.visible = true;
        }
        else {
            if (this.modalBg)
                this.modalBg.removeSelf();
        }
        if (!this.parent)
            this.parentLayer.addChild(this);
        else
            this.parent.setChildIndex(this, this.parent.numChildren - 1);
        this.visible = true;
        if (this.needInAnimate)
            this.inAnimate();
        else
            this.openEnd();
        if (this.openSound) {
        }
    }
    addEventListener() {
        this.eventAdded = true;
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onStageResize);
    }
    removeEventListener() {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onStageResize);
    }
    inAnimate() {
        if (this.opening && this.animateTween)
            return;
        if (this.closeing) {
            this.clearAnimateTween();
            this.closeing = false;
        }
        this.mouseEnabled = false;
        this.startAnimateIn();
    }
    startAnimateIn() {
        this.opening = true;
        this.pos(SystemContext.gameWidth >> 1, SystemContext.gameHeight >> 1);
        this.scale(0, 0);
        let endPos = this.windowTargetPos();
        this.animateTween = Laya.Tween.to(this, { x: endPos.x, y: endPos.y, scaleX: 1, scaleY: 1 }, 300, Laya.Ease.sineOut, new Laya.Handler(this, this.openEnd));
    }
    windowTargetPos() {
        return new Laya.Point(SystemContext.gameWidth - this.width >> 1, SystemContext.gameHeight - this.height >> 1);
    }
    openEnd() {
        let endPos = this.windowTargetPos();
        this.pos(endPos.x, endPos.y);
        this.scale(1, 1);
        this.animateTween = null;
        this.opening = false;
        this.mouseEnabled = true;
        this.loadSilenceRes();
        if (this.hideOtherView)
            WindowManager.GetInstance().UpdateHideView(this, true);
    }
    outAnimate(closeType) {
        if (this.closeing && this.animateTween)
            return;
        if (this.opening) {
            this.clearAnimateTween();
            this.opening = false;
        }
        this.mouseEnabled = false;
        this.startAnimateOut(closeType);
        if (this.hideOtherView)
            WindowManager.GetInstance().UpdateHideView(this, false);
    }
    startAnimateOut(closeType) {
        this.closeing = true;
        this.animateTween = Laya.Tween.to(this, { x: SystemContext.gameWidth >> 1, y: SystemContext.gameHeight >> 1, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.sineOut, new Laya.Handler(this, this.closeEnd, [closeType, true]));
    }
    closeEnd(closeType, animateEnd = false) {
        this.closeed = true;
        this.animateTween = null;
        this.closeing = false;
        this.mouseEnabled = true;
        if (this.modalBg)
            this.modalBg.removeSelf();
        this.removeSelf();
        if (closeType == WindowBase.CLOSE_NORMAL) {
            if (this.autoRecover)
                this.destroy();
        }
        else if (closeType == WindowBase.CLOSE_HIDE) { }
        if (!animateEnd) {
            if (this.hideOtherView)
                WindowManager.GetInstance().UpdateHideView(this, false);
        }
        GameEventDispatcher.GetInstance().event(GameEventDispatcher.WINDOW_CLOSED, this.name);
    }
    onStageResize(event) {
        if (this.modalBg) {
            this.modalBg.graphics.clear();
            this.modalBg.graphics.drawRect(0, 0, SystemContext.gameWidth, SystemContext.gameHeight, "#000000");
            this.modalBg.size(SystemContext.gameWidth, SystemContext.gameHeight);
        }
        if (this.parent && !this.closeing) {
            this.clearAnimateTween();
            this.scale(1, 1);
            this.windowTargetPos();
        }
        this.pos(SystemContext.gameWidth - this.width >> 1, SystemContext.gameHeight - this.height >> 1);
    }
    onModalClick(event) {
    }
    startLoadRes() {
        SilenceResManager.GetInstance().PauseSilenceRes();
        this.loading = true;
        LoadingManager.ShowLoading();
        this.addResEvent();
        this.totalCount = this.resNames.length;
        this.loadedCount = 0;
        let priority = 100 + this.resNames.length - 1;
        for (let i = 0; i < this.resNames.length; i++) {
            RES.LoadGroup(this.resNames[i], priority);
            priority--;
        }
    }
    addResEvent() {
        RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
    }
    removeResEvent() {
        RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
        this.totalCount = 0;
        this.loadedCount = 0;
    }
    onResourceProgress(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        let progress = event.progress;
        progress = this.loadedCount / this.totalCount + progress * (1 / this.totalCount);
        LoadingManager.ShowLoadProgress(progress * 100, 100);
    }
    onResourceError(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        this.removeResEvent();
        LoadingManager.ShowLoadError("资源组加载失败：" + event.groupName, this.name);
        SilenceResManager.GetInstance().RecoverySilenceRes();
        this.loading = false;
        if (this.destroyed) {
            this.clearSkeletonEffectPools();
            this.clearWindowRes();
        }
        else
            this.destroy();
    }
    onResourceLoadComplete(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
            this.loading = false;
            this.removeResEvent();
            LoadingManager.CloseLoading();
            if (this.destroyed) {
                this.clearSkeletonEffectPools();
                this.clearWindowRes();
            }
            else {
                this.init();
                this.enterWindow(...this.windowData);
            }
            SilenceResManager.GetInstance().RecoverySilenceRes();
        }
    }
    loadSilenceRes() {
        if (!this.silenceResArr || this.silenceResArr.length <= 0)
            return;
        SilenceResManager.GetInstance().LoadSilenceRes(this.silenceResArr);
    }
    AddRecoverTemplet(url) {
        if (!this.recoverTemplets)
            this.recoverTemplets = [];
        if (this.recoverTemplets.indexOf(url) == -1)
            this.recoverTemplets.push(url);
    }
    AddRecoverEffectPool(poolSign) {
        if (!this.skeletonEffectPools)
            this.skeletonEffectPools = [];
        if (this.skeletonEffectPools.indexOf(poolSign) == -1)
            this.skeletonEffectPools.push(poolSign);
    }
    clearAnimateTween() {
        if (this.animateTween) {
            this.animateTween.clear();
            this.animateTween = null;
        }
    }
    clearSkeletonEffectPools() {
        if (this.skeletonEffectPools && this.skeletonEffectPools.length) {
            let length = this.skeletonEffectPools.length;
            for (let i = 0; i < length; i++) {
                EffectUtils.ClearSkeletonEffectPool(this.skeletonEffectPools[i]);
            }
            this.skeletonEffectPools.length = 0;
        }
    }
    clearWindowRes() {
        if (!this.autoRecoverRes)
            return;
        if (this.recoverTemplets && this.recoverTemplets.length > 0) {
            let length = this.recoverTemplets.length;
            for (let i = 0; i < length; i++) {
                AnimateManager.GetInstane().DestroyAnimate(this.recoverTemplets[i]);
            }
            this.recoverTemplets.length = 0;
        }
        if (this.resNames && this.resNames.length > 0) {
            for (let i = 0; i < this.resNames.length; i++) {
                RES.ClearResByGroup(this.resNames[i], false, true);
            }
            this.resNames.length = 0;
        }
    }
    destroy() {
        this.clearAnimateTween();
        if (this.modalBg) {
            this.modalBg.off(Laya.Event.CLICK, this, this.onModalClick);
            this.modalBg.destroy();
            this.modalBg = null;
        }
        if (this.eventAdded)
            this.removeEventListener();
        super.destroy(true);
        this.clearSkeletonEffectPools();
        this.clearWindowRes();
        this.parentLayer = null;
        this.windowData = null;
        WindowManager.GetInstance().DeleteKey(this.name);
    }
}
WindowBase.CLOSE_NORMAL = 1;
WindowBase.CLOSE_HIDE = 2;

//import SgsSprite from "../controls/base/SgsSprite";
//import SystemContext from "../../SystemContext";
//import WindowManager from "../../mode/base/WindowManager";
//import GameEventDispatcher from "../../event/GameEventDispatcher";
//import SilenceResManager from "../../mode/base/SilenceResManager";
//import EffectUtils from "../../utils/EffectUtils";
//import AnimateManager from "../../mode/base/AnimateManager";
//import RES from "../../res/RES";
class SceneBase extends SgsSprite {
    constructor() {
        super();
        this.inited = false;
        this.needInAnimate = false;
        this.needOutAnimate = false;
        this.sceneName = "";
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
        this.init();
    }
    get SceneName() {
        return this.sceneName;
    }
    set SceneName(val) {
        this.sceneName = val;
    }
    set SceneData(val) {
        this.sceneData = val;
    }
    get SceneData() {
        return this.sceneData;
    }
    get ResNames() {
        return this.resNames;
    }
    set ResNames(value) {
        this.resNames = value;
    }
    get EnterComplete() {
        return this.enterComplete;
    }
    set EnterComplete(value) {
        this.enterComplete = value;
    }
    ResetScene(data) {
    }
    get OperationRecord() {
        return this.operationRecord;
    }
    AddOperationRecord(name) {
        if (!this.operationRecord)
            this.operationRecord = [];
        if (this.operationRecord.indexOf(name) == -1)
            this.operationRecord.push(name);
    }
    BackFrontView(isBack = true) {
        if (isBack) {
            let frontName = this.getFrontOperationRecord();
            if (frontName != "")
                WindowManager.GetInstance().ShowWindow(frontName);
            else {
            }
            this.delLastOperationRecord();
        }
        else {
            this.DelAllOperationRecord();
        }
    }
    GetLastOperationRecord() {
        if (this.operationRecord && this.operationRecord.length >= 1)
            return this.operationRecord[this.operationRecord.length - 1];
        return "";
    }
    DelAllOperationRecord() {
        if (this.operationRecord)
            this.operationRecord.length = 0;
    }
    getFrontOperationRecord() {
        if (this.operationRecord && this.operationRecord.length >= 2)
            return this.operationRecord[this.operationRecord.length - 2];
        return "";
    }
    delLastOperationRecord() {
        if (this.operationRecord && this.operationRecord.length > 0)
            this.operationRecord.pop();
    }
    init() {
        this.on(Laya.Event.ADDED, this, this.onAddToStage);
        this.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }
    onAddToStage(event) {
        if (!this.inited) {
            this.inited = true;
            this.createChildren();
            this.addEventListener();
            this.loadSilenceRes();
        }
        this.AnimateIn();
    }
    createChildren() {
    }
    addEventListener() {
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onStageResize);
    }
    removeEventListener() {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onStageResize);
    }
    loadSilenceRes() {
        if (!this.silenceResArr || this.silenceResArr.length <= 0)
            return;
        SilenceResManager.GetInstance().LoadSilenceRes(this.silenceResArr);
    }
    AnimateIn() {
        this.mouseEnabled = false;
        if (this.needInAnimate) {
        }
        else {
            this.animateInEnd();
        }
    }
    animateInEnd() {
        this.mouseEnabled = true;
        this.event(SceneBase.ANIMATE_IN_COMPLETE, this);
        if (this.enterComplete) {
            this.enterComplete.run();
            this.enterComplete = null;
        }
    }
    AnimateOut() {
        if (this.needOutAnimate) {
        }
        else {
            this.animateOutEnd();
        }
    }
    animateOutEnd() {
        this.removeSelf();
        this.removeEventListener();
        this.event(SceneBase.ANIMATE_OUT_COMPLETE, this);
    }
    onRemoveToStage(event) {
        this.off(Laya.Event.ADDED, this, this.onAddToStage);
        this.off(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }
    onStageResize(event = null) {
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
    }
    AddRecoverTemplet(url) {
        if (!this.recoverTemplets)
            this.recoverTemplets = [];
        if (this.recoverTemplets.indexOf(url) == -1)
            this.recoverTemplets.push(url);
    }
    AddRecoverEffectPool(poolSign) {
        if (!this.skeletonEffectPools)
            this.skeletonEffectPools = [];
        if (this.skeletonEffectPools.indexOf(poolSign) == -1)
            this.skeletonEffectPools.push(poolSign);
    }
    clearSkeletonEffectPools() {
        if (this.skeletonEffectPools && this.skeletonEffectPools.length) {
            let length = this.skeletonEffectPools.length;
            for (let i = 0; i < length; i++) {
                EffectUtils.ClearSkeletonEffectPool(this.skeletonEffectPools[i]);
            }
            this.skeletonEffectPools.length = 0;
        }
    }
    clearSceneRes() {
        if (this.recoverTemplets && this.recoverTemplets.length > 0) {
            let length = this.recoverTemplets.length;
            for (let i = 0; i < length; i++) {
                AnimateManager.GetInstane().DestroyAnimate(this.recoverTemplets[i]);
            }
            this.recoverTemplets.length = 0;
        }
        if (this.resNames && this.resNames.length > 0) {
            for (let i = 0; i < this.resNames.length; i++) {
                RES.ClearResByGroup(this.resNames[i], false, true);
            }
            this.resNames.length = 0;
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        Laya.Tween.clearAll(this);
        Laya.timer.clearAll(this);
        super.destroy(true);
        this.clearSkeletonEffectPools();
        this.clearSceneRes();
        this.sceneData = null;
        this.enterComplete = null;
    }
}
SceneBase.ANIMATE_OUT_COMPLETE = "animate_out_complete";
SceneBase.ANIMATE_IN_COMPLETE = "animate_in_complete";
SceneBase.ANIMATE_RESET_COMPLETE = "ANIMATE_RESET_COMPLETE";

//import FontName from "../../../enum/FontName";
//import Global from "../../../Global";
//import SceneManager from "../../../mode/base/SceneManager";
//import SgsSoundManager from "../../../mode/base/SgsSoundManager";
//import WindowManager from "../../../mode/base/WindowManager";
//import RES from "../../../res/RES";
//import SystemContext from "../../../SystemContext";
//import UIUtils from "../../../utils/UIUtils";
//import SgsFlatButton from "../../controls/base/SgsFlatButton";
//import SgsSprite from "../../controls/base/SgsSprite";
//import SgsText from "../../controls/base/SgsText";
//import SgsTexture from "../../controls/base/SgsTexture";
//import DressAvatar from "../../dressScene/DressAvatar";
//import SceneBase from "../SceneBase";
class DressSaveScene extends SceneBase {
    constructor() {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["dressSaveScene"];
    }
    createChildren() {
        super.createChildren();
        this.bg = new SgsTexture(RES.GetRes("dressSceneBg_image"));
        this.addDrawChild(this.bg);
        this.light = new SgsTexture(RES.GetRes("dressLight"));
        this.light.pos(134, 374);
        this.addDrawChild(this.light);
        this.dressAvatar = new DressAvatar();
        this.dressAvatar.pos((SystemContext.gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72, 102);
        this.dressAvatar.scale(0.72, 0.72);
        this.addChild(this.dressAvatar);
        this.topSp = new SgsSprite();
        this.topSp.size(this.width, this.height);
        this.topSp.addDrawClick();
        this.addChild(this.topSp);
        this.downBtn = new SgsFlatButton();
        this.downBtn.pos(0, 29);
        this.downBtn.InitSkin("baseDownBtn");
        this.downBtn.on(Laya.Event.CLICK, this, this.onDownLoadHandler);
        this.topSp.addDrawChild(this.downBtn);
        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0, 133);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK, this, this.onRuleHandler);
        this.topSp.addDrawChild(this.ruleBtn);
        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(647, 29);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK, this, this.onHomeHandler);
        this.topSp.addDrawChild(this.homeBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(647, 133);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.topSp.addDrawChild(this.soundBtn);
        this.shareBtn = new SgsFlatButton();
        this.shareBtn.pos(647, 237);
        this.shareBtn.InitSkin("baseShareBtn");
        this.shareBtn.on(Laya.Event.CLICK, this, this.onShareHandler);
        this.topSp.addDrawChild(this.shareBtn);
        this.saveBtn = new SgsFlatButton();
        this.saveBtn.pos(227, 820);
        this.saveBtn.InitSkin("baseSaveBtn");
        this.saveBtn.on(Laya.Event.CLICK, this, this.onSaveHandler);
        this.topSp.addDrawChild(this.saveBtn);
        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK, this, this.onMyDressHandler);
        this.topSp.addDrawChild(this.myDressBtn);
        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK, this, this.onRankHandler);
        this.topSp.addDrawChild(this.rankBtn);
        this.dressBtn = new SgsFlatButton();
        this.dressBtn.InitSkin("baseDressBtn");
        this.dressBtn.on(Laya.Event.CLICK, this, this.onDressHandler);
        this.topSp.addDrawChild(this.dressBtn);
        this.desc = new SgsText();
        this.desc.pos(126, 943);
        this.desc.width = SystemContext.gameWidth - 126 * 2;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#6A736F";
        this.desc.fontSize = 22;
        this.desc.leading = 10;
        this.desc.text = "主人，点击按钮可将该搭配保存至您的手机相册哦\n同时，您可前往【我的搭配】中查看所有搭配记录。";
        this.addDrawChild(this.desc);
        if (this.sceneData)
            this.dressAvatar.UpdateAll(this.sceneData.skin, this.sceneData.collocation);
        this.onStageResize();
    }
    onDownLoadHandler() {
        Global.DownLoadGame();
    }
    onRuleHandler() {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }
    onHomeHandler() {
        SceneManager.GetInstance().EnterScene("HomeScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onShareHandler() {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }
    onSaveHandler() {
        if (this.sceneData)
            WindowManager.GetInstance().OpenWindow("SaveDressWindow", this.sceneData.skin, this.sceneData.collocation);
    }
    onMyDressHandler() {
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }
    onRankHandler() {
        SceneManager.GetInstance().EnterScene("RankScene");
    }
    onDressHandler() {
        SceneManager.GetInstance().EnterScene("DressScene");
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        let startY = this.desc.y + this.desc.height;
        let centerY = SystemContext.gameHeight - startY - 232 >> 1;
        this.myDressBtn.pos(77, startY + centerY);
        this.rankBtn.pos(291, startY + centerY);
        this.dressBtn.pos(506, startY + centerY);
    }
    destroy() {
        super.destroy();
    }
}

//import TextureAtlas from "./TextureAtlas";
class TextureAtlasManager {
    constructor(atlasTextureWidth = 2048, atlasTextureHeight = 2048, atlasLimitWidth = 512, atlasLimitHeight = 512, maxAtlaserCount = 2) {
        this.atlasTextureWidth = 0;
        this.atlasTextureHeight = 0;
        this.atlasLimitWidth = 0;
        this.atlasLimitHeight = 0;
        this.maxAtlaserCount = 0;
        this.atlasTextureWidth = atlasTextureWidth;
        this.atlasTextureHeight = atlasTextureHeight;
        this.atlasLimitWidth = atlasLimitWidth;
        this.atlasLimitHeight = atlasLimitHeight;
        this.maxAtlaserCount = maxAtlaserCount;
        this.atlasArray = [];
        this.tmpAtlasPos = new Laya.Point();
        TextureAtlasManager.Instance = this;
    }
    NeedPushAtlas(texture) {
        if (texture && texture.bitmap && texture.bitmap.imageBitmap &&
            texture.width <= this.atlasLimitWidth && texture.height <= this.atlasLimitHeight)
            texture["canMergeAltas"] = true;
    }
    PushAtlas(texture) {
        if (texture["inMergeAltas"] || !texture["canMergeAltas"] || !texture.bitmap.imageBitmap)
            return false;
        var w = texture.width;
        var h = texture.height;
        var sz = this.atlasArray.length;
        var atlas;
        var find = false;
        for (var i = 0; i < sz; i++) {
            atlas = this.atlasArray[i];
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (find)
                break;
        }
        if (!find) {
            atlas = new TextureAtlas(this.atlasTextureWidth, this.atlasTextureHeight);
            this.atlasArray.push(atlas);
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (!find) {
                throw 'err1';
            }
        }
        if (find) {
            atlas.texture.addToAtlasTexture(texture, this.tmpAtlasPos.x, this.tmpAtlasPos.y);
            atlas.texture.addToAtlas(texture, this.tmpAtlasPos.x, this.tmpAtlasPos.y);
            return true;
        }
    }
    GC() {
        var n = this.atlasArray.length - this.maxAtlaserCount;
        if (n > 0) {
            for (var i = 0; i < n; i++) {
                this.atlasArray[i].destroy();
            }
            this.atlasArray.splice(0, n);
            console.log(">>>TextureAtlasManager GC : " + n);
        }
    }
    FreeAll(isClose = false) {
        for (var i = 0; i < this.atlasArray.length; i++) {
            this.atlasArray[i].destroy();
        }
        this.atlasArray.length = 0;
        if (isClose)
            TextureAtlasManager.Instance = null;
    }
}
Laya.Browser.window.TextureAtlasManager = TextureAtlasManager;

//import AtlaserTexture from "./AtlaserTexture";
class TextureAtlas {
    constructor(texWidth, texHeight) {
        this.texWidth = 0;
        this.texHeight = 0;
        this.texWidth = texWidth;
        this.texHeight = texHeight;
        this.texture = null;
        this.texture = AtlaserTexture.getAtlaserTexture(this.texWidth, this.texHeight);
        if (this.texWidth / TextureAtlas.atlasGridW > 256)
            TextureAtlas.atlasGridW = Math.ceil(this.texWidth / 256);
        this.atlasgrid = new Laya.AtlasGrid(this.texWidth / TextureAtlas.atlasGridW, this.texHeight / TextureAtlas.atlasGridW, this.texture.id);
    }
    getAEmpty(w, h, pt) {
        var find = this.atlasgrid.addRect(1, Math.ceil(w / TextureAtlas.atlasGridW), Math.ceil(h / TextureAtlas.atlasGridW), pt);
        if (find) {
            pt.x *= TextureAtlas.atlasGridW;
            pt.y *= TextureAtlas.atlasGridW;
        }
        return find;
    }
    destroy() {
        if (this.texture) {
            this.texture.destroy();
            this.texture = null;
        }
        this.atlasgrid = null;
    }
}
TextureAtlas.atlasGridW = 16;

//import RES from "../res/RES";
class AtlaserTexture extends Laya.Resource {
    constructor(texWidth, texHeight) {
        super();
        this.texWidth = 0;
        this.texHeight = 0;
        this.bitmap = { id: 0, _glTexture: null };
        this.texWidth = texWidth;
        this.texHeight = texHeight;
        this.bitmap.id = this.id;
        this._inAtlasTextureKey = [];
        this._inAtlasTextureBitmapValue = [];
        this._inAtlasTextureOriUVValue = [];
        this._InAtlasWebGLImagesKey = {};
        this._InAtlasWebGLImagesOffsetValue = [];
        this.lock = true;
    }
    static getAtlaserTexture(width, height) {
        return new AtlaserTexture(width, height);
    }
    recreateResource() {
        if (this._source)
            return;
        var gl = Laya["LayaGL"].instance;
        var glTex = this._source = gl.createTexture();
        this.bitmap._glTexture = glTex;
        Laya.WebGLContext["bindTexture"](gl, gl.TEXTURE_2D, glTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.texWidth, this.texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this["_setGPUMemory"](this.texWidth * this.texHeight * 4);
    }
    addToAtlasTexture(texture, offsetX, offsetY) {
        !this._source && this.recreateResource();
        var gl = Laya["LayaGL"].instance;
        var sUrl = texture.url;
        var bitmap = texture.bitmap;
        this._InAtlasWebGLImagesKey[sUrl ? sUrl : bitmap.id] = { bitmap: bitmap, offsetInfoID: this._InAtlasWebGLImagesOffsetValue.length };
        this._InAtlasWebGLImagesOffsetValue.push([offsetX, offsetY]);
        Laya.WebGLContext["bindTexture"](gl, gl.TEXTURE_2D, this._source);
        !Laya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, bitmap.imageBitmap);
        !Laya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }
    addToAtlas(texture, offsetX, offsetY) {
        texture._atlasID = this._inAtlasTextureKey.length;
        var oriUV = texture.uv.slice();
        var oriBitmap = texture.bitmap;
        this._inAtlasTextureKey.push(texture);
        this._inAtlasTextureOriUVValue.push(oriUV);
        this._inAtlasTextureBitmapValue.push(oriBitmap);
        this.computeUVinAtlasTexture(texture, oriUV, offsetX, offsetY);
        texture.bitmap = this;
        texture["inMergeAltas"] = true;
    }
    computeUVinAtlasTexture(texture, oriUV, offsetX, offsetY) {
        var _w = this.texWidth;
        var _h = this.texHeight;
        var u1 = offsetX / _w, v1 = offsetY / _h, u2 = (offsetX + texture.bitmap.width) / _w, v2 = (offsetY + texture.bitmap.height) / _h;
        var inAltasUVWidth = texture.bitmap.width / _w, inAltasUVHeight = texture.bitmap.height / _h;
        texture.uv = [u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight, u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight, u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight, u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight];
    }
    recoveryTextures() {
        var urls = [];
        for (var i = 0, n = this._inAtlasTextureKey.length; i < n; i++) {
            this._inAtlasTextureKey[i].bitmap = this._inAtlasTextureBitmapValue[i];
            this._inAtlasTextureKey[i].uv = this._inAtlasTextureOriUVValue[i];
            this._inAtlasTextureKey[i]._atlasID = -1;
            this._inAtlasTextureKey[i]["inMergeAltas"] = false;
            urls.push(this._inAtlasTextureKey[i].url);
        }
        this._inAtlasTextureKey.length = 0;
        this._inAtlasTextureBitmapValue.length = 0;
        this._inAtlasTextureOriUVValue.length = 0;
        this._InAtlasWebGLImagesKey = null;
        this._InAtlasWebGLImagesOffsetValue.length = 0;
        return urls;
    }
    _disposeResource() {
        super._disposeResource();
        if (this.bitmap) {
            this.bitmap._glTexture = null;
            this.bitmap = null;
        }
        if (this._source) {
            var gl = Laya["LayaGL"].instance;
            gl.deleteTexture(this._source);
            this._source = null;
            this["_setGPUMemory"](0);
        }
    }
    destroy() {
        let urls = this.recoveryTextures();
        super.destroy();
        if (urls && urls.length > 0) {
            var textureUrl;
            for (var i = 0, n = urls.length; i < n; i++) {
                textureUrl = urls[i];
                if (RES.GetReference(textureUrl) <= 0)
                    RES.ClearResByUrl(textureUrl);
            }
            urls.length = 0;
            urls = null;
        }
    }
    get texture() {
        return this;
    }
    get width() {
        return this.texWidth;
    }
    get height() {
        return this.texHeight;
    }
    _getSource() {
        return this._source;
    }
}

//import SgsFlatContainer from "./ui/controls/base/SgsFlatContainer";
//import SgsText from "./ui/controls/base/SgsText";
class TestContainerC extends SgsFlatContainer {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.initChilds();
    }
    initChilds() {
        let test1 = new SgsText();
        test1.text = "7";
        this.addDrawChild(test1);
        let test2 = new SgsText();
        test2.text = "8";
        this.addOtherChild(0, test2);
    }
}

//import SgsFlatContainer from "./ui/controls/base/SgsFlatContainer";
//import SgsText from "./ui/controls/base/SgsText";
class TestContainerB extends SgsFlatContainer {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.initChilds();
    }
    initChilds() {
        let test1 = new SgsText();
        test1.text = "4";
        this.addDrawChild(test1);
        let test2 = new SgsText();
        test2.text = "5";
        this.addDrawChild(test2);
        let test3 = new SgsText();
        test3.text = "6";
        this.addOtherChild(0, test3);
    }
}

//import TestContainerC from "./TestContainerC";
//import SgsFlatContainer from "./ui/controls/base/SgsFlatContainer";
//import SgsText from "./ui/controls/base/SgsText";
class TestContainerA extends SgsFlatContainer {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.initChilds();
    }
    initChilds() {
        let test1 = new SgsText();
        test1.text = "1";
        this.addDrawChild(test1);
        let test2 = new SgsText();
        test2.text = "2";
        this.addDrawChild(test2);
        let test3 = new SgsText();
        test3.text = "3";
        this.addOtherChild(0, test3);
    }
    CreateC() {
        let c = new TestContainerC(this.otherRenders);
        this.addDrawChild(c);
    }
}

//import GameEventDispatcher from "./event/GameEventDispatcher";
class SystemContext {
    constructor() {
    }
    static UpdateGameSize(screenWidth, screenHeight) {
        this.gameWidth = this.stageWidth;
        this.gameHeight = this.stageHeight;
        GameEventDispatcher.GetInstance().event(Laya.Event.RESIZE);
    }
    static get stageWidth() {
        return Laya.stage.width;
    }
    static get stageHeight() {
        return Laya.stage.height;
    }
    static get canvasX() {
        return Laya.Browser.clientWidth * Laya.Browser.pixelRatio - Laya.stage.width * Laya.stage.clientScaleX >> 1;
    }
    static get canvasY() {
        return Laya.Browser.clientHeight * Laya.Browser.pixelRatio - Laya.stage.height * Laya.stage.clientScaleY >> 1;
    }
}
SystemContext.designWidth = 750;
SystemContext.designHeight = 1496;
SystemContext.gameWidth = 750;
SystemContext.gameHeight = 0;

//import ResourceEvent from "./ResourceEvent";
//import RES from "./RES";
//import SgsText from "../ui/controls/base/SgsText";
//import SgsTexture from "../ui/controls/base/SgsTexture";
//import SgsFlatContainer from "../ui/controls/base/SgsFlatContainer";
class ResourceLoader {
    constructor(resConfig) {
        this.priorityQueue = {};
        this.itemListDic = {};
        this.loadedGroups = [];
        this.loadedLocalRess = [];
        this.lazyLoadList = [];
        this.asyncDic = {};
        this.atlasSubitemDic = {};
        this.resConfig = resConfig;
    }
    loadConfig(url) {
        Laya.loader.load(url, Laya.Handler.create(this, function (data) {
            if (!data) {
                RES.dispatchResourceEvent(ResourceEvent.CONFIG_LOAD_ERROR);
                return;
            }
            if (!data.hasOwnProperty("groups") || !data.hasOwnProperty("resources")) {
                console.warn("配置文件数据错误");
                RES.dispatchResourceEvent(ResourceEvent.CONFIG_LOAD_ERROR);
                return;
            }
            this.resConfig.parseConfig(data);
            RES.dispatchResourceEvent(ResourceEvent.CONFIG_COMPLETE);
        }));
    }
    loadGroup(groupName, groupList, priority) {
        if (this.priorityQueue[priority]) {
            this.priorityQueue[priority].push(groupName);
        }
        else {
            this.priorityQueue[priority] = [groupName];
        }
        this.addGroupInLoading(groupName, groupList);
        var maxPriority = this.getMaxPriority();
        if (priority >= maxPriority) {
            this.loadNext();
        }
        else {
        }
    }
    stopGroup(groupName) {
        let groupList = this.itemListDic[groupName];
        if (groupList) {
            this.delPriorityGroupName(groupName);
            this.delGroupInLoading(groupName);
            if (groupList.length <= 0) {
                groupList = this.resConfig.getGroupByName(groupName);
                let cancelUrls = [];
                if (groupList && groupList.length > 0) {
                    for (let i = 0; i < groupList.length; i++) {
                        if (!this.isResInLoadingGroup(groupList[i].url))
                            cancelUrls.push(groupList[i].url);
                    }
                    Laya.loader.cancelLoadByUrls(cancelUrls);
                }
                return false;
            }
        }
        return true;
    }
    loadItem(url, type, key, compFunc, thisObject, args) {
        var param = { url: url, type: type, key: key, compFunc: compFunc, thisObject: thisObject, args: args };
        if (this.asyncDic[url]) {
            this.asyncDic[url].push(param);
        }
        else {
            this.asyncDic[url] = [param];
            this.lazyLoadList.push(param);
            if (this.isAllGroupLoaded()) {
                this.loadNext();
            }
            else {
            }
        }
    }
    stopLoadItem(url, compFunc, thisObject) {
        if (!url || !compFunc || !thisObject)
            return;
        let param;
        let argsList = this.asyncDic[url];
        if (argsList && argsList.length) {
            for (let i = 0; i < argsList.length; i++) {
                param = argsList[i];
                if (!param || !param.compFunc || !param.thisObject)
                    continue;
                if (param.compFunc == compFunc && param.thisObject == thisObject) {
                    argsList.splice(i, 1);
                    break;
                }
            }
        }
        if (!argsList || argsList.length <= 0) {
            delete this.asyncDic[url];
            for (let i = 0; i < this.lazyLoadList.length; i++) {
                param = this.lazyLoadList[i];
                if (!param || !param.compFunc || !param.thisObject)
                    continue;
                if (param.url == url && param.compFunc == compFunc && param.thisObject == thisObject) {
                    this.lazyLoadList.splice(i, 1);
                    break;
                }
            }
            Laya.loader.cancelLoadByUrl(url);
        }
    }
    loadNext() {
        var length = 0;
        var i = 0;
        var nextResources = this.getNextGroup();
        if (nextResources && nextResources.length > 0) {
            length = nextResources.length;
            var nextResource;
            for (i = 0; i < length; i++) {
                nextResource = nextResources[i];
                this.loadOneGroup(nextResource.groupName, nextResource.groupList);
                nextResource.groupList.length = 0;
            }
        }
        else if (this.isAllGroupLoaded()) {
            if (this.lazyLoadList && this.lazyLoadList.length > 0) {
                length = this.lazyLoadList.length;
                for (i = 0; i < length; i++) {
                    this.loadAsync(this.lazyLoadList.shift());
                }
            }
        }
    }
    getMaxPriority() {
        var maxPriority = Number.NEGATIVE_INFINITY;
        for (var p in this.priorityQueue) {
            maxPriority = Math.max(maxPriority, parseInt(p));
        }
        return maxPriority;
    }
    isAllGroupLoaded() {
        var maxPriority = this.getMaxPriority();
        return maxPriority >= 0 ? false : true;
    }
    getNextGroup() {
        var maxPriority = this.getMaxPriority();
        var queue = this.priorityQueue[maxPriority];
        if (!queue || queue.length == 0)
            return null;
        var list = [];
        var length = queue.length;
        var groupName = "";
        var groupList = [];
        for (var i = 0; i < length; i++) {
            groupName = queue[i];
            groupList = this.itemListDic[groupName];
            if (groupList && groupList.length > 0) {
                list.push({ groupName: groupName, groupList: groupList });
            }
        }
        if (list.length > 0)
            return list;
        return null;
    }
    loadOneGroup(groupName, groupList) {
        if (!Laya.loader.hasListener(Laya.Event.ERROR)) {
            Laya.loader.on(Laya.Event.ERROR, this, onResourceLoadError);
        }
        Laya.loader.load(groupList, Laya.Handler.create(this, onComplete, [[...groupList]]), Laya.Handler.create(this, onProgress, null, false));
        function onComplete(groupList, success) {
            if (!this.isGroupInLoading(groupName)) {
                this.loadNext();
                return;
            }
            this.delPriorityGroupName(groupName);
            this.delGroupInLoading(groupName);
            if (this.isAllGroupLoaded()) {
                Laya.loader.off(Laya.Event.ERROR, this, onResourceLoadError);
            }
            if (success == false) {
                RES.dispatchResourceEvent(ResourceEvent.GROUP_LOAD_ERROR, groupName);
                this.loadNext();
                return;
            }
            this.addGroupLoaded(groupName);
            this.addResLoadedLocal(groupName, groupList);
            this.parseGroupAtlas(groupName, groupList);
            RES.dispatchResourceEvent(ResourceEvent.GROUP_COMPLETE, groupName);
            this.loadNext();
        }
        function onProgress(progress) {
            RES.dispatchResourceEvent(ResourceEvent.GROUP_PROGRESS, groupName, progress);
        }
        function onResourceLoadError(error) {
            RES.dispatchResourceEvent(ResourceEvent.ITEM_LOAD_ERROR, "", 0, error);
        }
    }
    getAtlasSubitemByName(name) {
        var url = this.atlasSubitemDic[name];
        return url ? url : "";
    }
    loadAsync(resItem) {
        Laya.loader.load(resItem.url, Laya.Handler.create(this, function (argItem, data) {
            var argsList = this.asyncDic[argItem.url];
            delete this.asyncDic[argItem.url];
            if (data && argItem.type == "atlas") {
                this.parseAtlas(argItem.url);
            }
            if (!argsList)
                return;
            let length = argsList.length;
            let param;
            let key = "";
            for (var i = 0; i < length; i++) {
                param = argsList[i];
                key = param.key != "" ? param.key : param.url;
                if (param.thisObject instanceof Laya.Sprite && param.thisObject.destroyed)
                    continue;
                if ((param.thisObject instanceof SgsText || param.thisObject instanceof SgsTexture || param.thisObject instanceof SgsFlatContainer)
                    && param.thisObject.destroyed)
                    continue;
                if (param.args)
                    param.compFunc && param.compFunc.call(param.thisObject, data, key, param.args);
                else
                    param.compFunc && param.compFunc.call(param.thisObject, data, key);
            }
        }, [resItem]), null, resItem.type);
    }
    isGroupInLoading(groupName) {
        return this.itemListDic[groupName] !== undefined;
    }
    addGroupInLoading(groupName, groupList) {
        this.itemListDic[groupName] = groupList;
    }
    delGroupInLoading(groupName) {
        delete this.itemListDic[groupName];
    }
    isGroupLoaded(groupName) {
        return this.loadedGroups.indexOf(groupName) != -1 ? true : false;
    }
    addGroupLoaded(groupName) {
        if (this.loadedGroups.indexOf(groupName) == -1)
            this.loadedGroups.push(groupName);
    }
    delGroupLoaded(groupName) {
        var index = this.loadedGroups.indexOf(groupName);
        if (index != -1)
            this.loadedGroups.splice(index, 1);
    }
    isResLoadedLocal(groupName) {
        return this.loadedLocalRess.indexOf(groupName) != -1 ? true : false;
    }
    addResLoadedLocal(groupName, groupList) {
        if (!groupName || groupName.length <= 0 || !groupList || groupList.length <= 0)
            return;
        var length = groupList.length;
        var resItem;
        for (var i = 0; i < length; i++) {
            var resItem = groupList[i];
            if (resItem && this.loadedLocalRess.indexOf(resItem.url) == -1)
                this.loadedLocalRess.push(resItem.url);
        }
    }
    delLoadedGroupsByItemName(url) {
        var loadedGroups = this.loadedGroups;
        var loadedGroupLength = loadedGroups.length;
        for (var i = 0; i < loadedGroupLength; i++) {
            var group = this.resConfig.getRawGroupByName(loadedGroups[i]);
            var length = group.length;
            for (var j = 0; j < length; j++) {
                var item = group[j];
                if (item.url == url) {
                    loadedGroups.splice(i, 1);
                    i--;
                    loadedGroupLength = loadedGroups.length;
                    break;
                }
            }
        }
    }
    isResInLoadedGroup(url) {
        var loadedGroups = this.loadedGroups;
        var loadedGroupLength = loadedGroups.length;
        for (var i = 0; i < loadedGroupLength; i++) {
            var group = this.resConfig.getRawGroupByName(loadedGroups[i]);
            var length = group ? group.length : 0;
            for (var j = 0; j < length; j++) {
                var item = group[j];
                if (item.url == url)
                    return true;
            }
        }
        return false;
    }
    isResInLoadingGroup(url) {
        var groupList;
        var result = false;
        for (var groupName in this.itemListDic) {
            groupList = this.resConfig.getRawGroupByName(groupName);
            if (groupList) {
                for (var i = 0; i < groupList.length; i++) {
                    var item = groupList[i];
                    if (item.url == url) {
                        result = true;
                        break;
                    }
                }
            }
            if (result)
                break;
        }
        return result;
    }
    delPriorityGroupName(groupName) {
        for (var p in this.priorityQueue) {
            var queue = this.priorityQueue[p];
            var index = 0;
            var found = false;
            var length = queue.length;
            for (var i = 0; i < length; i++) {
                var name_2 = queue[i];
                if (name_2 == groupName) {
                    queue.splice(index, 1);
                    found = true;
                    break;
                }
                index++;
            }
            if (found) {
                if (queue.length == 0) {
                    delete this.priorityQueue[p];
                }
                break;
            }
        }
    }
    parseGroupAtlas(groupName, groupList) {
        if (!groupName || groupName.length <= 0 || !groupList || groupList.length <= 0)
            return;
        var length = groupList.length;
        var resItem;
        for (var i = 0; i < length; i++) {
            var resItem = groupList[i];
            if (resItem.type == "atlas") {
                this.parseAtlas(resItem.url);
            }
        }
    }
    parseAtlas(atlasUrl) {
        var atlasJson = RES.GetRes(atlasUrl);
        if (!atlasJson)
            return;
        var frames = atlasJson.frames;
        var cleanUrl = atlasUrl.split("?")[0];
        var directory = (atlasJson.meta && atlasJson.meta.prefix) ? atlasJson.meta.prefix : cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + "/";
        var key = "";
        for (var name in frames) {
            key = name.substring(0, name.lastIndexOf("."));
            this.atlasSubitemDic[key] = directory + name;
        }
    }
    delAtlas(url) {
        var atlasList = Laya.Loader.getAtlas(url);
        if (!atlasList || atlasList.length <= 0)
            return;
        var length = atlasList.length;
        var atlasSubItemUrl = "";
        for (var i = 0; i < length; i++) {
            atlasSubItemUrl = atlasList[i];
            atlasSubItemUrl = atlasSubItemUrl.substring(atlasSubItemUrl.lastIndexOf("/") + 1, atlasSubItemUrl.lastIndexOf("."));
            if (atlasSubItemUrl != "")
                delete this.atlasSubitemDic[atlasSubItemUrl];
        }
    }
}

class ResourceItem {
    constructor(name, url, type) {
        this.name = "";
        this.url = "";
        this.type = "";
        this.name = name;
        this.url = url;
        this.type = type;
    }
}

class ResourceEvent {
    constructor(groupName = "", progress = 0, errorUrl = "") {
        this.groupName = "";
        this.progress = 0;
        this.errorUrl = "";
        this.groupName = groupName;
        this.progress = progress;
        this.errorUrl = errorUrl;
    }
}
ResourceEvent.CONFIG_COMPLETE = "configComplete";
ResourceEvent.CONFIG_LOAD_ERROR = "configLoadError";
ResourceEvent.GROUP_PROGRESS = "groupProgress";
ResourceEvent.GROUP_COMPLETE = "groupComplete";
ResourceEvent.ITEM_LOAD_ERROR = "itemLoadError";
ResourceEvent.GROUP_LOAD_ERROR = "groupLoadError";

//import ResourceItem from "./ResourceItem";
//import RES from "./RES";
class ResourceConfig {
    constructor() {
        this.groupDic = {};
        this.keyMap = {};
        this.configComplete = false;
    }
    getResourceItem(key) {
        var data = this.keyMap[key];
        if (data)
            return data;
        var url = this.getResourceUrl(key);
        for (var p in this.keyMap) {
            data = this.keyMap[p];
            if (data.url == url)
                return data;
        }
        return null;
    }
    getRawGroupByName(name) {
        if (this.groupDic[name])
            return this.groupDic[name];
        return null;
    }
    getGroupByName(name) {
        if (!this.groupDic[name])
            return null;
        var group = new Array();
        var list = this.groupDic[name];
        var length = list.length;
        for (var i = 0; i < length; i++) {
            var obj = list[i];
            group.push(this.parseResourceItem(obj));
        }
        return group;
    }
    getResourceUrl(key) {
        if (!key || key.length <= 0)
            return "";
        if (key.indexOf("/") == -1) {
            let item = this.keyMap[key];
            if (item) {
                if (item.compressTexture) {
                    let format = Laya.Utils.getFileExtension(item.url);
                    let changType = Laya.Utils.getTextureCompressFormat(format);
                    if (format != changType) {
                        return item.url.replace("." + format, "." + changType);
                    }
                }
                return item.url;
            }
            return "";
        }
        else {
            if (RES.resourceRoot != "" && key.indexOf(RES.resourceRoot) == -1) {
                key = RES.resourceRoot + key;
            }
        }
        return key;
    }
    getGroupName(url) {
        for (var p in this.groupDic) {
            var groupList = this.groupDic[p];
            var length = groupList.length;
            for (var i = 0; i < length; i++) {
                if (groupList[i].url == url) {
                    return p;
                }
            }
        }
        return "";
    }
    addGroupKeys(groupName, keys) {
        if (!this.groupDic[groupName] || !keys || keys.length == 0)
            return;
        let list = this.groupDic[groupName];
        let length = keys.length;
        let key = "";
        let gList;
        for (let i = 0; i < length; i++) {
            key = keys[i];
            gList = this.groupDic[key];
            if (gList) {
                var len = gList.length;
                for (var j = 0; j < len; j++) {
                    var item = gList[j];
                    if (list.indexOf(item) == -1) {
                        list.push(item);
                        this.addSkForPngItem(list, item);
                    }
                }
            }
            else {
                var item = this.keyMap[key];
                if (item) {
                    if (list.indexOf(item) == -1) {
                        list.push(item);
                        this.addSkForPngItem(list, item);
                    }
                }
                else {
                    console.warn("创建自定义加载资源组，资源未在配置文件找到：", key);
                }
            }
        }
    }
    delGroupKeys(groupName, keys) {
        if (!this.groupDic[groupName])
            return;
        if (!keys || keys.length == 0) {
            this.groupDic[groupName] = [];
            return;
        }
        let list = this.groupDic[groupName];
        let length = keys.length;
        let key = "";
        let gList;
        let index = -1;
        for (let i = 0; i < length; i++) {
            key = keys[i];
            gList = this.groupDic[key];
            if (gList) {
                var len = gList.length;
                for (var j = 0; j < len; j++) {
                    var item = gList[j];
                    index = list.indexOf(item);
                    if (index != -1) {
                        list.splice(index, 1);
                        this.delSkForPngItem(list, item);
                    }
                }
            }
            else {
                var item = this.keyMap[key];
                if (item) {
                    index = list.indexOf(item);
                    if (index != -1) {
                        list.splice(index, 1);
                        this.delSkForPngItem(list, item);
                    }
                }
            }
        }
    }
    createGroup(groupName, keys, override) {
        if ((!override && this.groupDic[groupName]) || !keys || keys.length == 0)
            return false;
        let groupDic = this.groupDic;
        let group = [];
        let length = keys.length;
        let key = "";
        let gList;
        for (var i = 0; i < length; i++) {
            key = keys[i];
            gList = groupDic[key];
            if (gList) {
                var len = gList.length;
                for (var j = 0; j < len; j++) {
                    var item = gList[j];
                    if (group.indexOf(item) == -1) {
                        group.push(item);
                        this.addSkForPngItem(group, item);
                    }
                }
            }
            else {
                var item = this.keyMap[key];
                if (item) {
                    if (group.indexOf(item) == -1) {
                        group.push(item);
                        this.addSkForPngItem(group, item);
                    }
                }
                else {
                    console.warn("创建自定义加载资源组，资源未在配置文件找到：", key);
                }
            }
        }
        if (group.length == 0)
            return false;
        this.groupDic[groupName] = group;
        return true;
    }
    addResources(resources) {
        if (!resources || resources.length == 0)
            return;
        let length = resources.length;
        let resourceItem;
        let gList;
        for (let i = 0; i < length; i++) {
            resourceItem = resources[i];
            if (!this.keyMap[resourceItem.name])
                this.addItemToKeyMap(resourceItem);
        }
    }
    delResources(resources) {
        if (!resources || resources.length == 0)
            return;
        let length = resources.length;
        let resourceItem;
        for (let i = 0; i < length; i++) {
            resourceItem = resources[i];
            let item = this.keyMap[resourceItem.name];
            if (item)
                this.delItemToKeyMap(item);
        }
    }
    delResourcesByName(names) {
        if (!names || names.length == 0)
            return;
        let length = names.length;
        let name;
        for (let i = 0; i < length; i++) {
            name = names[i];
            let item = this.keyMap[name];
            if (item)
                this.delItemToKeyMap(item);
        }
    }
    parseConfig(data) {
        if (!data)
            return;
        let resources = data["resources"];
        let item;
        if (resources) {
            let length = resources.length;
            for (let i = 0; i < length; i++) {
                item = resources[i];
                if (!Laya.Browser.window.useLocalConfig) {
                }
                this.addItemToKeyMap(item);
            }
        }
        let groups = data["groups"];
        if (groups) {
            let keyDic = {};
            let length = groups.length;
            let group;
            let keys;
            for (let i = 0; i < length; i++) {
                group = groups[i];
                keys = group.keys.split(",");
                let list = [];
                let len = keys.length;
                let key;
                for (let j = 0; j < len; j++) {
                    key = keys[j].trim();
                    list.push(key);
                }
                keyDic[group.name] = list;
            }
            for (let groupName in keyDic) {
                keys = keyDic[groupName];
                length = keys.length;
                let key;
                let list = [];
                for (let i = 0; i < length; i++) {
                    this.parseItems(list, keyDic, keys[i]);
                }
                this.groupDic[groupName] = list;
            }
        }
        this.configComplete = true;
    }
    addItemToKeyMap(item) {
        if (!this.keyMap[item.name]) {
            let url = item.url;
            if (url && url.indexOf("://") == -1 && url.indexOf(RES.resourceRoot) != 0)
                item.url = RES.resourceRoot + url;
            this.keyMap[item.name] = item;
            this.addSkForPngResource(item);
        }
    }
    delItemToKeyMap(item) {
        if (this.keyMap[item.name]) {
            delete this.keyMap[item.name];
            this.delSkForPngResource(item);
        }
    }
    parseItems(list, keyDic, key) {
        let gList = keyDic[key];
        if (gList) {
            var len = gList.length;
            for (var i = 0; i < len; i++) {
                this.parseItems(list, keyDic, gList[i]);
            }
        }
        else {
            let item = this.keyMap[key];
            if (item && list.indexOf(item) == -1) {
                list.push(item);
                this.addSkForPngItem(list, item);
            }
        }
        return list;
    }
    addSkForPngResource(item) {
        if (this.checkSkResource(item)) {
            let urlIndex = item.url.lastIndexOf(".");
            let fortmat = "png";
            if (item.compressTexture) {
                fortmat = Laya.Utils.getTextureCompressFormat(fortmat);
            }
            let pngItem = { url: item.url.substr(0, urlIndex) + "." + fortmat, type: "image", name: this.getSkForPngKey(item.name) };
            if (!this.keyMap[pngItem.name])
                this.keyMap[pngItem.name] = pngItem;
        }
    }
    delSkForPngResource(item) {
        if (this.checkSkResource(item)) {
            let name = this.getSkForPngKey(item.name);
            if (this.keyMap[name])
                delete this.keyMap[name];
        }
    }
    addSkForPngItem(list, item) {
        if (this.checkSkResource(item)) {
            let pngItem = this.keyMap[this.getSkForPngKey(item.name)];
            if (pngItem && list.indexOf(pngItem) == -1)
                list.push(pngItem);
        }
    }
    delSkForPngItem(list, item) {
        if (this.checkSkResource(item)) {
            let pngItem = this.keyMap[this.getSkForPngKey(item.name)];
            let index = pngItem ? list.indexOf(pngItem) : -1;
            if (index != -1)
                list.splice(index, 1);
        }
    }
    checkSkResource(item) {
        let urlIndex = item.url.lastIndexOf(".");
        let postfix = urlIndex == -1 ? "" : item.url.substr(urlIndex);
        if (postfix == ".sk" && item.type && item.type == "arraybuffer")
            return true;
        return false;
    }
    getSkForPngKey(key) {
        let index = key.lastIndexOf("_sk");
        let pngKey = index == -1 ? key + "_png" : key.substr(0, index) + "_png";
        return pngKey;
    }
    parseResourceItem(data) {
        var resItem = new ResourceItem(data.name, data.url, data.type);
        resItem.data = data;
        return resItem;
    }
}

//import ResourceLoader from "./ResourceLoader";
//import ResourceEvent from "./ResourceEvent";
//import ResourceConfig from "./ResourceConfig";
class RES extends Laya.EventDispatcher {
    constructor() {
        super();
    }
    static GetInstance() {
        if (!RES._res) {
            RES._res = new RES();
        }
        return RES._res;
    }
    static set RetryNum(retryNum) {
        Laya.loader.retryNum = retryNum;
    }
    static set RetryDelay(retryDelay) {
        Laya.loader.retryDelay = retryDelay;
    }
    static set MaxLoader(maxLoader) {
        Laya.loader.maxLoader = maxLoader;
    }
    static AddEventListener(type, thisObject, listener) {
        RES.GetInstance().on(type, thisObject, listener);
    }
    static RemoveEventListener(type, thisObject, listener) {
        RES.GetInstance().off(type, thisObject, listener);
    }
    static LoadConfig(url, resourceRoot = "") {
        RES.resourceRoot = resourceRoot;
        if (!url || url.length <= 0) {
            console.warn("配置文件url为空");
            return;
        }
        RES.resLoader.loadConfig(url);
    }
    static LoadGroup(groupName, priority = 0) {
        if (!groupName || groupName.length <= 0) {
            console.warn("加载的资源组名称不能为空");
            return;
        }
        if (!RES.resConfig.configComplete) {
            console.warn("配置文件未加载完，请先加载配置文件");
            return;
        }
        if (RES.resLoader.isGroupLoaded(groupName)) {
            RES.dispatchResourceEvent(ResourceEvent.GROUP_COMPLETE, groupName);
            return;
        }
        if (RES.resLoader.isGroupInLoading(groupName))
            return;
        var groupList = RES.resConfig.getGroupByName(groupName);
        if (!groupList || groupList.length <= 0) {
            console.warn("加载不存在的资源组或资源组中无资源:" + groupName);
            return;
        }
        RES.resLoader.loadGroup(groupName, groupList, priority);
    }
    static LoadSilenceGroup(groupName, groupList, priority = 0) {
        if (!groupName || groupName.length <= 0) {
            console.warn("加载的资源组名称不能为空");
            return;
        }
        if (!RES.resConfig.configComplete) {
            console.warn("配置文件未加载完，请先加载配置文件");
            return;
        }
        if (RES.resLoader.isGroupInLoading(groupName))
            return;
        if (!groupList || groupList.length <= 0) {
            console.warn("加载不存在的资源组或资源组中无资源:" + groupName);
            return;
        }
        RES.resLoader.loadGroup(groupName, groupList, priority);
    }
    static StopGroup(groupName) {
        return RES.resLoader.stopGroup(groupName);
    }
    static IsGroupLoaded(groupName) {
        return RES.resLoader.isGroupLoaded(groupName);
    }
    static IsResLoadedLocal(groupName) {
        return RES.resLoader.isResLoadedLocal(groupName);
    }
    static GetGroupByName(groupName) {
        return RES.resConfig.getGroupByName(groupName);
    }
    static AddGroupKeys(groupName, keys) {
        RES.resLoader.delGroupLoaded(groupName);
        RES.resConfig.addGroupKeys(groupName, keys);
    }
    static DelGroupKeys(groupName, keys) {
        RES.resConfig.delGroupKeys(groupName, keys);
    }
    static CreateGroup(groupName, keys, override = false) {
        if (override) {
            this.resLoader.delGroupLoaded(groupName);
        }
        return RES.resConfig.createGroup(groupName, keys, override);
    }
    static AddResources(resources) {
        RES.resConfig.addResources(resources);
    }
    static DelResources(resources) {
        RES.resConfig.delResources(resources);
    }
    static DelResourcesByName(names) {
        RES.resConfig.delResourcesByName(names);
    }
    static HasRes(key) {
        return RES.GetRes(key) != null;
    }
    static IsResInLoadedGroup(url) {
        return RES.resLoader.isResInLoadedGroup(url);
    }
    static GetRes(key) {
        var atlasUrl = RES.resLoader.getAtlasSubitemByName(key);
        if (atlasUrl != "")
            return Laya.loader.getRes(atlasUrl);
        var url = RES.resConfig.getResourceUrl(key);
        return url == "" ? null : Laya.loader.getRes(url);
    }
    static GetAtlasRes(url) {
        return Laya.loader.getRes(url);
    }
    static GetAtlasUrl(name) {
        var atlasUrl = RES.resLoader.getAtlasSubitemByName(name);
        return atlasUrl;
    }
    static GetResAsync(key, thisObject, compFunc, args) {
        var resourceItem = RES.resConfig.getResourceItem(key);
        if (!resourceItem) {
            compFunc && compFunc.call(thisObject, null, key);
            return;
        }
        var res = RES.GetRes(key);
        if (res) {
            compFunc && compFunc.call(thisObject, res, key);
            return;
        }
        RES.resLoader.loadItem(resourceItem.url, resourceItem.type, key, compFunc, thisObject, args);
    }
    static GetResByUrl(url, thisObject, compFunc, type, args) {
        if (url && url.indexOf("://") == -1) {
            url = RES.resConfig.getResourceUrl(url);
        }
        var res = Laya.loader.getRes(url);
        if (res) {
            if (compFunc) {
                if (args)
                    compFunc && compFunc.call(thisObject, res, url, args);
                else
                    compFunc && compFunc.call(thisObject, res, url);
            }
            return;
        }
        RES.resLoader.loadItem(url, type, "", compFunc, thisObject, args);
    }
    static CancelGetResByUrl(url, thisObject, compFunc) {
        RES.resLoader.stopLoadItem(url, compFunc, thisObject);
    }
    static ClearTextureRes(url) {
        Laya.loader.clearTextureRes(url);
    }
    static ClearRes(key, forceDispose = true) {
        var url = RES.resConfig.getResourceUrl(key);
        if (url == "")
            return;
        if (!Laya.SoundManager.autoReleaseSound) {
            let item = RES.resConfig.getResourceItem(key);
            if (item && item.type == "sound")
                return;
        }
        RES.resLoader.delAtlas(url);
        Laya.loader.clearRes(url, forceDispose);
        if (forceDispose || !RES.HasRes(url)) {
            RES.resLoader.delLoadedGroupsByItemName(url);
        }
    }
    static ClearResByUrl(url, forceDispose = true) {
        this.delayClearRunTimeRes(url);
    }
    static ClearResByGroup(groupName, force = false, forceDispose = true) {
        var groupList = RES.resConfig.getRawGroupByName(groupName);
        if (groupList && groupList.length > 0) {
            RES.resLoader.delGroupLoaded(groupName);
            var length = groupList.length;
            for (var i = 0; i < length; i++) {
                var item = groupList[i];
                if (!force && (RES.resLoader.isResInLoadedGroup(item.url) || RES.resLoader.isResInLoadingGroup(item.url))) {
                }
                else {
                    if (!Laya.SoundManager.autoReleaseSound && item.type == "sound") {
                    }
                    else {
                        RES.ClearRes(item.url, forceDispose);
                    }
                }
            }
        }
    }
    static ClearSilenceResByGroup(groupName, groupList, force = false, forceDispose = true) {
        if (groupList && groupList.length > 0) {
            RES.resLoader.delGroupLoaded(groupName);
            var length = groupList.length;
            for (var i = 0; i < length; i++) {
                var item = groupList[i];
                if (!force && (RES.resLoader.isResInLoadedGroup(item.url) || RES.resLoader.isResInLoadingGroup(item.url))) {
                }
                else {
                    if (!Laya.SoundManager.autoReleaseSound && item.type == "sound") {
                    }
                    else {
                        RES.ClearRes(item.url, forceDispose);
                    }
                }
            }
        }
    }
    static GetResourceItem(key) {
        return RES.resConfig.getResourceItem(key);
    }
    static dispatchResourceEvent(type, groupName = "", progress = 0, errorUrl = "") {
        RES.GetInstance().event(type, new ResourceEvent(groupName, progress, errorUrl));
    }
    static AddReference(url) {
        if (!url || url.length <= 0)
            return;
        let reference = 1;
        if (this.referenceDic[url]) {
            reference = this.referenceDic[url];
            reference++;
        }
        this.referenceDic[url] = reference;
    }
    static DelReference(url) {
        if (!url || url.length <= 0)
            return;
        if (this.referenceDic[url]) {
            let reference = this.referenceDic[url];
            if (reference <= 1)
                delete this.referenceDic[url];
            else
                this.referenceDic[url] = reference - 1;
        }
    }
    static GetReference(url) {
        if (!url || url.length <= 0)
            return 0;
        if (this.referenceDic[url])
            return this.referenceDic[url];
        return 0;
    }
    static delayClearRunTimeRes(url) {
        if (!url || url.length <= 0 || this.GetReference(url) > 0)
            return;
        this.waitClearResDic[url] = Laya.Browser.now();
        if (!this.clearResIng) {
            this.clearResIng = true;
            Laya.timer.once(5000, this, this.clearRunTimeRes);
        }
    }
    static clearRunTimeRes() {
        this.onLoopClearRunTimeRes(false);
    }
    static onLoopClearRunTimeRes(isFrameLoop) {
        let frameTm = Laya.stage.getFrameTm();
        let curTime = 0;
        let isAllClear = true;
        let url = "";
        for (url in this.waitClearResDic) {
            curTime = Laya.Browser.now();
            if (curTime - this.waitClearResDic[url] < 5000) {
                isAllClear = false;
                continue;
            }
            else if (curTime - frameTm > 20) {
                isAllClear = false;
                break;
            }
            else {
                delete this.waitClearResDic[url];
                if (this.GetReference(url) <= 0)
                    Laya.loader.clearRes(url, true);
            }
        }
        if (isAllClear) {
            Laya.timer.clear(this, this.onLoopClearRunTimeRes);
            this.clearResIng = false;
        }
        else {
            if (!isFrameLoop)
                Laya.timer.frameLoop(5, this, this.onLoopClearRunTimeRes, [true]);
        }
    }
    static AddDebugReference(url, clsName) {
        if (!url || url.length <= 0 || !clsName || clsName.length <= 0)
            return;
        if (this.referenceDebugDic[url]) {
            let referenceDic = this.referenceDebugDic[url];
            let reference = 1;
            if (referenceDic[clsName]) {
                reference = referenceDic[clsName];
                reference++;
            }
            referenceDic[clsName] = reference;
        }
        else {
            this.referenceDebugDic[url] = {};
            this.referenceDebugDic[url][clsName] = 1;
        }
    }
    static DelDebugReference(url, clsName) {
        if (!url || url.length <= 0 || !clsName || clsName.length <= 0)
            return;
        if (this.referenceDebugDic[url]) {
            let referenceDic = this.referenceDebugDic[url];
            if (referenceDic[clsName]) {
                let reference = referenceDic[clsName];
                if (reference <= 1) {
                    delete referenceDic[clsName];
                    let keys = Object.keys(referenceDic);
                    if (!keys || keys.length <= 0)
                        delete this.referenceDebugDic[url];
                }
                else
                    referenceDic[clsName] = reference - 1;
            }
        }
    }
}
RES.resourceRoot = "";
RES.resConfig = new ResourceConfig();
RES.resLoader = new ResourceLoader(RES.resConfig);
RES.referenceDic = {};
RES.waitClearResDic = {};
RES.clearResIng = false;
RES.referenceDebugDic = {};
Laya.Browser.window.RES = RES;

//import DressSaveScene from "./ui/base/dressSaveScene/DressSaveScene";
//import DressScene from "./ui/dressScene/DressScene";
//import HomeScene from "./ui/homeScene/HomeScene";
//import MyDressScene from "./ui/myDressScene/MyDressScene";
//import RankScene from "./ui/rankScene/RankScene";
//import LookDressWindow from "./ui/window/LookDressWindow";
//import PromptWindow from "./ui/window/PromptWindow";
//import RuleWindow from "./ui/window/RuleWindow";
//import SaveDressWindow from "./ui/window/SaveDressWindow";
//import SharePromptWindow from "./ui/window/SharePromptWindow";
//import VoteWorkInfoWindow from "./ui/window/VoteWorkInfoWindow";
class RegClass {
    static RegAllClass() {
        this.regCls("HomeScene", HomeScene);
        this.regCls("DressScene", DressScene);
        this.regCls("MyDressScene", MyDressScene);
        this.regCls("RankScene", RankScene);
        this.regCls("DressSaveScene", DressSaveScene);
        this.regCls("PromptWindow", PromptWindow);
        this.regCls("SharePromptWindow", SharePromptWindow);
        this.regCls("RuleWindow", RuleWindow);
        this.regCls("VoteWorkInfoWindow", VoteWorkInfoWindow);
        this.regCls("LookDressWindow", LookDressWindow);
        this.regCls("SaveDressWindow", SaveDressWindow);
    }
    static GetInstanceClass(className) {
        return Laya.ClassUtils.getInstance(className);
    }
    static GetRegClass(className) {
        return Laya.ClassUtils.getRegClass(className);
    }
    static regCls(className, classDef) {
        Laya.ClassUtils.regClass(className, classDef);
    }
}

//import ByteArray from "../utils/ByteArray";
class AESUtils {
    constructor() {
    }
    Init() {
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
        this.encryptCounter = new aesjs.Counter(iv1, 1);
        this.decryptCounter = new aesjs.Counter(iv2, 2);
        this.encrypt = new aesjs.ModeOfOperation.ctr(myKey, this.encryptCounter);
        this.decrypt = new aesjs.ModeOfOperation.ctr(myKey, this.decryptCounter);
    }
    Reset() {
        this.Init();
    }
    Encrypt(buffer) {
        if (this.encrypt) {
            let uint8 = this.encrypt.encrypt(new Uint8Array(buffer));
            return uint8;
        }
        return null;
    }
    Decrypt(buffer) {
        if (this.decrypt) {
            let uint8 = this.decrypt.decrypt(new Uint8Array(buffer));
            return uint8;
        }
        return null;
    }
    InitOfb() {
        var cbck = [0x14, 0x33, 0x45, 0x6b, 0x55, 0x5e, 0x37, 0x78,
            0x61, 0x4e, 0x3f, 0x2d, 0x72, 0x65, 0x51, 0x3d];
        var cbciv = new Float32Array([0x89, 0x65, 0x3e, 0x37, 0x24, 0x46, 0x56, 0x45,
            0x23, 0x75, 0x43, 0x21, 0x6d, 0x55, 0x61, 0xe1]);
        this.jofb = new aesjs.ModeOfOperation.cfb(cbck, cbciv, 16);
    }
    Ofb_Dec(buffer) {
        if (!this.jofb)
            this.InitOfb();
        let uData = new ByteArray();
        let len = buffer.byteLength;
        uData.writeArrayBuffer(buffer);
        let count = 16 - len % 16;
        uData.length = count + len;
        let result = this.jofb.decrypt(new Uint8Array(uData.buffer));
        return result.slice(0, len);
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import DressType from "../../enum/DressType";
//import Global from "../../Global";
//import HttpUtils from "../../utils/HttpUtils";
//import StorageUtils from "../../utils/StorageUtils";
//import UIUtils from "../../utils/UIUtils";
//import SceneManager from "../base/SceneManager";
class GameManager extends Laya.EventDispatcher {
    constructor() {
        super();
        this.openID = "";
        this.token = "";
        this.score = 0;
        this.code = "";
    }
    static GetInstance() {
        if (null == GameManager.instance)
            GameManager.instance = new GameManager();
        return GameManager.instance;
    }
    get Score() {
        return this.score;
    }
    get Code() {
        return this.code;
    }
    get MyCollocationList() {
        return this.myCollocationList;
    }
    get JoinCollocationInfo() {
        if (!this.joinCollocationInfo) {
            if (this.myCollocationList && this.myCollocationList.length) {
                for (let i = 0; i < this.myCollocationList.length; i++) {
                    if (this.myCollocationList[i].is_join) {
                        this.joinCollocationInfo = this.myCollocationList[i];
                        break;
                    }
                }
            }
        }
        return this.joinCollocationInfo;
    }
    get IsCollocationMaxed() {
        return this.myCollocationList && this.myCollocationList.length >= Global.CollocationMax ? true : false;
    }
    InitUserData() {
        if (isWinXin()) {
            let reqObj = Laya.Browser.window.reqObj;
            if (reqObj && reqObj.code) {
                this.WechatLogin(reqObj.code);
            }
            else {
                let openID = StorageUtils.getString("lwzhOpenID");
                let token = StorageUtils.getString("lwzhToken");
                if (openID && token) {
                    this.openID = openID;
                    this.token = token;
                    this.GetTokenTime(this.token);
                }
                else {
                    this.WechatAuthorize();
                }
            }
        }
        else {
            if (Laya.Browser.window.isLocalDebug) {
                this.openID = "obEQh50jNP06elRvSzjUSEjXWuSE";
                this.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvMTB0aGx3aHouc2FuZ3Vvc2hhLmNvbVwvYXBpXC93ZWNoYXRMb2dpbiIsImlhdCI6MTY1ODU3Njk2OSwiZXhwIjoxNjU5MTgxNzY5LCJuYmYiOjE2NTg1NzY5NjksImp0aSI6Ikk0N0dlNXFCYWtqU3JLTVUiLCJzdWIiOjEsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.3GPj0ea6zxbAoN5GKt0F6GBx4Es3Pm5_xNLczpznfXc";
                this.GetTokenTime(this.token);
            }
            else {
                this.WechatAuthorize();
            }
        }
    }
    WechatAuthorize() {
        StorageUtils.delStorage("lwzhOpenID");
        StorageUtils.delStorage("lwzhToken");
        wxAuthorize();
    }
    WechatLogin(code) {
        HttpUtils.Request(Global.ServerUrl + "/api/wechatLogin?code=" + code, null, this.onWechatLogin.bind(this), "get");
    }
    onWechatLogin(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.openID = data.userModel.open_id;
        this.token = data.token;
        StorageUtils.addString("lwzhOpenID", this.openID);
        StorageUtils.addString("lwzhToken", this.token);
        this.WeChatJsSDK();
        this.MyScore();
    }
    GetTokenTime(token) {
        HttpUtils.Request(Global.ServerUrl + "/api/getTokenTime?token=" + token, null, this.onGetTokenTime.bind(this), "get");
    }
    onGetTokenTime(result) {
        let data = this.parseResult(result);
        if (!data || !data.left_time || data.left_time < 43200) {
            this.WechatAuthorize();
            return;
        }
        this.WeChatJsSDK();
        this.MyScore();
    }
    WeChatJsSDK() {
        HttpUtils.Request(Global.ShareJsSdk + "?url=" + Global.GameUrl, null, this.onWeChatJsSDK.bind(this), "get");
    }
    onWeChatJsSDK(result) {
        try {
            let msg = JSON.parse(result);
            if (msg && msg.appId && msg.timestamp && msg.nonceStr && msg.signature) {
                if (isWinXin()) {
                    wxConfig(msg.appId, msg.timestamp, msg.nonceStr, msg.signature, this, function (data) {
                        if (data > 0) {
                            var logoUrl = Laya.URL.formatURL("res/assets/logo.jpg");
                            wxShare("李婉皮肤共创计划", "《三国杀十周年》创玩节开启，携手百万玩家参与魏阵营武将李婉皮肤设计，超多搭配，丰富竞赛奖励，打造您心中最美武将", Global.GameUrl, logoUrl, this, function (data) {
                                console.log("分享接口回调：" + data);
                            });
                        }
                    });
                }
            }
            else {
                console.log("微信jsSDK接口数据异常：" + result);
            }
        }
        catch (error) {
        }
    }
    MyScore() {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/myScore?token=" + this.token, null, this.onMyScore.bind(this), "get");
    }
    onMyScore(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.score = data.score;
        this.code = data.code;
        this.event(GameManager.SCORE_CHANGE, [this.score]);
        if (!this.myCollocationList) {
            this.myCollocationList = [];
            this.CollocationList(1);
        }
    }
    CollocationList(page) {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/myList?token=" + this.token + "&page=" + page, null, this.onCollocationList.bind(this), "get");
    }
    onCollocationList(result) {
        let data = this.parseResult(result);
        if (!data || !this.myCollocationList)
            return;
        let myList = data.data;
        if (myList && myList.length > 0) {
            myList.forEach(element => {
                if (!this.CheckCollocation(element.skin, element.collocation))
                    element.collocation = null;
                this.myCollocationList.push(element);
            });
        }
        if (data.current_page < data.last_page) {
            this.CollocationList(data.current_page + 1);
        }
        else {
            this.myCollocationList.sort(this.myCollocationListSort);
            let sceneManager = SceneManager.GetInstance();
            if (!sceneManager.CurScene)
                this.event(GameManager.ENTER_GAME);
        }
    }
    CollocationSave(skin, collocation) {
        if (!this.CheckCollocation(skin, collocation, "装扮数据异常，不能保存"))
            return;
        let params = { token: this.token, skin: skin, collocation: collocation };
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/save", JSON.stringify(params), this.onCollocationSave.bind(this), "post", "text", ["Content-Type", "application/json"]);
    }
    onCollocationSave(result) {
        let data = this.parseResult(result);
        if (!data || !data.collocation)
            return;
        let info = data.collocation;
        if (this.myCollocationList) {
            if (!this.CheckCollocation(info.skin, info.collocation))
                info.collocation = null;
            this.myCollocationList.push(info);
            this.myCollocationList.sort(this.myCollocationListSort);
        }
        this.event(GameManager.COLLOCATION_SAVE_SUCC, [info]);
    }
    CollocationJoin(id) {
        let params = { token: this.token, id: id };
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/join", JSON.stringify(params), this.onCollocationJoin.bind(this, id), "post", "text", ["Content-Type", "application/json"]);
    }
    onCollocationJoin(id, result) {
        let data = this.parseResult(result);
        if (!data || !data.code)
            return;
        this.code = data.code;
        if (this.myCollocationList) {
            for (let i = 0; i < this.myCollocationList.length; i++) {
                if (this.myCollocationList[i].id == id) {
                    this.myCollocationList[i].is_join = 1;
                    break;
                }
            }
            this.myCollocationList.sort(this.myCollocationListSort);
        }
        this.event(GameManager.COLLOCATION_JOIN_SUCC);
    }
    CollocationRank() {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rank?token=" + this.token, null, this.onCollocationRank.bind(this), "get");
    }
    onCollocationRank(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.event(GameManager.COLLOCATION_RANK, [data]);
    }
    CollocationRankSearch(code) {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rank?token=" + this.token + "&code=" + code, null, this.onCollocationRankSearch.bind(this), "get");
    }
    onCollocationRankSearch(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.event(GameManager.COLLOCATION_RANK_SEARCH, [data]);
    }
    CollocationVote(code) {
        let params = { token: this.token, code: code };
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/vote", JSON.stringify(params), this.onCollocationVote.bind(this, code), "post", "text", ["Content-Type", "application/json"]);
    }
    onCollocationVote(code, result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.event(GameManager.COLLOCATION_VOTE_SUCC, [code]);
        this.MyScore();
    }
    CollocationShare() {
        let todayShareAddScore = false;
        if (this.shareSuccDate) {
            let curDate = new Date();
            todayShareAddScore = this.shareSuccDate.getFullYear() == curDate.getFullYear() && this.shareSuccDate.getMonth() == curDate.getMonth() &&
                this.shareSuccDate.getDate() == curDate.getDate() ? true : false;
        }
        if (!todayShareAddScore)
            HttpUtils.Request(Global.ServerUrl + "/api/collocation/share?token=" + this.token, null, this.onCollocationShare.bind(this), "get");
    }
    onCollocationShare(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.shareSuccDate = new Date();
        this.MyScore();
    }
    CollocationRankInfo(code) {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rankInfo?token=" + this.token + "&code=" + code, null, this.onCollocationRankInfo.bind(this), "get");
    }
    onCollocationRankInfo(result) {
        let data = this.parseResult(result);
        if (!data)
            return;
        this.event(GameManager.COLLOCATION_RANK_INFO, [data.collocation]);
    }
    CheckCollocation(skin, collocation, tipMsg = "") {
        let result = true;
        if (!skin || skin < 1 || skin > 3)
            result = false;
        else if (!collocation || collocation.length <= 0)
            result = false;
        else {
            let config = DressConfiger.GetInstance();
            let dressVo;
            let existHairstyle = false;
            let existEye = false;
            let existShoes = false;
            let existSuit = false;
            let existJacket = false;
            let existLowerGarments = false;
            for (let i = 0; i < collocation.length; i++) {
                dressVo = config.GetDressByDressID(collocation[i]);
                if (!dressVo) {
                    result = false;
                    break;
                }
                else if (dressVo.DressType == DressType.DESHairstyle)
                    existHairstyle = true;
                else if (dressVo.DressType == DressType.DESEye)
                    existEye = true;
                else if (dressVo.DressType == DressType.DESShoes)
                    existShoes = true;
                else if (dressVo.DressType == DressType.DESSuit)
                    existSuit = true;
                else if (dressVo.DressType == DressType.DESJacket)
                    existJacket = true;
                else if (dressVo.DressType == DressType.DESLowerGarments)
                    existLowerGarments = true;
            }
            if (result) {
                if (!existHairstyle || !existEye || !existShoes)
                    result = false;
                else {
                    if (existSuit) {
                        if (existJacket || existLowerGarments)
                            result = false;
                    }
                    else {
                        if (!existJacket || !existLowerGarments)
                            result = false;
                    }
                }
            }
        }
        if (!result && tipMsg)
            UIUtils.ShowTextPrompt(tipMsg);
        return result;
    }
    myCollocationListSort(a, b) {
        if (a.is_join)
            return -1;
        if (b.is_join)
            return 1;
        return a.number - b.number;
    }
    parseResult(result) {
        try {
            let msg = JSON.parse(result);
            if (msg) {
                if (msg.code) {
                    if (msg.code == 401) {
                        this.WechatAuthorize();
                    }
                    else {
                        let errorMsg = msg.msg ? msg.msg : "请求错误";
                        UIUtils.ShowTextPrompt(errorMsg);
                    }
                    return null;
                }
                else {
                    return msg.data;
                }
            }
        }
        catch (error) {
            return null;
        }
    }
}
GameManager.ENTER_GAME = "ENTER_GAME";
GameManager.SCORE_CHANGE = "SCORE_CHANGE";
GameManager.COLLOCATION_SAVE_SUCC = "COLLOCATION_SAVE_SUCC";
GameManager.COLLOCATION_JOIN_SUCC = "COLLOCATION_JOIN_SUCC";
GameManager.COLLOCATION_RANK = "COLLOCATION_RANK";
GameManager.COLLOCATION_RANK_SEARCH = "COLLOCATION_RANK_SEARCH";
GameManager.COLLOCATION_VOTE_SUCC = "COLLOCATION_VOTE_SUCC";
GameManager.COLLOCATION_RANK_INFO = "COLLOCATION_RANK_INFO";
GameManager.BACK_RANK_CHANGE = "BACK_RANK_CHANGE";

//import Dictionary from "../../utils/Dictionary";
//import RegClass from "../../RegClass";
//import SceneManager from "./SceneManager";
class WindowManager {
    constructor() {
        this.windowDic = new Dictionary();
        this.windowLayerDic = new Dictionary();
        this.hideViewWinDic = new Dictionary();
    }
    static GetInstance() {
        if (null == WindowManager.instance) {
            WindowManager.instance = new WindowManager();
        }
        return WindowManager.instance;
    }
    OpenWindow(winName, ...args) {
        let result = this.windowDic.getStringKey(winName);
        if (!result) {
            result = RegClass.GetInstanceClass(winName);
            if (result) {
                result.name = winName;
                this.AddKey(winName, result);
                result.Open(...args);
            }
            else {
                console.log(winName + '弹窗未找到');
                return null;
            }
        }
        else {
            if (result.Loading) {
                result["windowData"] = args;
                return;
            }
            if (result.parent) {
                result.Close(true);
                this.OpenWindow(winName, ...args);
            }
            else {
                result.ResetOpen(args);
            }
        }
        return result;
    }
    CloseWindow(win, ignoreCloseAnimate = false) {
        let result = this.windowDic.getStringKey(win);
        if (result && result.parent) {
            result.Close(ignoreCloseAnimate);
        }
    }
    ShowWindow(win) {
        let result = this.windowDic.getStringKey(win);
        if (result && (!result.parent || result.Closeing)) {
            result.Show();
        }
    }
    HideWindow(win) {
        let result = this.windowDic.getStringKey(win);
        if (result && result.parent) {
            result.Hide();
        }
    }
    GetWindow(win) {
        let result = this.windowDic.getStringKey(win);
        return result ? result : null;
    }
    hasWindow(win) {
        return this.windowDic.has(win);
    }
    IsShowWindow(win) {
        let result = this.windowDic.getStringKey(win);
        if (result && result.parent)
            return true;
        return false;
    }
    CloseAllWindow(force = false, ignoreCloseAnimate = false) {
        this.windowDic.forEach((key, win) => {
            if (win && win.parent && (force || win.CanAutoClose))
                win.Close(ignoreCloseAnimate);
        });
    }
    CloseAllWindowWithouts(excludeWins, force = false, ignoreCloseAnimate = false) {
        this.windowDic.forEach((key, win) => {
            if (win && win.parent && (force || win.CanAutoClose) && excludeWins.indexOf(win.name) == -1)
                win.Close(ignoreCloseAnimate);
        });
    }
    AddRecoverTemplet(winName, url) {
        let win = this.windowDic.getStringKey(winName);
        if (win)
            win.AddRecoverTemplet(url);
    }
    AddRecoverEffectPool(winName, poolSign) {
        let win = this.windowDic.getStringKey(winName);
        if (win)
            win.AddRecoverEffectPool(poolSign);
    }
    UpdateHideView(targetWin, isOpen) {
        this.windowLayerDic.destroy();
        this.hideViewWinDic.destroy();
        let parentZOrder = 0;
        let winIndex = -1;
        this.windowDic.forEach((key, win) => {
            if (win && win.parent) {
                parentZOrder = win.parent.zOrder;
                if (!this.windowLayerDic.has(parentZOrder))
                    this.windowLayerDic.addNumberKey(parentZOrder, [win]);
                else
                    this.windowLayerDic.getNumberKey(parentZOrder).push(win);
                if (win.HideOtherView && !win.Closeing) {
                    winIndex = win.parent.getChildIndex(win);
                    if (!this.hideViewWinDic.has(parentZOrder))
                        this.hideViewWinDic.addNumberKey(parentZOrder, winIndex);
                    else
                        this.hideViewWinDic.addNumberKey(parentZOrder, Math.max(winIndex, this.hideViewWinDic.getNumberKey(parentZOrder)));
                }
            }
        });
        let curScnen = SceneManager.GetInstance().CurScene;
        if (this.hideViewWinDic.count > 0) {
            let wins;
            this.hideViewWinDic.forEach((parentZOrder, winIndex) => {
                wins = this.windowLayerDic.getNumberKey(parentZOrder);
                if (wins && wins.length > 0) {
                    wins.forEach(element => {
                        if (winIndex > element.parent.getChildIndex(element))
                            element.visible = false;
                        else
                            element.visible = true;
                    });
                }
            });
            if (curScnen)
                curScnen.visible = false;
        }
        else {
            this.windowDic.forEach((key, win) => {
                if (win)
                    win.visible = true;
            });
            if (curScnen)
                curScnen.visible = true;
        }
        this.windowLayerDic.destroy();
        this.hideViewWinDic.destroy();
    }
    AddKey(win, window) {
        if (window && !window.destroyed)
            this.windowDic.addStringKey(win, window);
    }
    DeleteKey(win) {
        if (this.windowDic.has(win))
            this.windowDic.del(win);
    }
}

//import DateUtils from "../../utils/DateUtils";
class TimerManager extends Laya.EventDispatcher {
    constructor() {
        super();
        this.isFirstSystemTime = true;
        this.gameTimeSecond = 0;
        this.serverTime = 0;
        this.getServerTime = 0;
        this.timer = new Laya.Timer();
    }
    static GetInstance() {
        if (null == TimerManager.instance) {
            TimerManager.instance = new TimerManager();
        }
        return TimerManager.instance;
    }
    Start() {
    }
    InitHeartBeart() {
    }
    get GameTimeSecond() {
        return this.gameTimeSecond;
    }
    get ServerTime() {
        let afterTime = this.gameTimeSecond - this.getServerTime;
        if (afterTime < 0)
            afterTime = 0;
        return this.serverTime + afterTime;
    }
    get ServerDate() {
        return new Date(this.ServerTime * 1000);
    }
    get ServerUTC8Date() {
        let d = new Date(this.ServerTime * 1000);
        let localTime = d.getTime();
        let localOffset = d.getTimezoneOffset() * 60000;
        let utc = localTime + localOffset;
        let offset = 8;
        let localSecondTime = utc + (3600000 * offset);
        return new Date(localSecondTime);
    }
    GetUTC8Date(second) {
        let d = new Date(second * 1000);
        let localTime = d.getTime();
        let localOffset = d.getTimezoneOffset() * 60000;
        let utc = localTime + localOffset;
        let offset = 8;
        let localSecondTime = utc + (3600000 * offset);
        return new Date(localSecondTime);
    }
    LogServerTime() {
        let d = new Date(this.ServerTime * 1000);
        console.log("服务器时间：" + DateUtils.DateFormat(d, "yyyy-MM-dd hh:mm:ss"));
    }
}
TimerManager.SecondChanged = "second";
TimerManager.TIMER_ZERO = "TIMER_ZERO";
TimerManager.HEARTBEAT_DISTANCE = 30;
TimerManager.MINUTE_DISTANCE = 60;

//import SceneManager from "./SceneManager";
//import Dictionary from "../../utils/Dictionary";
//import RES from "../../res/RES";
//import ResourceEvent from "../../res/ResourceEvent";
class SilenceResManager {
    constructor() {
        this.silenceResDic = new Dictionary();
    }
    static GetInstance() {
        if (null == SilenceResManager.instance) {
            SilenceResManager.instance = new SilenceResManager();
        }
        return SilenceResManager.instance;
    }
    LoadSilenceRes(resArr) {
        if (!resArr || resArr.length <= 0)
            return;
        this.StopSilenceRes();
        let length = resArr.length;
        let groupName = "";
        let groupList;
        let resItem;
        let groups;
        for (let i = 0; i < length; i++) {
            groupName = resArr[i];
            groupList = RES.GetGroupByName(groupName);
            groupName = groupName + "_silence";
            if (groupList && groupList.length) {
                if (this.silenceResDic.has(groupName))
                    groups = this.silenceResDic.getStringKey(groupName);
                else
                    groups = new Array();
                let len = groupList.length;
                for (let j = 0; j < len; j++) {
                    resItem = groupList[j];
                    if (!RES.IsResLoadedLocal(resItem.url))
                        groups.push(resItem);
                }
                if (groups && groups.length)
                    this.silenceResDic.addStringKey(groupName, groups);
            }
        }
        if (this.silenceResDic.count) {
            this.addResEvent();
            let priority = this.silenceResDic.count - 1;
            this.silenceResDic.forEach((groupName, groups) => {
                RES.DelGroupKeys(groupName);
                let keys = [];
                for (let i = 0; i < groups.length; i++) {
                    keys.push(groups[i].name);
                }
                RES.CreateGroup(groupName, keys);
                RES.LoadSilenceGroup(groupName, [...groups], priority);
                priority--;
            });
        }
    }
    StopSilenceRes() {
        if (this.silenceResDic.count <= 0)
            return;
        let isStop = false;
        this.silenceResDic.forEach((groupName, groups) => {
            isStop = RES.StopGroup(groupName);
            if (!isStop)
                this.clearSilenceRes(groupName);
        });
        this.loadSilenceEnd();
    }
    PauseSilenceRes() {
        if (this.silenceResDic.count <= 0)
            return;
        let isStop = false;
        this.silenceResDic.forEach((groupName, groups) => {
            isStop = RES.StopGroup(groupName);
            if (!isStop)
                this.clearSilenceRes(groupName);
        });
        this.removeResEvent();
    }
    RecoverySilenceRes() {
        if (this.silenceResDic.count <= 0)
            return;
        let groupNames = [];
        let sIndex = -1;
        this.silenceResDic.forEach((groupName, groups) => {
            sIndex = groupName.indexOf("_silence");
            if (sIndex == -1)
                groupNames.push(groupName);
            else
                groupNames.push(groupName.substring(0, sIndex));
        });
        this.removeResEvent();
        this.silenceResDic.destroy();
        if (groupNames && groupNames.length)
            this.LoadSilenceRes(groupNames);
    }
    loadSilenceEnd() {
        this.removeResEvent();
        this.silenceResDic.destroy();
    }
    addResEvent() {
        RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
    }
    removeResEvent() {
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
    }
    onSceneResourceLoadComplete(event) {
        if (this.silenceResDic.has(event.groupName)) {
            this.clearSilenceRes(event.groupName);
            this.silenceResDic.del(event.groupName);
            if (this.silenceResDic.count <= 0) {
                this.loadSilenceEnd();
            }
        }
    }
    onResourceError(event) {
        if (this.silenceResDic.has(event.groupName)) {
            this.clearSilenceRes(event.groupName);
            this.silenceResDic.del(event.groupName);
            if (this.silenceResDic.count <= 0) {
                this.loadSilenceEnd();
            }
        }
    }
    clearSilenceRes(groupName) {
        let groupList = this.silenceResDic.getStringKey(groupName);
        RES.ClearSilenceResByGroup(groupName, groupList, false, true);
        RES.DelGroupKeys(groupName);
    }
    isClearSilenceRes(groupName) {
        let curScene = SceneManager.GetInstance().CurScene;
        let nextScene = SceneManager.GetInstance().NextScene;
        let curResNames = curScene ? curScene.ResNames : null;
        let nextResNames = nextScene ? nextScene.ResNames : null;
        if ((!curResNames || curResNames.indexOf(groupName) == -1) && (!nextResNames || nextResNames.indexOf(groupName) == -1))
            return true;
        return false;
    }
}

//import StorageUtils from "../../utils/StorageUtils";
class SgsSoundManager {
    constructor() {
        this.IsBgmStop = false;
        this.IsBgmStop = StorageUtils.getBoolean("isBgmStop");
    }
    static GetInstance() {
        if (SgsSoundManager.instance == null)
            SgsSoundManager.instance = new SgsSoundManager();
        return SgsSoundManager.instance;
    }
    static get LayaBgMusic() {
        return Laya.SoundManager["_bgMusic"];
    }
    PlayBgm() {
        Laya.SoundManager.playMusic("res/assets/runtime/voice/bgm.mp3");
    }
    StopBgm() {
        this.IsBgmStop = true;
        StorageUtils.addBoolean("isBgmStop", this.IsBgmStop);
        Laya.SoundManager.stopMusic();
    }
    ChangeBgmState() {
        this.IsBgmStop = !this.IsBgmStop;
        if (!this.IsBgmStop)
            Laya.SoundManager.playMusic("res/assets/runtime/voice/bgm.mp3");
        else
            Laya.SoundManager.stopMusic();
        StorageUtils.addBoolean("isBgmStop", this.IsBgmStop);
    }
    static PlaySound(url, loops, completeHander) {
        return Laya.SoundManager.playSound(url, loops, completeHander);
    }
    static StopSound(url) {
        Laya.SoundManager.stopSound(url);
    }
}

//import LoadingManager from "./LoadingManager";
//import SilenceResManager from "./SilenceResManager";
//import RegClass from "../../RegClass";
//import RES from "../../res/RES";
//import ResourceEvent from "../../res/ResourceEvent";
//import SceneLayer from "../../ui/layer/SceneLayer";
//import SceneBase from "../../ui/base/SceneBase";
class SceneManager {
    constructor() {
        this.previousSceneName = "";
        this.totalCount = 0;
        this.loadedCount = 0;
    }
    static GetInstance() {
        if (null == SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }
    EnterScene(sceneName, data = null, createAgain = false, complete = null) {
        if (this.lastScene && this.lastScene.SceneName == sceneName && !createAgain) {
            this.lastScene.ResetScene(data);
            return;
        }
        let scene = RegClass.GetInstanceClass(sceneName);
        if (!scene) {
            console.log(sceneName + '场景未找到');
            return;
        }
        scene.SceneName = sceneName;
        scene.SceneData = data;
        scene.EnterComplete = complete;
        this.nextScene = scene;
        if (this.lastScene) {
            SilenceResManager.GetInstance().StopSilenceRes();
            this.lastScene.mouseEnabled = false;
        }
        this.loadSceneResourceGroup(scene.ResNames);
    }
    get CurScene() {
        return this.lastScene;
    }
    get NextScene() {
        return this.nextScene;
    }
    get PreviousSceneName() {
        return this.previousSceneName;
    }
    CheckSceneName(sceneName) {
        return this.lastScene && this.lastScene.SceneName == sceneName;
    }
    get IsGameScene() {
        return false;
    }
    AddRecoverTemplet(url) {
        if (this.lastScene)
            this.lastScene.AddRecoverTemplet(url);
    }
    AddRecoverEffectPool(poolSign) {
        if (this.lastScene)
            this.lastScene.AddRecoverEffectPool(poolSign);
    }
    loadSceneResourceGroup(resNames) {
        if (!resNames || resNames.length <= 0) {
            this.enterNextScene();
            return;
        }
        LoadingManager.ShowLoading();
        this.addResEvent();
        this.totalCount = resNames.length;
        this.loadedCount = 0;
        let priority = 1000 + resNames.length - 1;
        for (let i = 0; i < resNames.length; i++) {
            RES.LoadGroup(resNames[i], priority);
            priority--;
        }
    }
    addResEvent() {
        RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
    }
    removeResEvent() {
        RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
        this.totalCount = 0;
        this.loadedCount = 0;
    }
    onResourceProgress(event) {
        if (!this.nextScene)
            return;
        if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0) {
            let progress = event.progress;
            progress = this.loadedCount / this.totalCount + progress * (1 / this.totalCount);
            LoadingManager.ShowLoadProgress(progress * 100, 100);
        }
    }
    onResourceError(event) {
        if (!this.nextScene)
            return;
        if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0) {
            if (this.lastScene)
                this.lastScene.mouseEnabled = true;
            this.nextScene.destroy();
            this.removeResEvent();
            LoadingManager.ShowLoadError("资源组加载失败：" + event.groupName, "");
        }
    }
    onSceneResourceLoadComplete(event) {
        if (!this.nextScene)
            return;
        if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0) {
            this.loadedCount++;
            if (this.loadedCount >= this.totalCount) {
                this.removeResEvent();
                this.enterNextScene();
            }
        }
    }
    enterNextScene() {
        LoadingManager.CloseLoading();
        if (this.lastScene) {
            this.lastScene.on(SceneBase.ANIMATE_OUT_COMPLETE, this, this.onSceneAnimateOutComplete);
            this.lastScene.AnimateOut();
        }
        else {
            this.executeSwitchScene(this.nextScene);
        }
    }
    onSceneAnimateOutComplete() {
        this.lastScene.off(SceneBase.ANIMATE_OUT_COMPLETE, this, this.onSceneAnimateOutComplete);
        this.executeSwitchScene(this.nextScene);
    }
    executeSwitchScene(scene) {
        if (!scene)
            return;
        if (this.lastScene)
            this.previousSceneName = this.lastScene.SceneName;
        let tempScene = this.lastScene;
        this.lastScene = scene;
        if (tempScene)
            tempScene.destroy();
        this.lastScene.on(SceneBase.ANIMATE_IN_COMPLETE, this, this.onSceneAnimateInComplete);
        SceneLayer.GetInstance().addChild(this.lastScene);
        if (this.lastScene == this.nextScene)
            this.nextScene = null;
    }
    onSceneAnimateInComplete(scene) {
    }
}

class ManagerBase extends Laya.EventDispatcher {
    constructor() {
        super();
    }
    AddEventListener() {
    }
    RemoveEventListener() {
    }
    destroy() {
        this.RemoveEventListener();
        this.offAll();
    }
    ClearData() {
    }
}

//import LoadingUI from "../../ui/loading/LoadingUI";
//import TopUILayer from "../../ui/layer/TopUILayer";
class LoadingManager {
    constructor() {
    }
    static ShowLoading(delay = 1000) {
        if (!this.loadingUI)
            this.loadingUI = new LoadingUI();
        this.loadingUI.Show(delay);
        if (!this.loadingUI.parent)
            TopUILayer.GetInstance().addChild(this.loadingUI);
    }
    static ShowLoadProgress(curValue, maxValue) {
        if (this.loadingUI)
            this.loadingUI.ShowProgress(curValue, maxValue);
    }
    static ShowLoadError(errorMsg, winName = "") {
        if (this.loadingUI)
            this.loadingUI.ShowError(errorMsg, winName);
    }
    static CloseLoading() {
        if (this.loadingUI)
            this.loadingUI.Hide();
    }
}

//import SgsTemplet from "../../ui/controls/base/SgsTemplet";
//import Dictionary from "../../utils/Dictionary";
class AnimateManager extends Laya.EventDispatcher {
    constructor() {
        super();
        this.waitClearAnimateDic = {};
        this.clearAnimateIng = false;
        this.animateDic = new Dictionary();
        this.animateContainerDic = new Dictionary();
        this.referenceDic = {};
    }
    static GetInstane() {
        if (!this.instance)
            this.instance = new AnimateManager();
        return this.instance;
    }
    LoadAnimate(url, parent) {
        if (!url)
            return;
        let temp = this.animateDic.getStringKey(url);
        if (temp) {
            if (!temp.isParserComplete) { }
            else if (!temp.checkTempletRes()) {
                this.destroyAnimate(url, true);
                temp = null;
            }
            else {
                if (parent)
                    parent.event(AnimateManager.ANIMATE_LOAD_COMPLETE, temp);
                this.event(AnimateManager.ANIMATE_LOAD_COMPLETE, temp);
                return;
            }
        }
        if (!temp) {
            temp = new SgsTemplet();
            temp.name = url;
            temp.on(Laya.Event.COMPLETE, this, this.onSpineResComplete);
            temp.on(Laya.Event.ERROR, this, this.onSpineResError, [temp]);
            temp.loadAni(url);
            this.animateDic.addStringKey(url, temp);
        }
        if (parent) {
            let arr = this.animateContainerDic.get(temp);
            if (!arr)
                this.animateContainerDic.add(temp, [parent]);
            else if (arr.indexOf(parent) < 0)
                arr.push(parent);
        }
    }
    DestroyAnimate(url) {
        this.destroyAnimate(url);
    }
    HasTemplet(url) {
        let temp = this.animateDic.getStringKey(url);
        return temp && temp.isParserComplete ? true : false;
    }
    GetTemplet(url) {
        let temp = this.animateDic.getStringKey(url);
        return temp ? temp : null;
    }
    HasTempletRes(url) {
        if (!this.animateDic || this.animateDic.count <= 0)
            return false;
        let result = false;
        this.animateDic.breakForEach((skUrl, element) => {
            if (url == skUrl || element.hasTempletRes(url)) {
                result = true;
                return true;
            }
        });
        return result;
    }
    get AnimateDic() {
        return this.animateDic;
    }
    get AnimateList() {
        if (!this.animateDic || this.animateDic.count <= 0)
            return null;
        let result = [];
        this.animateDic.forEach((key, element) => {
            result.push(key);
        });
        return result;
    }
    onSpineResError(data) {
        if (!data)
            return;
        data.off(Laya.Event.ERROR, this, this.onSpineResError);
        data.off(Laya.Event.COMPLETE, this, this.onSpineResComplete);
        let arr = this.animateContainerDic.get(data);
        if (arr) {
            arr.forEach(sp => {
                if (sp && !sp.destroyed)
                    sp.event(AnimateManager.ANIMATE_LOAD_COMPLETE, data.name);
            });
            this.animateContainerDic.del(data);
        }
        this.event(AnimateManager.ANIMATE_LOAD_COMPLETE, data.name);
        this.ClearAllReferenceByUrl(data.name);
        this.destroyAnimate(data.name);
    }
    onSpineResComplete(data) {
        if (!data)
            return;
        data.off(Laya.Event.ERROR, this, this.onSpineResError);
        data.off(Laya.Event.COMPLETE, this, this.onSpineResComplete);
        let arr = this.animateContainerDic.get(data);
        if (arr) {
            arr.forEach(sp => {
                if (sp && !sp.destroyed)
                    sp.event(AnimateManager.ANIMATE_LOAD_COMPLETE, data);
            });
            this.animateContainerDic.del(data);
        }
        this.event(AnimateManager.ANIMATE_LOAD_COMPLETE, data);
    }
    AddReference(url) {
        if (!url || url.length <= 0)
            return;
        let reference = 1;
        if (this.referenceDic[url]) {
            reference = this.referenceDic[url];
            reference++;
        }
        this.referenceDic[url] = reference;
    }
    DelReference(url) {
        if (!url || url.length <= 0)
            return;
        if (this.referenceDic[url]) {
            let reference = this.referenceDic[url];
            if (reference <= 1)
                delete this.referenceDic[url];
            else
                this.referenceDic[url] = reference - 1;
        }
    }
    ClearAllReferenceByUrl(url) {
        if (!url || url.length <= 0)
            return;
        if (this.referenceDic[url])
            delete this.referenceDic[url];
    }
    GetReference(url) {
        if (!url || url.length <= 0)
            return 0;
        if (this.referenceDic[url])
            return this.referenceDic[url];
        return 0;
    }
    delayClearAnimate(url) {
        if (!url || url.length <= 0 || this.GetReference(url) > 0)
            return;
        this.waitClearAnimateDic[url] = Laya.Browser.now();
        if (!this.clearAnimateIng) {
            this.clearAnimateIng = true;
            Laya.timer.once(5000, this, this.onClearAnimate);
        }
    }
    onClearAnimate() {
        this.onLoopClearAnimate(false);
    }
    onLoopClearAnimate(isFrameLoop) {
        let frameTm = Laya.stage.getFrameTm();
        let curTime = 0;
        let isAllClear = true;
        let url = "";
        let templet;
        let containerArr;
        for (url in this.waitClearAnimateDic) {
            curTime = Laya.Browser.now();
            if (curTime - this.waitClearAnimateDic[url] < 5000) {
                isAllClear = false;
                continue;
            }
            else if (curTime - frameTm > 20) {
                isAllClear = false;
                break;
            }
            else {
                delete this.waitClearAnimateDic[url];
                if (this.GetReference(url) <= 0) {
                    templet = this.animateDic.getStringKey(url);
                    if (templet) {
                        containerArr = this.animateContainerDic.get(templet);
                        if (containerArr)
                            containerArr.splice(0);
                        templet.off(Laya.Event.ERROR, this, this.onSpineResError);
                        templet.off(Laya.Event.COMPLETE, this, this.onSpineResComplete);
                        templet.destroy();
                        this.animateDic.del(url);
                        this.animateContainerDic.del(templet);
                    }
                }
            }
        }
        if (isAllClear) {
            Laya.timer.clear(this, this.onLoopClearAnimate);
            this.clearAnimateIng = false;
        }
        else {
            if (!isFrameLoop)
                Laya.timer.frameLoop(5, this, this.onLoopClearAnimate, [true]);
        }
    }
    destroyAnimate(url, force = false) {
        if (!url || url.length <= 0 || (!force && this.GetReference(url) > 0))
            return;
        let templet = this.animateDic.getStringKey(url);
        if (templet && !templet.destroyed) {
            let containerArr = this.animateContainerDic.get(templet);
            if (containerArr)
                containerArr.splice(0);
            templet.off(Laya.Event.ERROR, this, this.onSpineResError);
            templet.off(Laya.Event.COMPLETE, this, this.onSpineResComplete);
            templet.destroy();
            this.animateDic.del(url);
            this.animateContainerDic.del(templet);
        }
    }
}
AnimateManager.ANIMATE_LOAD_COMPLETE = "ANIMATE_LOAD_COMPLETE";
AnimateManager.ANIMATE_ARR_LOAD_COMPLETE = "ANIMATE_ARR_LOAD_COMPLETE";

//import AnimateManager from "./mode/base/AnimateManager";
//import ObjUtil from "./utils/ObjUtil";
class Global {
    static Init(data) {
        if (data)
            ObjUtil.copyObj(data, this);
    }
    static get GameUrl() {
        return Laya.Browser.window.gameUrl;
    }
    static get AppID() {
        return Laya.Browser.window.appid;
    }
    static DownLoadGame() {
        window.open(Global.GameDownLoadUrl);
    }
    static logRes() {
        let atlasMap = Laya.Loader["atlasMap"];
        let logAtlas = [];
        if (atlasMap) {
            for (let key in atlasMap) {
                logAtlas.push(key);
            }
        }
        let loadedMap = Laya.Loader.loadedMap;
        let others = [];
        let spines = [];
        if (loadedMap) {
            let destroyed = false;
            let suffixIndex = -1;
            let skUrl = "";
            let skelUrl = "";
            let loadedItem;
            for (let key in loadedMap) {
                loadedItem = loadedMap[key];
                if (loadedItem == undefined)
                    continue;
                if (logAtlas.indexOf(key) >= 0)
                    continue;
                if (key.lastIndexOf(".mp3") >= 0)
                    continue;
                if (key.lastIndexOf(".ttf") >= 0)
                    continue;
                if (key.lastIndexOf(".sk") >= 0 || key.lastIndexOf(".skel") >= 0) {
                    spines.push(key);
                    continue;
                }
                destroyed = false;
                if (loadedItem instanceof Laya.Texture2D) {
                    destroyed = loadedItem.destroyed;
                    suffixIndex = key.lastIndexOf(".");
                    skUrl = key.substring(0, suffixIndex) + '.sk';
                    if (loadedMap[skUrl])
                        continue;
                    else {
                        skelUrl = key.substring(0, suffixIndex) + '.skel';
                        if (loadedMap[skelUrl])
                            continue;
                    }
                }
                else if (key.lastIndexOf(".atlas") >= 0 && typeof (loadedItem) == "string") {
                    suffixIndex = key.lastIndexOf(".");
                    skelUrl = key.substring(0, suffixIndex) + '.skel';
                    if (loadedMap[skelUrl])
                        continue;
                }
                others.push({ url: key, destroyed: destroyed });
            }
        }
        let dic = AnimateManager.GetInstane().AnimateDic;
        let templets = [];
        if (dic) {
            dic.forEach((url, templet) => {
                templets.push(url);
            });
        }
        console.warn("图集：");
        console.warn({ logAtlas: logAtlas });
        console.warn("spine资源：");
        console.warn({ spines: spines });
        console.warn("AnimateManager中spine数据模板：");
        console.warn({ templets: templets });
        console.warn("其他资源：");
        console.warn({ others: others });
    }
}
Global.LongClickTime = 750;
Global.OperationFastTime = 2000;
Global.BgWidth = 750;
Global.BgHeight = 1496;
Global.ModelWidth = 548;
Global.ModelHeight = 940;
Global.ModelOffsetX = 306 - 242 >> 1;
Global.IsDebug = true;
Global.AutoClearRes = true;
Global.ServerUrl = "";
Global.ShareJsSdk = "";
Global.GameDownLoadUrl = "";
Global.CollocationMax = 0;

class TipsEvent {
    constructor() {
        this.follow = false;
    }
    initData(target, follow) {
        this.target = target;
        this.follow = follow;
    }
    clear() {
        this.target = null;
        this.follow = false;
    }
    recover() {
        this.clear();
        if (TipsEvent.pool.indexOf(this) == -1)
            TipsEvent.pool.push(this);
    }
    static create(target, follow = false) {
        let event;
        if (TipsEvent.pool.length)
            event = TipsEvent.pool.pop();
        else
            event = new TipsEvent();
        event.initData(target, follow);
        return event;
    }
}
TipsEvent.TIPS_OVER_EVENT = "TIPS_OVER_EVENT";
TipsEvent.TIPS_OUT_EVENT = "TIPS_OUT_EVENT";
TipsEvent.TIPS_SIZE_CHNAGED_EVENT = "TIPS_SIZE_CHNAGED_EVENT";
TipsEvent.pool = [];

class GameEventDispatcher extends Laya.EventDispatcher {
    constructor() {
        super();
    }
    static GetInstance() {
        if (null == GameEventDispatcher.instance) {
            GameEventDispatcher.instance = new GameEventDispatcher();
        }
        return GameEventDispatcher.instance;
    }
}
GameEventDispatcher.DIANJIANG_INFO_CHANGE_EVENT = "DIANJIANG_INFO_CHANGE_EVENT";
GameEventDispatcher.GAME_ADAPTATION = "GAME_ADAPTATION";
GameEventDispatcher.STAGE_FOCUS = "STAGE_FOCUS";
GameEventDispatcher.STAGE_BLUR = "STAGE_BLUR";
GameEventDispatcher.STAGE_VISIBILITY = "STAGE_VISIBILITY";
GameEventDispatcher.WINDOW_CLOSED = "windowClosed";
GameEventDispatcher.AIHELP = "AIHELP";
GameEventDispatcher.AIHELP_POPUP_WIN = "AIHELP_POPUP_WIN";
GameEventDispatcher.PREVENT_ADDICTION = "PREVENT_ADDICTION";
GameEventDispatcher.GAME_AUDIO_CHANGE = "GAME_AUDIO_CHANGE";
GameEventDispatcher.GAME_QR_BUY_COMMPLETE = "GAME_QR_BUY_COMMPLETE";
GameEventDispatcher.ACTIVITY_SWITCH_TAB = "ACTIVITY_SWITCH_TAB";
GameEventDispatcher.GAME_GENERAL_INFO_SELECT_SKIN = "GAME_GENERAL_INFO_SELECT_SKIN";
GameEventDispatcher.GAME_GENERAL_PLAY_SKILL_SOUND = "GAME_GENERAL_PLAY_SKILL_SOUND";
GameEventDispatcher.CARD_AVATAR_SKILL_CHANGE = "CARD_AVATAR_SKILL_CHANGE";
GameEventDispatcher.SKILL_STATE_DATA_CHANGE = "CARD_LABLE_STATE_CHANGE";
GameEventDispatcher.SHARE_SUCCESS = "SHARE_SUCCESS";
GameEventDispatcher.UPDATE_GAME_ROUND_RECORD = "UPDATE_GAME_ROUND_RECORD";
GameEventDispatcher.OPEN_GAME_ROUND_RECORD = "OPEN_GAME_ROUND_RECORD";
GameEventDispatcher.CARD_UNLOCK_WINDOW_CLOSED = "CARD_UNLOCK_WINDOW_CLOSED";
GameEventDispatcher.ENTER_ROUND = "ENTER_ROUND";
GameEventDispatcher.UPDATE_BROADCAST_STATE = "UPDATE_BROADCAST_STATE";

class EventExpand {
    constructor() {
    }
}
EventExpand.LONG_DOWN = "longDown";

class FontName {
}
FontName.WRYH = "微软雅黑";
FontName.HEITI = "黑体";
FontName.ST = "siyuan";
FontName.LISHU = "隶书";

class DressType {
    static GetDressTypeName(dressType) {
        return dressType >= 0 && dressType < this.typeNames.length ? this.typeNames[dressType] : "";
    }
    static GetDressTypeSort(dressType) {
        return dressType >= 0 && dressType < this.typeSorts.length ? this.typeSorts[dressType] : 0;
    }
}
DressType.DESDefault = 0;
DressType.DESSuit = 1;
DressType.DESHairstyle = 2;
DressType.DESEye = 3;
DressType.DESJacket = 4;
DressType.DESLowerGarments = 5;
DressType.DESOrnaments = 6;
DressType.DESArms = 7;
DressType.DESShoes = 8;
DressType.typeNames = ["", "套装", "发型", "眼睛", "上衣", "下衣", "饰品", "武器", "鞋子"];
DressType.typeSorts = [0, 1, 2, 3, 4, 5, 6, 7, 8];

class LayoutEnum {
}
LayoutEnum.NoneLayout = 0;
LayoutEnum.VerticalLayout = 1;
LayoutEnum.HorizontalLayout = 2;
LayoutEnum.TileLayout = 3;

var LayerOrder;
(function (LayerOrder) {
    LayerOrder[LayerOrder["BottomLayer"] = 0] = "BottomLayer";
    LayerOrder[LayerOrder["BackgroundLayer"] = 1] = "BackgroundLayer";
    LayerOrder[LayerOrder["SceneLayer"] = 2] = "SceneLayer";
    LayerOrder[LayerOrder["WindowLayer"] = 3] = "WindowLayer";
    LayerOrder[LayerOrder["AnimationLayer"] = 4] = "AnimationLayer";
    LayerOrder[LayerOrder["TopUILayer"] = 5] = "TopUILayer";
    LayerOrder[LayerOrder["PromptLayer"] = 6] = "PromptLayer";
})(LayerOrder || (LayerOrder = {}));

class ButtonPhaseEnum {
}
ButtonPhaseEnum.up = 0;
ButtonPhaseEnum.over = 1;
ButtonPhaseEnum.down = 2;

//import RES from "./../res/RES";
//import GameEventDispatcher from "../event/GameEventDispatcher";
//import DressConfiger from "./DressConfiger";
class ConfigerManager {
    constructor() {
        this.preloadConfigerList = [
            DressConfiger.GetInstance()
        ];
        this.configLen = 0;
        this.parseIndex = 0;
        this.workerList = [];
    }
    static GetInstance() {
        if (ConfigerManager.instance == null)
            ConfigerManager.instance = new ConfigerManager();
        return ConfigerManager.instance;
    }
    ParsePreloadConfig() {
        if (Laya.Browser.window.useLocalConfig) {
            this.parseConfig();
        }
        else {
            unZip(RES.GetRes("Config_sgs"), this, function (zipFiles) {
                this.zipFiles = zipFiles;
                if (this.zipFiles && this.zipFiles.length) {
                    this.parseConfig();
                }
                else {
                    console.log("解压Config.sgs异常");
                }
            });
        }
    }
    parseConfig() {
        this.configLen = this.preloadConfigerList.length;
        this.parseIndex = 0;
        this.time = Laya.Browser.now();
        console.log("配置解析开始");
        var length = this.configLen = this.preloadConfigerList.length;
        if (Laya.Browser.window.useLocalConfig) {
            for (var i = 0; i < length; i++) {
                let configer = this.preloadConfigerList[i];
                let configerData = RES.GetRes(configer.configName);
                if (configer.promptlyParse) {
                    configer.ParseConfig(configerData ? configerData : null);
                }
                else {
                    configer.data = configerData;
                }
                RES.ClearRes(configer.configName);
            }
            this.preloadConfigParsed();
        }
        else {
            if (!Laya.WorkerLoader.workerSupported) {
                for (var i = 0; i < length; i++) {
                    let configer = this.preloadConfigerList[i];
                    let configerData = RES.GetRes(configer.configName);
                    configer.WorkParse(this.getZipConfigData(configer.configName), null);
                    RES.ClearRes(configer.configName);
                }
                this.preloadConfigParsed();
            }
            else {
                for (let i = 0; i < 3; i++) {
                    let w = new Worker("libs/min/ConfigWorker.min.js?v=2020071301");
                    this.workerList.push(w);
                    this.parseIndex = i;
                    this.parseConfigIndex(i, w);
                }
            }
        }
    }
    parseComplete(worker) {
        this.configLen--;
        if (this.configLen <= 0) {
            this.preloadConfigParsed();
        }
        else {
            this.parseIndex++;
            this.parseConfigIndex(this.parseIndex, worker);
        }
    }
    parseConfigIndex(index, woker) {
        let configer = this.preloadConfigerList[index];
        if (configer) {
            configer.on(ConfigerManager.CONFIG_PARSE_COMPLETE, this, this.parseComplete);
            configer.WorkParse(this.getZipConfigData(configer.configName), woker);
        }
    }
    getZipConfigData(configName) {
        let resItem = RES.GetResourceItem(configName);
        if (resItem && resItem.url) {
            let url = resItem.url;
            let name = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".")) + ".sgs";
            if (this.zipFiles && this.zipFiles.length) {
                let len = this.zipFiles.length;
                for (let i = 0; i < len; i++) {
                    if (this.zipFiles[i].name == name)
                        return this.zipFiles[i].data;
                }
            }
        }
        return null;
    }
    preloadConfigParsed() {
        if (!Laya.Browser.window.useLocalConfig) {
            this.workerList.forEach(w => {
                w.terminate();
            });
            this.preloadConfigerList.forEach(cf => {
                cf.off(ConfigerManager.CONFIG_PARSE_COMPLETE, this, this.parseComplete);
            });
            this.workerList.length = 0;
            RES.ClearRes("Config_sgs");
            this.zipFiles = null;
        }
        GameEventDispatcher.GetInstance().event("PARSE_CONFIGED");
        console.log("配置解析完成时间：" + (Laya.Browser.now() - this.time));
    }
}
ConfigerManager.CONFIG_PARSE_COMPLETE = "CONFIG_PARSE_COMPLETE";

//import Crypt from "../net/Crypt";
//import ByteArray from "./../utils/ByteArray";
//import ConfigerManager from "./ConfigerManager";
class ConfigerBase extends Laya.EventDispatcher {
    constructor(configName) {
        super();
        this.configName = "";
        this.promptlyParse = false;
        this.configName = configName;
    }
    WorkParse(data, worker) {
        if (!data) {
            console.log("配置解析出错：" + this.configName);
        }
        if (data instanceof ArrayBuffer) {
            if (!this.crypt)
                this.crypt = Crypt.GetInstance();
            let baseData = this.crypt.Ofb_Dec(data);
            let inflate = new Zlib.Gunzip(baseData);
            let plain = inflate.decompress();
            if (worker) {
                worker.onmessage = function (e) {
                    if (this.promptlyParse) {
                        this.ParseConfig(e.data);
                    }
                    else {
                        this.data = e.data;
                    }
                    this.event(ConfigerManager.CONFIG_PARSE_COMPLETE, worker);
                }.bind(this);
                worker.postMessage({ name: this.configName, buffer: plain.buffer }, [plain.buffer]);
            }
            else {
                let result = new ByteArray();
                result.endian = Laya.Byte.LITTLE_ENDIAN;
                result.writeArrayBuffer(plain.buffer);
                result.pos = 0;
                let str = result.readUTFBytes(result.length);
                try {
                    data = JSON.parse(str);
                }
                catch (e) {
                    console.log("json解析出错:" + this.configName, e);
                }
                if (this.promptlyParse) {
                    this.ParseConfig(data);
                }
                else {
                    this.data = data;
                }
            }
        }
        else {
            if (this.promptlyParse) {
                this.ParseConfig(data);
            }
            else {
                this.data = data;
            }
        }
        return data;
    }
    parseBuffer(data) {
        if (data instanceof ArrayBuffer) {
            if (!this.crypt)
                this.crypt = Crypt.GetInstance();
            let baseData = this.crypt.Ofb_Dec(data);
            let inflate = new Zlib.Gunzip(baseData);
            let plain = inflate.decompress();
            let result = new ByteArray();
            result.endian = Laya.Byte.LITTLE_ENDIAN;
            result.writeArrayBuffer(plain.buffer);
            result.pos = 0;
            let str = result.readUTFBytes(result.length);
            try {
                data = JSON.parse(str);
            }
            catch (e) {
                console.log("json解析出错:" + this.configName, e);
            }
        }
        return data;
    }
    ParseConfig(data) {
        if (!data) {
            console.log("配置解析出错：" + this.configName);
        }
        this.data = null;
        return data;
    }
    toString() {
        return this.configName;
    }
}

//import SgsHttpRequest from "./SgsHttpRequest";
class SgsUpLoadHttpRequest extends SgsHttpRequest {
    constructor(callback) {
        super(callback);
        this.on(Laya.Event.PROGRESS, this, this.onProgress);
    }
    send(url, data = null, method = "get", responseType = "text", headers = null) {
        super.send(url, data, method, responseType, headers);
    }
    onProgress(num) {
        console.log('上传进度：' + num);
        this.event("onProgress", num);
    }
    removeEvents() {
        super.removeEvents();
        this.offAll(Laya.Event.PROGRESS);
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import FontName from "../../enum/FontName";
//import Global from "../../Global";
//import SceneManager from "../../mode/base/SceneManager";
//import SgsSoundManager from "../../mode/base/SgsSoundManager";
//import WindowManager from "../../mode/base/WindowManager";
//import GameManager from "../../mode/gameManager/GameManager";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import WindowBase from "../base/WindowBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsImage from "../controls/base/SgsImage";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import DressAvatar from "../dressScene/DressAvatar";
//import PromptWindow from "./PromptWindow";
class VoteWorkInfoWindow extends WindowBase {
    constructor() {
        super();
        this.isMyDress = false;
        this.isSelf = false;
        this.code = "";
        this.isVoteSucc = false;
        this.saveTime = 0;
        this.modal = true;
        this.hideOtherView = true;
        this.addDrawClick();
    }
    Open(modelType, dressIDs) {
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames = ["dressPartTemp"];
        super.Open(modelType, dressIDs);
    }
    init() {
        super.init();
        this.bg = new SgsTexture(RES.GetRes("myDressSceneBg_image"));
        this.addDrawChild(this.bg);
        this.backBtn = new SgsFlatButton();
        this.backBtn.pos(0, 36);
        this.backBtn.InitSkin("baseBackBtn");
        this.backBtn.on(Laya.Event.CLICK, this, this.onBackHandler);
        this.addDrawChild(this.backBtn);
        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(552, 36);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK, this, this.onHomeHandler);
        this.addDrawChild(this.homeBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(652, 36);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.addDrawChild(this.soundBtn);
        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK, this, this.onMyDressHandler);
        this.addDrawChild(this.myDressBtn);
        this.shareBtn = new SgsFlatButton();
        this.shareBtn.InitSkin("baseShareBtn1");
        this.shareBtn.on(Laya.Event.CLICK, this, this.onShareHandler);
        this.addDrawChild(this.shareBtn);
        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK, this, this.onRankHandler);
        this.addDrawChild(this.rankBtn);
        this.currencyBg = new SgsTexture(RES.GetRes("baseCurrencyBg"));
        this.currencyBg.pos(439, 75);
        this.addDrawChild(this.currencyBg);
        this.avatarBg = new SgsTexture(RES.GetRes("VoteWorkInfoAvatarBg_image"));
        this.addDrawChild(this.avatarBg);
        this.rankFlag = new SgsTexture(RES.GetRes("myDressRank1"));
        this.rankFlag.visible = false;
        this.addDrawChild(this.rankFlag);
        this.decorateLeft = new SgsTexture(RES.GetRes("myDressDecorateLeft"));
        this.decorateLeft.visible = false;
        this.addDrawChild(this.decorateLeft);
        this.decorateRight = new SgsTexture(RES.GetRes("myDressDecorateRight"));
        this.decorateRight.visible = false;
        this.addDrawChild(this.decorateRight);
        this.voteBtn = new SgsFlatButton();
        this.voteBtn.InitSkin("myDressSelfVoteBtn");
        this.voteBtn.visible = false;
        this.voteBtn.on(Laya.Event.CLICK, this, this.onVoteHandler);
        this.addDrawChild(this.voteBtn);
        this.currencyTitle = new SgsText();
        this.currencyTitle.font = FontName.HEITI;
        this.currencyTitle.color = "#9da093";
        this.currencyTitle.fontSize = 30;
        this.currencyTitle.text = "我的桃气值：";
        this.currencyTitle.pos(this.currencyBg.x - this.currencyTitle.width + 10, this.currencyBg.y + 22);
        this.addDrawChild(this.currencyTitle);
        this.currencyText = new SgsText();
        this.currencyText.pos(this.currencyBg.x, this.currencyBg.y);
        this.currencyText.size(this.currencyBg.width, this.currencyBg.height);
        this.currencyText.font = FontName.HEITI;
        this.currencyText.color = "#ffffff";
        this.currencyText.fontSize = 26;
        this.currencyText.align = "center";
        this.currencyText.valign = "middle";
        this.currencyText.bold = true;
        this.addDrawChild(this.currencyText);
        this.codeTitle = new SgsText();
        this.codeTitle.font = FontName.HEITI;
        this.codeTitle.color = "#CBB07D";
        this.codeTitle.fontSize = 22;
        this.codeTitle.text = "参赛编号：";
        this.addDrawChild(this.codeTitle);
        this.codeText = new SgsText();
        this.codeText.font = FontName.HEITI;
        this.codeText.color = "#C09264";
        this.codeText.fontSize = 26;
        this.codeText.bold = true;
        this.addDrawChild(this.codeText);
        this.taoqiTitle = new SgsText();
        this.taoqiTitle.font = FontName.HEITI;
        this.taoqiTitle.color = "#CBB07D";
        this.taoqiTitle.fontSize = 22;
        this.taoqiTitle.text = "桃气值：";
        this.addDrawChild(this.taoqiTitle);
        this.taoqiText = new SgsText();
        this.taoqiText.font = FontName.HEITI;
        this.taoqiText.color = "#C09264";
        this.taoqiText.fontSize = 26;
        this.taoqiText.bold = true;
        this.addDrawChild(this.taoqiText);
        this.desc = new SgsText();
        this.desc.width = SystemContext.gameWidth - 74 * 2;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#E5A7AE";
        this.desc.fontSize = 24;
        this.desc.leading = 10;
        this.desc.wordWrap = true;
        this.addDrawChild(this.desc);
        this.avatarSp = new Laya.Sprite();
        this.avatarSp.size(404, 618);
        this.avatarSp.scrollRect = new Laya.Rectangle(0, 0, 404, 618);
        this.addChild(this.avatarSp);
        this.avatar = new DressAvatar();
        this.avatar.pos(28, 110);
        this.avatar.scale(0.73, 0.73);
        this.avatarSp.addChild(this.avatar);
        this.voteFlag = new SgsImage();
        this.voteFlag.source = RES.GetRes("myDressSelfWork");
        this.voteFlag.visible = false;
        this.addChild(this.voteFlag);
        this.onStageResize();
    }
    enterWindow(isMyDress, rankInfo = null) {
        super.enterWindow();
        this.isMyDress = isMyDress;
        let manager = GameManager.GetInstance();
        if (isMyDress) {
            this.isSelf = true;
            let info = manager.JoinCollocationInfo;
            if (info)
                this.avatar.UpdateAll(info.skin, info.collocation);
            this.code = manager.Code;
        }
        else if (rankInfo) {
            this.isSelf = rankInfo.is_self ? true : false;
            this.avatar.UpdateAll(rankInfo.skin, rankInfo.collocation);
            this.code = rankInfo.code;
            this.onRankInfo(rankInfo);
        }
        this.voteFlag.visible = this.isSelf;
        this.voteBtn.InitSkin(this.isSelf ? "myDressSelfVoteBtn" : "myDressOtherVoteBtn");
        this.voteBtn.visible = true;
        this.codeText.text = this.code;
        this.updateCurrency();
        manager.on(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.on(GameManager.COLLOCATION_RANK_INFO, this, this.onRankInfo);
        manager.on(GameManager.COLLOCATION_VOTE_SUCC, this, this.onVoteSucc);
        if (isMyDress && this.code)
            manager.CollocationRankInfo(this.code);
        this.layoutChangeUI();
    }
    onScoreChange() {
        this.updateCurrency();
    }
    onRankInfo(data) {
        if (data.code != this.code)
            return;
        this.taoqiText.text = data.score + "";
        this.desc.visible = this.isSelf;
        if (data.rank >= 1 && data.rank <= 3) {
            this.rankFlag.texture = RES.GetRes("myDressRank" + data.rank);
            this.rankFlag.visible = true;
            this.decorateLeft.visible = this.decorateRight.visible = false;
        }
        else {
            this.rankFlag.visible = false;
            this.decorateLeft.visible = this.decorateRight.visible = true;
        }
        if (this.desc.visible) {
            if (!data.rank) {
                this.desc.text = "主人，您的参赛作品-" + data.code + ",暂未上榜 快邀请您的好友，为您助力投票吧~";
            }
            else {
                if (data.rank >= 1 && data.rank <= 99)
                    this.desc.text = "恭喜主人，您的参赛作品-" + data.code + ",目前排名：" + data.rank + "，快邀请您的好友，为您投票助力获得更高的排行吧~";
                else
                    this.desc.text = "主人，您的参赛作品-" + data.code + ",目前排名：" + data.rank + "，暂未上榜 快邀请您的好友，为您助力投票吧~";
            }
        }
        this.layoutChangeUI();
    }
    onVoteSucc(code) {
        if (code != this.code)
            return;
        this.isVoteSucc = true;
        UIUtils.OpenPromptWin("", "*主人，您已成功投出1票哦", 100, Laya.Handler.create(this, this.onConfirmShare), null, PromptWindow.BTN_TYPE3);
        GameManager.GetInstance().CollocationRankInfo(this.code);
    }
    updateCurrency() {
        let score = GameManager.GetInstance().Score;
        this.currencyText.text = score + "";
        this.currencyText.fontSize = score < 100 ? 32 : 26;
    }
    onBackHandler() {
        if (!this.isMyDress && this.isVoteSucc) {
            GameManager.GetInstance().event(GameManager.BACK_RANK_CHANGE);
        }
        this.Close();
    }
    onHomeHandler() {
        this.Close();
        SceneManager.GetInstance().EnterScene("HomeScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onMyDressHandler() {
        this.Close();
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }
    onShareHandler() {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }
    onRankHandler() {
        if (!this.isMyDress && this.isVoteSucc) {
            GameManager.GetInstance().event(GameManager.BACK_RANK_CHANGE);
        }
        this.Close();
        SceneManager.GetInstance().EnterScene("RankScene");
    }
    onVoteHandler() {
        let manager = GameManager.GetInstance();
        if (manager.Score <= 0)
            UIUtils.OpenPromptWin("", "*主人，您的桃气值不足；可以通过每日登录或者分享获取桃气值哦！", 100, Laya.Handler.create(this, this.onConfirmShare), null, PromptWindow.BTN_TYPE3);
        else {
            let curTime = Laya.Browser.now();
            if (curTime - this.saveTime < Global.OperationFastTime)
                return;
            this.saveTime = curTime;
            manager.CollocationVote(this.code);
        }
    }
    onConfirmShare() {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }
    layoutCodeAnyTaoQi() {
        this.codeTitle.pos(this.avatarBg.x + 120, this.avatarBg.y + 640);
        this.codeText.pos(this.codeTitle.x + this.codeTitle.width, this.codeTitle.y - 2);
        let startX = 528 - (this.taoqiTitle.width + this.taoqiText.width);
        this.taoqiTitle.pos(this.avatarBg.x + startX, this.avatarBg.y + 640);
        this.taoqiText.pos(this.taoqiTitle.x + this.taoqiTitle.width, this.taoqiTitle.y - 2);
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
        this.avatarBg.pos(52, 126);
        this.rankFlag.pos(this.avatarBg.x + 24, this.avatarBg.y + 75);
        this.decorateLeft.pos(this.avatarBg.x + 59, this.avatarBg.y + 87);
        this.decorateRight.pos(this.avatarBg.x + 557, this.avatarBg.y + 87);
        this.voteFlag.pos(this.avatarBg.x + 153, this.avatarBg.y + 110);
        this.voteBtn.pos(this.avatarBg.x + 159, this.avatarBg.y + 686);
        this.desc.pos(74, this.avatarBg.y + 810);
        this.avatarSp.pos(this.avatarBg.x + 123, this.avatarBg.y);
        this.layoutChangeUI();
    }
    layoutChangeUI() {
        this.layoutCodeAnyTaoQi();
        let startY = this.desc.y + this.desc.height;
        if (!this.desc.visible)
            startY = this.voteBtn.y + this.voteBtn.height;
        let centerY = SystemContext.gameHeight - startY - 232 >> 1;
        this.myDressBtn.pos(77, startY + centerY);
        this.shareBtn.pos(291, startY + centerY);
        this.rankBtn.pos(506, startY + centerY);
    }
    clearWindowRes() {
        RES.DelGroupKeys("dressPartTemp");
        super.clearWindowRes();
    }
    destroy() {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.off(GameManager.COLLOCATION_RANK_INFO, this, this.onRankInfo);
        manager.off(GameManager.COLLOCATION_VOTE_SUCC, this, this.onVoteSucc);
        manager = null;
        super.destroy();
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import FontName from "../../enum/FontName";
//import Global from "../../Global";
//import RES from "../../res/RES";
//import UIUtils from "../../utils/UIUtils";
//import WindowBase from "../base/WindowBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import DressAvatar from "../dressScene/DressAvatar";
class SaveDressWindow extends WindowBase {
    constructor() {
        super();
        this.modal = true;
        this.modalAlpha = 0.8;
        if (Global.AutoClearRes)
            this.resNames = ["saveDressWin"];
        this.size(575, 924);
        this.addDrawClick();
    }
    Open(modelType, dressIDs) {
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames.push("dressPartTemp");
        super.Open(modelType, dressIDs);
    }
    init() {
        super.init();
        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(250, 0);
        this.closeBtn.InitSkin("baseWindowClose");
        this.closeBtn.on(Laya.Event.CLICK, this, this.Close);
        this.addDrawChild(this.closeBtn);
        this.bg = new SgsTexture(RES.GetRes("saveDressWinScroll"));
        this.bg.pos(0, 101);
        this.addDrawChild(this.bg);
        this.descText = new SgsText();
        this.descText.pos(0, 900);
        this.descText.width = this.width;
        this.descText.font = FontName.HEITI;
        this.descText.color = "#DCC492";
        this.descText.fontSize = 24;
        this.descText.align = "center";
        this.descText.text = "主人，长按人物可以保存您的创作哦~";
        this.addDrawChild(this.descText);
        this.reference = new Laya.Sprite();
        this.reference.pos(60, 153);
        this.reference.size(450, 668);
        this.reference.zOrder = Number.MAX_VALUE - 1;
        this.addChild(this.reference);
        this.avatarContainer = new SgsSprite();
        this.avatarBg = new SgsTexture(RES.GetRes("saveDressWinBg_image"));
        this.avatarContainer.addDrawChild(this.avatarBg);
        this.dressAvatar = new DressAvatar();
        this.dressAvatar.pos(127, 102);
        this.avatarContainer.addChild(this.dressAvatar);
        this.leftLogo = new Laya.Image();
        this.leftLogo.pos(27, 17);
        this.leftLogo.source = RES.GetRes("saveDressWinLeftLogo");
        this.avatarContainer.addChild(this.leftLogo);
        this.rightLogo = new Laya.Image();
        this.rightLogo.pos(548, 18);
        this.rightLogo.source = RES.GetRes("saveDressWinRightLogo");
        this.avatarContainer.addChild(this.rightLogo);
        this.qrCode = new Laya.Image();
        this.qrCode.pos(61, 806);
        this.qrCode.source = RES.GetRes("saveDressWinQRCode");
        this.avatarContainer.addChild(this.qrCode);
        this.bottomText = new Laya.Image();
        this.bottomText.pos(25, 1021);
        this.bottomText.source = RES.GetRes("saveDressWinBottomText");
        this.avatarContainer.addChild(this.bottomText);
        this.onStageResize();
    }
    enterWindow(modelType, dressIDs) {
        super.enterWindow();
        this.dressAvatar.UpdateAll(modelType, dressIDs);
        Laya.timer.frameOnce(2, this, this.onMergeImg);
    }
    onMergeImg() {
        UIUtils.ClearTextPrompt();
        var htmlC = this.avatarContainer.drawToCanvas(750, 1113, 0, 0);
        var base64 = htmlC.toBase64("image/png", 1);
        htmlC.destroy();
        if (this.avatarContainer) {
            this.avatarContainer.destroy();
            this.avatarContainer = null;
        }
        this.imgElement = document.getElementById("mergeImg");
        if (this.imgElement)
            this.imgElement.style.display = "block";
        else {
            this.imgElement = document.createElement("img");
            this.imgElement.id = "mergeImg";
            this.imgElement.crossOrigin = "";
            document.getElementById("layaContainer").appendChild(this.imgElement);
        }
        this.imgElement.src = base64;
        Laya.Utils.fitDOMElementInArea(this.imgElement, this.reference, 0, 0, this.reference.width, this.reference.height);
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        if (this.imgElement)
            Laya.Utils.fitDOMElementInArea(this.imgElement, this.reference, 0, 0, this.reference.width, this.reference.height);
    }
    clearWindowRes() {
        RES.DelGroupKeys("dressPartTemp");
        super.clearWindowRes();
    }
    destroy() {
        Laya.timer.clearAll(this);
        if (this.avatarContainer) {
            this.avatarContainer.destroy();
            this.avatarContainer = null;
        }
        if (this.imgElement) {
            this.imgElement.src = "";
            this.imgElement.style.display = "none";
            this.imgElement = null;
        }
        super.destroy();
    }
}

//import FontName from "../../enum/FontName";
//import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsText from "../controls/base/SgsText";
class RuleItemUI extends SgsSprite {
    constructor() {
        super();
        this.init();
    }
    init() {
        this.codeText = new SgsText();
        this.codeText.font = FontName.HEITI;
        this.codeText.fontSize = 24;
        this.codeText.bold = true;
        this.codeText.color = "#80B6A7";
        this.addDrawChild(this.codeText);
        this.descText = new SgsHTMLDivElement();
        this.descText.x = 35;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 24;
        this.descText.color = "#80B6A7";
        this.descText.leading = 16;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.addChild(this.descText);
    }
    SetDesc(width, code, desc) {
        this.width = width;
        this.descText.width = this.width - this.descText.x;
        this.codeText.text = code;
        this.descText.innerHTML = desc;
        this.height = this.descText.contextHeight - 16;
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import Global from "../../Global";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import WindowBase from "../base/WindowBase";
//import SgsSpriteButton from "../controls/base/SgsSpriteButton";
//import DressAvatar from "../dressScene/DressAvatar";
class LookDressWindow extends WindowBase {
    constructor() {
        super();
        this.modal = true;
        this.modalAlpha = 0.8;
    }
    Open(modelType, dressIDs) {
        if (Global.AutoClearRes && DressConfiger.GetInstance().GetDressPartTempGroup(dressIDs))
            this.resNames = ["dressPartTemp"];
        super.Open(modelType, dressIDs);
    }
    init() {
        super.init();
        this.dressAvatar = new DressAvatar();
        this.dressAvatar.scale(0.9, 0.9);
        this.addChild(this.dressAvatar);
        this.closeBtn = new SgsSpriteButton();
        this.closeBtn.InitSkin("baseWindowClose");
        this.closeBtn.on(Laya.Event.CLICK, this, this.Close);
        this.addChild(this.closeBtn);
        this.onStageResize();
    }
    enterWindow(modelType, dressIDs) {
        super.enterWindow();
        this.dressAvatar.UpdateAll(modelType, dressIDs);
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
        this.dressAvatar.pos((this.width - this.dressAvatar.width * 0.9 >> 1) + Global.ModelOffsetX * 0.9, (this.height - this.dressAvatar.height >> 1) + 30);
        this.closeBtn.pos(556, this.dressAvatar.y - 100);
    }
    clearWindowRes() {
        RES.DelGroupKeys("dressPartTemp");
        super.clearWindowRes();
    }
    destroy() {
        super.destroy();
    }
}

//import RES from "../../res/RES";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsTexture from "../controls/base/SgsTexture";
class ImageFlatButton extends SgsFlatButton {
    constructor() {
        super();
    }
    initChilds() {
        super.initChilds();
        if (!this.textFlag) {
            this.textFlag = new SgsTexture();
            this.addDrawChild(this.textFlag);
        }
    }
    InitTextSkin(res) {
        this.textFlag.texture = RES.GetRes(res);
        this.setLayoutChanged();
    }
    changeLayout() {
        super.changeLayout();
        this.textFlag.pos(this.width - this.textFlag.width >> 1, this.height - this.textFlag.height >> 1);
    }
}

//import RES from "../../res/RES";
//import WindowBase from "../base/WindowBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsTexture from "../controls/base/SgsTexture";
class CommonBaseWindow extends WindowBase {
    constructor() {
        super();
        this.modal = true;
        this.size(670, 365);
        this.addDrawClick();
    }
    init() {
        super.init();
        this.bg = new SgsTexture(RES.GetRes("commonWindowBg"));
        this.bg.width = this.width;
        this.bg.height = this.height;
        this.bg.sizeGrid = "277,1,82,1";
        this.addDrawChild(this.bg);
        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(588, 50);
        this.closeBtn.InitSkin("commonWindowCloseBtn");
        this.closeBtn.on(Laya.Event.CLICK, this, this.onCloseHandler);
        this.addDrawChild(this.closeBtn);
    }
    size(width, height) {
        super.size(width, height);
        if (this.bg)
            this.bg.height = height;
        return this;
    }
    onStageResize(event = null) {
        super.onStageResize(event);
    }
    onCloseHandler() {
        this.Close();
    }
}

//import TipsEvent from "./../../event/TipsEvent";
//import GameEventDispatcher from "./../../event/GameEventDispatcher";
//import SgsSprite from "../controls/base/SgsSprite";
class ToolTipBase extends SgsSprite {
    constructor() {
        super();
        this.needAutoPos = true;
        this.mouseEnabled = false;
        this.zOrder = 1003;
    }
    size(w, h) {
        super.size(w, h);
        if (this.needAutoPos)
            GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_SIZE_CHNAGED_EVENT, this);
        return this;
    }
    get showWidth() {
        return this.width * this.scaleX >> 0;
    }
    get showHeight() {
        return this.height * this.scaleY >> 0;
    }
}

//import LayoutEnum from "../../enum/base/LayoutEnum";
//import FontName from "../../enum/FontName";
//import Global from "../../Global";
//import SceneManager from "../../mode/base/SceneManager";
//import SgsSoundManager from "../../mode/base/SgsSoundManager";
//import WindowManager from "../../mode/base/WindowManager";
//import GameManager from "../../mode/gameManager/GameManager";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import SceneBase from "../base/SceneBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsImage from "../controls/base/SgsImage";
//import SgsSpriteButton from "../controls/base/SgsSpriteButton";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsFlatPanel from "../controls/SgsFlatPanel";
//import PromptWindow from "../window/PromptWindow";
//import RankItemUI from "./RankItemUI";
class RankScene extends SceneBase {
    constructor() {
        super();
        this.isSearch = false;
        this.operationTime = 0;
        if (Global.AutoClearRes)
            this.resNames = ["rankScene"];
        this.addDrawClick();
    }
    createChildren() {
        super.createChildren();
        this.bg = new SgsTexture(RES.GetRes("myDressSceneBg_image"));
        this.addDrawChild(this.bg);
        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0, 36);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK, this, this.onRuleHandler);
        this.addDrawChild(this.ruleBtn);
        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(552, 36);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK, this, this.onHomeHandler);
        this.addDrawChild(this.homeBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(652, 36);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.addDrawChild(this.soundBtn);
        this.dressBtn = new SgsFlatButton();
        this.dressBtn.InitSkin("baseDressBtn");
        this.dressBtn.on(Laya.Event.CLICK, this, this.onDressHandler);
        this.addDrawChild(this.dressBtn);
        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK, this, this.onMyDressHandler);
        this.addDrawChild(this.myDressBtn);
        this.downBtn = new SgsFlatButton();
        this.downBtn.InitSkin("baseDownBtn1");
        this.downBtn.on(Laya.Event.CLICK, this, this.onDownLoadHandler);
        this.addDrawChild(this.downBtn);
        this.searchBg = new SgsTexture(RES.GetRes("baseSearchBg"));
        this.searchBg.pos(52, 156);
        this.searchBg.size(645, 52);
        this.searchBg.sizeGrid = "1,64,1,30";
        this.addDrawChild(this.searchBg);
        this.currencyBg = new SgsTexture(RES.GetRes("baseCurrencyBg"));
        this.currencyBg.pos(439, 75);
        this.addDrawChild(this.currencyBg);
        this.currencyTitle = new SgsText();
        this.currencyTitle.font = FontName.HEITI;
        this.currencyTitle.color = "#9da093";
        this.currencyTitle.fontSize = 30;
        this.currencyTitle.text = "我的桃气值：";
        this.currencyTitle.pos(this.currencyBg.x - this.currencyTitle.width + 10, this.currencyBg.y + 22);
        this.addDrawChild(this.currencyTitle);
        this.currencyText = new SgsText();
        this.currencyText.pos(this.currencyBg.x, this.currencyBg.y);
        this.currencyText.size(this.currencyBg.width, this.currencyBg.height);
        this.currencyText.font = FontName.HEITI;
        this.currencyText.color = "#ffffff";
        this.currencyText.fontSize = 26;
        this.currencyText.align = "center";
        this.currencyText.valign = "middle";
        this.currencyText.bold = true;
        this.addDrawChild(this.currencyText);
        this.desc = new SgsText();
        this.desc.x = 60;
        this.desc.width = SystemContext.gameWidth - 120;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#E5A7AE";
        this.desc.fontSize = 24;
        this.desc.leading = 10;
        this.desc.wordWrap = true;
        this.addDrawChild(this.desc);
        this.searchInput = new Laya.TextInput();
        this.searchInput.pos(this.searchBg.x + 30, this.searchBg.y);
        this.searchInput.size(this.searchBg.width - 30 - 120, this.searchBg.height);
        this.searchInput.font = FontName.HEITI;
        this.searchInput.fontSize = 24;
        this.searchInput.color = "#C8BBA5";
        this.searchInput.promptColor = "#C8BBA5";
        this.searchInput.prompt = "主人，这里输入编号可快速查找到对应作品哦~";
        this.searchInput.on(Laya.Event.INPUT, this, this.onSearchChanage);
        this.searchInput.on(Laya.Event.BLUR, this, this.onSearchChanage);
        this.searchInput.on(Laya.Event.ENTER, this, this.onSearchHandler);
        this.addChild(this.searchInput);
        this.searchClearBtn = new SgsSpriteButton();
        this.searchClearBtn.pos(this.searchBg.x + 543, this.searchBg.y + 16);
        this.searchClearBtn.InitSkin("baseSearchClearBtn");
        this.searchClearBtn.visible = false;
        this.searchClearBtn.on(Laya.Event.CLICK, this, this.onSearchClearHandler);
        this.addChild(this.searchClearBtn);
        this.searchButton = new SgsSpriteButton();
        this.searchButton.pos(this.searchBg.x + 583, this.searchBg.y);
        this.searchButton.size(62, 52);
        this.searchButton.on(Laya.Event.CLICK, this, this.onSearchHandler);
        this.addChild(this.searchButton);
        this.panel = new SgsFlatPanel(RankItemUI, 3, 1);
        this.panel.SetLayout(LayoutEnum.TileLayout, 34, 15, 2);
        this.panel.width = 694 + 12;
        this.panel.pos(34, 240);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("yellowVscroll");
        this.panel.on("scrollChange", this, this.onScrollChange);
        this.addChild(this.panel);
        this.panelBottomBg = new SgsImage();
        this.panelBottomBg.source = RES.GetRes("myDressBottomBg");
        this.panelBottomBg.visible = false;
        this.addChild(this.panelBottomBg);
        this.initView();
        this.onStageResize();
    }
    initView() {
        let manager = GameManager.GetInstance();
        manager.on(GameManager.COLLOCATION_RANK, this, this.onRank);
        manager.on(GameManager.COLLOCATION_RANK_SEARCH, this, this.onRankSearch);
        manager.on(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.on(GameManager.BACK_RANK_CHANGE, this, this.onBackRankChange);
        this.updateCurrency();
        manager.CollocationRank();
    }
    onRank(data) {
        if (!data)
            return;
        let manager = GameManager.GetInstance();
        let myRank = data.myRank;
        if (myRank) {
            if (!manager.CheckCollocation(myRank.skin, myRank.collocation))
                myRank.collocation = null;
            this.updateDesc(myRank.code, myRank.rank);
        }
        let rank = data.rank;
        if (rank && rank.length > 0 && rank[0].code) {
            let list = [];
            let isContainSelf = false;
            rank.forEach(element => {
                if (!manager.CheckCollocation(element.skin, element.collocation))
                    element.collocation = null;
                if (element.is_self) {
                    isContainSelf = true;
                    list.unshift(element);
                }
                else {
                    list.push(element);
                }
            });
            if (!isContainSelf) {
                if (myRank)
                    list.unshift(myRank);
            }
            this.panel.DataProvider = list;
        }
        else {
            this.panel.DataProvider = null;
        }
        this.updatePanelBottomBg();
    }
    onRankSearch(data) {
        if (!data)
            return;
        let rank = data.rank;
        if (rank && rank.length > 0 && rank[0].code) {
            this.isSearch = true;
            if (!GameManager.GetInstance().CheckCollocation(rank[0].skin, rank[0].collocation))
                rank[0].collocation = null;
            this.panel.DataProvider = rank;
            if (rank[0].is_self) {
                this.updateDesc(rank[0].code, rank[0].rank);
            }
        }
        else {
            UIUtils.ShowTextPrompt("没有该编号的作品");
        }
    }
    onScoreChange() {
        this.updateCurrency();
    }
    onBackRankChange() {
        if (this.isSearch) {
            let dataProvider = this.panel.DataProvider;
            if (dataProvider && dataProvider.length > 0)
                GameManager.GetInstance().CollocationRankSearch(dataProvider[0].code);
        }
        else {
            GameManager.GetInstance().CollocationRank();
        }
    }
    updateCurrency() {
        let score = GameManager.GetInstance().Score;
        this.currencyText.text = score + "";
        this.currencyText.fontSize = score < 100 ? 32 : 26;
    }
    updatePanelBottomBg() {
        this.panelBottomBg.visible = false;
        let self = this;
        Laya.timer.frameOnce(2, this, function () {
            if (self.destroyed)
                return;
            self.panelBottomBg.visible = self.panel.vScrollBar.max > 0 ? true : false;
        });
    }
    updateDesc(code, rank) {
        if (!rank) {
            this.desc.text = "主人，您的参赛作品-" + code + ",暂未上榜 快邀请您的好友，为您助力投票吧~";
        }
        else {
            if (rank >= 1 && rank <= 99)
                this.desc.text = "恭喜主人，您的参赛作品-" + code + ",目前排名：" + rank + "，快邀请您的好友，为您投票助力获得更高的排行吧~";
            else
                this.desc.text = "主人，您的参赛作品-" + code + ",目前排名：" + rank + "，暂未上榜 快邀请您的好友，为您助力投票吧~";
        }
    }
    onSearchClearHandler() {
        let curTime = Laya.Browser.now();
        if (curTime - this.operationTime < Global.OperationFastTime)
            return;
        this.operationTime = curTime;
        this.searchInput.text = "";
        this.searchClearBtn.visible = this.searchInput.text ? true : false;
        if (this.isSearch)
            GameManager.GetInstance().CollocationRank();
        this.isSearch = false;
    }
    onSearchChanage() {
        this.searchClearBtn.visible = this.searchInput.text ? true : false;
    }
    onSearchHandler() {
        if (!this.searchInput.text) {
            UIUtils.OpenPromptWin("", "请先输入编号", 100, null, null, PromptWindow.BTN_TYPE2);
            return;
        }
        let curTime = Laya.Browser.now();
        if (curTime - this.operationTime < Global.OperationFastTime)
            return;
        this.operationTime = curTime;
        GameManager.GetInstance().CollocationRankSearch(this.searchInput.text);
    }
    onRuleHandler() {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }
    onHomeHandler() {
        SceneManager.GetInstance().EnterScene("HomeScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onDressHandler() {
        SceneManager.GetInstance().EnterScene("DressScene");
    }
    onMyDressHandler() {
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }
    onDownLoadHandler() {
        Global.DownLoadGame();
    }
    onScrollChange() {
        let scrollBar = this.panel.vScrollBar;
        if (!scrollBar)
            return;
        this.panelBottomBg.visible = scrollBar.value < scrollBar.max;
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        this.panel.height = SystemContext.gameHeight - this.panel.y - 356;
        this.panelBottomBg.y = this.panel.y + this.panel.height - 97;
        this.desc.y = SystemContext.gameHeight - 318;
        this.dressBtn.pos(77, SystemContext.gameHeight - 259);
        this.myDressBtn.pos(291, SystemContext.gameHeight - 259);
        this.downBtn.pos(506, SystemContext.gameHeight - 259);
    }
    destroy() {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.COLLOCATION_RANK, this, this.onRank);
        manager.off(GameManager.COLLOCATION_RANK_SEARCH, this, this.onRankSearch);
        manager.off(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.off(GameManager.BACK_RANK_CHANGE, this, this.onBackRankChange);
        manager = null;
        super.destroy();
    }
}

//import LayoutEnum from "../../enum/base/LayoutEnum";
//import FontName from "../../enum/FontName";
//import Global from "../../Global";
//import SceneManager from "../../mode/base/SceneManager";
//import SgsSoundManager from "../../mode/base/SgsSoundManager";
//import WindowManager from "../../mode/base/WindowManager";
//import GameManager from "../../mode/gameManager/GameManager";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import SceneBase from "../base/SceneBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsImage from "../controls/base/SgsImage";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsFlatPanel from "../controls/SgsFlatPanel";
//import PromptWindow from "../window/PromptWindow";
//import MyDressItemUI from "./MyDressItemUI";
class MyDressScene extends SceneBase {
    constructor() {
        super();
        if (Global.AutoClearRes) {
            this.resNames = ["myDressScene"];
            let list = GameManager.GetInstance().MyCollocationList;
            if (list && list.length > 0)
                RES.DelGroupKeys("myDressScene", ["myDressSceneNot_image"]);
        }
        this.addDrawClick();
    }
    createChildren() {
        super.createChildren();
        this.bg = new SgsTexture(RES.GetRes("myDressSceneBg_image"));
        this.addDrawChild(this.bg);
        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0, 36);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK, this, this.onRuleHandler);
        this.addDrawChild(this.ruleBtn);
        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(552, 36);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK, this, this.onHomeHandler);
        this.addDrawChild(this.homeBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(652, 36);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.addDrawChild(this.soundBtn);
        this.dressBtn = new SgsFlatButton();
        this.dressBtn.InitSkin("baseDressBtn");
        this.dressBtn.on(Laya.Event.CLICK, this, this.onDressHandler);
        this.addDrawChild(this.dressBtn);
        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK, this, this.onRankHandler);
        this.addDrawChild(this.rankBtn);
        this.downBtn = new SgsFlatButton();
        this.downBtn.InitSkin("baseDownBtn1");
        this.downBtn.on(Laya.Event.CLICK, this, this.onDownLoadHandler);
        this.addDrawChild(this.downBtn);
        this.currencyBg = new SgsTexture(RES.GetRes("baseCurrencyBg"));
        this.currencyBg.pos(439, 75);
        this.addDrawChild(this.currencyBg);
        this.currencyTitle = new SgsText();
        this.currencyTitle.font = FontName.HEITI;
        this.currencyTitle.color = "#9da093";
        this.currencyTitle.fontSize = 30;
        this.currencyTitle.text = "我的桃气值：";
        this.currencyTitle.pos(this.currencyBg.x - this.currencyTitle.width + 10, this.currencyBg.y + 22);
        this.addDrawChild(this.currencyTitle);
        this.currencyText = new SgsText();
        this.currencyText.pos(this.currencyBg.x, this.currencyBg.y);
        this.currencyText.size(this.currencyBg.width, this.currencyBg.height);
        this.currencyText.font = FontName.HEITI;
        this.currencyText.color = "#ffffff";
        this.currencyText.fontSize = 26;
        this.currencyText.align = "center";
        this.currencyText.valign = "middle";
        this.currencyText.bold = true;
        this.addDrawChild(this.currencyText);
        this.desc = new SgsText();
        this.desc.width = SystemContext.gameWidth;
        this.desc.font = FontName.HEITI;
        this.desc.color = "#B0B4B0";
        this.desc.fontSize = 22;
        this.desc.align = "center";
        this.desc.text = "主人，您还没有参赛呢，快选一组作品上传吧~";
        this.desc.visible = false;
        this.addDrawChild(this.desc);
        this.panel = new SgsFlatPanel(MyDressItemUI, 3, 1);
        this.panel.SetLayout(LayoutEnum.TileLayout, 34, 15, 2);
        this.panel.width = 694 + 12;
        this.panel.pos(34, 167);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("blueVscroll");
        this.panel.on("scrollChange", this, this.onScrollChange);
        this.addChild(this.panel);
        this.panelBottomBg = new SgsImage();
        this.panelBottomBg.source = RES.GetRes("myDressBottomBg");
        this.panelBottomBg.visible = false;
        this.addChild(this.panelBottomBg);
        this.initView();
        this.onStageResize();
    }
    initView() {
        let manager = GameManager.GetInstance();
        let list = manager.MyCollocationList;
        if (!list || list.length <= 0) {
            this.showNotView();
        }
        else {
            this.panel.DataProvider = list;
        }
        this.updatePanelBottomBg();
        this.updateCurrency();
        this.desc.visible = list && list.length > 0 && !manager.Code ? true : false;
        manager.on(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.on(GameManager.COLLOCATION_JOIN_SUCC, this, this.onJoinSucc);
    }
    onScoreChange() {
        this.updateCurrency();
    }
    onJoinSucc() {
        let manager = GameManager.GetInstance();
        UIUtils.OpenPromptWin("", "*主人，恭喜您已经成功参赛！<br/>您的作品编号为：" + manager.Code, 100, null, null, PromptWindow.BTN_TYPE2);
        this.panel.DataProvider = manager.MyCollocationList;
        this.desc.visible = manager.Code ? true : false;
    }
    updateCurrency() {
        let score = GameManager.GetInstance().Score;
        this.currencyText.text = score + "";
        this.currencyText.fontSize = score < 100 ? 32 : 26;
    }
    updatePanelBottomBg() {
        this.panelBottomBg.visible = false;
        let self = this;
        Laya.timer.frameOnce(2, this, function () {
            if (self.destroyed)
                return;
            self.panelBottomBg.visible = self.panel.vScrollBar.max > 0 ? true : false;
        });
    }
    showNotView() {
        if (!this.notBg) {
            this.notBg = new SgsTexture(RES.GetRes("myDressSceneNot_image"));
            this.notBg.x = 53;
            this.addDrawChild(this.notBg);
            this.notText = new SgsText();
            this.notText.pos(this.notBg.x + 83, this.notBg.y + 155);
            this.notText.font = FontName.HEITI;
            this.notText.color = "#a2693f";
            this.notText.fontSize = 30;
            this.notText.leading = 20;
            this.notText.text = "呜呜呜，主人，\n您还没有给婉儿搭配任何一套衣服呢！ \n快去创作您心目里最美丽的造型吧~";
            this.addDrawChild(this.notText);
            this.onStageResize();
        }
    }
    onRuleHandler() {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }
    onHomeHandler() {
        SceneManager.GetInstance().EnterScene("HomeScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onDressHandler() {
        SceneManager.GetInstance().EnterScene("DressScene");
    }
    onRankHandler() {
        SceneManager.GetInstance().EnterScene("RankScene");
    }
    onDownLoadHandler() {
        Global.DownLoadGame();
    }
    onScrollChange() {
        let scrollBar = this.panel.vScrollBar;
        if (!scrollBar)
            return;
        this.panelBottomBg.visible = scrollBar.value < scrollBar.max;
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        this.panel.height = SystemContext.gameHeight - this.panel.y - 345;
        this.panelBottomBg.y = this.panel.y + this.panel.height - 97;
        this.desc.y = SystemContext.gameHeight - 296;
        if (this.notBg) {
            this.notBg.y = 150 + (SystemContext.gameHeight - 150 - 260 - this.notBg.height + 100 >> 1);
            this.notText.pos(this.notBg.x + 83, this.notBg.y + 155);
        }
        this.dressBtn.pos(77, SystemContext.gameHeight - 259);
        this.rankBtn.pos(291, SystemContext.gameHeight - 259);
        this.downBtn.pos(506, SystemContext.gameHeight - 259);
    }
    destroy() {
        let manager = GameManager.GetInstance();
        manager.off(GameManager.SCORE_CHANGE, this, this.onScoreChange);
        manager.off(GameManager.COLLOCATION_JOIN_SUCC, this, this.onJoinSucc);
        manager = null;
        super.destroy();
    }
}

//import SgsSprite from "../controls/base/SgsSprite";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsText from "../controls/base/SgsText";
//import GameEventDispatcher from "../../event/GameEventDispatcher";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import FontName from "../../enum/FontName";
//import EffectUtils from "../../utils/EffectUtils";
class MainLoadingView extends SgsSprite {
    constructor() {
        super();
        this.curValue = 0;
        this.maxValue = 0;
        this.oldValue = 0;
        this.tweenPos = 0;
        this.initChilds();
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onStageResize);
        this.onStageResize();
    }
    initChilds() {
        this.bg = new SgsTexture(RES.GetRes("mainLoadingBg_image"));
        this.addDrawChild(this.bg);
        this.descText = new SgsText();
        this.descText.width = SystemContext.gameWidth;
        this.descText.font = FontName.HEITI;
        this.descText.fontSize = 40;
        this.descText.color = "#A7928A";
        this.descText.bold = true;
        this.descText.align = "center";
        this.addDrawChild(this.descText);
        this.effect = EffectUtils.GetSkeletonEffect(false, true);
        this.effect.x = SystemContext.gameWidth >> 1;
        this.effect.scale(1, 1);
        this.effect.playEffect("res/assets/mainLoading/tuzitiao.sk", 0, true);
        this.addChild(this.effect);
    }
    ShowProgress(curValue, maxValue) {
        this.clearTweenProgress();
        this.oldValue = this.curValue;
        this.locationProgress(this.curValue, this.maxValue);
        this.curValue = curValue;
        this.maxValue = maxValue;
        if (this.curValue >= this.maxValue) {
            this.locationProgress(this.curValue, this.maxValue);
        }
        else {
            this.startTweenProgress();
        }
    }
    ShowError(errorMsg) {
        this.descText.text = "资源加载失败，请刷新...";
    }
    ShowText(msg) {
        this.descText.text = msg;
    }
    ShowParseConfig() {
    }
    ResetProgress() {
    }
    startTweenProgress() {
        this.clearTweenProgress();
        this.tweenPos = 0;
        this.tweenProgress = Laya.Tween.to(this, { tweenPos: 1 }, 1000, null, Laya.Handler.create(this, this.onTweenComplete));
        this.tweenProgress.update = Laya.Handler.create(this, this.onTweenUpdate, null, false);
    }
    clearTweenProgress() {
        if (this.tweenProgress) {
            Laya.Tween.clear(this.tweenProgress);
            this.tweenProgress = null;
        }
    }
    onTweenUpdate() {
        let value = this.oldValue + (this.curValue - this.oldValue) * this.tweenPos;
        this.locationProgress(value, this.maxValue);
    }
    onTweenComplete() {
        this.tweenProgress = null;
        this.locationProgress(this.curValue, this.maxValue);
    }
    locationProgress(curValue, maxValue) {
        let ratio = curValue / maxValue;
        if (ratio >= 1)
            ratio = 0.99;
        ratio = Math.floor(ratio * 100);
        this.descText.text = "加载中：" + ratio + "%";
    }
    onStageResize(event = null) {
        UIUtils.BgAdaptation(this.bg);
        this.effect.y = SystemContext.gameHeight / 2 + 100;
        this.descText.y = this.effect.y - 350;
    }
    destroy() {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onStageResize);
        this.clearTweenProgress();
        super.destroy();
        RES.ClearResByGroup("mainLoading");
    }
}

//import SystemContext from "./../../SystemContext";
//import RES from "./../../res/RES";
//import GameEventDispatcher from "./../../event/GameEventDispatcher";
//import SgsImage from "../controls/base/SgsImage";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsText from "../controls/base/SgsText";
//import FontName from "../../enum/FontName";
class LoadingUI extends SgsSprite {
    constructor() {
        super();
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
        this.addDrawClick();
        this.initChilds();
    }
    initChilds() {
        this.contentSp = new SgsSprite();
        this.contentSp.visible = false;
        this.addChild(this.contentSp);
        this.modalBg = new Laya.Sprite();
        this.modalBg.alpha = 0.6;
        this.contentSp.addChild(this.modalBg);
        this.circle = new SgsImage();
        this.circle.pivot(37, 37);
        this.circle.pos(this.width / 2, this.height / 2);
        this.circle.source = RES.GetRes("loadingCircle");
        this.contentSp.addChild(this.circle);
        this.txt = new SgsText();
        this.txt.pos(this.width - this.txt.textWidth >> 1, this.circle.y + 50);
        this.txt.font = FontName.HEITI;
        this.txt.color = "#ffffff";
        this.txt.fontSize = 26;
        this.txt.text = "加载中，请等待...";
        this.contentSp.addDrawChild(this.txt);
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onStageResize);
        this.onStageResize();
    }
    Show(delay) {
        Laya.timer.clearAll(this);
        this.contentSp.visible = false;
        if (delay <= 0)
            this.playCircle();
        else
            Laya.timer.once(delay, this, this.onDelayShow);
    }
    Hide() {
        Laya.timer.clearAll(this);
        this.removeSelf();
    }
    playCircle() {
        Laya.timer.loop(50, this, this.onLoop);
        this.contentSp.visible = true;
    }
    onLoop() {
        this.circle.rotation += 9;
    }
    ShowProgress(curValue, maxValue) {
    }
    ShowError(errorMsg, winName = "") {
    }
    onDelayShow() {
        this.playCircle();
    }
    onStageResize(event = null) {
        this.size(SystemContext.gameWidth, SystemContext.gameHeight);
        this.modalBg.graphics.clear();
        this.modalBg.graphics.drawRect(0, 0, this.width, this.height, "#000000");
        this.circle.pos(this.width / 2, this.height / 2);
        this.txt.pos(this.width - this.txt.textWidth >> 1, this.circle.y + 50);
    }
    destroy() {
        Laya.timer.clearAll(this);
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onStageResize);
        super.destroy();
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class WindowLayer extends LayerBase {
    constructor() {
        super(LayerOrder.WindowLayer);
    }
    static GetInstance() {
        if (null == WindowLayer.instance) {
            WindowLayer.instance = new WindowLayer();
        }
        return WindowLayer.instance;
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class TopUILayer extends LayerBase {
    constructor() {
        super(LayerOrder.TopUILayer);
    }
    static GetInstance() {
        if (null == TopUILayer.instance) {
            TopUILayer.instance = new TopUILayer();
        }
        return TopUILayer.instance;
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
class SceneLayer extends LayerBase {
    constructor() {
        super(LayerOrder.SceneLayer);
    }
    static GetInstance() {
        if (null == SceneLayer.instance) {
            SceneLayer.instance = new SceneLayer();
        }
        return SceneLayer.instance;
    }
}

//import LayerBase from "./LayerBase";
//import { LayerOrder } from "../../enum/base/layerOrder";
//import SystemContext from "../../SystemContext";
//import TextPromptUI from "../controls/TextPromptUI";
class PromptLayer extends LayerBase {
    constructor() {
        super(LayerOrder.PromptLayer);
        this.textPromptGap = 3;
        this.textPromptUIs = [];
        this.textPromptPool = [];
    }
    static GetInstance() {
        if (null == PromptLayer.instance) {
            PromptLayer.instance = new PromptLayer();
        }
        return PromptLayer.instance;
    }
    ShowTextPrompt(msg, time = 3000) {
        let textPromptUI;
        let startY = 0;
        let length = this.textPromptUIs.length;
        if (length > 0) {
            textPromptUI = this.textPromptUIs[length - 1];
            startY = textPromptUI.y + textPromptUI.height + this.textPromptGap;
            if (length >= 3) {
                textPromptUI = this.textPromptUIs.shift();
                textPromptUI.Clear();
                this.textPromptPool.push(textPromptUI);
            }
        }
        if (this.textPromptPool.length)
            textPromptUI = this.textPromptPool.shift();
        else
            textPromptUI = new TextPromptUI();
        textPromptUI.HideComplete = this.textPromptComplete.bind(this);
        textPromptUI.Show(msg, time);
        textPromptUI.x = SystemContext.gameWidth - textPromptUI.width >> 1;
        textPromptUI.y = length > 0 ? startY : SystemContext.gameHeight - textPromptUI.height >> 1;
        this.textPromptUIs.push(textPromptUI);
        this.layoutTextPrompt();
    }
    ClearTextPrompt() {
        if (!this.textPromptUIs)
            return;
        let textPromptUI;
        while (this.textPromptUIs.length) {
            textPromptUI = this.textPromptUIs.pop();
            if (textPromptUI) {
                textPromptUI.Clear();
                this.textPromptPool.push(textPromptUI);
            }
        }
    }
    textPromptComplete(textPromptUI) {
        if (!textPromptUI || !this.textPromptUIs)
            return;
        let index = this.textPromptUIs.indexOf(textPromptUI);
        if (index != -1) {
            this.textPromptUIs.splice(index, 1);
            textPromptUI.Clear();
            this.textPromptPool.push(textPromptUI);
            this.layoutTextPrompt();
        }
    }
    layoutTextPrompt() {
        if (!this.textPromptUIs || this.textPromptUIs.length <= 0)
            return;
        let totalHeight = 0;
        this.textPromptUIs.forEach((textPromptUI) => {
            totalHeight += textPromptUI.height;
        });
        totalHeight += (this.textPromptUIs.length - 1) * this.textPromptGap;
        let startY = SystemContext.gameHeight - totalHeight >> 1;
        this.textPromptUIs.forEach((textPromptUI) => {
            textPromptUI.x = SystemContext.gameWidth - textPromptUI.width >> 1;
            textPromptUI.UpMove(startY);
            startY += textPromptUI.height + this.textPromptGap;
        });
    }
}

//import Global from "../../Global";
//import SceneManager from "../../mode/base/SceneManager";
//import SgsSoundManager from "../../mode/base/SgsSoundManager";
//import WindowManager from "../../mode/base/WindowManager";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import SceneBase from "../base/SceneBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsTexture from "../controls/base/SgsTexture";
class HomeScene extends SceneBase {
    constructor() {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["homeScene"];
        this.addDrawClick();
    }
    createChildren() {
        super.createChildren();
        this.bg = new SgsTexture(RES.GetRes("homeSceneBg_image"));
        this.addDrawChild(this.bg);
        this.title = new SgsTexture(RES.GetRes("homeLogo"));
        this.title.pos(0, 0);
        this.addDrawChild(this.title);
        this.desc = new SgsTexture(RES.GetRes("homeText"));
        this.desc.pos(58, 790);
        this.addDrawChild(this.desc);
        this.startBtn = new SgsFlatButton();
        this.startBtn.InitSkin("homeStartBtn");
        this.startBtn.on(Laya.Event.CLICK, this, this.onStartHandler);
        this.addDrawChild(this.startBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(645, 31);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.addDrawChild(this.soundBtn);
        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.InitSkin("baseMyDressBtn1");
        this.myDressBtn.on(Laya.Event.CLICK, this, this.onMyDressHandler);
        this.addDrawChild(this.myDressBtn);
        this.shareBtn = new SgsFlatButton();
        this.shareBtn.InitSkin("baseShareBtn1");
        this.shareBtn.on(Laya.Event.CLICK, this, this.onShareHandler);
        this.addDrawChild(this.shareBtn);
        this.rankBtn = new SgsFlatButton();
        this.rankBtn.InitSkin("baseRankBtn1");
        this.rankBtn.on(Laya.Event.CLICK, this, this.onRankHandler);
        this.addDrawChild(this.rankBtn);
        this.onStageResize();
    }
    onStartHandler() {
        SceneManager.GetInstance().EnterScene("DressScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onMyDressHandler() {
        SceneManager.GetInstance().EnterScene("MyDressScene");
    }
    onShareHandler() {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }
    onRankHandler() {
        SceneManager.GetInstance().EnterScene("RankScene");
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        this.desc.pos(58, SystemContext.gameHeight * 790 / SystemContext.designHeight);
        this.startBtn.pos(211, SystemContext.gameHeight - 91 - 265);
        this.myDressBtn.pos(77, SystemContext.gameHeight - 259);
        this.shareBtn.pos(291, SystemContext.gameHeight - 259);
        this.rankBtn.pos(506, SystemContext.gameHeight - 259);
        if (this.desc.y + this.desc.height + 20 >= this.startBtn.y)
            this.desc.y = this.startBtn.y - this.desc.height - 20;
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import DressType from "../../enum/DressType";
//import FontName from "../../enum/FontName";
//import Global from "../../Global";
//import SceneManager from "../../mode/base/SceneManager";
//import SgsSoundManager from "../../mode/base/SgsSoundManager";
//import WindowManager from "../../mode/base/WindowManager";
//import GameManager from "../../mode/gameManager/GameManager";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import UIUtils from "../../utils/UIUtils";
//import SceneBase from "../base/SceneBase";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsSpriteButton from "../controls/base/SgsSpriteButton";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsTabButtonGroup from "../controls/SgsTabButtonGroup";
//import CollocationDressAvatar from "./CollocationDressAvatar";
//import DressBottomView from "./DressBottomView";
//import DressColorTabFlatButton from "./DressColorTabFlatButton";
class DressScene extends SceneBase {
    constructor() {
        super();
        if (Global.AutoClearRes)
            this.resNames = ["dressScene"];
    }
    createChildren() {
        super.createChildren();
        this.bg = new SgsTexture(RES.GetRes("dressSceneBg_image"));
        this.addDrawChild(this.bg);
        this.light = new SgsTexture(RES.GetRes("dressLight"));
        this.addDrawChild(this.light);
        this.dressAvatar = new CollocationDressAvatar();
        this.addChild(this.dressAvatar);
        this.topSp = new SgsSprite();
        this.topSp.size(this.width, this.height);
        this.topSp.addDrawClick();
        this.addChild(this.topSp);
        this.downBtn = new SgsFlatButton();
        this.downBtn.pos(0, 29);
        this.downBtn.InitSkin("baseDownBtn");
        this.downBtn.on(Laya.Event.CLICK, this, this.onDownLoadHandler);
        this.topSp.addDrawChild(this.downBtn);
        this.ruleBtn = new SgsFlatButton();
        this.ruleBtn.pos(0, 133);
        this.ruleBtn.InitSkin("baseRuleBtn");
        this.ruleBtn.on(Laya.Event.CLICK, this, this.onRuleHandler);
        this.topSp.addDrawChild(this.ruleBtn);
        this.homeBtn = new SgsFlatButton();
        this.homeBtn.pos(647, 29);
        this.homeBtn.InitSkin("baseHomeBtn");
        this.homeBtn.on(Laya.Event.CLICK, this, this.onHomeHandler);
        this.topSp.addDrawChild(this.homeBtn);
        this.soundBtn = new SgsFlatButton();
        this.soundBtn.pos(647, 133);
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
        this.soundBtn.on(Laya.Event.CLICK, this, this.onSoundHandler);
        this.topSp.addDrawChild(this.soundBtn);
        this.shareBtn = new SgsFlatButton();
        this.shareBtn.pos(647, 237);
        this.shareBtn.InitSkin("baseShareBtn");
        this.shareBtn.on(Laya.Event.CLICK, this, this.onShareHandler);
        this.topSp.addDrawChild(this.shareBtn);
        this.myDressBtn = new SgsFlatButton();
        this.myDressBtn.pos(647, 341);
        this.myDressBtn.InitSkin("baseMyDressBtn");
        this.myDressBtn.on(Laya.Event.CLICK, this, this.onMyDressHandler);
        this.topSp.addDrawChild(this.myDressBtn);
        this.rankBtn = new SgsFlatButton();
        this.rankBtn.pos(647, 445);
        this.rankBtn.InitSkin("baseRankBtn");
        this.rankBtn.on(Laya.Event.CLICK, this, this.onRankHandler);
        this.topSp.addDrawChild(this.rankBtn);
        this.dressIngFlag = new SgsTexture(RES.GetRes("dressIngFlag"));
        this.dressIngFlag.pos(150, 435);
        this.dressIngFlag.visible = false;
        this.topSp.addDrawChild(this.dressIngFlag);
        this.dressAvatar.SetDressIngFlag(this.dressIngFlag);
        this.changeSkinText = new SgsText();
        this.changeSkinText.pos(560, 110);
        this.changeSkinText.width = 26;
        this.changeSkinText.font = FontName.HEITI;
        this.changeSkinText.color = "#A4AF9F";
        this.changeSkinText.fontSize = 27;
        this.changeSkinText.leading = 5;
        this.changeSkinText.wordWrap = true;
        this.changeSkinText.text = "切换肤色";
        this.topSp.addDrawChild(this.changeSkinText);
        this.skinColorTabGroup = new SgsTabButtonGroup([{ label: "", value: 1 }, { label: "", value: 2 }, { label: "", value: 3 }], 1, true, -18, DressColorTabFlatButton);
        this.skinColorTabGroup.pos(442, 63);
        this.skinColorTabGroup.on(SgsTabButtonGroup.TAP_CLICKED, this, this.onSkinColorTabClick);
        this.addChild(this.skinColorTabGroup);
        this.bottomView = new DressBottomView();
        this.bottomView.on("changeDress", this, this.onChangeDress);
        this.bottomView.on("delDress", this, this.onDelDress);
        this.bottomView.on("openCloseEvent", this, this.onOpenCloseHandler);
        this.addChild(this.bottomView);
        this.saveBtn = new SgsSpriteButton();
        this.saveBtn.pos(227, 820);
        if (GameManager.GetInstance().IsCollocationMaxed)
            this.saveBtn.InitSkin("dressMaxedBtn", "dressMaxedBtn", "dressMaxedBtn", "dressMaxedBtn");
        else
            this.saveBtn.InitSkin("dressSaveBtn", "dressSaveBtn", "dressSaveBtn", "dressSaveBtnDisable");
        this.saveBtn.enabled = false;
        this.saveBtn.on(Laya.Event.CLICK, this, this.onSaveHandler);
        this.addChild(this.saveBtn);
        this.dressAvatar.UpdateAll(1, DressConfiger.GetInstance().DefaultDressIDs);
        this.skinColorTabGroup.SelectedValue = 1;
        this.onStageResize();
        GameManager.GetInstance().on(GameManager.COLLOCATION_SAVE_SUCC, this, this.onSaveSucc);
    }
    onSaveSucc(data) {
        UIUtils.ShowTextPrompt("保存成功");
        if (data)
            SceneManager.GetInstance().EnterScene("DressSaveScene", data);
    }
    onDownLoadHandler() {
        Global.DownLoadGame();
    }
    onRuleHandler() {
        WindowManager.GetInstance().OpenWindow("RuleWindow");
    }
    onHomeHandler() {
        this.checkChangeScene("HomeScene");
    }
    onSoundHandler() {
        SgsSoundManager.GetInstance().ChangeBgmState();
        this.soundBtn.InitSkin(!SgsSoundManager.GetInstance().IsBgmStop ? "baseSoundBtn" : "baseSoundCloseBtn");
    }
    onShareHandler() {
        WindowManager.GetInstance().OpenWindow("SharePromptWindow");
    }
    onMyDressHandler() {
        this.checkChangeScene("MyDressScene");
    }
    onRankHandler() {
        this.checkChangeScene("RankScene");
    }
    onSkinColorTabClick(value) {
        this.dressAvatar.UpdateModel(value);
    }
    onChangeDress(dressVo) {
        if (!dressVo || this.dressAvatar.IsDressIng)
            return;
        if (dressVo.DressID == 0) {
            this.dressAvatar.RecoveryDefaultByType(dressVo.DressType);
        }
        else if (dressVo.DressType == DressType.DESSuit) {
            this.dressAvatar.ReplaceDress(dressVo.DressID);
        }
        else {
            this.dressAvatar.ReplaceDress(dressVo.DressID);
        }
        this.updateSaveBtnState();
    }
    onDelDress() {
        if (this.dressAvatar.IsDressIng)
            return;
        if (this.saveBtn.enabled)
            UIUtils.OpenPromptWin("", "主人，您是否要清空当前所有装扮？", 100, Laya.Handler.create(this, this.onConfirmDel));
    }
    onConfirmDel() {
        this.dressAvatar.UpdateAll(1, DressConfiger.GetInstance().DefaultDressIDs);
        this.updateSaveBtnState();
    }
    onSaveHandler() {
        UIUtils.OpenPromptWin("", "*主人~是否保存该搭配？<br>（保存后无法修改和删除，并且最多保存99条）", 40, Laya.Handler.create(this, this.onConfirmCompete));
    }
    onConfirmCompete() {
        if (this.destroyed)
            return;
        GameManager.GetInstance().CollocationSave(this.skinColorTabGroup.SelectedValue, this.dressAvatar.DressIDs);
    }
    updateSaveBtnState() {
        if (GameManager.GetInstance().IsCollocationMaxed) {
            this.saveBtn.enabled = false;
            return;
        }
        let defaultDressIDs = DressConfiger.GetInstance().DefaultDressIDs;
        let curDressIDs = this.dressAvatar.DressIDs;
        let isEqual = true;
        if ((!defaultDressIDs && curDressIDs) || (defaultDressIDs && !curDressIDs) || defaultDressIDs.length != curDressIDs.length)
            isEqual = false;
        else {
            for (let i = 0; i < defaultDressIDs.length; i++) {
                if (curDressIDs.indexOf(defaultDressIDs[i]) == -1) {
                    isEqual = false;
                    break;
                }
            }
        }
        this.saveBtn.enabled = !isEqual;
    }
    checkChangeScene(sceneName) {
        if (this.saveBtn.enabled) {
            UIUtils.OpenPromptWin("", "主人，切换界面将不会保存当前换装，是否前往该界面？", 0, Laya.Handler.create(this, function () {
                SceneManager.GetInstance().EnterScene(sceneName);
            }));
        }
        else
            SceneManager.GetInstance().EnterScene(sceneName);
    }
    onOpenCloseHandler(isOpen) {
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        let gameWidth = SystemContext.gameWidth;
        let gameHeight = SystemContext.gameHeight;
        if (isOpen) {
            Laya.Tween.to(this.dressAvatar, { scaleX: 0.72, scaleY: 0.72, x: (gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72, y: 102 }, 200);
            Laya.Tween.to(this.light, { y: 374 }, 200, null, Laya.Handler.create(this, this.onBottomOpenComplete));
        }
        else {
            let offsetY = this.dressAvatar.OffsetY;
            let offsetHeight = this.dressAvatar.OffsetHeight;
            let dressScale = 1;
            let dressAcatarY = (gameHeight - 103 - 34 - this.dressAvatar.height >> 1) - (offsetY + offsetHeight >> 1);
            if (dressAcatarY + offsetY < 80) {
                dressAcatarY = 80 - offsetY;
                dressScale = (gameHeight - 103 - 34 - dressAcatarY * 2) / this.dressAvatar.height;
            }
            Laya.Tween.to(this.dressAvatar, { scaleX: dressScale, scaleY: dressScale, x: (gameWidth - this.dressAvatar.width * dressScale >> 1) + Global.ModelOffsetX * dressScale, y: dressAcatarY }, 200);
            Laya.Tween.to(this.light, { y: dressAcatarY + this.dressAvatar.height * dressScale - 404 }, 200);
            this.saveBtn.visible = this.skinColorTabGroup.visible = this.changeSkinText.visible = false;
        }
    }
    onBottomOpenComplete() {
        this.saveBtn.visible = this.skinColorTabGroup.visible = this.changeSkinText.visible = true;
    }
    onStageResize(event = null) {
        super.onStageResize(event);
        UIUtils.BgAdaptation(this.bg);
        this.bottomView.StageResize();
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        let gameWidth = SystemContext.gameWidth;
        let gameHeight = SystemContext.gameHeight;
        if (this.bottomView.IsOpen) {
            this.dressAvatar.pos((gameWidth - this.dressAvatar.width * 0.72 >> 1) + Global.ModelOffsetX * 0.72, 102);
            this.dressAvatar.scale(0.72, 0.72);
            this.light.pos(134, 374);
            this.saveBtn.visible = this.skinColorTabGroup.visible = true;
        }
        else {
            let offsetY = this.dressAvatar.OffsetY;
            let offsetHeight = this.dressAvatar.OffsetHeight;
            let dressScale = 1;
            let dressAcatarY = (gameHeight - 103 - 34 - this.dressAvatar.height >> 1) - (offsetY + offsetHeight >> 1);
            if (dressAcatarY + offsetY < 80) {
                dressAcatarY = 80 - offsetY;
                dressScale = (gameHeight - 103 - 34 - dressAcatarY * 2) / this.dressAvatar.height;
            }
            this.dressAvatar.pos((gameWidth - this.dressAvatar.width * dressScale >> 1) + Global.ModelOffsetX * dressScale, dressAcatarY);
            this.dressAvatar.scale(dressScale, dressScale);
            this.light.pos(134, dressAcatarY + this.dressAvatar.height * dressScale - 404);
        }
    }
    destroy() {
        Laya.Tween.clearAll(this.dressAvatar);
        Laya.Tween.clearAll(this.light);
        GameManager.GetInstance().off(GameManager.COLLOCATION_SAVE_SUCC, this, this.onSaveSucc);
        super.destroy();
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import LayoutEnum from "../../enum/base/LayoutEnum";
//import RES from "../../res/RES";
//import SystemContext from "../../SystemContext";
//import DressVO from "../../vo/DressVO";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsImage from "../controls/base/SgsImage";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsFlatPanel from "../controls/SgsFlatPanel";
//import SgsTabButtonGroup from "../controls/SgsTabButtonGroup";
//import DressPanelFlatItem from "./DressPanelFlatItem";
//import DressTabFlatButton from "./DressTabFlatButton";
//import DressTabPanel from "./DressTabPanel";
class DressBottomView extends SgsSprite {
    constructor() {
        super();
        this.tabList = [{ label: "", value: 1 }, { label: "", value: 2 }, { label: "", value: 3 }, { label: "", value: 4 },
            { label: "", value: 5 }, { label: "", value: 6 }, { label: "", value: 7 }, { label: "", value: 8 }];
        this.openHeight = 0;
        this.isOpen = true;
        this.openCloseIng = false;
        this.panelMaxHeight = 132 * 4 + (10 * 3);
        this.width = SystemContext.gameWidth;
        this.addDrawClick();
        this.initChilds();
    }
    initChilds() {
        this.dressBg = new SgsTexture(RES.GetRes("dressPanelBg"));
        this.dressBg.pos(0, 103);
        this.dressBg.sizeGrid = "30,127,140,52";
        this.dressBg.width = SystemContext.gameWidth;
        this.addDrawChild(this.dressBg);
        this.openBtn = new SgsFlatButton();
        this.openBtn.pos(29, 0);
        this.openBtn.InitSkin("dressUpBtn");
        this.openBtn.visible = !this.isOpen;
        this.openBtn.on(Laya.Event.CLICK, this, this.onOpenHandler);
        this.addDrawChild(this.openBtn);
        this.closeBtn = new SgsFlatButton();
        this.closeBtn.pos(29, 0);
        this.closeBtn.InitSkin("dressDownBtn");
        this.closeBtn.visible = this.isOpen;
        this.closeBtn.on(Laya.Event.CLICK, this, this.onCloseHandler);
        this.addDrawChild(this.closeBtn);
        this.delBtn = new SgsFlatButton();
        this.delBtn.pos(647, 0);
        this.delBtn.InitSkin("dressDelBtn");
        this.delBtn.on(Laya.Event.CLICK, this, this.onDelHandler);
        this.addDrawChild(this.delBtn);
        this.leftBtn = new SgsFlatButton();
        this.leftBtn.pos(0, 103);
        this.leftBtn.InitSkin("dressLeftBtn", "dressLeftBtn", "dressLeftBtn", "dressLeftBtnDisable");
        this.leftBtn.on(Laya.Event.CLICK, this, this.onLeftHandler);
        this.addDrawChild(this.leftBtn);
        this.rightBtn = new SgsFlatButton();
        this.rightBtn.pos(705, 103);
        this.rightBtn.InitSkin("dressRightBtn", "dressRightBtn", "dressRightBtn", "dressRightBtnDisable");
        this.rightBtn.on(Laya.Event.CLICK, this, this.onRightHandler);
        this.addDrawChild(this.rightBtn);
        this.tabPanel = new DressTabPanel();
        this.tabPanel.pos(49, 103);
        this.tabPanel.size(652, 75);
        this.tabPanel.hScrollBarSkin = "";
        this.tabPanel.on("scrollChange", this, this.onScrollChange);
        this.addChild(this.tabPanel);
        this.tabGroup = new SgsTabButtonGroup(this.tabList, 1, false, 4, DressTabFlatButton);
        this.tabGroup.on(SgsTabButtonGroup.TAP_CLICKED, this, this.onTabClick);
        this.tabPanel.addChild(this.tabGroup);
        this.dressPanel = new SgsFlatPanel(DressPanelFlatItem, 1, -1);
        this.dressPanel.pos(30, this.dressBg.y + 86);
        this.dressPanel.width = SystemContext.gameWidth - 36;
        this.dressPanel.vScrollBarSkin = RES.GetAtlasUrl("whiteVscroll");
        this.dressPanel.SetLayout(LayoutEnum.TileLayout, 10, 7, 5);
        this.dressPanel.on(SgsFlatPanel.ITEM_CLICK, this, this.onItemClick);
        this.addChild(this.dressPanel);
        this.dressRightBg = new SgsImage();
        this.dressRightBg.x = 585;
        this.dressRightBg.source = RES.GetRes("dressPanelRightBg");
        this.addChild(this.dressRightBg);
        this.tabGroup.SelectedValue = 1;
    }
    get IsOpen() {
        return this.isOpen;
    }
    StageResize() {
        if (this.openCloseIng) {
            Laya.Tween.clearAll(this);
            this.openCloseIng = false;
        }
        let maxHeight = this.dressBg.y + 86 + this.panelMaxHeight + 40;
        let height = SystemContext.gameHeight - 840;
        if (height > maxHeight)
            height = maxHeight;
        this.openHeight = height;
        this.dressBg.height = height - this.dressBg.y;
        this.dressPanel.height = this.dressBg.height - 86 - 40;
        this.dressRightBg.y = this.dressPanel.y + this.dressPanel.height - 26;
        if (this.isOpen) {
            this.height = height;
        }
        this.y = SystemContext.gameHeight - this.height;
    }
    onOpenHandler() {
        if (this.openCloseIng)
            return;
        this.openCloseIng = true;
        this.isOpen = true;
        this.openBtn.visible = !this.isOpen;
        this.closeBtn.visible = this.isOpen;
        this.leftBtn.visible = this.rightBtn.visible = this.tabPanel.visible = this.dressPanel.visible = true;
        this.height = this.openHeight;
        Laya.Tween.to(this, { y: SystemContext.gameHeight - this.height }, 200, null, Laya.Handler.create(this, this.onOpenCloseComplete));
        this.event("openCloseEvent", this.isOpen);
    }
    onCloseHandler() {
        if (this.openCloseIng)
            return;
        this.openCloseIng = true;
        this.isOpen = false;
        this.openBtn.visible = !this.isOpen;
        this.closeBtn.visible = this.isOpen;
        this.height = this.tabPanel.y;
        Laya.Tween.to(this, { y: SystemContext.gameHeight - this.height }, 200, null, Laya.Handler.create(this, this.onOpenCloseComplete));
        this.event("openCloseEvent", this.isOpen);
    }
    onOpenCloseComplete() {
        this.openCloseIng = false;
        if (!this.isOpen)
            this.leftBtn.visible = this.rightBtn.visible = this.tabPanel.visible = this.dressPanel.visible = false;
    }
    onLeftHandler() {
        this.tabPanel.scrollTo(this.tabPanel.hScrollBar.value - 164, 0);
    }
    onRightHandler() {
        this.tabPanel.scrollTo(this.tabPanel.hScrollBar.value + 164, 0);
    }
    onTabClick() {
        let list = [];
        if (!this.resetDressVo) {
            this.resetDressVo = new DressVO();
            this.resetDressVo.DressID = 0;
        }
        this.resetDressVo.DressType = this.tabGroup.SelectedValue;
        list.push(this.resetDressVo);
        let config = DressConfiger.GetInstance();
        let dressVos = config.GetDresssByDressType(this.tabGroup.SelectedValue);
        this.dressPanel.scrollTo(0, 0);
        if (dressVos && dressVos.length > 0) {
            let defaultDressIDs = config.DefaultDressIDs;
            dressVos.forEach(dressVo => {
                if (!defaultDressIDs || defaultDressIDs.indexOf(dressVo.DressID) == -1)
                    list.push(dressVo);
            });
            this.dressPanel.DataProvider = list;
        }
        else
            this.dressPanel.DataProvider = [this.resetDressVo];
    }
    onItemClick(index, data, itemUI) {
        this.event("changeDress", data);
    }
    onDelHandler() {
        this.event("delDress");
    }
    onScrollChange() {
        this.updateLeftRightBtn();
    }
    updateLeftRightBtn() {
        this.leftBtn.enabled = this.tabPanel.hScrollBar.value > 0;
        this.rightBtn.enabled = this.tabPanel.hScrollBar.value < this.tabPanel.hScrollBar.max;
    }
    destroy() {
        Laya.Tween.clearAll(this);
        super.destroy();
        this.resetDressVo = null;
    }
}

//import SgsFlatImage from "../controls/base/SgsFlatImage";
class DressAvatarPartUI extends SgsFlatImage {
    constructor() {
        super();
    }
    get DressVO() {
        return this.dressVo;
    }
    get DressPartVO() {
        return this.dressPartVo;
    }
    get DressID() {
        return this.dressVo ? this.dressVo.DressID : 0;
    }
    get DressType() {
        return this.dressVo ? this.dressVo.DressType : 0;
    }
    get Layer() {
        return this.dressPartVo ? this.dressPartVo.Layer : 0;
    }
    get IsLoaded() {
        if (!this._skin)
            return false;
        return this.texture && this.texture.url == this._skin ? true : false;
    }
    SetItemData(dressVo, dressPartVo) {
        this.dressVo = dressVo;
        this.dressPartVo = dressPartVo;
        if (!dressPartVo) {
            this.skin = "";
            return;
        }
        if (dressPartVo.PartPos && dressPartVo.PartPos.length >= 2)
            this.pos(dressPartVo.PartPos[0], dressPartVo.PartPos[1]);
        else
            this.pos(0, 0);
        this.skin = dressPartVo.ResourceUrl;
    }
    clear(destroy = true) {
        super.clear(destroy);
        if (destroy) {
            this.dressVo = null;
            this.dressPartVo = null;
        }
    }
}

//import DressConfiger from "../../config/DressConfiger";
//import Global from "../../Global";
//import RES from "../../res/RES";
//import SgsSprite from "../controls/base/SgsSprite";
//import SgsTexture from "../controls/base/SgsTexture";
//import DressAvatarPartUI from "./DressAvatarPartUI";
class DressAvatar extends SgsSprite {
    constructor() {
        super();
        this.autoClear = true;
        this.onlyDestroyClear = false;
        this.modelType = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetWidth = 0;
        this.offsetHeight = 0;
        this.invalidCheckLoadedFlag = false;
        this.size(Global.ModelWidth, Global.ModelHeight);
        this.createModel();
        this.partUIs = [];
        this.partPools = [];
        this.dressIDs = [];
    }
    createModel() {
        this.model = new SgsTexture();
        this.addDrawChild(this.model);
    }
    get ModelType() {
        return this.modelType;
    }
    get DressIDs() {
        return this.dressIDs;
    }
    UpdateAll(modelType, dressIDs) {
        this.Reset();
        if (dressIDs && dressIDs.length > 0) {
            this.UpdateModel(modelType);
            let dressConfig = DressConfiger.GetInstance();
            let dressVo;
            dressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo) {
                    this.dressIDs.push(dressID);
                    this.addDressPartUIs(dressConfig, dressVo);
                }
            });
            this.updateLayer();
        }
    }
    UpdateModel(modelType) {
        if (!modelType || modelType < 1 || modelType > 3)
            modelType = 1;
        this.modelType = modelType;
        if (this.model)
            this.model.texture = RES.GetRes("modelAvatar" + modelType);
    }
    Reset() {
        this.modelType = 0;
        this.dressIDs.length = 0;
        this.model.texture = null;
        let partUI;
        while (this.partUIs.length > 0) {
            partUI = this.partUIs.shift();
            partUI.off(Laya.Event.COMPLETE, this, this.onPartLoadComplete);
            this.removeDrawChild(partUI, false);
            this.partPools.push(partUI);
        }
    }
    get OffsetX() {
        return this.offsetX;
    }
    get OffsetY() {
        return this.offsetY;
    }
    get OffsetWidth() {
        return this.offsetWidth;
    }
    get OffsetHeight() {
        return this.offsetHeight;
    }
    addDressID(dressID) {
        if (this.dressIDs.indexOf(dressID) == -1)
            this.dressIDs.push(dressID);
    }
    getDressIDIndexByType(dressType) {
        let dressConfig = DressConfiger.GetInstance();
        let vo;
        for (let i = 0; i < this.dressIDs.length; i++) {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (vo && vo.DressType == dressType)
                return i;
        }
        return -1;
    }
    addDressPartUIs(dressConfig, dressVo) {
        if (!dressVo || this.checkPartUIByDressID(dressVo.DressID))
            return;
        let dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
        if (dressParts && dressParts.length > 0) {
            let partUI;
            dressParts.forEach(dressPartVo => {
                if (this.partPools.length > 0)
                    partUI = this.partPools.shift();
                else
                    partUI = new DressAvatarPartUI();
                partUI.autoClear = Global.AutoClearRes && this.autoClear;
                partUI.onlyDestroyClear = this.onlyDestroyClear;
                partUI.on(Laya.Event.COMPLETE, this, this.onPartLoadComplete);
                this.partUIs.push(partUI);
                partUI.SetItemData(dressVo, dressPartVo);
            });
        }
    }
    checkPartUIByDressID(dressID) {
        if (!this.partUIs || this.partUIs.length <= 0)
            return false;
        for (let i = 0; i < this.partUIs.length; i++) {
            if (this.partUIs[i].DressID == dressID)
                return true;
        }
        return false;
    }
    updateLayer() {
        if (!this.partUIs || this.partUIs.length <= 0)
            return;
        this.partUIs.sort(function (aUI, bUI) {
            return aUI.Layer - bUI.Layer;
        });
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetWidth = 0;
        this.offsetHeight = 0;
        let partVo;
        this.partUIs.forEach((partUI) => {
            if (partUI.drawed)
                this.removeDrawChild(partUI, false);
            partVo = partUI.DressPartVO;
            if (partVo && partVo.PartPos && partVo.PartPos.length >= 2 && partVo.PartSize && partVo.PartSize.length >= 2) {
                this.offsetX = Math.min(this.offsetX, partVo.PartPos[0]);
                this.offsetY = Math.min(this.offsetY, partVo.PartPos[1]);
                this.offsetWidth = Math.max(this.offsetWidth, partVo.PartPos[0] + partVo.PartSize[0] - this.width);
                this.offsetHeight = Math.max(this.offsetHeight, partVo.PartPos[1] + partVo.PartSize[1] - this.height);
            }
        });
        if (this.model.drawed)
            this.removeDrawChild(this.model, false);
        let partUI;
        for (let i = 0; i < this.partUIs.length; i++) {
            partUI = this.partUIs[i];
            if (partUI.Layer >= 10 && !this.model.drawed)
                this.addDrawChild(this.model);
            this.addDrawChild(partUI);
        }
        if (!this.model.drawed)
            this.addDrawChild(this.model);
    }
    onPartLoadComplete(partUI) {
        if (!this.invalidCheckLoadedFlag) {
            this.invalidCheckLoadedFlag = true;
            Laya.timer.callLater(this, this.checkPartAllLoaded);
        }
    }
    checkPartAllLoaded() {
        this.invalidCheckLoadedFlag = false;
        if (this.destroyed)
            return;
        let isAllLoaded = true;
        for (let i = 0; i < this.partUIs.length; i++) {
            if (!this.partUIs[i].IsLoaded) {
                isAllLoaded = false;
                break;
            }
        }
        if (isAllLoaded)
            this.event(DressAvatar.LOAD_COMPLETE, this);
    }
    destroy() {
        let partUI;
        while (this.partPools.length > 0) {
            partUI = this.partPools.shift();
            partUI.off(Laya.Event.COMPLETE, this, this.onPartLoadComplete);
            this.removeDrawChild(partUI, true);
        }
        this.partUIs.length = 0;
        super.destroy();
        this.modelType = 0;
        this.dressIDs.length = 0;
    }
}
DressAvatar.LOAD_COMPLETE = "LOAD_COMPLETE";

//import DressConfiger from "../../config/DressConfiger";
//import DressType from "../../enum/DressType";
//import DressAvatar from "./DressAvatar";
//import DressAvatarLoad from "./dressAvatarLoad";
class CollocationDressAvatar extends DressAvatar {
    constructor() {
        super();
        this.avatarLoads = [];
        this.avatarLoadPools = [];
    }
    get IsDressIng() {
        return this.avatarLoads.length > 0 ? true : false;
    }
    SetDressIngFlag(flag) {
        this.dressIngFlag = flag;
    }
    RecoveryDefaultByType(dressType) {
        if (this.IsDressIng)
            return;
        if (this.getDressIDIndexByType(dressType) == -1)
            return;
        let dressConfig = DressConfiger.GetInstance();
        let self = this;
        if (dressType == DressType.DESSuit) {
            this.delDressByType(dressType);
            addDefaultDress(DressType.DESJacket);
            addDefaultDress(DressType.DESLowerGarments);
        }
        else {
            addDefaultDress(dressType);
        }
        function addDefaultDress(dressType) {
            self.delDressByType(dressType);
            let defaultDressVo = dressConfig.GetDefaultDressVoByType(dressType);
            if (defaultDressVo) {
                if (self.dressIDs.indexOf(defaultDressVo.DressID) == -1)
                    self.dressIDs.push(defaultDressVo.DressID);
                self.addDressPartUIs(dressConfig, defaultDressVo);
            }
        }
        this.updateLayer();
        this.updateDressIngFlag(false);
    }
    ReplaceDress(dressID) {
        if (this.IsDressIng)
            return;
        if (this.dressIDs.indexOf(dressID) >= 0)
            return;
        let dressConfig = DressConfiger.GetInstance();
        let dressVo = dressConfig.GetDressByDressID(dressID);
        if (!dressVo)
            return;
        this.updateDressIngFlag(true);
        let vo;
        for (let i = 0; i < this.dressIDs.length; i++) {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (dressVo.DressType == DressType.DESSuit) {
                if (vo.DressType == dressVo.DressType || vo.DressType == DressType.DESJacket || vo.DressType == DressType.DESLowerGarments) {
                    this.cancelAvatarLoad(vo);
                    this.dressIDs.splice(i, 1);
                    i--;
                }
            }
            else if (dressVo.DressType == DressType.DESJacket || dressVo.DressType == DressType.DESLowerGarments) {
                if (vo.DressType == dressVo.DressType || vo.DressType == DressType.DESSuit) {
                    this.cancelAvatarLoad(vo);
                    this.dressIDs.splice(i, 1);
                    i--;
                }
            }
            else if (vo.DressType == dressVo.DressType) {
                this.cancelAvatarLoad(vo);
                this.dressIDs.splice(i, 1);
                break;
            }
        }
        this.addDressID(dressID);
        this.createAvatarLoad(dressVo);
    }
    Reset() {
        let avatarLoad;
        while (this.avatarLoads.length > 0) {
            avatarLoad = this.avatarLoads.shift();
            avatarLoad.off(Laya.Event.COMPLETE, this, this.onAvatarLoadComplete);
            avatarLoad.CancelDressPartRes();
            this.avatarLoadPools.push(avatarLoad);
        }
        super.Reset();
    }
    delDressByType(dressType) {
        let dressConfig = DressConfiger.GetInstance();
        let vo;
        for (let i = 0; i < this.dressIDs.length; i++) {
            vo = dressConfig.GetDressByDressID(this.dressIDs[i]);
            if (vo.DressType == dressType) {
                this.cancelAvatarLoad(vo);
                this.dressIDs.splice(i, 1);
                break;
            }
        }
        let partUI;
        for (let i = 0; i < this.partUIs.length; i++) {
            partUI = this.partUIs[i];
            if (partUI.DressType == dressType) {
                this.partUIs.splice(i, 1);
                partUI.off(Laya.Event.COMPLETE, this, this.onPartLoadComplete);
                this.removeDrawChild(partUI, false);
                this.partPools.push(partUI);
                i--;
            }
        }
    }
    createAvatarLoad(dressVo) {
        if (!dressVo)
            return;
        let avatarLoad;
        if (this.avatarLoadPools.length > 0)
            avatarLoad = this.avatarLoadPools.shift();
        else
            avatarLoad = new DressAvatarLoad();
        avatarLoad.on(Laya.Event.COMPLETE, this, this.onAvatarLoadComplete);
        this.avatarLoads.push(avatarLoad);
        avatarLoad.LoadDressPartRes(dressVo);
    }
    onAvatarLoadComplete(avatarLoad) {
        avatarLoad.off(Laya.Event.COMPLETE, this, this.onAvatarLoadComplete);
        let index = this.avatarLoads.indexOf(avatarLoad);
        if (index >= 0)
            this.avatarLoads.splice(index, 1);
        this.avatarLoadPools.push(avatarLoad);
        let dressVo = avatarLoad.DressVO;
        if (!dressVo || this.dressIDs.indexOf(dressVo.DressID) == -1)
            return;
        let dressConfig = DressConfiger.GetInstance();
        let repairDressVo;
        this.delDressByType(dressVo.DressType);
        if (dressVo.DressType == DressType.DESSuit) {
            this.delDressByType(DressType.DESJacket);
            this.delDressByType(DressType.DESLowerGarments);
        }
        else if (dressVo.DressType == DressType.DESJacket) {
            this.delDressByType(DressType.DESSuit);
            let index = this.getDressIDIndexByType(DressType.DESLowerGarments);
            if (index == -1)
                repairDressVo = dressConfig.GetDefaultDressVoByType(DressType.DESLowerGarments);
        }
        else if (dressVo.DressType == DressType.DESLowerGarments) {
            this.delDressByType(DressType.DESSuit);
            let index = this.getDressIDIndexByType(DressType.DESJacket);
            if (index == -1)
                repairDressVo = dressConfig.GetDefaultDressVoByType(DressType.DESJacket);
        }
        this.addDressID(dressVo.DressID);
        this.addDressPartUIs(dressConfig, dressVo);
        if (repairDressVo) {
            this.addDressID(repairDressVo.DressID);
            this.addDressPartUIs(dressConfig, repairDressVo);
        }
        this.updateLayer();
        this.updateDressIngFlag(false);
    }
    cancelAvatarLoad(dressVo) {
        if (!dressVo)
            return;
        let avatarLoad;
        for (let i = 0; i < this.avatarLoads.length; i++) {
            avatarLoad = this.avatarLoads[i];
            if (avatarLoad.DressVO && avatarLoad.DressVO.DressID == dressVo.DressID) {
                avatarLoad.off(Laya.Event.COMPLETE, this, this.onAvatarLoadComplete);
                avatarLoad.CancelDressPartRes();
                this.avatarLoads.splice(i, 1);
                this.avatarLoadPools.push(avatarLoad);
                break;
            }
        }
    }
    updateDressIngFlag(isShow) {
        if (!this.dressIngFlag)
            return;
        Laya.timer.clear(this, this.onDelayShowDressIngFlag);
        if (isShow)
            Laya.timer.once(1000, this, this.onDelayShowDressIngFlag);
        else
            this.dressIngFlag.visible = false;
    }
    onDelayShowDressIngFlag() {
        this.dressIngFlag.visible = true;
    }
    destroy() {
        Laya.timer.clear(this, this.onDelayShowDressIngFlag);
        let avatarLoad;
        while (this.avatarLoads.length > 0) {
            avatarLoad = this.avatarLoads.shift();
            avatarLoad.off(Laya.Event.COMPLETE, this, this.onAvatarLoadComplete);
            avatarLoad.CancelDressPartRes();
        }
        this.avatarLoadPools.length = 0;
        super.destroy();
        this.dressIngFlag = null;
    }
}

//import SgsSprite from "./base/SgsSprite";
//import LoadingManager from "../../mode/base/LoadingManager";
//import RES from "../../res/RES";
//import ResourceEvent from "../../res/ResourceEvent";
class ViewStackBase extends SgsSprite {
    constructor(initData = null) {
        super();
        this.autoRecoverRes = true;
        this.loading = false;
        this.totalCount = 0;
        this.loadedCount = 0;
        this.initData = null;
        this.initData = initData;
    }
    init() {
    }
    Reset() {
    }
    Remove() {
    }
    ReadyClose() {
    }
    StartLoadRes() {
        if (this.loading)
            return;
        if (!this.resNames || this.resNames.length <= 0) {
            this.init();
            return;
        }
        this.loading = true;
        LoadingManager.ShowLoading();
        this.addResEvent();
        this.totalCount = this.resNames.length;
        this.loadedCount = 0;
        let priority = 100 + this.resNames.length - 1;
        for (let i = 0; i < this.resNames.length; i++) {
            RES.LoadGroup(this.resNames[i], priority);
            priority--;
        }
    }
    addResEvent() {
        RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
    }
    removeResEvent() {
        RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceLoadComplete);
        this.totalCount = 0;
        this.loadedCount = 0;
    }
    onResourceProgress(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        let progress = event.progress;
        progress = this.loadedCount / this.totalCount + progress * (1 / this.totalCount);
        LoadingManager.ShowLoadProgress(progress * 100, 100);
    }
    onResourceError(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        this.removeResEvent();
        LoadingManager.ShowLoadError("资源组加载失败：" + event.groupName, this.name);
        this.loading = false;
        if (this.destroyed) {
            this.clearViewStackRes();
        }
        else
            this.destroy();
    }
    onResourceLoadComplete(event) {
        if (!this.resNames || this.resNames.indexOf(event.groupName) == -1)
            return;
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
            this.loading = false;
            this.removeResEvent();
            LoadingManager.CloseLoading();
            if (this.destroyed) {
                this.clearViewStackRes();
            }
            else {
                this.init();
            }
        }
    }
    clearViewStackRes() {
        if (!this.autoRecoverRes)
            return;
        if (this.resNames && this.resNames.length > 0) {
            for (let i = 0; i < this.resNames.length; i++) {
                RES.ClearResByGroup(this.resNames[i], false, true);
            }
            this.resNames.length = 0;
        }
    }
    destroy() {
        super.destroy();
        this.clearViewStackRes();
        this.initData = null;
    }
}

//import PromptLayer from "./../layer/PromptLayer";
//import RES from "./../../res/RES";
//import FontName from "./../../enum/FontName";
//import SgsHTMLDivElement from "./base/SgsHTMLDivElement";
//import SgsSprite from "./base/SgsSprite";
//import SgsTexture from "./base/SgsTexture";
//import SystemContext from "../../SystemContext";
class TextPromptUI extends SgsSprite {
    constructor() {
        super();
        this.padding = 35;
        this.showTime = 3000;
        this.size(SystemContext.gameWidth, 77);
        this.zOrder = 1004;
        this.initChilds();
    }
    initChilds() {
        this.msgBg = new SgsTexture(RES.GetRes("textPromptBg"));
        this.msgBg.size(this.width, this.height);
        this.msgBg.sizeGrid = "1,220,1,220";
        this.addDrawChild(this.msgBg);
        this.htmlDiv = new SgsHTMLDivElement();
        this.htmlDiv.width = SystemContext.gameWidth - this.padding * 2;
        this.htmlDiv.fontFamily = FontName.HEITI;
        this.htmlDiv.fontSize = 36;
        this.htmlDiv.color = "#f8f9f1";
        this.htmlDiv.mouseEnabled = false;
        this.htmlDiv.mouseThrough = false;
        this.addChild(this.htmlDiv);
    }
    Show(value, time = 3000) {
        this.showTime = time;
        this.htmlDiv.innerHTML = value;
        this.htmlDiv.pos(this.width - this.htmlDiv.contextWidth >> 1, this.height - this.htmlDiv.contextHeight >> 1);
        this.delayHide();
        PromptLayer.GetInstance().addChild(this);
    }
    UpMove(y) {
        if (this.y == y)
            return;
        if (this.upTween) {
            Laya.Tween.clear(this.upTween);
            this.upTween = null;
        }
        this.upTween = Laya.Tween.to(this, { y: y }, 300, null, Laya.Handler.create(this, this.onUpComplete));
    }
    Clear() {
        Laya.Tween.clearAll(this);
        this.removeSelf();
        this.HideComplete = null;
        this.upTween = null;
        this.showTime = 3000;
        this.alpha = 1;
        this.y = 0;
    }
    onUpComplete() {
        this.upTween = null;
    }
    delayHide() {
        Laya.Tween.to(this, { alpha: 0 }, 300, null, Laya.Handler.create(this, this.onHideComplete), this.showTime);
    }
    onHideComplete() {
        if (this.HideComplete) {
            this.HideComplete(this);
        }
    }
}

//import FontName from "../../enum/FontName";
//import SgsFlatButton from "./base/SgsFlatButton";
class SgsTabFlatButton extends SgsFlatButton {
    constructor(otherRenders = null) {
        super(otherRenders);
        this._value = 0;
        this.enableTip = "";
    }
    set value(val) {
        this._value = val;
    }
    get value() {
        return this._value;
    }
    get EnableTip() {
        return this.enableTip;
    }
    set EnableTip(value) {
        this.enableTip = value;
    }
    init(...arg) {
        if (arg && arg.length)
            this.InitSkin(arg[0], arg.length > 1 && arg[1] ? arg[1] : "", arg.length > 2 && arg[2] ? arg[2] : "", arg.length > 3 && arg[3] ? arg[3] : "", arg.length > 4 && arg[4] ? arg[4] : "");
        else
            this.InitSkin("tabButtonGeneral_Normal", "tabButtonGeneral_Overt", "tabButtonGeneral_Overt", "tabButtonGeneral_Overt", "tabButtonGeneral_Select");
        this.labelFont = FontName.ST;
        this.labelSize = 16;
        this.labelColors = "#291400,#291400,#291400";
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
    }
}

//import SgsSprite from "./base/SgsSprite";
//import SgsTabFlatButton from "./SgsTabFlatButton";
class SgsTabButtonGroup extends SgsSprite {
    constructor(data, otherLayerNum = 0, isVertical = false, gap = 5, btnClass = SgsTabFlatButton, btnWidth = 0, gap2 = 0) {
        super();
        this.otherLayerNum = 0;
        this.isVertical = false;
        this.gap = 5;
        this.btnWidth = 0;
        this.gap2 = 0;
        this.btnList = [];
        this.otherLayerNum = otherLayerNum;
        this.isVertical = isVertical;
        this.gap = gap;
        this.btnClass = btnClass;
        this.btnWidth = btnWidth;
        this.gap2 = gap2;
        if (this.otherLayerNum > 0) {
            this.addDrawClick();
            this.addDrawMouseEvent();
            this.otherRenders = [];
            let layerSp;
            for (let i = 0; i < otherLayerNum; i++) {
                layerSp = new SgsSprite();
                this.addChild(layerSp);
                this.otherRenders.push(layerSp);
            }
        }
        this.initUI(data);
    }
    set SelectedValue(value) {
        if (this.btnList.length) {
            for (let i = 0; i < this.btnList.length; i++) {
                if (this.btnList[i].value == value)
                    this.selectButton(this.btnList[i]);
            }
        }
    }
    set SelectedIndex(index) {
        if (this.btnList.length && index < this.btnList.length) {
            this.selectButton(this.btnList[index]);
        }
    }
    get SelectedValue() {
        return this.lastTabButton ? this.lastTabButton.value : -1;
    }
    get SelectedIndex() {
        if (!this.lastTabButton || !this.btnList || this.btnList.length <= 0)
            return -1;
        return this.btnList.indexOf(this.lastTabButton);
    }
    get SelectedButton() {
        return this.lastTabButton;
    }
    Rest() {
        if (this.btnList.length) {
            if (this.lastTabButton) {
                this.lastTabButton.selected = false;
                this.lastTabButton = null;
            }
        }
    }
    GetButtonByValue(value) {
        let selectBtn;
        for (let i = 0; i < this.btnList.length; i++) {
            let btn = this.btnList[i];
            if (btn.value == value) {
                selectBtn = btn;
                break;
            }
        }
        return selectBtn;
    }
    GetButtonByIndex(index) {
        let btn;
        if (this.btnList.length && index < this.btnList.length) {
            btn = this.btnList[index];
        }
        return btn;
    }
    GetButtonList() {
        return this.btnList;
    }
    get ListLength() {
        return this.btnList ? this.btnList.length : 0;
    }
    ShowRedPointByIndex(index, isShow) {
        let btn = this.GetButtonByIndex(index);
        if (btn) {
            if (isShow)
                btn.ShowRedPoint();
            else
                btn.RemoveRedPoint();
        }
    }
    ShowRedPointByValue(value, isShow) {
        let btn = this.GetButtonByValue(value);
        if (btn) {
            if (isShow)
                btn.ShowRedPoint();
            else
                btn.RemoveRedPoint();
        }
    }
    initUI(data) {
        if (data) {
            let btn;
            let sx = 0;
            let sy = 0;
            data.forEach((value) => {
                if (this.otherLayerNum > 0)
                    btn = new this.btnClass(this.otherRenders);
                else
                    btn = new this.btnClass();
                this.btnList.push(btn);
                if (value.label)
                    btn.label = value.label;
                btn.value = value.value;
                if (value.enableTip)
                    btn.EnableTip = value.enableTip;
                if (value.skinList)
                    btn.init(value.skinList[0], value.skinList[1], value.skinList[2], value.skinList[3], value.skinList[4]);
                else
                    btn.init();
                btn.on(Laya.Event.CLICK, this, this.onBtnClick);
                if (btn instanceof SgsTabFlatButton)
                    this.addDrawChild(btn);
                else
                    this.addChild(btn);
            }, this);
        }
        this.layout();
    }
    onBtnClick(event) {
        let target;
        if (event instanceof SgsTabFlatButton)
            target = event;
        else
            target = event.target;
        if (this.lastTabButton == target)
            return;
        if (!target.enabled) {
            return;
        }
        this.selectButton(target);
    }
    selectButton(btn) {
        if (btn) {
            if (this.lastTabButton)
                this.lastTabButton.selected = false;
            this.lastTabButton = btn;
            this.lastTabButton.selected = true;
            this.event(SgsTabButtonGroup.TAP_CLICKED, this.lastTabButton.value);
        }
    }
    layout() {
        let btn;
        let sx = 0;
        let sy = 0;
        this.btnList.forEach((btn) => {
            if (btn && btn.visible) {
                btn.pos(sx, sy);
                if (this.btnWidth)
                    btn.width = this.btnWidth;
                if (this.isVertical) {
                    sy += btn.height + this.gap;
                    sx += this.gap2;
                }
                else {
                    sx += btn.width + this.gap;
                    sy += this.gap2;
                }
                this.size(btn.x + btn.width, btn.y + btn.height);
            }
        });
    }
    destroy() {
        super.destroy();
    }
}
SgsTabButtonGroup.TAP_CLICKED = "TAP_CLICKED";

//import SgsSprite from "./base/SgsSprite";
class SgsPanelItemBase extends SgsSprite {
    constructor() {
        super();
        this.drawed = false;
        this.inited = false;
        this.dataed = false;
        this.delayLoadTime = 100;
        this.loadStatus = 0;
        this.visible = false;
        this.on(Laya.Event.REMOVED, this, this.onSelfRemoved);
    }
    get Drawed() {
        return this.drawed;
    }
    get Inited() {
        return this.inited;
    }
    get Dataed() {
        return this.dataed;
    }
    get NeedLeaveDrawClear() {
        return this.loadStatus != 0;
    }
    EnterDraw() {
        if (this.drawed)
            return;
        this.drawed = true;
        this.visible = true;
        if (!this.inited) {
            this.inited = true;
            this.init();
            if (this.dataed)
                this.updateViewData();
        }
        else {
            if (this.dataed)
                this.startLoad();
        }
    }
    LeaveDraw() {
        if (!this.drawed)
            return;
        this.drawed = false;
        this.visible = false;
    }
    LeaveDrawClear() {
        if (this.loadStatus == 1) {
            Laya.timer.clear(this, this.onDelayLoad);
            this.loadStatus = 0;
        }
        else if (this.loadStatus == 2)
            this.leaveDrawClear();
    }
    SetData(...args) {
        if (this.inited && this.dataed && this["isLeaveDrawClear"])
            this.LeaveDrawClear();
        this.stopLoad();
        this.loadStatus = 0;
        this.dataed = true;
        if (this.inited)
            this.updateViewData();
    }
    init() {
    }
    updateViewData() {
        this.startLoad();
    }
    startLoad() {
        if (this.drawed && this.loadStatus == 0) {
            this.loadStatus = 1;
            if (this.delayLoadTime > 0)
                Laya.timer.once(this.delayLoadTime, this, this.onDelayLoad);
            else
                this.enterDrawLoad();
        }
    }
    onDelayLoad() {
        if (!this.drawed || !this.parent) {
            this.loadStatus = 0;
            return;
        }
        this.enterDrawLoad();
    }
    enterDrawLoad() {
        this.loadStatus = 2;
    }
    leaveDrawClear() {
        this.loadStatus = 0;
    }
    stopLoad() {
        if (this.loadStatus == 1) {
            Laya.timer.clear(this, this.onDelayLoad);
            this.loadStatus = 0;
        }
    }
    onSelfRemoved(event) {
        if (!this.destroyed) {
            if (this.inited && this.dataed && this["isLeaveDrawClear"])
                this.LeaveDrawClear();
        }
    }
    destroy(destroyChild = true) {
        Laya.timer.clear(this, this.onDelayLoad);
        super.destroy(destroyChild);
    }
}

//import SgsHTMLDivElement from "./base/SgsHTMLDivElement";
class SgsPanelHtmlBase extends SgsHTMLDivElement {
    constructor() {
        super();
        this.drawed = false;
        this.inited = false;
        this.visible = false;
    }
    get Drawed() {
        return this.drawed;
    }
    get Inited() {
        return this.inited;
    }
    get Dataed() {
        return false;
    }
    get NeedLeaveDrawClear() {
        return false;
    }
    EnterDraw() {
        if (this.drawed)
            return;
        this.drawed = true;
        this.visible = true;
        if (!this.inited) {
            this.inited = true;
            this.init();
        }
    }
    LeaveDraw() {
        if (!this.drawed)
            return;
        this.drawed = false;
        this.visible = false;
    }
    LeaveDrawClear() {
    }
    init() {
    }
}

//import SgsFlatContainer from "./base/SgsFlatContainer";
class SgsFlatPanelItemBase extends SgsFlatContainer {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.rendererIndex = 0;
        this.inited = false;
        this.selected = false;
        this.delayLoadTime = 100;
        this.loadStatus = 0;
    }
    set RendererIndex(val) {
        this.rendererIndex = val;
    }
    get RendererIndex() {
        return this.rendererIndex;
    }
    set ItemRendererFunction(val) {
        this.itemRendererFunction = val;
    }
    set ParentPanel(val) {
        this.parentPanel = val;
    }
    set RendererData(val) {
        if (this.rendererData == val)
            return;
        this.stopLoad();
        this.loadStatus = 0;
        this.rendererData = val;
        if (!this.inited) {
            this.inited = true;
            this.init();
        }
        if (this.itemRendererFunction)
            this.itemRendererFunction.runWith([this.rendererIndex, this.rendererData, this]);
        this.updateRenderer(this.rendererData);
        this.startLoad();
    }
    get RendererData() {
        return this.rendererData;
    }
    set Selected(value) {
        this.selected = value;
    }
    get Selected() {
        return this.selected;
    }
    ResetRendererData() {
        this.rendererData = null;
    }
    LeaveDrawClear() {
        if (this.loadStatus == 1) {
            Laya.timer.clear(this, this.onDelayLoad);
            this.loadStatus = 0;
        }
        else if (this.loadStatus == 2)
            this.leaveDrawClear();
    }
    init() {
    }
    updateRenderer(rendererData) {
    }
    startLoad() {
        if (this.drawed && this.loadStatus == 0) {
            this.loadStatus = 1;
            if (this.delayLoadTime > 0 && (!this.parentPanel || this.parentPanel.GetItemLoadStatus(this.rendererIndex) != 2))
                Laya.timer.once(this.delayLoadTime, this, this.onDelayLoad);
            else
                this.enterDrawLoad();
        }
    }
    onDelayLoad() {
        if (!this.drawed) {
            this.loadStatus = 0;
            return;
        }
        this.enterDrawLoad();
    }
    enterDrawLoad() {
        this.loadStatus = 2;
        if (this.parentPanel)
            this.parentPanel.UpdateItemLoadStatus(this.rendererIndex, this.loadStatus);
    }
    leaveDrawClear() {
        this.loadStatus = 0;
        if (this.parentPanel)
            this.parentPanel.UpdateItemLoadStatus(this.rendererIndex, this.loadStatus);
    }
    stopLoad() {
        if (this.loadStatus == 1) {
            Laya.timer.clear(this, this.onDelayLoad);
            this.loadStatus = 0;
        }
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        this.rendererData = null;
        if (destroy) {
            Laya.timer.clear(this, this.onDelayLoad);
            this.itemRendererFunction = null;
            this.parentPanel = null;
        }
    }
}

//import SgsTexture from "./SgsTexture";
//import SgsText from "./SgsText";
//import SgsSprite from "./SgsSprite";
//import RES from "../../../res/RES";
//import ButtonPhaseEnum from "../../../enum/base/ButtonPhaseEnum";
class SgsSpriteButton extends SgsSprite {
    constructor() {
        super();
        this.phase = 0;
        this._selected = false;
        this._enabled = true;
        this._text = "";
        this._stateChanged = false;
        this._layoutChanged = false;
        this.selectedEnabled = true;
        this.redPointIsShow = false;
        this.labelColors = "#ffffff,#ffffff,#ffffff,#ffffff,#ffffff";
        this.strokeColors = "#000000,#000000,#000000,#000000,#000000";
        this.labelPadding = "0,0,0,0";
        this.createChildren();
        super.on(Laya.Event.ADDED, this, this.onAddToStage);
        super.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }
    set width(value) {
        Laya.superSetter(SgsSprite, this, "width", value);
        this.background.width = value;
        this.setLayoutChanged();
    }
    get width() {
        return this.background.width;
    }
    set height(value) {
        Laya.superSetter(SgsSprite, this, "height", value);
        this.background.height = value;
        this.setLayoutChanged();
    }
    get height() {
        return this.background.height;
    }
    createChildren() {
        this.background = new SgsTexture();
        this.addDrawChild(this.background);
        this.textField = new SgsText();
        this.textField.wordWrap = false;
        this.textField.align = "center";
        this.textField.valign = "middle";
        this.addDrawChild(this.textField);
    }
    onAddToStage(event) {
        this.phase = ButtonPhaseEnum.up;
        super.on(Laya.Event.MOUSE_UP, this, this.onMouse);
        super.on(Laya.Event.MOUSE_OVER, this, this.onMouse);
        super.on(Laya.Event.MOUSE_DOWN, this, this.onMouse);
        super.on(Laya.Event.MOUSE_OUT, this, this.onMouse);
        super.on(Laya.Event.CLICK, this, this.onMouse);
    }
    onRemoveToStage(event) {
        super.off(Laya.Event.MOUSE_UP, this, this.onMouse);
        super.off(Laya.Event.MOUSE_OVER, this, this.onMouse);
        super.off(Laya.Event.MOUSE_DOWN, this, this.onMouse);
        super.off(Laya.Event.MOUSE_OUT, this, this.onMouse);
        super.off(Laya.Event.CLICK, this, this.onMouse);
    }
    InitSkin(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "", selectedDisableSkin = "") {
        this.skins = new Array();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        this.background.texture = RES.GetRes(upSkin);
        this.setStateChanged();
        this.setLayoutChanged();
    }
    InitSkinUrl(upSkin, overSkin = "", downSkin = "", disableSkin = "", selectedSkin = "", selectedDisableSkin = "") {
        this.skins = new Array();
        this.skins.push(upSkin);
        this.skins.push(overSkin);
        this.skins.push(downSkin);
        this.skins.push(disableSkin);
        this.skins.push(selectedSkin);
        this.skins.push(selectedDisableSkin);
        if (!this._loadSkins)
            this._loadSkins = [];
        else {
            this.clearLoadSkins();
            this._loadSkins.length = 0;
        }
        let url = "";
        for (let i = 0; i < this.skins.length; i++) {
            url = this.skins[i];
            if (url) {
                if (this._loadSkins.indexOf(url) == -1) {
                    this._loadSkins.push(url);
                    RES.AddReference(url);
                    RES.GetResByUrl(url, this, this.onSkinLoaded, "", url);
                }
            }
        }
    }
    ReloadSkin() {
        if (!this.skins || this.skins.length <= 0)
            return;
        if (this.skins[0].indexOf("/") == -1)
            return;
        let url = "";
        for (let i = 0; i < this.skins.length; i++) {
            url = this.skins[i];
            if (url) {
                RES.GetResByUrl(url, this, this.onSkinLoaded, "", url);
            }
        }
    }
    onSkinLoaded(texture, url) {
        if (this.skins && this.skins.indexOf(url) != -1) {
            this.changeState();
            this.changeLayout();
        }
    }
    set sizeGrid(value) {
        this.background.sizeGrid = value;
    }
    set label(value) {
        this._text = value;
        this.textField.text = value;
    }
    get label() {
        return this._text;
    }
    set labelColors(value) {
        if (value) {
            this._labelColors = value.split(",");
            this.setStateChanged();
        }
    }
    set labelSize(value) {
        this.textField.fontSize = value;
    }
    set labelFont(value) {
        this.textField.font = value;
    }
    set labelWordWrap(value) {
        this.textField.wordWrap = value;
    }
    set labelLeading(value) {
        this.textField.leading = value;
    }
    set labelAlign(value) {
        this.textField.align = value;
    }
    set labelValign(value) {
        this.textField.valign = value;
    }
    set strokeColors(value) {
        if (value) {
            this._strokeColors = value.split(",");
            this.setStateChanged();
        }
    }
    set labelStroke(value) {
        this.textField.stroke = value;
    }
    set labelBold(value) {
        this.textField.bold = value;
    }
    set labelItalic(value) {
        this.textField.italic = value;
    }
    set labelPadding(value) {
        if (value) {
            this._labelPadding = value.split(",");
            this.setLayoutChanged();
        }
    }
    set enabled(value) {
        this._enabled = value;
        this.setStateChanged();
    }
    get enabled() {
        return this._enabled;
    }
    set selected(value) {
        this._selected = value;
        this.setStateChanged();
    }
    get selected() {
        return this._selected;
    }
    on(type, caller, listener, args) {
        if (!this.eventDispatcher)
            this.eventDispatcher = new Laya.EventDispatcher();
        return this.eventDispatcher.on(type, caller, listener, args);
    }
    off(type, caller, listener, onceOnly) {
        if (!this.eventDispatcher)
            return;
        return this.eventDispatcher.off(type, caller, listener, onceOnly);
    }
    dispatcherEvent(type, data) {
        if (!this.eventDispatcher)
            return;
        this.eventDispatcher.event(type, data);
    }
    onMouse(event) {
        if (event.type == Laya.Event.MOUSE_UP)
            this.phase = ButtonPhaseEnum.over;
        else if (event.type == Laya.Event.MOUSE_OVER)
            this.phase = ButtonPhaseEnum.over;
        else if (event.type == Laya.Event.MOUSE_DOWN) {
            this.phase = ButtonPhaseEnum.down;
        }
        else if (event.type == Laya.Event.MOUSE_OUT)
            this.phase = ButtonPhaseEnum.up;
        if (this.enabled && !this.selected) {
            this.setStateChanged();
        }
        if (event.type == Laya.Event.CLICK) {
            if (!this.enabled) {
                return;
            }
            if (this.selected && !this.selectedEnabled) {
                return;
            }
        }
        if (this.eventDispatcher)
            this.eventDispatcher.event(event.type, event);
    }
    setStateChanged() {
        if (!this._stateChanged) {
            this._stateChanged = true;
            Laya.timer.callLater(this, this.changeState);
        }
    }
    changeState() {
        this._stateChanged = false;
        if (!this.skins || this.skins.length < 6)
            return;
        let curSkin = "";
        let textColor = "";
        let strokeColor = "";
        if (!this._enabled) {
            curSkin = this._selected ? this.skins[5] : this.skins[3];
            textColor = this._labelColors[3];
            strokeColor = this._strokeColors[3];
        }
        else if (this._selected) {
            curSkin = this.skins[4];
            textColor = this._labelColors[4];
            strokeColor = this._strokeColors[4];
        }
        else {
            curSkin = this.skins[this.phase];
            textColor = this._labelColors[this.phase];
            strokeColor = this._strokeColors[this.phase];
        }
        if (curSkin == "" || !RES.GetRes(curSkin))
            curSkin = this.skins[0];
        if (!textColor)
            textColor = "#ffffff";
        if (!strokeColor)
            strokeColor = "#000000";
        this.background.texture = RES.GetRes(curSkin);
        this.textField.color = textColor;
        this.textField.strokeColor = strokeColor;
    }
    setLayoutChanged() {
        if (!this._layoutChanged) {
            this._layoutChanged = true;
            Laya.timer.callLater(this, this.changeLayout);
        }
    }
    changeLayout() {
        this._layoutChanged = false;
        let left = parseInt(this._labelPadding[3]);
        let right = parseInt(this._labelPadding[1]);
        let top = parseInt(this._labelPadding[0]);
        let bottom = parseInt(this._labelPadding[2]);
        this.textField.x = left;
        this.textField.y = top;
        this.textField.width = this.width - left - right;
        this.textField.height = this.height - top - bottom;
    }
    ShowRedPoint(res = "TopRedPoint", x = 0, y = 0) {
        if (!this.redPointFlag) {
            let tex = RES.GetRes(res);
            if (!tex)
                return;
            this.redPointFlag = new SgsTexture(tex);
            let redPoint = this.RedPoint;
            if (x)
                redPoint.x = x;
            if (y)
                redPoint.y = y;
            this.redPointFlag.x = redPoint.x;
            this.redPointFlag.y = redPoint.y;
            this.addDrawChild(this.redPointFlag);
        }
        else {
            this.redPointFlag.visible = true;
        }
        this.redPointIsShow = true;
    }
    RemoveRedPoint() {
        if (this.redPointFlag)
            this.redPointFlag.visible = false;
        this.redPointIsShow = false;
    }
    RedPointIsShow() {
        return this.redPointIsShow;
    }
    get RedPoint() {
        return { x: this.width - 14, y: -4 };
    }
    clearLoadSkins() {
        if (this._loadSkins && this._loadSkins.length) {
            this._loadSkins.forEach(url => {
                RES.DelReference(url);
                RES.CancelGetResByUrl(url, this, this.onSkinLoaded);
                RES.ClearResByUrl(url);
            });
            this._loadSkins.length = 0;
        }
    }
    destroy() {
        if (this.eventDispatcher) {
            this.eventDispatcher.offAll();
            this.eventDispatcher = null;
        }
        super.destroy();
        this.clearLoadSkins();
        this._loadSkins = null;
    }
}

//import AnimateManager from "../../../mode/base/AnimateManager";
//import SceneManager from "../../../mode/base/SceneManager";
//import SgsSoundManager from "../../../mode/base/SgsSoundManager";
//import WindowManager from "../../../mode/base/WindowManager";
//import SgsSkeleton from "./SgsSkeleton";
class SgsSkeletonEffect extends SgsSkeleton {
    constructor(temp, mode) {
        super(temp, mode);
        this._isStop = false;
        this.animateUrl = "";
        this.mode = 0;
        this.soundUrl = "";
        this.autoRecoverSelf = false;
        this.loadErrorRecoverSelf = false;
        this.autoClearTemplet = false;
        this.clearTempletFollow = "";
        this.poolSign = "";
        this.clearPoolFollow = "";
        this.poolCount = 0;
        this.delayTime = 0;
    }
    set forceFllowTarget(target) {
        if (this._forceFllowTarget)
            this._forceFllowTarget.off("destroyEvent", this, this.onFollowDestroy);
        this._forceFllowTarget = target;
        if (this._forceFllowTarget)
            this._forceFllowTarget.on("destroyEvent", this, this.onFollowDestroy);
    }
    poolStrategy(poolSign, clearPoolFollow = "", poolCount = 0) {
        this.poolSign = poolSign;
        this.clearPoolFollow = clearPoolFollow;
        this.poolCount = poolCount;
    }
    RecoverPool() {
        if (this.destroyed || this["__InPool"])
            return;
        let pools = Laya.Pool.getPoolBySign(this.poolSign);
        if (this.poolCount <= 0 || !pools || pools.length < this.poolCount) {
            if (this.clearPoolFollow == SgsSkeletonEffect.CLEAR_FOLLOW_SCENE)
                SceneManager.GetInstance().AddRecoverEffectPool(this.poolSign);
            else if (this.clearPoolFollow)
                WindowManager.GetInstance().AddRecoverEffectPool(this.clearPoolFollow, this.poolSign);
            Laya.Pool.recover(this.poolSign, this);
        }
        else {
            this.destroy();
        }
    }
    stop() {
        this._isStop = true;
        this.off(Laya.Event.STOPPED, this, this.onEffectStop);
        super.stop();
    }
    paused() {
        this._isStop = true;
        super.paused();
    }
    resume() {
        this._isStop = false;
        super.resume();
    }
    get AnimateUrl() {
        return this.animateUrl;
    }
    get PlayIndex() {
        return this.nameOrIndex;
    }
    playEffect(url, nameOrIndex = 0, loop = false, mode = 0, playbackRate = 1, soundUrl = "") {
        if (this.destroyed) {
            this.clearEffect();
            return;
        }
        let animateManager = AnimateManager.GetInstane();
        if (this.animateUrl) {
            animateManager.DelReference(this.animateUrl);
            if (url != this.animateUrl) {
                this.clearSkeletonContent();
                if (this.autoClearTemplet)
                    AnimateManager.GetInstane().DestroyAnimate(this.animateUrl);
            }
        }
        this.animateUrl = url;
        if (!this.animateUrl)
            return;
        this.nameOrIndex = nameOrIndex;
        this.playLoop = loop;
        this.mode = mode;
        this._playbackRate = playbackRate;
        this.soundUrl = soundUrl;
        animateManager.AddReference(this.animateUrl);
        if (this.clearTempletFollow == SgsSkeletonEffect.CLEAR_FOLLOW_SCENE)
            SceneManager.GetInstance().AddRecoverTemplet(this.animateUrl);
        else if (this.clearTempletFollow)
            WindowManager.GetInstance().AddRecoverTemplet(this.clearTempletFollow, this.animateUrl);
        this["_pause"] = true;
        this._isStop = false;
        let templet = this.templet;
        if (templet && !templet["_isDestroyed"] && templet["_skBufferUrl"] == url && animateManager.HasTemplet(url)) {
            this.onStartPlay(this.templet, true);
            this.event(SgsSkeletonEffect.LOAD_COMPLETE, templet);
        }
        else {
            this.on(AnimateManager.ANIMATE_LOAD_COMPLETE, this, this.onLoadComplete);
            animateManager.LoadAnimate(url, this);
        }
    }
    presetSlotSkins(val) {
        this.slotSkins = val;
    }
    onLoadComplete(temp) {
        if (!temp)
            return;
        if (typeof (temp) == "string") {
            if (this.animateUrl == temp) {
                this.onLoadError();
                this.event(SgsSkeletonEffect.LOAD_COMPLETE, temp);
            }
            return;
        }
        if (this.animateUrl != temp.name)
            return;
        this.off(AnimateManager.ANIMATE_LOAD_COMPLETE, this, this.onLoadComplete);
        if (this.destroyed) {
            this.clearEffect();
            return;
        }
        this.clearSkeletonContent();
        this.onStartPlay(temp);
        this.event(SgsSkeletonEffect.LOAD_COMPLETE, temp);
    }
    onLoadError() {
        if (this.loadErrorRecoverSelf || (this.autoRecoverSelf && !this.playLoop))
            this.clearEffect();
    }
    onStartPlay(temp, isEqual = false) {
        if (!isEqual || this["_aniMode"] != this.mode)
            this.init(temp, this.mode);
        this.playbackRate(this._playbackRate);
        if (!this.playLoop)
            this.on(Laya.Event.STOPPED, this, this.onEffectStop);
        this.changeSlotSkin();
        if (this.nameOrIndex != -1 && !this._isStop) {
            this.play(this.nameOrIndex, this.playLoop);
            if (this.soundUrl)
                SgsSoundManager.PlaySound(this.soundUrl);
            if (this.delayTime && this.delayHandler)
                Laya.timer.once(this.delayTime, this, this.onDelayHandler);
        }
    }
    changeSlotSkin() {
        if (this.slotSkins && this.slotSkins.length > 0) {
            this.slotSkins.forEach(element => {
                if (element.slotName && element.texture)
                    this.setSlotSkin(element.slotName, element.texture);
            });
        }
    }
    onDelayHandler() {
        if (this.delayHandler) {
            this.delayHandler.run();
            this.delayHandler = null;
        }
    }
    onEffectStop() {
        this.event(SgsSkeletonEffect.PLAY_COMPLETE, this);
        if (this.autoRecoverSelf)
            this.clearEffect();
    }
    onFollowDestroy(target) {
        this.destroy();
    }
    clearSkeletonContent() {
        if (!this.templet || !this.player)
            return;
        this.off(Laya.Event.STOPPED, this, this.onEffectStop);
        super.stop();
        this.removeChildren();
    }
    clearEffect(force = false) {
        if (this.destroyed)
            return;
        Laya.timer.clearAll(this);
        this.offAll();
        this.off(AnimateManager.ANIMATE_LOAD_COMPLETE, this, this.onLoadComplete);
        this.off(Laya.Event.STOPPED, this, this.onEffectStop);
        let parentContainer = this["parentContainer"];
        let otherRenderIndex = this["otherRenderIndex"];
        if (!force && this.poolSign) {
            super.stop();
            if (parentContainer && otherRenderIndex >= 0)
                parentContainer.removeOherChild(otherRenderIndex, this, false);
            else
                this.removeSelf();
        }
        else {
            if (parentContainer && otherRenderIndex >= 0)
                parentContainer.removeOherChild(otherRenderIndex, this, true);
            else
                super.destroy(true);
        }
        this._isStop = false;
        let animateManager = AnimateManager.GetInstane();
        if (this.animateUrl) {
            animateManager.DelReference(this.animateUrl);
            if (this.autoClearTemplet)
                AnimateManager.GetInstane().DestroyAnimate(this.animateUrl);
            this.animateUrl = "";
        }
        if (this._forceFllowTarget) {
            this._forceFllowTarget.off("destroyEvent", this, this.onFollowDestroy);
            this._forceFllowTarget = null;
        }
        this.slotSkins = null;
        this.delayHandler = null;
        if (!force && this.poolSign) {
            this.RecoverPool();
        }
    }
    destroy(destroyChild = true) {
        if (!this.destroyed) {
            this.clearEffect(true);
            if (!this.destroyed)
                super.destroy(true);
        }
    }
}
SgsSkeletonEffect.CLEAR_FOLLOW_SCENE = "clearFollowScene";
SgsSkeletonEffect.LOAD_COMPLETE = "loadComplete";
SgsSkeletonEffect.PLAY_COMPLETE = "playComplete";

//import RES from "../../../res/RES";
//import SgsImage from "./SgsImage";
//import SgsSkeletonEffect from "./SgsSkeletonEffect";
class SgsSkeletonButton extends SgsSkeletonEffect {
    constructor(skUrl, actionName = 0, autoClearTemplet = true, clearTempletFollow = "") {
        super();
        this.skUrl = "";
        this.actionName = 0;
        this.autoClearTemplet = autoClearTemplet;
        this.clearTempletFollow = clearTempletFollow;
        this.skUrl = skUrl;
        this.actionName = actionName;
        this.playEffect(skUrl, actionName, true);
        this.on(Laya.Event.MOUSE_DOWN, this, this.mouseDownHandler);
    }
    ClickArea(x, y, width, height) {
        if (!this.hitArea)
            this.hitArea = new Laya.Rectangle(x, y, width, height);
        else
            this.hitArea.setTo(x, y, width, height);
        this.size(width, height);
    }
    ShowRedPoint(res = "TopRedPoint", xx = 45, yy = 2) {
        if (!this.redIcon) {
            this.redIcon = new SgsImage();
            this.redIcon.source = RES.GetRes(res);
            this.addChild(this.redIcon);
            this.redIcon.pos(xx, yy);
        }
        this.redIcon.visible = true;
    }
    RemoveRedPoint() {
        if (this.redIcon)
            this.redIcon.visible = false;
    }
    mouseDownHandler(event) {
    }
    destroy(destroyChild = true) {
        this.off(Laya.Event.MOUSE_DOWN, this, this.mouseDownHandler);
        this.hitArea = null;
        super.destroy(destroyChild);
    }
}

//import SgsFlatButton from "./SgsFlatButton";
class SgsFlatCheckBox extends SgsFlatButton {
    constructor(otherRenders = null) {
        super(otherRenders);
        this._width = 0;
        this.labelPadding = "0,0,0,5";
    }
    set width(value) {
        this._width = value;
    }
    get width() {
        if (this._width > 0)
            return this._width;
        let left = parseInt(this._labelPadding[3]);
        return this.background.width + left + this.textField.width;
    }
    set height(value) {
    }
    get height() {
        return Math.max(this.background.height, this.textField.height);
    }
    size(width, height) {
    }
    set data(value) {
        this._data = value;
    }
    get data() {
        return this._data;
    }
    initChilds() {
        super.initChilds();
        this.textField.mouseEnabled = true;
        this.textField.align = "left";
        this.textField.valign = "top";
    }
    Draw(render, index = -1) {
        super.Draw(render, index);
        this.textField.on(Laya.Event.MOUSE_UP, this, this.onUp);
        this.textField.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.textField.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
        this.textField.on(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.textField.on(Laya.Event.CLICK, this, this.onClick);
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        this.textField.off(Laya.Event.MOUSE_UP, this, this.onUp);
        this.textField.off(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.textField.off(Laya.Event.MOUSE_DOWN, this, this.onDown);
        this.textField.off(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.textField.off(Laya.Event.CLICK, this, this.onClick);
    }
    set enabled(value) {
        Laya.superSetter(SgsFlatCheckBox, this, "enabled", value);
    }
    get enabled() {
        return Laya.superGetter(SgsFlatCheckBox, this, "enabled");
    }
    set TipTriggerType(value) {
        Laya.superSetter(SgsFlatCheckBox, this, "TipTriggerType", value);
        this.textField.TipTriggerType = value;
    }
    set ToolTip(value) {
        Laya.superSetter(SgsFlatCheckBox, this, "ToolTip", value);
        this.textField.ToolTip = value;
    }
    get ToolTip() {
        return Laya.superGetter(SgsFlatCheckBox, this, "ToolTip");
    }
    onClick(event) {
        super.onClick(event);
        if (!this.enabled)
            return;
        this.dispEventChange(event);
    }
    dispEventChange(event) {
        this.selected = !this.selected;
        this.event(Laya.Event.CHANGE, this);
    }
    changeLayout() {
        this._layoutChanged = false;
        let left = parseInt(this._labelPadding[3]);
        let top = parseInt(this._labelPadding[0]);
        this.textField.x = this.background.width + left;
        if (this.background.height >= this.textField.height) {
            this.background.y = 0;
            this.textField.y = top + (this.background.height - this.textField.height >> 1);
        }
        else {
            this.textField.y = 0;
            this.background.y = top + (this.textField.height - this.background.height >> 1);
        }
    }
}

//import SgsSpriteButton from "./SgsSpriteButton";
//import FontName from "../../../enum/FontName";
class ComboboxRenderItem extends SgsSpriteButton {
    constructor() {
        super();
        this.height = 26;
        this.labelSize = 14;
        this.labelFont = FontName.ST;
        this.labelColors = "#FAEDD9,#FAEDD9,#FAEDD9,gray";
        this.labelAlign = "left";
        this.labelPadding = "0,3,0,3";
        this.InitSkin('EmptyImg', "ComboBoxItemOver", "ComboBoxItemOver");
    }
    set dataSource(obj) {
        if (obj) {
            this.width = this.parent.parent.width;
            this.label = obj.label;
        }
        else {
            this.label = "";
        }
    }
}

//import RES from "../res/RES";
//import AESUtils from "./AESUtils";
class Crypt extends AESUtils {
    constructor() {
        super();
    }
    static GetInstance() {
        return new Crypt();
    }
    static get IsWasmCrypt() {
        return false;
    }
    static SwitchCryptRes(groupName) {
        let item = RES.GetResourceItem(groupName);
        if (!item)
            return;
        let repl = this.IsWasmCrypt ? ".sgs" : "_a.sgs";
        if (item.type != "arraybuffer") {
            item.type = "arraybuffer";
            item.url = item.url.replace(".json", repl);
        }
        else {
            item.url = item.url.replace(".sgs", repl);
        }
    }
}

//import ManagerBase from "./ManagerBase";
//import ToolTips from "../../ui/tooltip/ToolTips";
//import TipsEvent from "../../event/TipsEvent";
//import EventExpand from "../../event/EventExpand";
//import GameEventDispatcher from "../../event/GameEventDispatcher";
//import SceneManager from "./SceneManager";
//import PromptLayer from "../../ui/layer/PromptLayer";
//import SgsTexture from "../../ui/controls/base/SgsTexture";
//import SgsText from "../../ui/controls/base/SgsText";
//import SystemContext from "../../SystemContext";
class TipsManager extends ManagerBase {
    constructor() {
        super();
        this.viewArr = [];
    }
    static GetInstance() {
        if (!this.instance)
            this.instance = new TipsManager();
        return this.instance;
    }
    RegisterTips(val, triggerType, caller) {
        let eventType = "";
        if (triggerType == "" || triggerType == TipsManager.CLICK_TRIGGER)
            eventType = Laya.Event.CLICK;
        else
            eventType = EventExpand.LONG_DOWN;
        if (val) {
            caller.on(eventType, this, this.onOverHandler);
        }
        else {
            caller.off(eventType, this, this.onOverHandler);
            TipsManager.GetInstance().HideTargetTips(caller);
        }
    }
    onOverHandler(event) {
        let tipsEvent = TipsEvent.create(event instanceof Laya.Event ? event.currentTarget : event);
        TipsManager.GetInstance().onDelayShowTip(tipsEvent);
    }
    get CurrentTip() {
        return this.currentTip;
    }
    get CurrentTarget() {
        if (this.curTipsEvent)
            return this.curTipsEvent.target;
        return null;
    }
    HideTargetTips(target) {
        if (!target)
            return;
        if (this.curTipsEvent && target == this.curTipsEvent.target)
            this.TipsHide();
        else if (this.delayEvent && target == this.delayEvent.target)
            this.stopDelayTips();
    }
    AddEventListener() {
        super.AddEventListener();
        GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_OVER_EVENT, this, this.onDelayShowTip);
        GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_OUT_EVENT, this, this.onHideTip);
        GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_SIZE_CHNAGED_EVENT, this, this.onTipsSizeChanged);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageDown);
    }
    RemoveEventListener() {
        super.RemoveEventListener();
    }
    onDelayShowTip(event) {
        this.stopDelayTips();
        let now = new Date().getTime();
        if (now - this.tipsHideTime < 500 && !(SceneManager.GetInstance().IsGameScene))
            this.tipsShow(event);
        else {
            this.TipsHide();
            this.delayEvent = event;
            Laya.timer.once(500, this, this.tipsShow, [event]);
        }
    }
    onHideTip(target) {
        if (target == this.CurrentTarget)
            this.TipsHide();
        else if (this.delayEvent && target == this.delayEvent.target)
            this.stopDelayTips();
    }
    tipsShow(event) {
        this.TipsHide();
        this.delayEvent = null;
        this.curTipsEvent = event;
        if (this.curTipsEvent.target && this.curTipsEvent.target.ToolTip) {
            if (this.curTipsEvent.target.ToolTip instanceof Function) {
                this.currentTip = this.curTipsEvent.target.ToolTip.apply();
                if (this.currentTip instanceof Laya.Sprite) {
                    if (this.viewArr.indexOf(this.currentTip) < 0)
                        this.viewArr.push(this.currentTip);
                    PromptLayer.GetInstance().addChild(this.currentTip);
                }
                else {
                    console.log("tips没有正确返回");
                    return;
                }
            }
            else if (typeof this.curTipsEvent.target.ToolTip == "string") {
                if (!this.toolTips)
                    this.toolTips = new ToolTips();
                PromptLayer.GetInstance().addChild(this.toolTips);
                this.toolTips.showMsg(this.curTipsEvent.target.ToolTip);
                this.currentTip = this.toolTips;
            }
            else {
                console.log("tips没有正确返回");
                return;
            }
            this.resetPos(this.currentTip);
        }
    }
    resetPosMove(tip) {
        if (!tip || !this.curTipsEvent || !this.curTipsEvent.target)
            return;
        if (!tip.needAutoPos)
            return;
        let xx = 0;
        let yy = 0;
        let p;
        if (this.curTipsEvent.target instanceof Laya.Sprite)
            p = this.curTipsEvent.target.localToGlobal(new Laya.Point(0, 0));
        else if (this.curTipsEvent.target instanceof SgsTexture || this.curTipsEvent.target instanceof SgsText)
            p = (this.curTipsEvent.target).globalPoint;
        else
            return;
        p = PromptLayer.GetInstance().globalToLocal(p);
        xx = p.x - tip.showWidth + (this.curTipsEvent.target.width >> 1);
        yy = p.y - tip.showHeight - 10;
        if (xx < 0)
            xx = p.x + (this.curTipsEvent.target.width >> 1);
        if (xx + tip.showWidth >= SystemContext.gameWidth - 10)
            xx = SystemContext.gameWidth - tip.showWidth - 10;
        if (yy < 0)
            yy = p.y + this.curTipsEvent.target.height + 10;
        if (yy + tip.showHeight >= SystemContext.gameHeight - 10)
            yy = SystemContext.gameHeight - tip.showHeight - 10;
        tip.x = xx;
        tip.y = yy;
    }
    resetPos(tip) {
        if (!tip || !this.curTipsEvent)
            return;
        if (this.curTipsEvent.follow) {
            let p = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            p = PromptLayer.GetInstance().globalToLocal(p);
            let xx = p.x;
            let yy = p.y;
            if (xx - tip.showWidth > 0)
                xx -= tip.showWidth;
            if (yy + tip.showHeight > SystemContext.gameHeight)
                yy -= tip.showHeight;
            tip.x = xx;
            tip.y = yy;
        }
        else {
            this.resetPosMove(tip);
        }
    }
    stopDelayTips() {
        Laya.timer.clear(this, this.tipsShow);
        if (this.delayEvent) {
            this.delayEvent.recover();
            this.delayEvent = null;
        }
    }
    TipsHide() {
        Laya.timer.clearAll(this);
        this.currentTip = null;
        if (this.toolTips && this.toolTips.parent) {
            this.toolTips.removeSelf();
        }
        this.viewArr.forEach(tip => {
            tip.removeSelf();
            tip.destroy();
        });
        this.viewArr.splice(0);
        if (this.curTipsEvent) {
            this.curTipsEvent.recover();
            this.curTipsEvent = null;
        }
        this.tipsHideTime = new Date().getTime();
    }
    onTipsSizeChanged(tips) {
        if (tips)
            this.resetPos(tips);
    }
    onStageDown(event) {
        this.stopDelayTips();
        if (this.currentTip)
            this.TipsHide();
    }
}
TipsManager.LONG_DOWN_TRIGGER = "longDownTrigger";
TipsManager.CLICK_TRIGGER = "clickTrigger";

//import Global from "../Global";
//import ConfigerBase from "./ConfigerBase";
class GlobalConfiger extends ConfigerBase {
    constructor() {
        super("GlobalConfig_json");
    }
    static GetInstance() {
        if (GlobalConfiger.instance == null)
            GlobalConfiger.instance = new GlobalConfiger();
        if (GlobalConfiger.instance.data)
            GlobalConfiger.instance.ParseConfig(GlobalConfiger.instance.data);
        return GlobalConfiger.instance;
    }
    ParseConfig(data) {
        data = super.ParseConfig(data);
        if (!data)
            return;
        Global.Init(data.ClientGlobalConf[0]);
    }
}

//import DressType from "../enum/DressType";
//import Global from "../Global";
//import RES from "../res/RES";
//import Dictionary from "../utils/Dictionary";
//import ObjUtil from "../utils/ObjUtil";
//import DressPartVO from "../vo/DressPartVO";
//import DressVO from "../vo/DressVO";
//import ConfigerBase from "./ConfigerBase";
class DressConfiger extends ConfigerBase {
    constructor() {
        super("DressConfig_json");
        this.dressDic = new Dictionary();
        this.dressByTypeDic = new Dictionary();
        this.dressPartDic = new Dictionary();
        this.dressTypeTabs = [];
    }
    static GetInstance() {
        if (DressConfiger.instance == null)
            DressConfiger.instance = new DressConfiger();
        if (DressConfiger.instance.data)
            DressConfiger.instance.ParseConfig(DressConfiger.instance.data);
        return DressConfiger.instance;
    }
    get DressDic() {
        return this.dressDic;
    }
    get DressPartDic() {
        return this.dressPartDic;
    }
    get DressTypeTabs() {
        return this.dressTypeTabs;
    }
    GetDressByDressID(dressID) {
        if (this.dressDic && this.dressDic.has(dressID))
            return this.dressDic.getNumberKey(dressID);
        return null;
    }
    GetDresssByDressType(dressType) {
        if (this.dressByTypeDic && this.dressByTypeDic.has(dressType))
            return this.dressByTypeDic.getNumberKey(dressType);
        return null;
    }
    GetDressPartByPartID(partID) {
        if (this.dressPartDic && this.dressPartDic.has(partID))
            return this.dressPartDic.getNumberKey(partID);
        return null;
    }
    GetDresPartsByDressID(dressID) {
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
    GetDressPartTempGroup(dressIDs) {
        RES.DelGroupKeys("dressPartTemp");
        if (dressIDs && dressIDs.length > 0) {
            let dressConfig = DressConfiger.GetInstance();
            let dressVo;
            let dressParts;
            let resources = [];
            let keys = [];
            let resourceUrl = "";
            dressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo) {
                    dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
                    if (dressParts && dressParts.length > 0) {
                        dressParts.forEach(element => {
                            resourceUrl = element.ResourceUrl;
                            if (resourceUrl) {
                                resources.push({ "url": resourceUrl, "type": "image", "name": "runtime_dressPart_image" + element.Resource });
                                keys.push("runtime_dressPart_image" + element.Resource);
                            }
                        });
                    }
                }
            });
            if (resources.length > 0) {
                RES.AddResources(resources);
                RES.AddGroupKeys("dressPartTemp", keys);
                return true;
            }
        }
        return false;
    }
    get DefaultDressIDs() {
        return Global.DefaultDressIDs;
    }
    GetDefaultDressIDByType(dressType) {
        let defaultDressIDs = this.DefaultDressIDs;
        if (!defaultDressIDs || defaultDressIDs.length <= 0)
            return 0;
        if (!this.defaultDressIDDic) {
            this.defaultDressIDDic = new Dictionary();
            let dressVo;
            defaultDressIDs.forEach(dressID => {
                dressVo = this.GetDressByDressID(dressID);
                if (dressVo)
                    this.defaultDressIDDic.addNumberKey(dressVo.DressType, dressID);
            });
        }
        if (this.defaultDressIDDic.has(dressType))
            return this.defaultDressIDDic.getNumberKey(dressType);
        return 0;
    }
    GetDefaultDressVoByType(dressType) {
        let dressID = this.GetDefaultDressIDByType(dressType);
        return this.GetDressByDressID(dressID);
    }
    get DefaultDressPartResources() {
        let defaultDressIDs = this.DefaultDressIDs;
        if (defaultDressIDs && defaultDressIDs.length > 0) {
            let dressConfig = DressConfiger.GetInstance();
            let dressVo;
            let dressParts;
            let resources = [];
            let resourceUrl = "";
            defaultDressIDs.forEach(dressID => {
                dressVo = dressConfig.GetDressByDressID(dressID);
                if (dressVo) {
                    dressParts = dressConfig.GetDresPartsByDressID(dressVo.DressID);
                    if (dressParts && dressParts.length > 0) {
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
    ParseConfig(data) {
        data = super.ParseConfig(data);
        if (!data)
            return;
        let dressConf = data.DressConf;
        if (dressConf) {
            let saveedTypes = [];
            let vo;
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
            let vo;
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

//import FontName from "../../enum/FontName";
//import GameManager from "../../mode/gameManager/GameManager";
//import UIUtils from "../../utils/UIUtils";
//import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
//import SgsText from "../controls/base/SgsText";
//import CommonBaseWindow from "./CommonBaseWindow";
class SharePromptWindow extends CommonBaseWindow {
    constructor() {
        super();
        this.modal = true;
        this.width = 670;
        this.addDrawClick();
    }
    init() {
        super.init();
        this.okBtn = UIUtils.CreateImageFlatButton("baseOkBtn", "baseTextOK");
        this.okBtn.pos(197, 349);
        this.okBtn.on(Laya.Event.CLICK, this, this.onOkHandler);
        this.addDrawChild(this.okBtn);
        this.titleText = new SgsText();
        this.titleText.y = 79;
        this.titleText.width = this.width;
        this.titleText.font = FontName.HEITI;
        this.titleText.fontSize = 40;
        this.titleText.bold = true;
        this.titleText.color = "#80B6A7";
        this.titleText.align = "center";
        this.titleText.text = "分享有礼";
        this.addDrawChild(this.titleText);
        this.descText = new SgsHTMLDivElement();
        this.descText.pos(70, 195);
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 26;
        this.descText.color = "#80B6A7";
        this.descText.leading = 24;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.descText.innerHTML = '主人，点击右上角&nbsp;<img style="height:28px;width:66px" src=' + '"' + 'res/assets/shareIcon.png"/>&nbsp;按钮可分享该活动 给您的好友，每日您将额外<font color="#FE8555">获得3个桃气值</font>哦~';
        this.addChild(this.descText);
    }
    enterWindow(okHandler, cancelHandler) {
        super.enterWindow();
        this.okHandler = okHandler;
        this.cancelHandler = cancelHandler;
        let height = this.descText.y + this.descText.contextHeight + 258 - 24;
        if (height < 528)
            height = 528;
        this.size(this.width, height);
        this.okBtn.y = this.height - this.okBtn.height - 76;
    }
    onOkHandler() {
        GameManager.GetInstance().CollocationShare();
        if (this.okHandler) {
            this.okHandler.run();
            this.okHandler = null;
        }
        this.Close();
    }
    onCloseHandler() {
        if (this.cancelHandler) {
            this.cancelHandler.run();
            this.cancelHandler = null;
        }
        this.Close();
    }
    destroy() {
        super.destroy();
        this.okHandler = null;
    }
}

//import FontName from "../../enum/FontName";
//import RES from "../../res/RES";
//import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
//import SgsText from "../controls/base/SgsText";
//import CommonBaseWindow from "./CommonBaseWindow";
//import RuleItemUI from "./RuleItemUI";
class RuleWindow extends CommonBaseWindow {
    constructor() {
        super();
        this.descY = 0;
        this.modal = true;
        this.size(670, 900);
        this.addDrawClick();
    }
    init() {
        super.init();
        this.titleText = new SgsText();
        this.titleText.y = 79;
        this.titleText.width = this.width;
        this.titleText.font = FontName.HEITI;
        this.titleText.fontSize = 40;
        this.titleText.bold = true;
        this.titleText.color = "#80B6A7";
        this.titleText.align = "center";
        this.titleText.text = "【皮肤梦工厂】活动规则";
        this.addDrawChild(this.titleText);
        this.panel = new Laya.Panel();
        this.panel.pos(55, 150);
        this.panel.size(583, 690);
        this.panel.vScrollBarSkin = RES.GetAtlasUrl("blueVscroll");
        this.addChild(this.panel);
        this.createTitleUI(this.descY, "【活动规则】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY, "①", "玩家在创玩节期间共创魏阵营武将李婉皮肤，打造属于您心目中的最美样貌，<font color='#ff0000'>每个用户只能选择一个作品参赛</font>，一经选定确认后无法修改哦。");
        this.createItemUI(this.descY, "②", "用户可通过游戏进行服装搭配并参赛投票，获得最高票数的搭配，<font color='#ff0000'>将会被官方采用制作李婉皮肤。</font>");
        this.createItemUI(this.descY, "③", "用户在排行榜可使用桃气值进行投票，可以进行自投，<font color='#ff0000'>投票次数无限制。</font>");
        this.createItemUI(this.descY, "④", "投票时间和截止时间：详见网页活动时间。");
        this.descY = this.descY + 10;
        this.createTitleUI(this.descY, "【桃气值】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY, "①", "用户每天登录游戏即可获得<font color='#ff0000'>5</font>个桃气值。");
        this.createItemUI(this.descY, "②", "用户每天分享本活动可多获得<font color='#ff0000'>3</font>个桃气值。");
        this.createItemUI(this.descY, "③", "桃气值不会每日清空，请在活动截止前使用您的桃气值。");
        this.createItemUI(this.descY, "④", "每名玩家每天最多获得<font color='#ff0000'>6</font>个桃气值</font>");
        this.descY = this.descY + 10;
        this.createTitleUI(this.descY, "【活动奖励】：");
        this.descY = this.descY + 23;
        this.createItemUI(this.descY, "①", "排行榜前20的玩家可获得<font color='#ff0000'>李婉武将*1。</font>");
        this.createItemUI(this.descY, "②", "排行榜前21-50的玩家可获得<font color='#ff0000'>豪华皮肤包*1。</font>");
        this.createItemUI(this.descY, "③", "排行榜51-100的玩家可获得<font color='#ff0000'>精致皮肤包*1。</font>");
    }
    createTitleUI(y, desc) {
        let descText = new SgsHTMLDivElement();
        descText.y = y;
        descText.width = 542;
        descText.fontFamily = FontName.HEITI;
        descText.fontSize = 28;
        descText.color = "#80B6A7";
        descText.wordWrap = true;
        descText.mouseEnabled = false;
        descText.innerHTML = desc;
        this.panel.addChild(descText);
        descText.height = descText.contextHeight;
        this.descY = this.descY + descText.contextHeight;
        return descText;
    }
    createItemUI(y, code, desc) {
        let ruleItemUI = new RuleItemUI();
        ruleItemUI.pos(12, y);
        ruleItemUI.SetDesc(542, code, desc);
        this.panel.addChild(ruleItemUI);
        this.descY = this.descY + ruleItemUI.height + 23;
        return ruleItemUI;
    }
}

//import FontName from "../../enum/FontName";
//import UIUtils from "../../utils/UIUtils";
//import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
//import SgsText from "../controls/base/SgsText";
//import CommonBaseWindow from "./CommonBaseWindow";
class PromptWindow extends CommonBaseWindow {
    constructor() {
        super();
        this.btnType = "";
        this.modal = true;
        this.width = 670;
        this.addDrawClick();
    }
    init() {
        super.init();
        this.titleText = new SgsText();
        this.titleText.y = 79;
        this.titleText.width = this.width;
        this.titleText.font = FontName.HEITI;
        this.titleText.fontSize = 40;
        this.titleText.bold = true;
        this.titleText.color = "#80B6A7";
        this.titleText.align = "center";
        this.addDrawChild(this.titleText);
        this.descText = new SgsHTMLDivElement();
        this.descText.y = 195;
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.fontFamily = FontName.HEITI;
        this.descText.fontSize = 26;
        this.descText.color = "#80B6A7";
        this.descText.align = "center";
        this.descText.leading = 24;
        this.descText.wordWrap = true;
        this.descText.mouseEnabled = false;
        this.addChild(this.descText);
    }
    enterWindow(title, desc, descPaddingLeft, okHandler, cancelHandler, btnType) {
        super.enterWindow();
        this.okHandler = okHandler;
        this.cancelHandler = cancelHandler;
        this.btnType = btnType;
        this.titleText.text = title || "提示";
        this.descText.x = descPaddingLeft || 140;
        this.descText.width = this.width - this.descText.x * 2;
        this.descText.innerHTML = desc;
        let height = this.descText.y + this.descText.contextHeight + 258 - 24;
        if (height < 528)
            height = 528;
        this.size(this.width, height);
        if (btnType == PromptWindow.BTN_TYPE1) {
            this.createButton(46, "baseCancelBtn", "baseTextCancel", cancelHandler);
            this.createButton(349, "baseOkBtn", "baseTextOK", okHandler);
        }
        else if (btnType == PromptWindow.BTN_TYPE2) {
            this.createButton(196, "baseOkBtn", "baseTextOK", okHandler);
        }
        else if (btnType == PromptWindow.BTN_TYPE3) {
            this.createButton(46, "baseOkBtn", "baseTextOK", cancelHandler);
            this.createButton(349, "baseCancelBtn", "baseTextShare", okHandler);
        }
    }
    createButton(x, bgRes, textRes, handler) {
        let btn = UIUtils.CreateImageFlatButton(bgRes, textRes);
        btn.pos(x, this.height - btn.height - 76);
        btn.on(Laya.Event.CLICK, this, this.onButtonHandler, [handler]);
        let index = this.closeBtn.endIndex;
        if (index >= 0)
            this.addDrawChildAt(btn, index + 1);
        else
            this.addDrawChild(btn);
        return btn;
    }
    onButtonHandler(handler) {
        if (handler) {
            handler.run();
            handler = null;
        }
        this.Close();
    }
    onCloseHandler() {
        if (this.cancelHandler) {
            this.cancelHandler.run();
            this.cancelHandler = null;
        }
        this.Close();
    }
    destroy() {
        super.destroy();
        this.okHandler = null;
        this.cancelHandler = null;
    }
}
PromptWindow.BTN_TYPE1 = "BTN_TYPE1";
PromptWindow.BTN_TYPE2 = "BTN_TYPE2";
PromptWindow.BTN_TYPE3 = "BTN_TYPE3";

//import RES from "../../res/RES";
//import SgsSpriteButton from "../controls/base/SgsSpriteButton";
//import SgsTexture from "../controls/base/SgsTexture";
class ImageSpriteButton extends SgsSpriteButton {
    constructor() {
        super();
    }
    createChildren() {
        super.createChildren();
        if (!this.textFlag) {
            this.textFlag = new SgsTexture();
            this.addDrawChild(this.textFlag);
        }
    }
    InitTextSkin(res) {
        this.textFlag.texture = RES.GetRes(res);
        this.setLayoutChanged();
    }
    changeLayout() {
        super.changeLayout();
        this.textFlag.pos(this.width - this.textFlag.width >> 1, this.height - this.textFlag.height >> 1);
    }
}

//import ToolTipBase from "./ToolTipBase";
//import RES from "./../../res/RES";
//import FontName from "./../../enum/FontName";
//import SgsHTMLDivElement from "../controls/base/SgsHTMLDivElement";
//import SgsTexture from "../controls/base/SgsTexture";
class ToolTips extends ToolTipBase {
    constructor() {
        super();
        this.bg = new SgsTexture(RES.GetRes("toolTipBg"));
        this.bg.sizeGrid = "11,11,11,11";
        this.bg.mouseEnabled = false;
        this.addDrawChild(this.bg);
        this.msg = new SgsHTMLDivElement();
        this.msg.width = 236;
        this.msg.fontFamily = FontName.ST;
        this.msg.fontSize = 16;
        this.msg.color = "#ffffff";
        this.msg.leading = 8;
        this.msg.wordWrap = true;
        this.msg.mouseEnabled = false;
        this.msg.x = 10;
        this.msg.y = 10;
        this.addChild(this.msg);
    }
    showMsg(str) {
        if (str) {
            this.msg.innerHTML = str;
            this.bg.size(this.msg.contextWidth + 20, this.msg.contextHeight - 8 + 20);
            this.size(this.bg.width, this.bg.height);
        }
        else {
            this.msg.innerHTML = "";
        }
    }
}

//import FontName from "../../enum/FontName";
//import WindowManager from "../../mode/base/WindowManager";
//import GameManager from "../../mode/gameManager/GameManager";
//import RES from "../../res/RES";
//import UIUtils from "../../utils/UIUtils";
//import SgsFlatButton from "../controls/base/SgsFlatButton";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsFlatPanelItemBase from "../controls/SgsFlatPanelItemBase";
//import DressAvatar from "../dressScene/DressAvatar";
class MyDressItemUI extends SgsFlatPanelItemBase {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.size(329, 355);
    }
    init() {
        this.bottomBg = new SgsTexture();
        this.bottomBg.y = 16;
        this.addDrawChild(this.bottomBg);
        this.silhouette = new SgsTexture(RES.GetRes("myDressItemSilhouette"));
        this.silhouette.pos(51, 30);
        this.addDrawChild(this.silhouette);
        this.avatarSp = new Laya.Sprite();
        this.oherChildPos(this.avatarSp, 51, 20);
        this.avatarSp.size(235, 268);
        this.avatarSp.scrollRect = new Laya.Rectangle(0, 0, 235, 268);
        this.addOtherChild(0, this.avatarSp);
        this.avatar = new DressAvatar();
        this.avatar.pos(-15, 8);
        this.avatar.scale(0.58, 0.58);
        this.avatar.on(DressAvatar.LOAD_COMPLETE, this, this.onAvatarLoadComplete);
        this.avatarSp.addChild(this.avatar);
        this.topBg = new SgsTexture();
        this.topBg.x = 9;
        this.addOtherChild(1, this.topBg);
        this.avatarBtn = new SgsFlatButton();
        this.avatarBtn.pos(51, 20);
        this.avatarBtn.size(235, 268);
        this.avatarBtn.on(Laya.Event.CLICK, this, this.onAvatarHandler);
        this.addOtherChild(1, this.avatarBtn);
        this.btn = new SgsFlatButton();
        this.btn.pos(75, 298);
        this.btn.on(Laya.Event.CLICK, this, this.onButtonHandler);
        this.addOtherChild(1, this.btn);
    }
    updateRenderer(rendererData) {
        this.itemData = rendererData;
        this.silhouette.visible = true;
        this.avatar.visible = false;
        this.avatar.UpdateAll(this.itemData.skin, this.itemData.collocation);
        if (this.itemData.is_join) {
            this.bottomBg.texture = RES.GetRes("myDressItemBottomBg1");
            this.topBg.texture = RES.GetRes("myDressItemTopBg1");
            this.updateVoteFlag(true);
            this.btn.InitSkin("myDressLookBtn1");
        }
        else {
            this.bottomBg.texture = RES.GetRes("myDressItemBottomBg");
            this.topBg.texture = RES.GetRes("myDressItemTopBg");
            this.updateVoteFlag(false);
            this.btn.InitSkin("myDressLookBtn");
        }
        if (!GameManager.GetInstance().Code) {
            this.btn.InitSkin("myDressEntryBtn");
        }
        this.updateCode(!this.itemData.is_join, this.itemData.number);
    }
    updateCode(isShow, code = 0) {
        if (isShow) {
            if (!this.codeBg) {
                this.codeBg = new SgsTexture(RES.GetRes("myDressCodeBg"));
                this.codeBg.pos(60, 34);
                this.addOtherChild(1, this.codeBg);
                this.codeText = new SgsText();
                this.codeText.pos(this.codeBg.x, this.codeBg.y);
                this.codeText.size(52, 53);
                this.codeText.font = FontName.HEITI;
                this.codeText.color = "#ffffff";
                this.codeText.fontSize = 24;
                this.codeText.align = "center";
                this.codeText.valign = "middle";
                this.addOtherChild(2, this.codeText);
            }
            let str = code.toString();
            if (str.length <= 1)
                str = "0" + str;
            this.codeText.text = str;
            this.codeBg.visible = this.codeText.visible = true;
        }
        else {
            if (this.codeBg)
                this.codeBg.visible = this.codeText.visible = false;
        }
    }
    updateVoteFlag(isShow) {
        if (isShow) {
            if (!this.voteFlag) {
                this.voteFlag = new SgsTexture(RES.GetRes("myDressVoteFlag"));
                this.voteFlag.pos(66, 35);
                this.addOtherChild(1, this.voteFlag);
            }
            this.voteFlag.visible = true;
        }
        else {
            if (this.voteFlag)
                this.voteFlag.visible = false;
        }
    }
    onAvatarLoadComplete() {
        this.silhouette.visible = false;
        this.avatar.visible = true;
    }
    onAvatarHandler() {
        if (!this.itemData)
            return;
        WindowManager.GetInstance().OpenWindow("LookDressWindow", this.itemData.skin, this.itemData.collocation);
    }
    onButtonHandler() {
        if (!this.itemData)
            return;
        if (!GameManager.GetInstance().Code) {
            UIUtils.OpenPromptWin("", "*主人，我们只有一次参赛机会哦！<br/>您是否选择此作品参赛？", 100, Laya.Handler.create(this, this.onConfirmCompete));
        }
        else if (this.itemData.is_join) {
            WindowManager.GetInstance().OpenWindow("VoteWorkInfoWindow", true);
        }
        else {
            WindowManager.GetInstance().OpenWindow("LookDressWindow", this.itemData.skin, this.itemData.collocation);
        }
    }
    onConfirmCompete() {
        if (!this.itemData)
            return;
        GameManager.GetInstance().CollocationJoin(this.itemData.id);
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        if (destroy) {
            this.itemData = null;
        }
    }
}

//import RES from "../../res/RES";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsTabFlatButton from "../controls/SgsTabFlatButton";
class DressTabFlatButton extends SgsTabFlatButton {
    constructor() {
        super();
        this.size(160, 75);
    }
    init() {
        super.InitSkin("dressTabButtonNormal", "dressTabButtonNormal", "dressTabButtonNormal", "dressTabButtonNormal", "dressTabButtonSelect");
    }
    set value(val) {
        this._value = val;
        this.changeState();
    }
    get value() {
        return this._value;
    }
    changeState() {
        super.changeState();
        if (!this.textFlag) {
            this.textFlag = new SgsTexture();
            this.addDrawChild(this.textFlag);
        }
        if (!this._enabled) {
        }
        else if (this._selected) {
            this.textFlag.texture = RES.GetRes("dressTabText" + this._value + "_select");
        }
        else {
            this.textFlag.texture = RES.GetRes("dressTabText" + this._value);
        }
        this.textFlag.pos(this.width - this.textFlag.width >> 1, this.height - this.textFlag.height >> 1);
    }
}

//import Global from "../../Global";
//import RES from "../../res/RES";
//import SgsFlatImage from "../controls/base/SgsFlatImage";
//import SgsTexture from "../controls/base/SgsTexture";
//import SgsFlatPanelItemBase from "../controls/SgsFlatPanelItemBase";
class DressPanelFlatItem extends SgsFlatPanelItemBase {
    constructor(otherRender) {
        super(otherRender);
        this.size(132, 132);
    }
    init() {
        super.init();
        this.bg = new SgsTexture();
        this.bg.mouseEnabled = true;
        this.bg.on(Laya.Event.CLICK, this, this.onClick);
        this.addDrawChild(this.bg);
        this.icon = new SgsFlatImage();
        this.icon.autoClear = Global.AutoClearRes;
        this.icon.onlyDestroyClear = true;
        this.addOtherChild(0, this.icon);
    }
    updateRenderer(rendererData) {
        super.updateRenderer(rendererData);
        this.dressVo = rendererData;
        if (this.dressVo.DressID == 0) {
            this.bg.texture = RES.GetRes("dressRest");
            this.icon.skin = "";
        }
        else {
            this.bg.texture = RES.GetRes("dressSelectBg");
            this.icon.skin = this.dressVo.ResourceUrl;
        }
    }
    onClick() {
        this.event(Laya.Event.CLICK, this);
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        if (destroy) {
            this.dressVo = null;
        }
    }
}

//import RES from "../../res/RES";
//import SgsTabFlatButton from "../controls/SgsTabFlatButton";
class DressColorTabFlatButton extends SgsTabFlatButton {
    constructor() {
        super();
        this.size(116, 84);
    }
    set value(val) {
        this._value = val;
        this.changeState();
    }
    get value() {
        return this._value;
    }
    changeState() {
        super.changeState();
        if (!this._enabled) {
        }
        else if (this._selected) {
            this.background.texture = RES.GetRes("dressSkinBtn" + this._value + "_select");
        }
        else {
            this.background.texture = RES.GetRes("dressSkinBtn" + this._value);
        }
    }
}

//import FontName from "./../../enum/FontName";
//import SgsSpriteButton from "./base/SgsSpriteButton";
class SgsTabButton extends SgsSpriteButton {
    constructor() {
        super();
        this._value = 0;
        this.enableTip = "";
    }
    set value(val) {
        this._value = val;
    }
    get value() {
        return this._value;
    }
    get EnableTip() {
        return this.enableTip;
    }
    set EnableTip(value) {
        this.enableTip = value;
    }
    init(...arg) {
        if (arg && arg.length)
            this.InitSkin(arg[0], arg.length > 1 && arg[1] ? arg[1] : "", arg.length > 2 && arg[2] ? arg[2] : "", arg.length > 3 && arg[3] ? arg[3] : "", arg.length > 4 && arg[4] ? arg[4] : "");
        else
            this.InitSkin("tabButtonGeneral_Normal", "tabButtonGeneral_Overt", "tabButtonGeneral_Overt", "tabButtonGeneral_Overt", "tabButtonGeneral_Select");
        this.labelFont = FontName.ST;
        this.labelSize = 16;
        this.labelColors = "#291400,#291400,#291400";
    }
    destroy() {
        super.destroy();
    }
}

//import SgsSpriteButton from "./SgsSpriteButton";
class SgsSpriteCheckBox extends SgsSpriteButton {
    constructor() {
        super();
        this.labelPadding = "0,0,0,5";
    }
    set width(value) {
    }
    get width() {
        let left = parseInt(this._labelPadding[3]);
        return this.background.width + left + this.textField.width;
    }
    set height(value) {
    }
    get height() {
        return Math.max(this.background.height, this.textField.height);
    }
    set data(value) {
        this._data = value;
    }
    get data() {
        return this._data;
    }
    createChildren() {
        super.createChildren();
        this.textField.align = "left";
        this.textField.valign = "top";
    }
    onMouse(event) {
        super.onMouse(event);
        if (this.enabled && event.type == Laya.Event.CLICK) {
            this.dispEventChange(event);
        }
    }
    dispEventChange(event) {
        this.selected = !this.selected;
        event.type = Laya.Event.CHANGE;
        if (this.eventDispatcher)
            this.eventDispatcher.event(Laya.Event.CHANGE, event);
    }
    changeLayout() {
        this._layoutChanged = false;
        let left = parseInt(this._labelPadding[3]);
        let top = parseInt(this._labelPadding[0]);
        this.textField.x = this.background.width + left;
        if (this.background.height >= this.textField.height) {
            this.background.y = 0;
            this.textField.y = top + (this.background.height - this.textField.height >> 1);
        }
        else {
            this.textField.y = 0;
            this.background.y = top + (this.textField.height - this.background.height >> 1);
        }
    }
}

//import SgsFlatCheckBox from "./SgsFlatCheckBox";
class SgsFlatRadio extends SgsFlatCheckBox {
    constructor(otherRenders = null) {
        super(otherRenders);
    }
    dispEventChange(event) {
        if (!this.selected) {
            this.selected = !this.selected;
            this.event(Laya.Event.CHANGE, this);
        }
    }
}

//import FontName from "../../enum/FontName";
//import WindowManager from "../../mode/base/WindowManager";
//import RES from "../../res/RES";
//import SgsText from "../controls/base/SgsText";
//import SgsTexture from "../controls/base/SgsTexture";
//import MyDressItemUI from "../myDressScene/MyDressItemUI";
class RankItemUI extends MyDressItemUI {
    constructor(otherRenders = null) {
        super(otherRenders);
        this.size(329, 355 + 14);
    }
    init() {
        super.init();
        this.bottomBg.y = 16 + 14;
        this.silhouette.y = 30 + 14;
        this.oherChildPos(this.avatarSp, 51, 20 + 14);
        this.topBg.y = 0 + 14;
        this.avatarBtn.y = 20 + 14;
        this.btn.y = 298 + 14;
    }
    updateRenderer(rendererData) {
        this.itemData = rendererData;
        this.silhouette.visible = true;
        this.avatar.visible = false;
        this.avatar.UpdateAll(this.itemData.skin, this.itemData.collocation);
        this.bottomBg.texture = RES.GetRes("myDressItemBottomBg1");
        this.topBg.texture = RES.GetRes("myDressItemTopBg1");
        this.btn.InitSkin("myDressGoVoteBtn");
        this.updateRank(true, this.itemData.rank);
        this.updateSelfVoteFlag(this.itemData.is_self);
    }
    updateRank(isShow, rank = 0) {
        if (isShow) {
            if (!this.rankBg) {
                this.rankBg = new SgsTexture();
                this.rankBg.pos(114, 0);
                this.addOtherChild(1, this.rankBg);
                this.rankText = new SgsText();
                this.rankText.pos(this.rankBg.x, this.rankBg.y);
                this.rankText.size(110, 53);
                this.rankText.font = FontName.HEITI;
                this.rankText.color = "#ffffff";
                this.rankText.fontSize = 24;
                this.rankText.align = "center";
                this.rankText.valign = "middle";
                this.addOtherChild(2, this.rankText);
            }
            if (rank >= 1 && rank <= 3)
                this.rankBg.texture = RES.GetRes("myDressRankBg" + rank);
            else
                this.rankBg.texture = RES.GetRes("myDressRankBg4");
            let rankStr = rank.toString();
            if (!rank || rank > 9999)
                rankStr = "9999+";
            else if (rankStr.length <= 1)
                rankStr = "0" + rankStr;
            this.rankText.text = rankStr;
            this.rankBg.visible = this.rankText.visible = true;
        }
        else {
            if (this.rankBg)
                this.rankBg.visible = this.rankText.visible = false;
        }
    }
    updateSelfVoteFlag(isShow) {
        if (isShow) {
            if (!this.selfVoteFlag) {
                this.selfVoteFlag = new SgsTexture(RES.GetRes("myDressSelfWork1"));
                this.selfVoteFlag.pos(304, 234);
                this.addOtherChild(1, this.selfVoteFlag);
            }
            this.selfVoteFlag.visible = true;
        }
        else {
            if (this.selfVoteFlag)
                this.selfVoteFlag.visible = false;
        }
    }
    onButtonHandler() {
        if (!this.itemData)
            return;
        WindowManager.GetInstance().OpenWindow("VoteWorkInfoWindow", false, this.itemData);
    }
    ClearDraw(destroy = true) {
        super.ClearDraw(destroy);
        if (destroy) {
        }
    }
}

//import SgsSpriteCheckBox from "./SgsSpriteCheckBox";
class SgsSpriteRadio extends SgsSpriteCheckBox {
    constructor() {
        super();
    }
    dispEventChange(event) {
        if (!this.selected) {
            this.selected = true;
            event.type = Laya.Event.CHANGE;
            if (this.eventDispatcher)
                this.eventDispatcher.event(Laya.Event.CHANGE, event);
        }
    }
}

//import RES from "./res/RES";
//import ResourceEvent from "./res/ResourceEvent";
//import FontName from "./enum/FontName";
//import Global from "./Global";
//import SystemContext from "./SystemContext";
//import RegClass from "./RegClass";
//import GameEventDispatcher from "./event/GameEventDispatcher";
//import MainLoadingView from "./ui/loading/MainLoadingView";
//import TopUILayer from "./ui/layer/TopUILayer";
//import ConfigerManager from "./config/ConfigerManager";
//import SgsTexture from "./ui/controls/base/SgsTexture";
//import TipsManager from "./mode/base/TipsManager";
//import SgsSoundManager from "./mode/base/SgsSoundManager";
//import SceneManager from "./mode/base/SceneManager";
//import TimerManager from "./mode/base/TimerManager";
//import GlobalConfiger from "./config/GlobalConfiger";
//import DressConfiger from "./config/DressConfiger";
//import GameManager from "./mode/gameManager/GameManager";
//import SgsSprite from "./ui/controls/base/SgsSprite";
//import TestContainerA from "./TestContainerA";
//import TestContainerB from "./TestContainerB";
class GameMain {
    constructor() {
        this.configRatio = 0;
        this.preloadRatio = 0;
        Config.isAlpha = true;
        Config.isAntialias = false;
        Config.useWebGL2 = false;
        Laya.init(750, 1496);
        Laya.stage.bgColor = null;
        Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;
        Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        Laya.Text.defaultFont = FontName.WRYH;
        Laya.SoundManager["_isActive"] = true;
        var workerVersion = Laya.Browser.window.workerVersion ? "?v=" + Laya.Browser.window.workerVersion : '';
        Laya.WorkerLoader.workerPath = "libs/workerloader.js" + workerVersion;
        Laya.WorkerLoader.enable = true;
        Global.ConsoleLog = console.log;
        RES.MaxLoader = 4;
        TimerManager.GetInstance().Start();
        TipsManager.GetInstance().AddEventListener();
        this.initClientConfig();
        Laya.stage.on(Laya.Event.RESIZE, this, this.stageResize);
        Laya.stage.on(Laya.Event.FOCUS, this, this.stageFocus);
        Laya.stage.on(Laya.Event.BLUR, this, this.stageBlur);
        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.stageVisibility);
        if ("focus" in Laya.Browser.window)
            Laya.Browser.window.focus();
        let document = Laya.Browser.document;
        if (document && "hasFocus" in document && !document.hasFocus()) {
            Laya.SoundManager["_isActive"] = false;
        }
        if (!SgsSoundManager.GetInstance().IsBgmStop)
            SgsSoundManager.GetInstance().PlayBgm();
    }
    stageResize(event) {
        SystemContext.UpdateGameSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio);
        this.updateInfoText();
    }
    stageFocus(event) {
        if (!Laya.SoundManager["_isActive"])
            Laya.SoundManager["_isActive"] = true;
        if (SgsSoundManager.LayaBgMusic && !Laya.SoundManager["_musicChannel"])
            SgsSoundManager.GetInstance().PlayBgm();
        GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_FOCUS);
    }
    stageBlur(event) {
        GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_BLUR);
    }
    stageVisibility(event) {
        GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_VISIBILITY);
    }
    initClientConfig() {
        let url = "res/config/GlobalConfig.json?v=" + Math.random().toString();
        let type = "json";
        Laya.loader.load(url, Laya.Handler.create(this, loadComplete), null, type);
        function loadComplete(data) {
            if (!data) {
                console.log("GlobalConfig.json加载失败");
                return;
            }
            GlobalConfiger.GetInstance().ParseConfig(data);
            RES.ClearResByUrl(url);
            if (Global.IsDebug)
                Laya.Stat.show();
            if (!Global.IsDebug)
                console.log = function () { };
            this.initResourceVersion();
        }
    }
    initResourceVersion() {
        if (!Laya.Browser.window.isLocalDebug) {
            this.addVersionPrefix();
            let resourceVersion = Laya.Browser.window.resourceVersion || "";
            Laya.ResourceVersion.enable("version.json?v=" + resourceVersion, Laya.Handler.create(this, loadComplete), Laya.ResourceVersion.FILENAME_VERSION);
        }
        else
            this.initResources();
        function loadComplete() {
            this.initResources();
        }
    }
    addVersionPrefix() {
        GameMain.versionCorrect = Laya.Browser.window.versionCorrect || "";
        GameMain.userVersionCorrect = Laya.Browser.window.userVersionCorrect || "";
        Laya.ResourceVersion.addVersionPrefix = this.customVersionPrefix;
    }
    customVersionPrefix(originURL) {
        let manifest = Laya.ResourceVersion.manifest;
        if (manifest && manifest[originURL])
            originURL = originURL + "?v=" + manifest[originURL] + GameMain.versionCorrect + GameMain.userVersionCorrect;
        return originURL;
    }
    initResources() {
        RES.AddEventListener(ResourceEvent.CONFIG_COMPLETE, this, this.onConfigComplete);
        RES.AddEventListener(ResourceEvent.CONFIG_LOAD_ERROR, this, this.onConfigError);
        RES.LoadConfig("res/assets/default.res.json", "res/");
    }
    onConfigError(event) {
        console.log("配置文件加载失败");
        RES.RemoveEventListener(ResourceEvent.CONFIG_COMPLETE, this, this.onConfigComplete);
        RES.RemoveEventListener(ResourceEvent.CONFIG_LOAD_ERROR, this, this.onConfigError);
    }
    onConfigComplete(event) {
        RES.RemoveEventListener(ResourceEvent.CONFIG_COMPLETE, this, this.onConfigComplete);
        RES.RemoveEventListener(ResourceEvent.CONFIG_LOAD_ERROR, this, this.onConfigError);
        RES.ClearResByUrl("res/assets/default.res.json");
        RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceComplete);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.AddEventListener(ResourceEvent.ITEM_LOAD_ERROR, this, this.onItemLoadError);
        RES.LoadGroup("mainLoading");
    }
    onResourceError(event) {
        this.showLoadError("资源组加载失败：" + event.groupName);
    }
    onResourceProgress(event) {
        let progress = event.progress;
        this.showLoadProgress(event.groupName, progress * 100, 100);
    }
    onItemLoadError(event) {
        this.showLoadError("资源加载失败：" + event.errorUrl);
    }
    onResourceComplete(event) {
        if (event.groupName == "mainLoading") {
            if (!GameMain.loadingView) {
                GameMain.loadingView = new MainLoadingView();
                TopUILayer.GetInstance().addChild(GameMain.loadingView);
                hideHtmlLoading();
            }
            RES.AddGroupKeys("preload", ["homeScene", "dressScene", "myDressScene", "rankScene", "saveDressWin"]);
            this.computeLoadResRatio();
            RES.LoadGroup("config");
            RegClass.RegAllClass();
        }
        else if (event.groupName == "config") {
            GameEventDispatcher.GetInstance().on("PARSE_CONFIGED", this, this.parseConfiged);
            ConfigerManager.GetInstance().ParsePreloadConfig();
            let dressConfiger = DressConfiger.GetInstance();
            let dressDic = dressConfiger.DressDic;
            let dressPartDic = dressConfiger.DressPartDic;
            let resources = [];
            let keys = [];
            let defaultResources = [];
            let defaultKeys = [];
            let resourceUrl = "";
            dressDic.forEach((key, element) => {
                resourceUrl = element.ResourceUrl;
                if (resourceUrl) {
                    resources.push({ "url": resourceUrl, "type": "image", "name": "runtime_dress_image" + element.Resource });
                    keys.push("runtime_dress_image" + element.Resource);
                }
            });
            let defaultDressResources = dressConfiger.DefaultDressPartResources;
            dressPartDic.forEach((key, element) => {
                resourceUrl = element.ResourceUrl;
                if (resourceUrl) {
                    if (defaultDressResources && defaultDressResources.indexOf(resourceUrl) >= 0) {
                        defaultResources.push({ "url": resourceUrl, "type": "image", "name": "runtime_dressPart_image" + element.Resource });
                        defaultKeys.push("runtime_dressPart_image" + element.Resource);
                    }
                    else {
                        resources.push({ "url": resourceUrl, "type": "image", "name": "runtime_dressPart_image" + element.Resource });
                        keys.push("runtime_dressPart_image" + element.Resource);
                    }
                }
            });
            if (defaultDressResources && defaultDressResources.length > 0) {
                defaultDressResources.forEach(url => {
                    RES.AddReference(url);
                });
            }
            if (defaultResources.length > 0) {
                RES.AddResources(defaultResources);
                RES.AddGroupKeys("preload", defaultKeys);
            }
            if (resources.length > 0) {
                RES.AddResources(resources);
                RES.AddGroupKeys("runtime", keys);
                RES.AddGroupKeys("preload", ["runtime"]);
            }
            RES.AddReference("res/assets/shareIcon.png");
            RES.LoadGroup("preload");
        }
        else if (event.groupName == "preload") {
            SgsTexture.EmptyTexture = RES.GetRes("EmptyImg");
            RES.DelGroupKeys("preload", ["homeScene", "dressScene", "myDressScene", "rankScene", "saveDressWin", "runtime"]);
            if (Global.AutoClearRes) {
                RES.ClearResByGroup("dressScene");
                RES.ClearResByGroup("myDressScene");
                RES.ClearResByGroup("rankScene");
                RES.ClearResByGroup("saveDressWin");
                RES.ClearResByGroup("runtime");
            }
            GameMain.preloaded = true;
            this.removeResLoadEvent();
            GameMain.EnterLoginScene();
        }
    }
    removeResLoadEvent() {
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceComplete);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.RemoveEventListener(ResourceEvent.ITEM_LOAD_ERROR, this, this.onItemLoadError);
    }
    parseConfiged() {
        GameEventDispatcher.GetInstance().off("PARSE_CONFIGED", this, this.parseConfiged);
        GameMain.parseConfiged = true;
        GameMain.EnterLoginScene();
    }
    static CheckLoaded() {
        return GameMain.parseConfiged && GameMain.preloaded;
    }
    static EnterLoginScene(platformLoginSucc = false) {
        if (GameMain.preloaded) {
            if (!GameMain.parseConfiged)
                GameMain.loadingView.ShowParseConfig();
            else
                GameMain.loadingView.ResetProgress();
        }
        if (GameMain.parseConfiged && GameMain.preloaded) {
            GameManager.GetInstance().on(GameManager.ENTER_GAME, this, this.onEnterGame);
            if (GameMain.loadingView)
                GameMain.loadingView.ShowText("加载数据中...");
            GameManager.GetInstance().InitUserData();
        }
    }
    static onEnterGame() {
        GameManager.GetInstance().off(GameManager.ENTER_GAME, this, this.onEnterGame);
        if (GameMain.loadingView) {
            GameMain.loadingView.parent.removeChild(this.loadingView);
            GameMain.loadingView.destroy();
            GameMain.loadingView = null;
        }
        SceneManager.GetInstance().EnterScene("HomeScene");
    }
    computeLoadResRatio() {
        let configs = RES.GetGroupByName("config");
        let preloads = RES.GetGroupByName("preload");
        let configCnt = configs ? configs.length : 0;
        let preloadCnt = preloads ? preloads.length : 0;
        this.configRatio = configCnt / (configCnt + preloadCnt);
        this.preloadRatio = preloadCnt / (configCnt + preloadCnt);
    }
    showLoadProgress(groupName, curValue, maxValue) {
        if (GameMain.loadingView) {
            if (groupName == "config")
                curValue = curValue * this.configRatio;
            else if (groupName == "preload")
                curValue = this.configRatio * 100 + curValue * this.preloadRatio;
            GameMain.loadingView.ShowProgress(curValue, maxValue);
        }
    }
    showLoadError(errorMsg) {
        if (GameMain.loadingView) {
            GameMain.loadingView.ShowError(errorMsg);
        }
    }
    updateInfoText() {
        this.sp1 = new SgsSprite();
        Laya.stage.addChild(this.sp1);
        this.sp2 = new SgsSprite();
        Laya.stage.addChild(this.sp2);
        var a = new TestContainerA([this.sp2]);
        this.sp1.addDrawChild(a);
        var b = new TestContainerB([this.sp2]);
        this.sp1.addDrawChild(b);
        a.CreateC();
        this.sp1.graphics.cmds;
        this.sp2.graphics.cmds;
    }
}
GameMain.parseConfiged = false;
GameMain.preloaded = false;
GameMain.versionCorrect = "";
GameMain.userVersionCorrect = "";
window.GameMain=GameMain;new GameMain();
//# sourceMappingURL=bundle.js.map