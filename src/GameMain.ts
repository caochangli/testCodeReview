import RES from "./res/RES";
import ResourceEvent from "./res/ResourceEvent";
import FontName from "./enum/FontName";
import Global from "./Global";
import SystemContext from "./SystemContext";
import RegClass from "./RegClass";
import GameEventDispatcher from "./event/GameEventDispatcher";
import ResourceItem from "./res/ResourceItem";
import MainLoadingView from "./ui/loading/MainLoadingView";
import TopUILayer from "./ui/layer/TopUILayer";
import ConfigerManager from "./config/ConfigerManager";
import SgsTexture from "./ui/controls/base/SgsTexture";
import TipsManager from "./mode/base/TipsManager";
import SgsSoundManager from "./mode/base/SgsSoundManager";
import SceneManager from "./mode/base/SceneManager";
import TimerManager from "./mode/base/TimerManager";
import GlobalConfiger from "./config/GlobalConfiger";
import DressConfiger from "./config/DressConfiger";
import DressVO from "./vo/DressVO";
import DressPartVO from "./vo/DressPartVO";
import GameManager from "./mode/gameManager/GameManager";

// 程序入口
export default class GameMain
{
    private static loadingView:MainLoadingView;sss
	private configRatio:number = 0;
	private preloadRatio:number = 0;
	private static parseConfiged:boolean = false;//配置解析完
	private static preloaded:boolean = false;//perload资源加载完
	private static versionCorrect:string = "";//资源版本纠正(全服)
	private static userVersionCorrect:string = "";//资源版本纠正(玩家自己)

	private infoText:Laya.Text;

    constructor()
    {
		Config.isAlpha = true;//场景透明
		Config.isAntialias = false;//抗锯齿9
		Config.useWebGL2 = false;
		Laya.init(750,1496);
		Laya.stage.bgColor = null;
		Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;//缩放模式
		Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;//屏幕方向
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;//水平居中对齐
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;//垂直居中对齐
		Laya.Text.defaultFont = FontName.WRYH;

		// Laya.SoundManager.autoStopMusic = false;
		Laya.SoundManager["_isActive"] = true;
		var workerVersion = Laya.Browser.window.workerVersion ? "?v=" + Laya.Browser.window.workerVersion : '';
		Laya.WorkerLoader.workerPath = "libs/workerloader.js" + workerVersion;
		Laya.WorkerLoader.enable = true;

		Global.ConsoleLog = console.log;
		RES.MaxLoader = 4;

		//注意全局只设置一次
		TimerManager.GetInstance().Start();
		TipsManager.GetInstance().AddEventListener();

		this.initClientConfig();

	
		
		Laya.stage.on(Laya.Event.RESIZE,this,this.stageResize);
		Laya.stage.on(Laya.Event.FOCUS,this,this.stageFocus);
		Laya.stage.on(Laya.Event.BLUR,this,this.stageBlur);
		Laya.stage.on(Laya.Event.VISIBILITY_CHANGE,this,this.stageVisibility);

		if ("focus" in Laya.Browser.window)
			Laya.Browser.window.focus();
		let document:any = Laya.Browser.document;
		if (document && "hasFocus" in document && !document.hasFocus())
		{
			Laya.SoundManager["_isActive"] = false;
		}
		if (!SgsSoundManager.GetInstance().IsBgmStop)
			SgsSoundManager.GetInstance().PlayBgm();
	}

	private stageResize(event:Laya.Event):void//舞台尺寸变化
	{
		// updateBgSize(Laya.Browser.clientWidth,Laya.Browser.clientHeight);
		SystemContext.UpdateGameSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio,Laya.Browser.clientHeight * Laya.Browser.pixelRatio);
		this.updateInfoText();		
	}

	private stageFocus(event:Laya.Event):void//舞台获得焦点
	{
		if (!Laya.SoundManager["_isActive"])
			Laya.SoundManager["_isActive"] = true;
		if (SgsSoundManager.LayaBgMusic && !Laya.SoundManager["_musicChannel"])
			SgsSoundManager.GetInstance().PlayBgm();
		GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_FOCUS);
	}

	private stageBlur(event:Laya.Event):void//舞台失去焦点
	{
		GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_BLUR);
	}

	private stageVisibility(event:Laya.Event):void//舞台可见性变化(是否进入后台)
	{
		GameEventDispatcher.GetInstance().event(GameEventDispatcher.STAGE_VISIBILITY);
	}

	// public static BgComplete():void
	// {
	// 	// updateBgSize(Laya.Browser.clientWidth,Laya.Browser.clientHeight);
	// }

	private initClientConfig():void//初始化客户端配置
	{
		let url:string = "res/config/GlobalConfig.json?v=" + Math.random().toString();
		let type:string = "json";
		Laya.loader.load(url,Laya.Handler.create(this,loadComplete),null,type);
		function loadComplete(data:any):void
		{
			if (!data)//失败 
			{
				console.log("GlobalConfig.json加载失败");
                return;
            }
			GlobalConfiger.GetInstance().ParseConfig(data);
			RES.ClearResByUrl(url);
			if (Global.IsDebug)//debug版本
				Laya.Stat.show();//显示fps
			if (!Global.IsDebug)//不开启log
				console.log = function(){};
			this.initResourceVersion();
		}
	}

	private initResourceVersion():void//初始化资源版本文件
	{
		if (!Laya.Browser.window.isLocalDebug)//启动资源版本控制
		{
			this.addVersionPrefix();
			let resourceVersion:string = Laya.Browser.window.resourceVersion || "";
			Laya.ResourceVersion.enable("version.json?v=" + resourceVersion,Laya.Handler.create(this,loadComplete),Laya.ResourceVersion.FILENAME_VERSION);	
		}
		else
			this.initResources();
		
		function loadComplete():void
		{
			this.initResources();
		}
	}

	private addVersionPrefix():void//重构版本控制机制(加上资源服务器前缀和对应版本号)
	{
		GameMain.versionCorrect = Laya.Browser.window.versionCorrect || "";
		GameMain.userVersionCorrect = Laya.Browser.window.userVersionCorrect || "";
		Laya.ResourceVersion.addVersionPrefix = this.customVersionPrefix;
	}

	private customVersionPrefix(originURL:string):string
	{
		let manifest = Laya.ResourceVersion.manifest;
		if (manifest && manifest[originURL])//添加版本号
			originURL = originURL + "?v=" + manifest[originURL] + GameMain.versionCorrect + GameMain.userVersionCorrect;
		return originURL;
	}

    private initResources():void//初始化资源
    {
		RES.AddEventListener(ResourceEvent.CONFIG_COMPLETE,this,this.onConfigComplete);
		RES.AddEventListener(ResourceEvent.CONFIG_LOAD_ERROR,this,this.onConfigError);
		RES.LoadConfig("res/assets/default.res.json","res/");
    } 

	private onConfigError(event:ResourceEvent):void
	{
		console.log("配置文件加载失败");
		RES.RemoveEventListener(ResourceEvent.CONFIG_COMPLETE,this,this.onConfigComplete);
		RES.RemoveEventListener(ResourceEvent.CONFIG_LOAD_ERROR,this,this.onConfigError);
	}

	private onConfigComplete(event:ResourceEvent):void
	{
		RES.RemoveEventListener(ResourceEvent.CONFIG_COMPLETE,this,this.onConfigComplete);
		RES.RemoveEventListener(ResourceEvent.CONFIG_LOAD_ERROR,this,this.onConfigError);

		RES.ClearResByUrl("res/assets/default.res.json");

		RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceComplete);
        RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.AddEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.AddEventListener(ResourceEvent.ITEM_LOAD_ERROR, this, this.onItemLoadError);
		
		RES.LoadGroup("mainLoading");//优先加载主loading资源
	} 

	private onResourceError(event:ResourceEvent):void
	{
		this.showLoadError("资源组加载失败：" + event.groupName);
	}

	private onResourceProgress(event:ResourceEvent):void
	{
		let progress:number = event.progress;
		this.showLoadProgress(event.groupName,progress * 100,100);
	}

	private onItemLoadError(event:ResourceEvent):void
	{
		this.showLoadError("资源加载失败：" + event.errorUrl);
	}

	private onResourceComplete(event:ResourceEvent):void
	{
		if (event.groupName == "mainLoading")//主加载界面资源加载完成
		{
			if (!GameMain.loadingView)
			{
				GameMain.loadingView = new MainLoadingView();
        		TopUILayer.GetInstance().addChild(GameMain.loadingView);
				hideHtmlLoading();
			}
			// BottomLayer.GetInstance().Init();

			// if (ClientConfiger.GetInstance().ConfigZip)//替换配置文件资源组为Config_sgs
			// {
			// 	RES.DelGroupKeys("config");
			// 	Crypt.SwitchCryptRes("Config_sgs");
			// 	RES.AddGroupKeys("config",["Config_sgs"]);
			// }
			//预加载资源
			RES.AddGroupKeys("preload",["homeScene","dressScene","myDressScene","rankScene","saveDressWin"]);
			this.computeLoadResRatio();
			RES.LoadGroup("config");
			RegClass.RegAllClass();
		}
		else if (event.groupName == "config")
		{
			GameEventDispatcher.GetInstance().on("PARSE_CONFIGED",this,this.parseConfiged);
            ConfigerManager.GetInstance().ParsePreloadConfig();

			//预加载runtime目录资源：进度条计算异常(资源总量增加了)
			let dressConfiger = DressConfiger.GetInstance();
			let dressDic = dressConfiger.DressDic;
			let dressPartDic = dressConfiger.DressPartDic;
			let resources:Array<any> = [];
			let keys:Array<string> = [];
			let defaultResources:Array<any> = [];
			let defaultKeys:Array<string> = [];
			let resourceUrl:string = "";
			dressDic.forEach((key:number,element:DressVO) => {
				resourceUrl = element.ResourceUrl;
				if (resourceUrl)
				{
					resources.push({"url":resourceUrl,"type":"image","name":"runtime_dress_image" + element.Resource});
					keys.push("runtime_dress_image" + element.Resource);
				}
			});
			let defaultDressResources = dressConfiger.DefaultDressPartResources;
			dressPartDic.forEach((key:number,element:DressPartVO) => {
				resourceUrl = element.ResourceUrl;
				if (resourceUrl)
				{
					if (defaultDressResources && defaultDressResources.indexOf(resourceUrl) >= 0)//默认搭配的部件资源
					{
						defaultResources.push({"url":resourceUrl,"type":"image","name":"runtime_dressPart_image" + element.Resource});
						defaultKeys.push("runtime_dressPart_image" + element.Resource);
					}
					else
					{
						resources.push({"url":resourceUrl,"type":"image","name":"runtime_dressPart_image" + element.Resource});
						keys.push("runtime_dressPart_image" + element.Resource);
					}
				}
			});
			if (defaultDressResources && defaultDressResources.length > 0)//给默认搭配部件的资源加一个引用计数，使其image组件无法回收其资源
			{
				defaultDressResources.forEach(url => {
					RES.AddReference(url);
				});
			}
			if (defaultResources.length > 0)//将默认搭配部件的资源添加到preload，且不回收
			{
				RES.AddResources(defaultResources);
				RES.AddGroupKeys("preload",defaultKeys);
				// this.computeLoadResRatio();
			}
			if (resources.length > 0)
			{
				RES.AddResources(resources);
				RES.AddGroupKeys("runtime",keys);
				RES.AddGroupKeys("preload",["runtime"]);
				// this.computeLoadResRatio();
			}
			RES.AddReference("res/assets/shareIcon.png");
			RES.LoadGroup("preload");
		}
		else if (event.groupName == "preload")
		{
			//设置SgsTexture空纹理
			SgsTexture.EmptyTexture = RES.GetRes("EmptyImg");
			//从preload资源组中删除下列资源组，以便后续清理
			RES.DelGroupKeys("preload",["homeScene","dressScene","myDressScene","rankScene","saveDressWin","runtime"]);
			if (Global.AutoClearRes)
			{
				//删除预加载的资源(不删除主页资源组,因为进游戏的第一个页面就是主页)
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
    
    private removeResLoadEvent()
    {
        RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onResourceComplete);
        RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
        RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS, this, this.onResourceProgress);
        RES.RemoveEventListener(ResourceEvent.ITEM_LOAD_ERROR, this, this.onItemLoadError);
    }

	private parseConfiged():void//配置解析完成
	{
		GameEventDispatcher.GetInstance().off("PARSE_CONFIGED",this,this.parseConfiged);
        GameMain.parseConfiged = true;
		GameMain.EnterLoginScene();
	}

	public static CheckLoaded():boolean//检测资源是否已加载完
	{
		return GameMain.parseConfiged && GameMain.preloaded;
	}

	public static EnterLoginScene(platformLoginSucc:boolean = false):void//进入登录界面
	{
		if (GameMain.preloaded)//资源已加载完
		{	
			if (!GameMain.parseConfiged)
				GameMain.loadingView.ShowParseConfig();//配置未解析完
			else
				GameMain.loadingView.ResetProgress();//配置已解析完
		}
		if (GameMain.parseConfiged && GameMain.preloaded)
		{
			GameManager.GetInstance().on(GameManager.ENTER_GAME,this,this.onEnterGame);
			if (GameMain.loadingView)
				GameMain.loadingView.ShowText("加载数据中...");
			GameManager.GetInstance().InitUserData();
			// if (GameMain.loadingView)
			// {
			// 	GameMain.loadingView.parent.removeChild(this.loadingView);
			// 	GameMain.loadingView.destroy();
			// 	GameMain.loadingView = null;
			// }
			// SceneManager.GetInstance().EnterScene("HomeScene");
		}
	}

	private static onEnterGame():void//进入游戏
	{
		GameManager.GetInstance().off(GameManager.ENTER_GAME,this,this.onEnterGame);
		if (GameMain.loadingView)
		{
			GameMain.loadingView.parent.removeChild(this.loadingView);
			GameMain.loadingView.destroy();
			GameMain.loadingView = null;
		}
		SceneManager.GetInstance().EnterScene("HomeScene");
	}

	private computeLoadResRatio():void
	{
		let configs:Array<ResourceItem> = RES.GetGroupByName("config");
		let preloads:Array<ResourceItem> = RES.GetGroupByName("preload");
		let configCnt:number = configs ? configs.length : 0;
		let preloadCnt:number = preloads ? preloads.length : 0;
		this.configRatio = configCnt / (configCnt + preloadCnt);
		this.preloadRatio = preloadCnt / (configCnt + preloadCnt);
	}

	private showLoadProgress(groupName:string,curValue:number,maxValue:number):void
	{
		if (GameMain.loadingView)
		{
			if (groupName == "config")
				curValue = curValue * this.configRatio;
			else if (groupName == "preload")
				curValue = this.configRatio * 100 + curValue * this.preloadRatio;
			GameMain.loadingView.ShowProgress(curValue,maxValue);
		}
	}

	private showLoadError(errorMsg:string):void
	{
		if (GameMain.loadingView)
		{
			GameMain.loadingView.ShowError(errorMsg);
		}
	}

	private updateInfoText():void
	{
		// if (!this.infoText)
		// {
		// 	this.infoText = new Laya.Text();
		// 	this.infoText.pos(10,10);
		// 	this.infoText.width = 750 - 20;
		// 	this.infoText.zOrder = 100;
		// 	this.infoText.font = "黑体";
		// 	this.infoText.fontSize = 30;
		// 	this.infoText.align = "right";
		// 	Laya.stage.addChild(this.infoText);
		// }
		// this.infoText.text = SystemContext.gameWidth + "x" + SystemContext.gameHeight;

		// this.infoText.text = "尺寸:" + SystemContext.gameWidth + "x" + SystemContext.gameHeight + " " +
		// 				"多线程:" + Laya.WorkerLoader.enable + " " +
		// 				"webp:" + Laya.Browser.window.useWebp;
	}

	// //调用账号信息静态接口
	// public static CallAccountInfoStatic(funName:string,value:any):void
	// {
	// 	if (AccountInfo) AccountInfo[funName](value);
	// }
	// //设置账号信息字段
	// public static SetAccountInfoField(field:string,value:any):void
	// {
	// 	if (AccountInfo.Self) AccountInfo.Self[field] = value;
	// }
	// //调用log信息接口
	// public static CallLogManager(funName:string,message:string):void
	// {
	// 	LogManager.GetInstance()[funName](message);
	// }
	// //调用渠道管理接口
	// public static CallChannelUtils(funName:string,...args):void
	// {
	// 	ChannelUtils[funName](...args);
	// }
	// //显示weGame登录状态异常(退出游戏)
	// public static ShowWeGameQuit(errText:string = null):void
	// {
	// 	GameContext.ShowWeGameQuit(errText);
	// }
	// //播放本地录像
	// public static PlayLocalRecord(value:any):void
	// {
	// 	GameReplayManager.PlayLocalRecord(value);
    // }
    // //调用语音
	// public static CallGameAudioManager(funName:string,...args):void
	// {
	// 	GameAudioManager[funName](...args);
	// }
}
new GameMain();