import Dictionary from "../../utils/Dictionary";
import RegClass from "../../RegClass";
import SceneManager from "./SceneManager";
import WindowBase from "../../ui/base/WindowBase";

/*
* name;
*/
export default class WindowManager
{
	protected windowDic:Dictionary;
	protected windowLayerDic:Dictionary;
	protected hideViewWinDic:Dictionary;

	constructor() 
	{
		this.windowDic = new Dictionary();
		this.windowLayerDic = new Dictionary();
		this.hideViewWinDic = new Dictionary();
	}

	protected static instance:WindowManager;
	public static GetInstance():WindowManager
	{
		if(null == WindowManager.instance)
		{
			WindowManager.instance = new WindowManager();
		}
		return WindowManager.instance;
	}
	
	//打开弹窗 - 如果已实例化则不创建
	public OpenWindow(winName:string,...args):WindowBase
	{
		let result:WindowBase = this.windowDic.getStringKey(winName);
		if (!result)//不存在
		{
			result = RegClass.GetInstanceClass(winName);
			if (result)
			{
				result.name = winName;
				this.AddKey(winName,result);
				result.Open(...args);
			}
			else
			{
				console.log(winName + '弹窗未找到');
				return null;
			}
		}
		else//已存在
		{
			if (result.Loading)//加载中:更新数据，等待加载完成即可
			{
				result["windowData"] = args;
				return;
			}
			if (result.parent)//在舞台上:关闭后重新打开
			{
				result.Close(true);//立刻关闭
				this.OpenWindow(winName,... args);
			}
			else//不回收的窗口
			{
				result.ResetOpen(args);
			}
		}
		return result;
	}

	//关闭弹窗
	public CloseWindow(win:string,ignoreCloseAnimate:boolean = false):void
	{
		let result:WindowBase = this.windowDic.getStringKey(win);
		if (result && result.parent)
		{
			result.Close(ignoreCloseAnimate);
		}
	}

	//显示窗口:显示掩藏的窗口
	public ShowWindow(win:string):void
	{
		let result:WindowBase = this.windowDic.getStringKey(win);
		if (result && (!result.parent || result.Closeing))
		{
			result.Show();
		}
	}

	//掩藏弹窗:从舞台移除但不destory
	public HideWindow(win:string):void
	{
		let result:WindowBase = this.windowDic.getStringKey(win);
		if (result && result.parent)
		{
			result.Hide();
		}
	}

	//获取已实例窗口
	public GetWindow(win:string):WindowBase
	{
		let result:WindowBase = this.windowDic.getStringKey(win);
		return result ? result : null;
	}

	//弹窗是否存在
	public hasWindow(win:string):boolean
	{
		return this.windowDic.has(win);
	}

	//弹窗是否已打开
	public IsShowWindow(win:string):boolean
	{
		let result:WindowBase = this.windowDic.getStringKey(win);
		if (result && result.parent)
			return true;
		return false;
	}

	//关闭所有窗口
	public CloseAllWindow(force:boolean = false,ignoreCloseAnimate:boolean = false):void
	{
		this.windowDic.forEach((key:string,win:WindowBase)=>{
			if (win && win.parent && (force || win.CanAutoClose))
				win.Close(ignoreCloseAnimate);
		});
		// SceneManager.GetInstance().CurrentScene.DelAllOperationRecord();
	}

	//关闭所有其他窗口，除了某些窗口
	public CloseAllWindowWithouts(excludeWins:Array<string>,force:boolean = false,ignoreCloseAnimate:boolean = false):void
	{
		this.windowDic.forEach((key:string,win:WindowBase)=>{
			if (win && win.parent && (force || win.CanAutoClose) && excludeWins.indexOf(win.name) == -1)
				win.Close(ignoreCloseAnimate);
		});
	}

	//添加随窗口回收的动画模板
	public AddRecoverTemplet(winName:string,url:string):void
	{
		let win:WindowBase = this.windowDic.getStringKey(winName);
		if (win)
			win.AddRecoverTemplet(url);
	}

	//添加随窗口回收的动画对象池
	public AddRecoverEffectPool(winName:string,poolSign:string):void
	{
		let win:WindowBase = this.windowDic.getStringKey(winName);
		if (win)
			win.AddRecoverEffectPool(poolSign);
	}

	//更新掩藏其他视图
	public UpdateHideView(targetWin:WindowBase,isOpen:boolean):void
	{
		this.windowLayerDic.destroy();
		this.hideViewWinDic.destroy();
		let parentZOrder:number = 0;
		let winIndex:number = -1;
		this.windowDic.forEach((key:string,win:WindowBase)=>{
			if (win && win.parent)
			{
				parentZOrder = (win.parent as Laya.Sprite).zOrder;
				//按父级拆分存储
				if (!this.windowLayerDic.has(parentZOrder))
					this.windowLayerDic.addNumberKey(parentZOrder,[win]);
				else
					this.windowLayerDic.getNumberKey(parentZOrder).push(win);
				if (win.HideOtherView && !win.Closeing)//需要掩藏其他视图
				{
					winIndex = win.parent.getChildIndex(win);
					if (!this.hideViewWinDic.has(parentZOrder))
						this.hideViewWinDic.addNumberKey(parentZOrder,winIndex);
					else
						this.hideViewWinDic.addNumberKey(parentZOrder,Math.max(winIndex,this.hideViewWinDic.getNumberKey(parentZOrder)));
				}
			}
		});
		let curScnen = SceneManager.GetInstance().CurScene;
		if (this.hideViewWinDic.count > 0)//存在需要掩藏视图的窗口
		{
			let wins:Array<WindowBase>;
			this.hideViewWinDic.forEach((parentZOrder:number,winIndex:number) => {
				wins = this.windowLayerDic.getNumberKey(parentZOrder);
				if (wins && wins.length > 0)
				{
					wins.forEach(element => {
						if (winIndex > element.parent.getChildIndex(element))
							element.visible = false;
						else
							element.visible = true;
					});
				}
			});
			if (curScnen) curScnen.visible = false;
		}
		else
		{
			this.windowDic.forEach((key:string,win:WindowBase)=>{
				if (win) win.visible = true;
			});
			if (curScnen) curScnen.visible = true;
		}
		this.windowLayerDic.destroy();
		this.hideViewWinDic.destroy();
	}

	public AddKey(win:string,window:WindowBase):void
	{
		if (window && !window.destroyed)
			this.windowDic.addStringKey(win,window);
	}

	public DeleteKey(win:string):void
	{
		if (this.windowDic.has(win))
			this.windowDic.del(win);
	}
}