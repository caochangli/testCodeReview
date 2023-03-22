/**
 * Created by caochangli on 2017-11-08.
 */
var Laya;
(function (Laya) {
    /**
     * 重构formatUrlH桉树；
     */
    Laya.URL.formatURL=function(url,base){
		if (!url)return "null path";
		if (url.indexOf(":")> 0)return url;
		if (Laya.URL.customFormat !=null)url=Laya.URL.customFormat(url,base);
		if (url.indexOf(":")> 0)return url;
		var char1=url.charAt(0);
		if (char1==="."){
			return Laya.URL.formatRelativePath((base || Laya.URL.basePath)+url);
			}else if (char1==='~'){
			return Laya.URL.rootPath+url.substring(1);
			}else if (char1==="d"){
			if (url.indexOf("data:image")===0)return url;
			}else if (char1==="/"){
			return url;
		}
		return (base || Laya.URL.basePath)+url;
	}

    /**
     * 调用父类的setter属性，代替其他语言的写法，如 super.alpha = 1;
     * @param thisObj 当前对象。永远都this
     * @param currentClass 当前 class 类名，非字符串
     * @param type 需要调用的setter属性名称
     * @param values 传给父类的值
     *
     * @exmaple Laya.superSetter(Laya.Sprite, this, "alpha", 1);
     */
    function superSetter(currentClass, thisObj, type) {
        var values = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            values[_i - 3] = arguments[_i];
        }
        var cla = currentClass.prototype;
        var seters;
        if (!currentClass.hasOwnProperty("__sets__")) {
            Object.defineProperty(currentClass, "__sets__", { "value": {} });
        }
        seters = currentClass["__sets__"];
        var setF = seters[type];
        if (setF) {
            return setF.apply(thisObj, values);
        }
        var d = Object.getPrototypeOf(cla);
        if (d == null) {
            return;
        }
        while (!d.hasOwnProperty(type)) {
            d = Object.getPrototypeOf(d);
            if (d == null) {
                return;
            }
        }
        setF = Object.getOwnPropertyDescriptor(d, type).set;
        seters[type] = setF;
        setF.apply(thisObj, values);
    }
    Laya.superSetter = superSetter;
   
    /**
     * 获取父类的getter属性值。代替其他语言的写法，如 super.alpha;
     * @param thisObj 当前对象。永远都this
     * @param currentClass 当前 class 类名，非字符串
     * @param type 需要调用的setter属性名称
     * @returns {any} 父类返回的值
     *
     * @exmaple Laya.superGetter(Laya.Sprite, this, "alpha");
     */
    function superGetter(currentClass, thisObj, type) {
        var cla = currentClass.prototype;
        var geters;
        if (!currentClass.hasOwnProperty("__gets__")) {
            Object.defineProperty(currentClass, "__gets__", { "value": {} });
        }
        geters = currentClass["__gets__"];
        var getF = geters[type];
        if (getF) {
            return getF.call(thisObj);
        }
        var d = Object.getPrototypeOf(cla);
        if (d == null) {
            return;
        }
        while (!d.hasOwnProperty(type)) {
            d = Object.getPrototypeOf(d);
            if (d == null) {
                return;
            }
        }
        getF = Object.getOwnPropertyDescriptor(d, type).get;
        geters[type] = getF;
        return getF.call(thisObj);
    }
    Laya.superGetter = superGetter;

})(Laya || (Laya = {}));


//解压压缩包
function unZip(zipData,thisObj,callBack)
{
    var fileDatas = [];
	var index = 0;
    JSZip.loadAsync(zipData).then(function (zip) 
    {
        for (var fileName in zip.files)
        {
            // var data = zip.file(fileName).async("arraybuffer");
            // fileDatas.push({name:fileName,data:data});
            if (zip.files[fileName].dir == false)
            {
                if (fileName.indexOf(".lh") != -1 || fileName.indexOf(".lmat") != -1)//文本格式
                    var data = zip.file(fileName).async("string");
                else
                    var data = zip.file(fileName).async("arraybuffer");
                fileDatas.push({name:fileName,data:data});
            }
        }
        if (fileDatas.length)
        {
            index = 0;
            parseZipFile(fileDatas[index],parseZipFileEnd);
        }
    });

    function parseZipFile(fileData,callBack)
    {
        fileData.data.then(function (text) {
            callBack(text);
        });
    }

    function parseZipFileEnd(text)
    {
        fileDatas[index].data = text;
        index ++;
        if (index < fileDatas.length) {
            parseZipFile(fileDatas[index],parseZipFileEnd);
        }
        else {
            callBack.apply(thisObj,[fileDatas]);
        }
	}
}