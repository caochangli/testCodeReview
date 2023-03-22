//监测本地缓存是否可以使用
window.canUseStorage = false;
try
{
	if (window.localStorage)
	{
		window.localStorage.setItem('laya','1');
		window.localStorage.removeItem('laya');
		window.canUseStorage = true;
	}
}catch(e){
	window.canUseStorage = false;
}

//获取用户版本纠正号
var userVersionCorrect = "";
if (window.canUseStorage)
{
	userVersionCorrect = window.localStorage.getItem("userVersionCorrect");
	if (!userVersionCorrect) 
		userVersionCorrect = "";
}
window.userVersionCorrect = userVersionCorrect;

//进入游戏时间
var openTime = new Date().getTime();

//获取进入游戏时间
function getGameOpenTime()
{
	return openTime;
}

//重载游戏
function resLoadGame()
{
	if (window.canUseStoragee)
	{
		var correct = 1;
		var correctStr = window.localStorage.getItem("userVersionCorrect");
		if (correctStr) correct = Number(correctStr) + 1;
		window.localStorage.setItem("userVersionCorrect",correct.toString());
	}		
	window.location.reload();
}

//是否支持es6
function checkES6()
{
	if (Supports.letConst && Supports.arrow && Supports.spreadRest && Supports.class)
		return true;
	return false;
}
window.supportES6 = checkES6();

//兼容闭包处理
window.gameFlag = "GameMain";
function scriptContent(fileName,fileContent)
{
	//es5解除闭包逻辑
	// if (fileName == "main.min.js")
	// {
	// 	//删除闭包代码
	// 	var sIndex = fileContent.indexOf("var Sgs=function(){");
	// 	if (sIndex >= 0)
	// 	{
	// 		fileContent =  fileContent.slice(0,sIndex) + fileContent.slice(sIndex + 19);
	// 		sIndex = fileContent.indexOf("new GameMain;");
	// 		if (sIndex >= 0)
	// 		{	
	// 				fileContent = fileContent.slice(0,sIndex + 13);
	// 		}
	// 	}

	// 	//挂载GameMain类
	// 	var sIndex = fileContent.indexOf("new GameMain();");
	// 	if (sIndex >= 0)//找到 new GameMain(); 的位置
	// 		fileContent = fileContent.slice(0,sIndex) + "\nwindow.GameMain = GameMain;\n" + fileContent.slice(sIndex);
	// }
	// return fileContent;

	//es6解除闭包逻辑
	if (fileName == "bundle.js")
	{
		var sIndex = fileContent.indexOf("'use strict';");
		if (sIndex >= 0)
		{
			fileContent = '\n' + fileContent.slice(sIndex + 13);
			sIndex = fileContent.indexOf("return GameMain;");
			if (sIndex >= 0)
			{	
				var eIndex = fileContent.indexOf("}());",sIndex + 16);
				if (eIndex >= 0)
					fileContent = fileContent.slice(0,sIndex) + fileContent.slice(eIndex + 5);
			}
		}

		//找出class类
		var sIndex = fileContent.indexOf("new GameMain();");
		if (sIndex >= 0)//找到 new GameMain(); 的位置
			fileContent = fileContent.slice(0,sIndex) + "\nwindow.GameMain = GameMain;\n" + fileContent.slice(sIndex);
	}
	return fileContent;
}	

