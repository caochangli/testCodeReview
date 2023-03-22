//caochangli 
//对编译后的main.min.js文件解除闭包处理(本地调试用)

var filePath = 'bin/js/main.min.js';//编译后文件
var fs = require('fs');

//闭包处理
function deBugClosure()
{
	var fileContent = fs.readFileSync(filePath,'utf-8');
	if (fileContent)
	{
		//去掉闭包代码
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
		
		fs.writeFileSync(filePath,fileContent);
	}
}


deBugClosure();
