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
	if (window.canUseStorage)
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
window.gameFlag = "Sgs";