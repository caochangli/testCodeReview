
import LoadingManager from "./LoadingManager";
import SilenceResManager from "./SilenceResManager";
import RegClass from "../../RegClass";
import RES from "../../res/RES";
import ResourceEvent from "../../res/ResourceEvent";
import SceneLayer from "../../ui/layer/SceneLayer";
import SceneBase from "../../ui/base/SceneBase";

/*
* 场景管理
*/
export default class SceneManager
{
    protected static instance:SceneManager;
	public static GetInstance():SceneManager
	{
		if (null == SceneManager.instance)
		{
			SceneManager.instance = new SceneManager();
		}
		return SceneManager.instance;
	}

	private previousSceneName:string = "";//上一个场景
    private lastScene:SceneBase;//最后一个场景
    private nextScene:SceneBase;//下一个场景


    /** 进入场景
     * @param sceneName 场景名 - 等同于类名。
     * @param data 传递的数据。
     * @param createAgain 是否再一次创建。当前场景若为进入的场景将移除后再创建，默认false
	 * @param complete 场景切换完成事件
     */
    public EnterScene(sceneName:string,data:any = null,createAgain:boolean = false,complete:Laya.Handler = null):void
    {
        if (this.lastScene && this.lastScene.SceneName == sceneName && !createAgain)
		{
			this.lastScene.ResetScene(data);
			return;
		}	
        let scene:SceneBase = RegClass.GetInstanceClass(sceneName);
		if (!scene) 
		{
			console.log(sceneName + '场景未找到');
			return;
		}
        scene.SceneName = sceneName;
        scene.SceneData = data;
		scene.EnterComplete = complete;
        this.nextScene = scene;
		if (this.lastScene)
		{
			SilenceResManager.GetInstance().StopSilenceRes();//停止原场景静默加载的资源
			this.lastScene.mouseEnabled = false;
		}
			
		// WBMgr.GetInstance().StartCache();//切换场景时缓存协议
        this.loadSceneResourceGroup(scene.ResNames);
	}
	
	//当前场景：进入场景过程中表示原来场景
	public get CurScene():SceneBase
	{
		return this.lastScene;
	}

	//下一个场景：进入场景过程中表示要进入的场景，进入结束后会置空
	public get NextScene():SceneBase
	{
		return this.nextScene;
	}

	//上一个场景名称
	public get PreviousSceneName():string
	{
		return this.previousSceneName;
	}

	//检查当前场景名
	public CheckSceneName(sceneName:string):boolean
	{
		return this.lastScene && this.lastScene.SceneName == sceneName;
	}

	//是否牌局内
	public get IsGameScene():boolean
	{
		return false;
	}

	//添加随场景回收的动画模板
	public AddRecoverTemplet(url:string):void
	{
		if (this.lastScene)
			this.lastScene.AddRecoverTemplet(url);
	}

	//添加随窗口回收的动画对象池
	public AddRecoverEffectPool(poolSign:string):void
	{
		if (this.lastScene)
			this.lastScene.AddRecoverEffectPool(poolSign);
	}

	private totalCount:number = 0;
	private loadedCount:number = 0;
    private loadSceneResourceGroup(resNames:Array<string>):void//加载场景资源
    {
		if (!resNames || resNames.length <= 0)//无需加载资源
		{
			this.enterNextScene();
			return;
		}
		LoadingManager.ShowLoading();
		this.addResEvent();
		this.totalCount = resNames.length;
		this.loadedCount = 0;
		let priority:number = 1000 + resNames.length - 1;
		for (let i:number = 0; i < resNames.length; i++)
		{
			RES.LoadGroup(resNames[i],priority);
			priority --;
		}
	}

	private addResEvent():void
	{
		RES.AddEventListener(ResourceEvent.GROUP_PROGRESS,this,this.onResourceProgress);
		RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR,this,this.onResourceError);
		RES.AddEventListener(ResourceEvent.GROUP_COMPLETE,this,this.onSceneResourceLoadComplete);
	}

	private removeResEvent():void
	{
		RES.RemoveEventListener(ResourceEvent.GROUP_PROGRESS,this,this.onResourceProgress);
		RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR,this,this.onResourceError);
		RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE,this,this.onSceneResourceLoadComplete);
		this.totalCount = 0;
		this.loadedCount = 0;
	}

	private onResourceProgress(event:ResourceEvent):void
	{
		if(!this.nextScene) return;
		if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0)
		{	
			let progress:number = event.progress;
			progress = this.loadedCount / this.totalCount + progress * (1 / this.totalCount);
			LoadingManager.ShowLoadProgress(progress * 100,100);
		}
	}

	private onResourceError(event:ResourceEvent):void
	{
		if (!this.nextScene) return;
		if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0)
		{
			if (this.lastScene)
				this.lastScene.mouseEnabled = true;
			this.nextScene.destroy();
			this.removeResEvent();
			LoadingManager.ShowLoadError("资源组加载失败：" + event.groupName,"");
		}
	}

	private onSceneResourceLoadComplete(event:ResourceEvent):void//场景资源加载完成
    {
		if (!this.nextScene) return;
		if (this.nextScene.ResNames && this.nextScene.ResNames.indexOf(event.groupName) >= 0)
		{	
			this.loadedCount ++;
			if (this.loadedCount >= this.totalCount)
			{
				this.removeResEvent();
				this.enterNextScene();
			}
		}
	}

	private enterNextScene():void
	{
		LoadingManager.CloseLoading();
		if (this.lastScene)//存在上个场景
		{
			this.lastScene.on(SceneBase.ANIMATE_OUT_COMPLETE,this,this.onSceneAnimateOutComplete);
			this.lastScene.AnimateOut();
		}
		else
		{
			this.executeSwitchScene(this.nextScene);
		}
	}
	
	private onSceneAnimateOutComplete():void//离开场景过度动画结束
    {
		this.lastScene.off(SceneBase.ANIMATE_OUT_COMPLETE,this,this.onSceneAnimateOutComplete);
		this.executeSwitchScene(this.nextScene);
	}

	private executeSwitchScene(scene:SceneBase):void
    {
		if (!scene) return;
		if (this.lastScene)
			this.previousSceneName = this.lastScene.SceneName;
		let tempScene = this.lastScene;
		this.lastScene = scene;
		if (tempScene) 
			tempScene.destroy();
		// this.SetBackGround(scene);
		
		this.lastScene.on(SceneBase.ANIMATE_IN_COMPLETE,this,this.onSceneAnimateInComplete);
        SceneLayer.GetInstance().addChild(this.lastScene);
		if(this.lastScene == this.nextScene)
			this.nextScene = null;
	}

    // public SetBackGround(scene:SceneBase)
    // {
	// 	if (scene.SceneName == "CreateRoleScene")//创建角色场景特殊处理
	// 		BackgroundManager.GetInstance().ShowBackGround("res/assets/runtime/battleBg/zhanchangbeijing_s.jpg",[],"",[]);
	// 	else
	// 	{
	// 		let sceneBgVO:SceneBgVO = BattleBgConfiger.GetInstance().GetSceneBgVO(scene.SceneName);
	// 		if (!sceneBgVO)
	// 			BackgroundManager.GetInstance().ShowBackGround("",[],"",[]);
	// 		else
	// 			BackgroundManager.GetInstance().ShowBackGround(sceneBgVO.BackUrl,sceneBgVO.BackAnimateUrls,sceneBgVO.ForwardUrl,sceneBgVO.ForwardAnimateUrls,sceneBgVO.DynamicCenter);
	// 	}
	// }

	private onSceneAnimateInComplete(scene:SceneBase):void//场景进入完成
	{
		//this.previousSceneName：判断从哪个场景退出的
	}
}