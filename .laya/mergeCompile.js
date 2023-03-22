var fs = require("fs");
// var path = require("path");
var childProcess = require('child_process');
var npmtscPath = process.argv[2];
var moduleDir = npmtscPath.replace("typescript\\bin\\tsc","").replace("typescript\\\\bin\\\\tsc","").replace("typescript/bin/tsc","");
var vlq = require(moduleDir + 'vlq');

//使用前请先在bin目录下准备好indexMerge.html文件
var tscJs = "./tscjs";//编译出的js存放目录
var enterClass = "GameMain";//项目入口类
var bundleJs = "./bin/js/bundle.js";//合并的js文件路径+名称

//js路径对应的ts路径
var jsTsPathMap = {};
//要缓存的合并编译信息字典 key:"./tscjs/GameMain.js" data:{jskey,tsKey:,jsCode:,tsCode:,map:[]}
var mergeCacheBuildMap = {};

//类名对应路径字典 key:"GameMain.js" data:"./tscjs/GameMain.js"
var clsPathMap = {};
//js类路径对应的ts文件key key:"./tscjs/GameMain.js" data:""
var tsKeyMap = {};
//类信息数组 [{name:"GameMain.js",path:./tscjs/GameMain.js}]
var clsInfoList = [];
//类路径数组 ["./tscjs/GameMain.js","./tscjs/net/AESUtils.js"]
var clsPathList = [];
//类名对应import类名字典 key:"GameMain.js" data:["FontName.js","UIUtils.js"]
var clsImportMap = {};
//模块依赖字典 key:"./tscjs/GameMain.js" data:["./tscjs/Global.js","./tscjs/RegClass.js"])
var moduleRelyMap = {};
//要缓存的编译信息字典 key:"./tscjs/GameMain.js" data:{jsKey:,tsKey:,relys:["./tscjs/Global.js","./tscjs/RegClass.js"]}
var cacheBuildMap = {};
//排序后的类路径列表 ["./tscjs/Global.js","./tscjs/RegClass.js"]
var sortPathList = [];

var fileData = "";


// function deleteTscJs(dir)
// {
//     var files = [];
//     if (fs.existsSync(dir))
//     {
//         files = fs.readdirSync(dir);//读取该文件夹
//         files.forEach(function(file)
//         {
//             var stats = fs.statSync(dir+'/'+file);
//             if (stats.isDirectory())
//             {
//                 deleteTscJs(dir+'/'+file);
//             }
//             else
//             {
//                 fs.unlinkSync(dir+'/'+file); 
//                 // console.log("删除文件"+fileUrl+'/'+file+"成功");
//             } 
//         });   
//         //fs.rmdirSync(dir);
//     }
// }

function startScan(dir)
{
	var files = fs.readdirSync(dir);
	files.forEach(function(name)
	{
		var path = dir + '/' + name;
		var states = fs.statSync(path);
		if(states.isDirectory())
		{
			startScan(path);
		}
		else
		{ 
            //找tscjs目录
			// if (path.indexOf(".js.map") == -1)
			// {
            //     clsPathMap[name] = path;
            //     clsPathList.push(path);
            //     clsInfoList.push({name:name,path:path});
            // }
            //找src目录
            if (path.indexOf(".ts") != -1)
			{
                jsName = name.substring(0,name.length - 2) + 'js';
                jsPath = tscJs + dir.substring(5,dir.length) + '/' + jsName;
                jsTsPathMap[jsPath] = path;
                clsPathMap[jsName] = jsPath;
                tsKeyMap[jsPath] = states.mtimeMs + "_" + states.size;
                clsPathList.push(jsPath);
                clsInfoList.push({name:jsName,path:jsPath});
			}
		}
    });
	// return clsInfoList;
}

function getFileKey(filePath)//获取文件key:修改时间_大小
{
    var states = fs.statSync(filePath);
    return states.mtimeMs + "_" + states.size;
}

function changeJs(clsName,path)
{
    fileData = "";
    var tsKey = tsKeyMap[path];
    var jsKey = "";
    var cacheInfo = buildCacheInfo ? buildCacheInfo[path] : null;
    var isTsChange = true;//ts文件是否变了
    var isJsChange = true;//js文件是否变了
    if (cacheInfo)//存在缓存信息
    {
        if (cacheInfo.tsKey == tsKey && cacheInfo.invalid == 1)//ts文件未变且是无效文件
        {
            cacheBuildMap[path] = cacheInfo;
            fileData = "";
            return false;
        }
        isTsChange = cacheInfo.tsKey == tsKey ? false : true;
        jsKey = getFileKey(path);
        isJsChange = cacheInfo.jsKey == jsKey ? false : true;
    }
    if (isTsChange || isJsChange)
    {
        fileData = fs.readFileSync(path,'utf-8');//读取js文件
        if (!fileData || fileData.length <= 0 || fileData.indexOf("//# sourceMappingURL=") == 0)//被注释的js文件
        {
            cacheBuildMap[path] = {tsKey:tsKey,invalid:1};//记录无效文件，下次就不用再读取文件后判断了
            return false;
        }
    }

    if (isTsChange)//ts文件变了:解析依赖关系
    {
        // console.log('TS变化：'+path);
        //解析import
        var length = fileData.length;
        var sIndex = -1;
        var eIndex = -1;
        var importCls = "";
        var enumSIndex = -1;
        var enumEIndex = -1;
        for (var k = 0; k < length; k++)
        {
            sIndex = fileData.indexOf('import ',k);
            eIndex = fileData.indexOf(' from ',k + 7);
            if (sIndex == -1 || eIndex == -1)
            {
                k = length;
                continue;
            }
            importCls = fileData.substring(sIndex + 7,eIndex);
            //处理枚举import { className }格式
            enumSIndex = importCls.indexOf('{');
            enumEIndex = importCls.indexOf('}');
            if (enumSIndex != -1 && enumEIndex != -1)
                importCls = importCls.substring(enumSIndex + 1,enumEIndex);
            importCls = importCls.replace(/\s*/g,"") + '.js';
            if (!clsImportMap[clsName])
                clsImportMap[clsName] = [importCls];
            else
                clsImportMap[clsName].push(importCls);
            k = eIndex + 8;
        }

        //检查依赖关系
        checkRelys(clsName,path,fileData);
    }
    else
    {
        moduleRelyMap[path] = cacheInfo.relys ? cacheInfo.relys.slice(0) : null;
        cacheBuildMap[path] = cacheInfo;
    }
    
    if (isJsChange)//js文件变了:处理js文件后保存
    {
        // console.log('JS变化：'+path);
        var isModifyJs = false;//是否修改了js
        //注释import
        sIndex = fileData.indexOf('import ');
        if (sIndex >= 2 && fileData.substring(sIndex - 2,sIndex) == "//")//从import往前找2个字符是"//"：已注释过
        {}
        else
        {
            while (sIndex >= 0)
            {
                isModifyJs = true;
                fileData = fileData.substring(0,sIndex) + '//' + fileData.substring(sIndex,fileData.length);
                sIndex = fileData.indexOf('import ', sIndex + 9);
            }
        }

        //删除export default 、export 
        sIndex = fileData.indexOf('export default ');
        if (sIndex != -1)
        {
            isModifyJs = true;
            fileData = fileData.substring(0,sIndex) + fileData.substring(sIndex + 15,fileData.length);
        }
        else
        {
            sIndex = fileData.indexOf('export ');
            if (sIndex != -1)
            {
                isModifyJs = true;
                fileData = fileData.substring(0,sIndex) + fileData.substring(sIndex + 7,fileData.length);
            }
        }

        //gameMain特殊处理,将gameMain赋给window
        sIndex = fileData.indexOf('new ' + enterClass + '();');
        if (sIndex != -1 && fileData.indexOf('window.' + enterClass + '=' + enterClass + ';') == -1)//gameMain入口文件类且未特殊处理过
        {
            isModifyJs = true;
            fileData = fileData.substring(0,sIndex) + 'window.' + enterClass + '=' + enterClass + ';' +  fileData.substring(sIndex,fileData.length);
        }
        
        //写入js文件
        if (isModifyJs)
            fs.writeFileSync(path,fileData);
    }

    if (isTsChange || isJsChange)//ts变化需重新解析依赖；js变化会导致jsKey变化
    {
        jsKey = getFileKey(path);
        if (cacheBuildMap[path])
        {
            cacheBuildMap[path].jsKey = jsKey;
            cacheBuildMap[path].tsKey = tsKey;
        }
        else//不需要依赖的也保存下，不然下次还要解析一遍才知道没有依赖
            cacheBuildMap[path] = {jsKey:jsKey,tsKey:tsKey,relys:null};
    }


    ///////合并js特殊处理: 获取js内容、处理sourcemap(ts内容、mappings 如果需要生成的话)
    var mergeCacheInfo = buildMergeCacheInfo ? buildMergeCacheInfo[path] : null;
    var jsCode = "";
    var tsCode = "";
    var map = null;
    if (mergeCacheInfo)//存在缓存信息
    {
        //和buildMergeCacheInfo.json文件中保存的jsKey、tsKey对比
        //因为tscCompile编译时不处理buildMergeCacheInfo.json文件
        //所以buildCacheInfo.json文件中保存的信息也许是最新的，但不代表buildMergeCacheInfo.json文件中保存的信息是最新的
        if (mergeCacheInfo.tsKey == tsKey)//ts未变
        {
            if (mergeCacheInfo.interface == 1)//接口文件
            {
                mergeCacheBuildMap[path] = mergeCacheInfo;
                fileData = "";
                return false;
            }
            tsCode = mergeCacheInfo.tsCode;
            map = mergeCacheInfo.map;
        }
        if (!jsKey)//还未获取jsKey
            jsKey = getFileKey(path);
        if (mergeCacheInfo.jsKey == jsKey)//js未变
            jsCode = mergeCacheInfo.jsCode;
    }
    if (!jsCode)//没有拿到jsCode
    {
        if (!fileData)//还未读取js文件
            fileData = fs.readFileSync(path,'utf-8');//读取js文件
        //删除import - 为了sourcemap代码行对应不再删除import
        // var index = fileData.indexOf('//import ');
        // while (index >= 0)
        // {
        //     endIndex = fileData.indexOf(';\r\n',index + 9);
        //     if (endIndex != -1)
        //     {
        //         fileData = fileData.substring(0,index) + fileData.substring(endIndex + 3,fileData.length);
        // 	    index = fileData.indexOf('//import ');
        //     }
        //     // else
        //     // {
        //     //     fileData = fileData.substring(0,index) + '//' + fileData.substring(index,fileData.length);
        // 	//     index = fileData.indexOf('import ', index + 9);
        //     // }
        // }

        //删除sourceMappingURL    
        sIndex = fileData.indexOf('//# sourceMappingURL=');
        if (sIndex != -1)
        {
            endIndex = fileData.indexOf('.js.map',sIndex + 21);
            if (endIndex != -1)
                fileData = fileData.substring(0,sIndex) + fileData.substring(endIndex + 7,fileData.length);
        }
        jsCode = fileData;
    }
    if (isMergeSourceMap)//需要生成sourcemap
    {
        if (!tsCode)//没有拿到tsCode
            tsCode = fs.readFileSync(jsTsPathMap[path],'utf-8');
        if (tsCode.indexOf(' interface ') >= 0)//接口文件特殊处理：接口文件不需要打包
        {
            mergeCacheBuildMap[path] = {tsKey:tsKey,interface:1};
            fileData = "";
            return false;
        }
        if (!map)//没有拿到map
        {
            var mapJson = JSON.parse(fs.readFileSync(path + '.map','utf-8'));
            map = vlqDecode(mapJson.mappings);
        }
    }
    mergeCacheBuildMap[path] = {jsKey:jsKey,tsKey:tsKey,jsCode:jsCode,tsCode:tsCode,map:map};
    ///////合并js特殊处理


    return true;
}

function checkRelys(clsName,path,fileData)//检查依赖
{
    if (!fileData || fileData.length <= 0) return;
    var importClss = clsImportMap[clsName];
    if (!importClss || importClss.length <= 0) return;
    var relys = [];//依赖数组：类名+后缀(如：GameMain.js)
    //继承
    checkExtends(clsName,path,fileData,importClss,relys);
    //静态变量
    checkStatic(clsName,path,fileData,importClss,relys);
	if (!relys.length) return;
	var relyCls = "";
	for (var i = 0; i < relys.length; i++)
	{
		relyCls = clsPathMap[relys[i]];
		if (relyCls)
		{
			if (!moduleRelyMap[path])
            {
                moduleRelyMap[path] = [relyCls];
                cacheBuildMap[path] = {jsKey:0,tsKey:0,relys:[relyCls]};//等保存js文件后再计算jsKey
            }    
			else if (moduleRelyMap[path].indexOf(relyCls) == -1)
            {
                moduleRelyMap[path].push(relyCls);
                cacheBuildMap[path].relys.push(relyCls);
            }
		}
	}
	// console.log(moduleRelyMap);
}

function checkExtends(clsName,path,code,importClss,relys)//检查类继承
{
    var sIndex = code.indexOf(' extends ');
    if (sIndex == -1) return;
    var eIndex = code.indexOf('{',sIndex + 9);
    if (eIndex == -1) return;
    var cls = code.substring(sIndex + 9,eIndex);
    cls = cls.replace(/\s*/g,"") + '.js';
    if (importClss.indexOf(cls) != -1)
    {
        relys.push(cls);
        // console.log("继承依赖 : "+ path + ' -> ' + cls);
    }
}

function checkStatic(clsName,path,code,importClss,relys)//检查类中静态变量初始化
{
	var sIndex = code.indexOf(' class ');
	if (sIndex == -1) return;
    var eIndex = code.indexOf('{',sIndex + 7);
	if (eIndex == -1) return;
    var ssIndex = -1;
    var eeIndex = -1;
    var sCount = 0;
    var eCount = 0;
    var length = code.length;
    for (var k = eIndex + 1; k < length; k++)
    {
        ssIndex = code.indexOf('{',k);
        eeIndex = code.indexOf('}',k);
        if (ssIndex == -1 && eeIndex == -1)
        {
            k = length;
            continue;
        }
        if (ssIndex != -1 && eeIndex == -1)//先找到{
        {
            sCount ++;
            k = ssIndex;
            continue;
        }
        else if (ssIndex == -1 && eeIndex != -1)//先找到}
        {
            eCount ++;
            if (eCount > sCount)
                k = length;
            else
                k = eeIndex;
			continue;
        }
        else if (ssIndex < eeIndex)//先找到{
        {
            sCount ++;
            k = ssIndex;
            continue;
        }
        else//先找到}
        {
            eCount ++;
            if (eCount > sCount)
                k = length;
            else
                k = eeIndex;
			continue;
        }
    }

    //截取类外部申明的静态变量
    if (length <= eeIndex + 1) return;
    var staticCode = code.substring(eeIndex + 1,length);
    // console.log(path+"外部静态变量申明字符串:"+staticCode);
    var sIndex = 0;
    var ssIndex = 0;
    var importCls = "";
    var matchStr = "";
    for (const dependency of importClss) 
    {
        sIndex = dependency.lastIndexOf('.js');
        if (sIndex != -1)
        {
            importCls = dependency.substring(0,sIndex);
            matchStr = ' new '+importCls+'(';
            ssIndex = staticCode.indexOf(matchStr,0);
            if (ssIndex != -1 && isPerfectMatch(ssIndex,ssIndex+matchStr.length,staticCode))
            {
                if (relys.indexOf(dependency) == -1)
                    relys.push(dependency);
            }
            else
            {
                matchStr = importCls+'.';
                ssIndex = staticCode.indexOf(matchStr,0);
                if (ssIndex != -1 && isPerfectMatch(ssIndex,-1,staticCode))
                {
                    if (relys.indexOf(dependency) == -1)
                        relys.push(dependency);
                }
            }
        }
    }
}

function sortJs()//js排序
{
    const checkCanOrder = (module) => {//检查是否可以排序
        var relys = moduleRelyMap[module];
        //此类没有依赖类
        if (!relys || relys.length <= 0) return true;
        for (var i = 0; i < relys.length; i++)
        {
            if (clsPathList.indexOf(relys[i]) == -1)//依赖类不存在：可能是Laya.***等
            {
                relys.splice(i,1);
                i--;
                continue;
            }
            if (sortPathList.indexOf(relys[i]) == -1)//依赖类未排序
                return false;
        }
        return true;
    };

    const moduleOrder = (module) => {//模块递归排序
        sortCount ++;
        // console.log("执行次数：" + sortCount);
        if (checkCanOrder(module))//可以排序
        {
            onceOrdered = true;
            clsPathList.splice(index,1);//从原数组删除
            sortPathList.push(module);
            delete moduleRelyMap[module];
        }
        index --;
        if (index >= 0)
        {
            try{
				return function(){
					return moduleOrder(clsPathList[index]);
				}
            }catch(event){
                orderedErr(sortCount,clsPathList,moduleRelyMap);
            }
        }
        else if (clsPathList.length)
        {
            if (!onceOrdered)//一遍结束未有任何模块排序，出现死循环
            {
                orderedErr(sortCount,clsPathList,moduleRelyMap);
                return true;
            }
            onceOrdered = false;
            index = clsPathList.length - 1;
            try{
                return function(){
					return moduleOrder(clsPathList[index]);
				}
            }catch(event){
                orderedErr(sortCount,clsPathList,moduleRelyMap);
            }
        }
		else
		{
			return true;
		}
    };
	
	const trampoline = (func, arg) => {
		var value = func(arg);
		while(typeof value === "function") {
			value = value();
		}
		return value;
	}
    
    for (var i = 0; i < clsPathList.length; i++)//删除入口文件，入口文件不用参与排序
    {
        if (clsPathList[i].indexOf("/" + enterClass + ".js") != -1)
        {
            clsPathList.splice(i,1);
            break;
        }
    }
    var index = clsPathList.length - 1;
    var sortCount = 0;
    var onceOrdered = false;//从最后到开始 一遍了是否有排序模式

    if (index >= 0)
        trampoline(moduleOrder,clsPathList[index]);
}

function orderedErr(sortCount,pathList,moduleRelyMap)
{
    console.log('排序异常，请查看 '+pathList+' 信息');
}

//合并sourceMap相关字段
var sourceMap = {"version":3,"file":"bundle.js","sources":[],"sourcesContent":[],"names":[],"mappings":""};
var mappings = [];
var lastRowOffest = 0;

function readBundleJs()//js写入bundleJs中
{
    //遍历js写入bundle.js
    var enterJsPath = tscJs + '/' + enterClass + '.js';
    var mergeStr = "";
    var mergeCacheBuildInfo;
    var jsData = "";
    for (var i = 0; i < sortPathList.length; i++)
    {
        mergeCacheBuildInfo = mergeCacheBuildMap[sortPathList[i]];
        if (!mergeCacheBuildInfo) 
            continue;
        jsData = mergeCacheBuildInfo.jsCode;//mergeClsMap[sortPathList[i]];
        if (jsData && jsData.length > 0)
            mergeStr += jsData + "\n";

        if (isMergeSourceMap)//需要生成map
        {
            mergeSourceMap(sortPathList[i],mergeCacheBuildInfo);
        }
    } 

    mergeCacheBuildInfo = mergeCacheBuildMap[enterJsPath];
    mergeStr += mergeCacheBuildInfo.jsCode;//加上入口文件//mergeClsMap[enterJsPath];
    if (isMergeSourceMap)//需要生成map
    {
        var index = bundleJs.lastIndexOf("/");//./bin/js/bundle.js
        var bundleName = bundleJs.substring(index + 1);
        mergeStr += "//# sourceMappingURL=" + bundleName + ".map";
    }
    fs.writeFileSync(bundleJs,mergeStr);

    if (isMergeSourceMap)//需要生成map
    {
        mergeSourceMap(enterJsPath,mergeCacheBuildInfo);
        sourceMap.mappings = vlqEncode(mappings);
        fs.writeFileSync(bundleJs + '.map',JSON.stringify(sourceMap));
    }
    mergeCacheBuildMap = null;
}

function mergeSourceMap(jsPath,mergeCacheBuildInfo)
{
    var tsCode = mergeCacheBuildInfo.tsCode;
    var map = mergeCacheBuildInfo.map;
    if (!tsCode || !map)
        return;

    if (sourceMap.sources.length > 0)//文件之间加了换行
        mappings.push([[]]); 
    
    var rows;//已经提前保存了缓存文件，这里不用再拷贝数组可以直接修改数组了
    var col;
    var endRow = 0;//本ts文件的结束行
    for (var r = 0; r < map.length; r++)//遍历行
    {
        rows = map[r];//每一行
        if (rows.length > 0 && rows[0].length > 0)//代码中间空行：不需要遍历
        {
            for (var c = 0;  c < rows.length; c++)//遍历列
            {
                col = rows[c];
                // col[0]//转换后代码所处列
                // col[1]//sources中哪个文件
                // col[2]//源码行
                // col[3]//源码列
                endRow += col[2];
                if (r == 0 && c == 0)
                {
                    col[1] = sourceMap.sources.length == 0 ? 0 : 1;
                    col[2] = col[2] - lastRowOffest;
                }    
                else
                    col[1] = 0;
            }
        }
        mappings.push(rows);
    }
    lastRowOffest = endRow;
    sourceMap.sources.push('../../'+jsTsPathMap[jsPath]);
    sourceMap.sourcesContent.push(tsCode);
}

function vlqDecode(sourceString)//vlq解密 
{
    var lines = sourceString.split(';')
    return lines.map(line => line.split(',').map(vlq.decode));
}

function vlqEncode(list)//vlq加密 
{
    var result = "";
    var rows;
    for (var i = 0; i < list.length; i++)
    {
        rows = list[i];
        if (i > 0) result += ';';
        for (var j = 0;  j < rows.length; j++)
        {
            if (j > 0) result += ',';
            result += vlq.encode(rows[j]);
        }
    }
    return result;
}

function isPerfectMatch(sIndex,eIndex,str)//是否完全匹配:防止因字符包含关系而找错(比如：要找 CardEvent,但其还有SeatCardEvent)
{
	var Regx = /^[A-Za-z0-9_]*$/;
    var lChar = str.charAt(sIndex - 1);
    if (eIndex == -1)//只比较左边
    {
        if (Regx.test(lChar))//变量左侧字符若为字母、数字、_则表明是其他变量
            return false;
        return true;
    }				
	var rChar = str.charAt(eIndex);
	if (Regx.test(lChar) || Regx.test(rChar))//变量俩侧字符若为字母、数字、_则表明是其他变量
		return false;
	return true;
}

// function isAnnotation(code,sIndex)//是否注释
// {
// 	var lineIndex = code.lastIndexOf('\n',sIndex);
// 	if (lineIndex == -1) lineIndex = 0;
// 	if (code.substring(lineIndex,sIndex).indexOf('//') != -1 || code.substring(lineIndex,sIndex).indexOf('*') != -1)//已注释
// 		return true;
// 	return false;
// }

function compileTs(backFun)//编译ts
{
    var cmd = 'node --max-old-space-size=10240 "' + npmtscPath + '" -p tsconfig2.json';
    childProcess.exec(cmd, function(error, stdout, stderr) {
        if (error)
        {
            // console.log('语法检查错误：' + stdout);
            throw new Error(stdout);
        }
        else
            backFun();
    });
}

function logTime(msg,nowDate)//打印
{
    if (!nowDate)
        nowDate = new Date();
    var hours = nowDate.getHours();
    var minutes = nowDate.getMinutes();
    var seconds = nowDate.getSeconds();
    if (hours < 10)
        hours = '0' + hours;
    if (minutes < 10)
        minutes = '0' + minutes;
    if (seconds < 10)
        seconds = '0' + seconds;
    console.log('[' + hours + ":" + minutes + ":" + seconds + '] ' + msg);  
}



///////////////////////////////////开始处理////////////////////////////////////

var nowDate = new Date(); 
var startTime = nowDate.getTime();
logTime('start mergeCompile',nowDate);

//删除tscjs目录中的文件
// logTime('开始删除tscjs目录');
// deleteTscJs(tscjs);

//读取编译配置文件
logTime('开始读取tsconfig2.json');
var tscInfo = fs.readFileSync('./tsconfig2.json','utf-8');
tscInfo = tscInfo && tscInfo != "" ? JSON.parse(tscInfo) : {};
var isMergeSourceMap = tscInfo.compilerOptions && tscInfo.compilerOptions.sourceMap ? true : false;//是否生成合并sourcemap

//读取编译缓存表
logTime('开始读取buildCacheInfo.json');
var buildCacheInfoUrl = tscJs + "/buildCacheInfo.json";
var buildCacheInfo = {};//缓存的编译信息
if (fs.existsSync(buildCacheInfoUrl))
{
    buildCacheInfo = fs.readFileSync(buildCacheInfoUrl,'utf-8');
	buildCacheInfo = buildCacheInfo && buildCacheInfo != "" ? JSON.parse(buildCacheInfo) : {};
}

//读取合并编译缓存表
logTime('开始读取buildMergeCacheInfo.json');
var buildMergeCacheInfoUrl = tscJs + "/buildMergeCacheInfo.json";
var buildMergeCacheInfo = {};//缓存的合并信息
if (fs.existsSync(buildMergeCacheInfoUrl))
{
    buildMergeCacheInfo = fs.readFileSync(buildMergeCacheInfoUrl,'utf-8');
	buildMergeCacheInfo = buildMergeCacheInfo && buildMergeCacheInfo != "" ? JSON.parse(buildMergeCacheInfo) : {};
}

//执行语法检查生成tscjs
logTime('开始编译TS脚本');
compileTs(function(){
    logTime('开始处理tscjs、bundle.js');
    //startScan(tscJs);
    //处理js文件
    startScan("./src");
    for (var i = 0; i < clsInfoList.length; i++)
    {
        var legalJs = changeJs(clsInfoList[i].name,clsInfoList[i].path);
        if (!legalJs)//无效js
        {
            delete clsPathMap[clsInfoList[i].name];
            clsPathList.splice(i,1);
            clsInfoList.splice(i,1);
            i--;
        }
    }
    sortJs();//排序js文件
    readBundleJs();//处理bundlejs
	fs.writeFileSync(buildCacheInfoUrl,JSON.stringify(cacheBuildMap));//保存编译缓存表
    fs.writeFileSync(buildMergeCacheInfoUrl,JSON.stringify(mergeCacheBuildMap));//保存合并编译缓存表
    
    var nowDate = new Date(); 
    logTime('end mergeCompile',nowDate);
    var takeTime = (nowDate.getTime() - startTime)/1000;
    if (takeTime <= 60)//秒
        logTime('耗时：' + takeTime + '秒');
    else
    {
        var minutes = Math.floor(takeTime/60);
        var second = Math.ceil(takeTime%60);
        logTime('耗时：' + minutes + '分' + second + '秒');
    }
});




