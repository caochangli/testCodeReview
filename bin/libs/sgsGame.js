//掩藏htmlLoading
function hideHtmlLoading()
{
	var loadingDiv = document.getElementById("loadingDiv");
	if (loadingDiv)
		loadingDiv.style.display = "none";
}

//检测是否使用webp格式
function checkWebp()
{
	if(!window.usePng)
	{
		try{
        	return (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0);
    	}catch(err) {
        	return  false;
    	}
	}
	return false;
}

// function updateBgSize(width,height)
// {
// 	var bgDiv = document.getElementById("bgDiv");
// 	if (bgDiv)
// 	{
// 		bgDiv.style.width = width + "px";
// 		bgDiv.style.height = height + "px";
// 	}
// }

function GetRequest() 
{ 
	var url = location.search; //获取url中"?"符后的字串 
	var theRequest = new Object(); 
	if (url.indexOf("?") != -1) { 
		var str = url.substr(1); 
		strs = str.split("&"); 
		for(var i = 0; i < strs.length; i ++) { 
			theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]); 
		}
	} 
	return theRequest; 
} 

function checkCanUseWebGL() 
{
	var canUseWebGL = false;
	try {
		var canvas = window.document.createElement("canvas");
		canUseWebGL = !!window["WebGLRenderingContext"] && !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
	}
	catch (e) {
		canUseWebGL = false;
	}
	return canUseWebGL;
}

function playVideo(myVideo) {//播放pv视频
    // 返回一个promise以告诉调用者检测结果
	if(!myVideo){
		return ;
	}
	var result = false
	if(typeof Promise == "function"){
		try{
			var playPromise = myVideo.play() ;
			var noVideoPromise = 'no video Promise';
			var playPromise = playPromise || Promise.reject(noVideoPromise);
			playPromise.then(function() {
				// Video could be autoplayed, do nothing.
				console.log("play sucess");
			}).catch(function(err) {
				console.log(err);
			// Video couldn't be autoplayed because of autoplay policy. Mute it and play.
				myVideo.muted = err != noVideoPromise;
				myVideo.play();
				sendLogMessage("SendDebugLog","VideoPromiseErro:" + JSON.stringify(err));
			});
		}catch(err){
			console.log(err);
		}
		
	}else{
		myVideo.play();
	}
}

var layaOrder={};
layaOrder["laya.core.min.js"]=1;
layaOrder["laya.ui.min.js"]=2;
layaOrder["laya.ani.min.js"]=3;
layaOrder["spine-core-4.0.min.js"]=4;
layaOrder["laya.spine.min.js"]=5;
layaOrder["laya.html.min.js"]=6;
layaOrder["laya.particle.min.js"]=7;
layaOrder["laya.d3.min.js"]=8;
function getLayaOrder(fileName)
{
	if (layaOrder[fileName])
		return layaOrder[fileName];
	return 100;
}

function loadZip(url,callBack)
{
	var fileDatas = [];
	var index = 0;
	JSZipUtils.getBinaryContent(url,function(err,zipData) 
	{
		if(err) throw err;
		// console.log("加载zip : " + url);
		if (url.indexOf('sgsGame.sgs') != -1 || url.indexOf('sgsGame.es5.sgs') != -1)//解密
		{
			CtrUtil.Init(function(){
				var str = CtrUtil.Ctr.Ofb_Dec(zipData);
				unpack(str);
			});
		}
		else
		{
			unpack(zipData);
		}
	});

	function unpack(zipData){
		JSZip.loadAsync(zipData).then(function (zip) {
			fileDatas = [];
			for(var fileName in zip.files)
			{
				var data = zip.file(fileName).async("string");
				fileDatas.push({name:fileName,data:data,order:getLayaOrder(fileName)});
			}
			if (fileDatas.length)
			{
				fileDatas.sort(function(a,b){
					return a.order-b.order;
				});
				index = 0;
				
				parseZipFile(fileDatas[index],parseZipFileEnd);
			}
		});
	}
	
	function parseZipFileEnd(){
		index ++;
		if (index < fileDatas.length) {
			parseZipFile(fileDatas[index],parseZipFileEnd);
		}
		else {
			callBack();
		}
	}
}

//解析zip文件，并转换为javascript脚本运行
function parseZipFile(fileData,callBack)
{
	//是否丢弃aes文件(QQ大厅合服后，通信加密采用aes新的key)
	if(window.discardAsd && fileData.name == "laya.asd.min.js"){
		callBack();
		return;
	}
	fileData.data.then(function (text) {
		if (isScriptContent)
			text = scriptContent(fileData.name,text);
		addScript(text);
		// console.log("解析js : " + fileData.name);
		callBack();
	});
}

//使用document创建javascript脚本
function addScript(text)
{
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.text = text;
	document.body.appendChild(script);
	document.body.removeChild(script);
}

function fileChange(input){
	var file = input.files[0];
	if(!file){
		return;
	}
	var reader = new FileReader();
	reader.onload = function (e) {
		if(window[gameFlag] && window[gameFlag].PlayLocalRecord)
		{
			window[gameFlag].PlayLocalRecord(reader.result);
			input.value = '';
		}
	}
	reader.readAsArrayBuffer(file);
}

//拷贝文本到剪贴板
var initClipboard = false;
var copyCallBack;
function copyToClipboard() {
	initClipboard = true;
	var copyBtn = document.getElementById("copyBtn");
	var clipboard = new ClipboardJS(copyBtn);
	clipboard.on('success', function(e) {
		//console.log(e);
		if(copyCallBack){
			copyCallBack(true);
		}
	});
	clipboard.on('error', function(e) {
		//console.log('Trigger:', e.trigger);
		if(copyCallBack){
			copyCallBack(false);
		}
	});
}

window.showCopyBtn = function(obj){
	if (!initClipboard) {
		copyToClipboard();
	}
	if(obj) {
		var btnDiv = document.getElementById("btnDiv");
		if (btnDiv) {
			btnDiv.style.transform = "scale(" + obj.scale + ")";
			btnDiv.style.mozTransform = "scale(" + obj.scale + ")";
			btnDiv.style.webkitTransform = "scale(" + obj.scale + ")";
			btnDiv.style.OTransform  = "scale(" + obj.scale + ")";
			btnDiv.style.msTransform  = "scale(" + obj.scale + ")";

			btnDiv.style.left = obj.left + "px";
			btnDiv.style.top = obj.top + "px";
			btnDiv.style.display = "block";
			
			var btn = document.getElementById("copyBtn");
			btn.setAttribute("data-clipboard-text",obj.nameTxt);
			copyCallBack = obj.callBack;
		}
	}
}

window.hideCopyBtn = function(){
	var btnDiv = document.getElementById("btnDiv");
	if (btnDiv)
		btnDiv.style.display = "none";
}


window.showInputFile = function(obj){
	if(obj){
		var inputDiv = document.getElementById("inputDiv");
		inputDiv.style.display = "block";
		inputDiv.style.transform = "scale(" + obj.scale + ")";
		inputDiv.style.mozTransform = "scale(" + obj.scale + ")";
		inputDiv.style.webkitTransform = "scale(" + obj.scale + ")";
		inputDiv.style.OTransform  = "scale(" + obj.scale + ")";
		inputDiv.style.msTransform  = "scale(" + obj.scale + ")";

		inputDiv.style.left = obj.left + "px";
		inputDiv.style.top = obj.top + "px";
	}
	
}

window.hideInputFile = function(){
	document.getElementById("inputDiv").style.display = "none";
}

function callIFrame(wdt, het, url,modal, type, closeBtn,btnTop,btnRight,alphaBg) {
	if(!url){
		return;
	}
	var sgs_wd_bton = '';
	if (closeBtn == 'nom') {
		btnTop = btnTop || 1;
		btnRight = btnRight || 10;
		sgs_wd_bton = '<div style="position:absolute;top:' + btnTop + 'px;right:' + btnRight + 'px;"><button class="CloseBtn" href="javascript:;" onclick="closeIFrame();return false;"></button></div>';
	} else if (closeBtn == 'def') {
		btnTop = btnTop || 22;
		btnRight = btnRight || 25;
		sgs_wd_bton = '<div style="position:absolute;top:' + btnTop + 'px;right:' + btnRight + 'px;"><a href="javascript:;" onclick="closeIFrame('+"'"+type+"'"+');return false;">[关闭]</a></div>';
    }
    else if(closeBtn == '2144')
    {
        btnTop = btnTop || 604;
		btnRight = btnRight || 715;
		sgs_wd_bton = '<div style="position:absolute;top:' + btnTop + 'px;right:' + btnRight + 'px;"><a style="font-size:24px;color:#361800; text-decoration:none;display: block;padding: 7px 60px;" href="javascript:;" onclick="closeIFrame('+"'"+type+"'"+');return false;">关闭</a></div>';
    }
	var top = Math.round(het/2);
	if(window.innerHeight/2 < top){
		top = window.innerHeight/2;
	}
	var isHttpsUrl = url.indexOf("https:") != -1;
	//tonglifang 如果https打开iframe的是一个http页面，不能使用ifrmae,弹新窗口；
	if(window.HttpsEnabled && !isHttpsUrl){			
		if (window.external && window.external.mxProductName) {
			window.open(url, "sgs_windows");
		}else{
			window.open(url);
		}
	}else{
		var sgs_wd_body = '<div id="iframeBody" style="position:absolute;font-size:12px;top:50%;left:50%;margin-top:-'+top+'px;margin-left:-'+Math.round(wdt/2)+'px;width:'+wdt+'px;height:'+het+'px;z-index:9000;"><iframe width="100%" height="100%" frameborder="no" allowtransparency="true" hidefocus="true" scrolling="no" ' + (alphaBg?'':'style="background-color:#fff;"') + ' src="'+url+'"></iframe>'+sgs_wd_bton+'</div>';
		if (window.external && window.external.mxProductName) {
			window.open(url, "sgs_windows");
		} else if (modal) {
			document.getElementById("iframeCon").innerHTML = '<div style="position:absolute;left:0px;top:0px;width:100%;height:100%;background:rgba(0,0,0,0.5)">' + sgs_wd_body + '</div>';
		} else {
			document.getElementById("iframeCon").innerHTML = sgs_wd_body;
		}
	}
}


function callIFrame2(wdt, het, url,modal) {
	if(!url){
		return;
	}
	var theRequest = new Object(); 
	var paramIndex = url.indexOf("?");
	if (paramIndex > -1) { 
		var str = url.substr(paramIndex + 1); 
		strs = str.split("&"); 
		for(var i = 0; i < strs.length; i ++) { 
			theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]); 
		} 
	} 

	if(theRequest.frameWidth)
	{
		wdt = Number(theRequest.frameWidth);
	}

	if(theRequest.frameHeight)
	{
		het = Number(theRequest.frameHeight);
	}

	if(document.body)
	{
		if(document.body.clientWidth)
		{
			var maxWidth = document.body.clientWidth - 32;
			wdt = wdt > maxWidth ? maxWidth : wdt;
		}

		if(document.documentElement)
		{
			var maxHeight = document.documentElement.clientHeight - 68;
			het = het > maxHeight ? maxHeight : het;
		}
	}
	
	var sgs_wd_bton = '';
	sgs_wd_bton += '<div style="position:absolute;top:-32px;right:-28px;"><a style="color:#FFF;margin-right:10px;" href="javascript:;" onclick="linkImageClick('+"'"+url+"'"+');return false;">在浏览器中打开此网页</a><a style="color:#FFF;" href="javascript:;" onclick="closeIFrame();return false;">[关闭]</a></div>';
	var sgs_wd_body = '<div id="iframeBody" style="position:absolute;font-size:12px;background-color:#2A1C10;top:50%;left:50%;margin-top:-'+Math.round(het/2 + 34) +'px;margin-left:-'+Math.round(wdt/2 + 16) +'px;width:'+(wdt - 64)+'px;height:'+(het - 30)+'px;z-index:9000;border:49px solid transparent;-webkit-border-image:url(res/assets/runtime/iframe/background.png) 49 49 49 49 stretch; -moz-border-image:url(res/assets/runtime/iframe/background.png)  49 49 49 49 stretch;-o-border-image:url(res/assets/runtime/iframe/background.png)  49 49 49 49 stretch;border-image:url(res/assets/runtime/iframe/background.png)  49 49 49 49 stretch;"><iframe width="'+ wdt +'px" height="'+ het +'px" frameborder="no" scrolling="yes" style="margin-left:-32px;margin-top:2px;"  src="'+url+'"></iframe>'+sgs_wd_bton+'</div>';
	//var sgs_wd_body = '<style type="text/css">div.wrap {padding: 3% 0 0 3%;} div.square {float: left;background: #ffa500;width: 30%;padding: 30% 0 0 0;margin: 0 3% 3% 0;border-radius: 4%;}</style><div class="wrap" style="position:absolute;font-size:12px;background-image:url(res/assets/runtime/iframe/background.png);background-size:cover;background-color:#2A1C10;top:50%;left:50%;margin-top:-'+Math.round(het/2 + 30) +'px;margin-left:-'+Math.round(wdt/2 + 20) +'px;width:'+(wdt + 40)+'px;height:'+(het + 50)+'px;z-index:9000;"><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div><div class="square"></div></div>'
	var isHttpsUrl = url.indexOf("https:") != -1;
	//tonglifang 如果https打开iframe的是一个http页面，不能使用ifrmae,弹新窗口；
	if(window.HttpsEnabled && !isHttpsUrl){		
		if (window.external && window.external.mxProductName) {
			window.open(url, "sgs_windows");
		}else{
			window.open(url);
		}
	}else{
		if (window.external && window.external.mxProductName) {
			window.open(url, "sgs_windows");
		} else if (modal) {
			document.getElementById("iframeCon").innerHTML = '<div style="position:absolute;left:0px;top:0px;width:100%;height:100%;background:rgba(0,0,0,0.5);">' + sgs_wd_body + '</div>';
		} else {
			document.getElementById("iframeCon").innerHTML = sgs_wd_body;
		}
	}
	
}

function closeIFrame(type) {
	document.getElementById("iframeCon").innerHTML = '';
	if (type == "pay") {
		if (window[gameFlag] && window[gameFlag].CallChannelUtils)
			window[gameFlag].CallChannelUtils("PayClosed");
	}
}

function callLinkImage(wdt, het, imageUrl, linkUrl, modal, closeBtn) {
	if(!linkUrl){
		return;
	}
	var sgs_wd_bton = '';
	if (closeBtn == 'nom') {
		sgs_wd_bton = '<div style="position:absolute;top:22px;right:25px;"><a href="javascript:;" onclick="closeLinkImage();return false;" style="float:left;width:19px;height:20px;overflow: hidden;text-indent:-9999px;cursor:pointer;background:url(images/close1.png) no-repeat 0 0;">[关闭]</a></div>';
	} else if (closeBtn == 'def') {
		sgs_wd_bton = '<div style="position:absolute;top:22px;right:25px;"><a href="javascript:;" onclick="closeLinkImage();return false;">[关闭]</a></div>';
	} else if(closeBtn == 'win'){
		sgs_wd_bton = '<div style="position:absolute;top:1px;right:10px;"><button class="CloseBtn" href="javascript:;" onclick="closeLinkImage();return false;"></button></div>';
	}
	var sgs_wd_body = '<div style="position:absolute;font-size:12px;top:50%;left:50%;margin-top:-'+Math.round(het/2)+'px;margin-left:-'+Math.round(wdt/2)+'px;width:'+wdt+'px;height:'+het+'px;z-index:9000;overflow:hidden;"><a href="javascript:;" onclick="linkImageClick('+"'"+linkUrl+"'"+');return false;"><img width="100%" height="100%" frameborder="no" scrolling="no" style="background-color:#fff;" src="'+imageUrl+'"/></a>'+sgs_wd_bton+'</div>';
	var isHttpsUrl = linkUrl.indexOf("https:") != -1;
	if(window.HttpsEnabled && !isHttpsUrl){		
		if (window.external && window.external.mxProductName) {
			window.open(linkUrl, "sgs_windows");
		}else{
			window.open(linkUrl);
		}
	}else{
		if (window.external && window.external.mxProductName) {
			window.open(linkUrl, "sgs_windows");
		} else if (modal) {
			document.getElementById("iframeCon").innerHTML = '<div style="position:absolute;left:0px;top:0px;width:100%;height:100%;background:rgba(0,0,0,0.5)">' + sgs_wd_body + '</div>';
		} else {
			document.getElementById("iframeCon").innerHTML = sgs_wd_body;
		}
	}
	
}

function closeLinkImage() {
	document.getElementById("iframeCon").innerHTML = '';
}

function linkImageClick(linkUrl) {
	window.open(linkUrl);
	document.getElementById("iframeCon").innerHTML = '';
}

function jsonpLogin (options) {
	var url = options.url;
	var data = options.data;
	
	var oBody = document.getElementsByTagName('body')[0];
	var oScript = document.createElement('script');
	oScript.setAttribute('src', url + '?' + format(data));
	oBody.appendChild(oScript);
}

function format(data) {
	var str = '';
	var arr = [];
	for (var p in data) {
		str = encodeURIComponent(p) + '=' + encodeURIComponent(data[p]);
		arr.push(str);
	}
	return arr.join("&") + "&_=" + new Date().getTime();
}

function sendAjax(obj){
	if(!obj){
		return;
	}
	var contentType = "application/x-www-form-urlencoded";
	if(obj.hasOwnProperty("contentType"))
	{
		contentType = obj.contentType ? obj.contentType : false;
	}

    var _ajax=$.ajax({
		url: obj.url,
		data:obj.data,
		type:obj.method||"get",
		dataType:obj.responseType||"text",
		contentType:contentType,
		processData:obj.processData,
		success: function( result ) {
			console.log(result);
			if(obj.callback){
				obj.callback(result);
			}
		},
		progress:function(result){
			if(obj.progressCB){
				obj.progressCB(result);
			}
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){
			console.log(errorThrown);
		},
		complete:function(XMLHttpRequest, textStatus){
			console.log(textStatus);
		}
	});

	return _ajax;
}

window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
	var info = "错误信息：" + errorMessage +
			"出错文件：" + scriptURI  +
			"出错行号：" + lineNumber +
			"出错列号：" + columnNumber  +
			"错误堆栈：" + (errorObj?errorObj.stack:"");
			// alert(info);
	// ClientLog.ReportError(info);

	// sendLogMessage("SendErrorLog",info);
};

////////////////////////微信API////////////////////////////////

var wxJsApiCheck = {};

//是否微信
function isWinXin()
{
	var ua = window.navigator.userAgent.toLowerCase();
	var str = ua.match(/MicroMessenger/i);
	if (str == "micromessenger")//微信端
		return true;
	return false;
}

//微信授权
function wxAuthorize()
{
	location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + window.appid + "&redirect_uri=" + window.gameUrl
					+ "&response_type=code&scope=snsapi_base&state=" + new Date().getTime() + "#wechat_redirect";
}

//权限配置接口
function wxConfig(appId,timestamp,nonceStr,signature,thisObj,callBack)
{
	wx.config({
		debug: false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
		appId: appId, // 必填，公众号的唯一标识
		timestamp: timestamp, // 必填，生成签名的时间戳
		nonceStr: nonceStr, // 必填，生成签名的随机串
		signature: signature,// 必填，签名
		jsApiList: ["checkJsApi","updateAppMessageShareData","updateTimelineShareData"] // 必填，需要使用的 JS 接口列表
	});
	wx.ready(function(){
		// config信息验证后会执行 ready 方法，所有接口调用都必须在 config 接口获得结果之后，
		//config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在 ready 函数中调用来确保正确执行。
		//对于用户触发时才调用的接口，则可以直接调用，不需要放在 ready 函数中。
		console.log("wx.config ready");
		wx.checkJsApi({
			jsApiList: ['updateAppMessageShareData','updateTimelineShareData'], // 需要检测的 JS 接口列表，所有 JS 接口列表见附录2,
			success: function(res) {
				// 以键值对的形式返回，可用的 api 值true，不可用为false
				// 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
				console.log(res);
				if (res.checkResult)
				{
					for (var key in res.checkResult)
					{
						wxJsApiCheck[key] = res.checkResult[key];
					}
				}
				callBack && callBack.apply(thisObj,[1]);
			}
		});
	});
	wx.error(function(res){
		// config信息验证失败会执行 error 函数，如签名过期导致验证失败，具体错误信息可以打开 config 的debug模式查看，也可以在返回的 res 参数中查看，对于 SPA 可以在这里更新签名。
		console.log("wx.error : " + res);
	});
}

//微信分享
function wxShare(title,desc,link,imgUrl,thisObj,callBack)
{
	//“分享给朋友”及“分享到QQ”
	if (wxJsApiCheck["updateAppMessageShareData"])
	{
		wx.updateAppMessageShareData({ 
			title: title, // 分享标题
			desc: desc, // 分享描述
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function () { 
				console.log("updateAppMessageShareData success");
				callBack && callBack.apply(thisObj,[1]);
			},
			cancel: function () { 
				console.log("updateAppMessageShareData cancel");
				callBack && callBack.apply(thisObj,[0]);
			}
		});
	}
	
	//“分享到朋友圈”及“分享到 QQ 空间”
	if (wxJsApiCheck["updateTimelineShareData"])
	{
		wx.updateTimelineShareData({ 
			title: title, // 分享标题
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function () { 
				console.log("updateTimelineShareData success");
				callBack && callBack.apply(thisObj,[1]);
			},
			cancel: function () { 
				console.log("updateTimelineShareData cancel");
				callBack && callBack.apply(thisObj,[0]);
			}
		});
	}
}

////////////////////////微信API////////////////////////////////

/////初始化

window.useWebp = checkWebp();
window.reqObj = GetRequest();//解析url参数
window.gameUrl = "https://10thwxh5.sanguosha.com/lwhzh5/index.php";//location.href.replace(location.search,"");//不带参数的url
window.appid = "wxd4f1448ebbb567a4";

if (isWinXin())
{
	if (window.reqObj.code)//授权返回
	{
		if (window.history && window.history.replaceState)//取消url中code参数：防止刷新继续走code 
			window.history.replaceState(null,null,window.gameUrl);
	}
	else
	{
		var openID = "";
		var token = "";
		if (window.canUseStorage)
		{
			openID = window.localStorage.getItem("lwzhOpenID");
			token = window.localStorage.getItem("lwzhToken");
		}
		if (!openID || !token)//本地没有保存token:去授权
		{
			this.wxAuthorize();
		}
		else
		{
			//进入游戏使用保存的token
		}
	}
}
else//非微端环境
{
	if (!window.isLocalDebug)//非本地debug调试环境
		this.wxAuthorize();//让微端自己提示用微信打开
}

/////进入游戏
var isScriptContent = typeof scriptContent == "function" ? true : false;
function enterGame()
{
	if (window.isLocalDebug)
	{
		//本地debug调试环境
	}
	else
	{
		//加载引擎库
		var layaPack = "laya.sgs";
		var gamePack = "sgsGame.sgs";
		if (!window.supportES6){//es5
			layaPack = "laya.es5.sgs";
			gamePack = "sgsGame.es5.sgs";
		}
		if (window.gameName) gamePack = window.gameName;

		loadZip("libs/min/" + layaPack + "?v=" + window.layaVersion + window.userVersionCorrect,function(){
			// console.log("Laya代码解析完成");
			loadZip(gamePack + "?v=" + window.mainVersion + window.userVersionCorrect,function(){
				// console.log("main.min.js代码解析完成");
			});
		});
	}
}