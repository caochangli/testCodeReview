import DressConfiger from "../../config/DressConfiger";
import DressType from "../../enum/DressType";
import Global from "../../Global";
import HttpUtils from "../../utils/HttpUtils";
import StorageUtils from "../../utils/StorageUtils";
import UIUtils from "../../utils/UIUtils";
import DressVO from "../../vo/DressVO";
import SceneManager from "../base/SceneManager";

/*
* name;
*/
export default class GameManager extends Laya.EventDispatcher
{
	public static ENTER_GAME:string = "ENTER_GAME";//进入游戏
	public static SCORE_CHANGE:string = "SCORE_CHANGE";//积分变化
	public static COLLOCATION_SAVE_SUCC:string = "COLLOCATION_SAVE_SUCC";//装扮保存成功
	public static COLLOCATION_JOIN_SUCC:string = "COLLOCATION_JOIN_SUCC";//装扮参赛成功
	public static COLLOCATION_RANK:string = "COLLOCATION_RANK";//排行榜列表
	public static COLLOCATION_RANK_SEARCH:string = "COLLOCATION_RANK_SEARCH";//排行榜搜索
	public static COLLOCATION_VOTE_SUCC:string = "COLLOCATION_VOTE_SUCC";//装扮投票成功
	public static COLLOCATION_RANK_INFO:string = "COLLOCATION_RANK_INFO";//排行榜作品详情
	public static BACK_RANK_CHANGE:string = "BACK_RANK_CHANGE";//返回排行榜变更数据

	private openID:string = "";
	private token:string = "";
	private score:number = 0;//积分
	private code:string = "";//参赛作品编号
	private myCollocationList:Array<any>;//我的搭配列表
	private joinCollocationInfo:any;//参赛作品搭配信息
	private shareSuccDate:Date;//分享成功的时间

	constructor() 
	{
        super();
	}

	protected static instance:GameManager;
	public static GetInstance():GameManager
	{
		if (null == GameManager.instance)
			GameManager.instance = new GameManager();
		return GameManager.instance;
	}

	//桃气值
	public get Score():number
	{
		return this.score;
	}

	//参赛作品编号
	public get Code():string
	{
		return this.code;
	}

	//我的搭配列表
	public get MyCollocationList():Array<any>
	{
		return this.myCollocationList;
	}

	//我的参赛作品搭配信息
	public get JoinCollocationInfo():any
	{
		if (!this.joinCollocationInfo)
		{
			if (this.myCollocationList && this.myCollocationList.length)
			{
				for (let i:number = 0; i < this.myCollocationList.length; i++)
				{
					if (this.myCollocationList[i].is_join)
					{
						this.joinCollocationInfo = this.myCollocationList[i];
						break; 
					}
				}
			}
		}
		return this.joinCollocationInfo;
	}

	//是否已达搭配上限
	public get IsCollocationMaxed():boolean
	{
		return this.myCollocationList && this.myCollocationList.length >= Global.CollocationMax ? true : false;
	}

	//初始化用户数据
	public InitUserData():void
	{
		if (isWinXin())
		{
			let reqObj = Laya.Browser.window.reqObj;
			if (reqObj && reqObj.code)//授权返回
			{
				this.WechatLogin(reqObj.code);
			}
			else
			{
				let openID:string = StorageUtils.getString("lwzhOpenID");
				let	token:string = StorageUtils.getString("lwzhToken");
				if (openID && token)//利用保存的token
				{
					this.openID = openID;
					this.token = token;
					this.GetTokenTime(this.token);//校验token
				}
				else//异常：去授权
				{
					this.WechatAuthorize();
				}
			}
		}
		else//非微端环境
		{
			if (Laya.Browser.window.isLocalDebug)//本地debug调试环境
			{
				this.openID = "obEQh50jNP06elRvSzjUSEjXWuSE";
				this.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvMTB0aGx3aHouc2FuZ3Vvc2hhLmNvbVwvYXBpXC93ZWNoYXRMb2dpbiIsImlhdCI6MTY1ODU3Njk2OSwiZXhwIjoxNjU5MTgxNzY5LCJuYmYiOjE2NTg1NzY5NjksImp0aSI6Ikk0N0dlNXFCYWtqU3JLTVUiLCJzdWIiOjEsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.3GPj0ea6zxbAoN5GKt0F6GBx4Es3Pm5_xNLczpznfXc";				
				this.GetTokenTime(this.token);//校验token
			}
			else
			{
				this.WechatAuthorize();
			}
		}
	}

	//微信授权
	public WechatAuthorize():void
	{
		StorageUtils.delStorage("lwzhOpenID");
		StorageUtils.delStorage("lwzhToken");
		wxAuthorize();
	}

	//微信公众号授权登录：通过code获取openid、token
    public WechatLogin(code:string):void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/wechatLogin?code=" + code,null,this.onWechatLogin.bind(this),"get");
    }

	private onWechatLogin(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.openID = data.userModel.open_id;
		this.token = data.token;
		StorageUtils.addString("lwzhOpenID",this.openID);
		StorageUtils.addString("lwzhToken",this.token);
		this.WeChatJsSDK();
		this.MyScore();
	}

	//校验token剩余时间
    public GetTokenTime(token:string):void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/getTokenTime?token=" + token,null,this.onGetTokenTime.bind(this),"get");
    }

	private onGetTokenTime(result:any):void
	{
		let data = this.parseResult(result);
		if (!data || !data.left_time || data.left_time < 43200)//无效、过期、还有半天过期token 
		{
			this.WechatAuthorize();
			return;
		}
		this.WeChatJsSDK();
		this.MyScore();
	}

	//微信jsSDK
	public WeChatJsSDK():void
	{
		HttpUtils.Request(Global.ShareJsSdk + "?url=" + Global.GameUrl,null,this.onWeChatJsSDK.bind(this),"get");
	}

	private onWeChatJsSDK(result:any):void
	{
		try {
			let msg:any = JSON.parse(result);
			if (msg && msg.appId && msg.timestamp && msg.nonceStr && msg.signature)
			{	
				if (isWinXin())
				{
					wxConfig(msg.appId,msg.timestamp,msg.nonceStr,msg.signature,this,function(data:number){
						if (data > 0)//配置成功
						{
							var logoUrl = Laya.URL.formatURL("res/assets/logo.jpg");
							wxShare("李婉皮肤共创计划","《三国杀十周年》创玩节开启，携手百万玩家参与魏阵营武将李婉皮肤设计，超多搭配，丰富竞赛奖励，打造您心中最美武将",Global.GameUrl,logoUrl,this,function(data:number){
								console.log("分享接口回调：" + data);//0取消 1成功
								// if (data > 0)//分享设置成功
								// {
								// 	GameManager.GetInstance().CollocationShare();
								// }
							});
						}
					});
				}	
			}
			else
			{
				console.log("微信jsSDK接口数据异常：" + result);
			}
		}
		catch (error){
			
		}
	}

	//我的分数信息
    public MyScore():void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/myScore?token="+ this.token,null,this.onMyScore.bind(this),"get");
    }

	private onMyScore(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.score = data.score;
		this.code = data.code;
		this.event(GameManager.SCORE_CHANGE,[this.score]);

		if (!this.myCollocationList)//我的搭配列表不存在:登录时请求我的搭配列表
		{
			this.myCollocationList = [];
			this.CollocationList(1);
		}
	}

	//我的搭配列表
    public CollocationList(page:number):void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/myList?token="+ this.token + "&page=" + page,null,this.onCollocationList.bind(this),"get");
    }

	private onCollocationList(result:any):void
	{
		let data = this.parseResult(result);
		if (!data || !this.myCollocationList) return;
		let myList = data.data;
		if (myList && myList.length > 0)
		{
			myList.forEach(element => {
				if (!this.CheckCollocation(element.skin,element.collocation))//数据异常
					element.collocation = null;
				this.myCollocationList.push(element);
			});
		}
		if (data.current_page < data.last_page)//继续请求
		{
			this.CollocationList(data.current_page + 1);
		}
		else//我的搭配列表请求完
		{
			this.myCollocationList.sort(this.myCollocationListSort);
			let sceneManager = SceneManager.GetInstance();
			if (!sceneManager.CurScene)//未进入游戏
				this.event(GameManager.ENTER_GAME);
		}
	}

	//保存装扮
    public CollocationSave(skin:number,collocation:Array<number>):void
    {
		if (!this.CheckCollocation(skin,collocation,"装扮数据异常，不能保存")) return;
		let params = {token:this.token,skin:skin,collocation:collocation};
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/save",JSON.stringify(params),this.onCollocationSave.bind(this),"post","text",["Content-Type", "application/json"]);
    }

	private onCollocationSave(result:any):void
	{
		let data = this.parseResult(result);
		if (!data || !data.collocation) return;
		let info = data.collocation;
		if (this.myCollocationList)
		{
			if (!this.CheckCollocation(info.skin,info.collocation))//数据异常
				info.collocation = null;
			this.myCollocationList.push(info);
			this.myCollocationList.sort(this.myCollocationListSort);
		}	
		this.event(GameManager.COLLOCATION_SAVE_SUCC,[info]);
	}

	//参赛
    public CollocationJoin(id:string):void
    {
		let params = {token:this.token,id:id};
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/join",JSON.stringify(params),this.onCollocationJoin.bind(this,id),"post","text",["Content-Type", "application/json"]);
    }

	private onCollocationJoin(id:number,result:any):void
	{
		let data = this.parseResult(result);
		if (!data || !data.code) return;
		this.code = data.code;
		if (this.myCollocationList)
		{
			for (let i:number = 0; i < this.myCollocationList.length; i++)//将我的搭配打上参赛标记
			{
				if (this.myCollocationList[i].id == id)
				{
					this.myCollocationList[i].is_join = 1;
					break;
				}
			}
			this.myCollocationList.sort(this.myCollocationListSort);
		}
		this.event(GameManager.COLLOCATION_JOIN_SUCC);
	}

	//排行榜列表
    public CollocationRank():void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rank?token=" + this.token,null,this.onCollocationRank.bind(this),"get");
    }

	private onCollocationRank(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.event(GameManager.COLLOCATION_RANK,[data]);
	}

	//排行榜搜索
    public CollocationRankSearch(code:string):void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rank?token=" + this.token + "&code=" + code,null,this.onCollocationRankSearch.bind(this),"get");
    }

	private onCollocationRankSearch(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.event(GameManager.COLLOCATION_RANK_SEARCH,[data]);
	}

	//投票
    public CollocationVote(code:string):void
    {
		let params = {token:this.token,code:code};
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/vote",JSON.stringify(params),this.onCollocationVote.bind(this,code),"post","text",["Content-Type", "application/json"]);
    }

	private onCollocationVote(code:string,result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.event(GameManager.COLLOCATION_VOTE_SUCC,[code]);
		this.MyScore();
	}

	//分享
    public CollocationShare():void
    {
		let todayShareAddScore:boolean = false;//今日分享已加过分
		if (this.shareSuccDate)
		{
			let curDate = new Date();
			todayShareAddScore = this.shareSuccDate.getFullYear() == curDate.getFullYear() && this.shareSuccDate.getMonth() == curDate.getMonth() && 
							this.shareSuccDate.getDate() == curDate.getDate() ? true : false;
		}
		if (!todayShareAddScore)
       		HttpUtils.Request(Global.ServerUrl + "/api/collocation/share?token=" + this.token,null,this.onCollocationShare.bind(this),"get");
    }

	private onCollocationShare(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.shareSuccDate = new Date();
		this.MyScore();
	}

	//排行榜作品详情
    public CollocationRankInfo(code:string):void
    {
        HttpUtils.Request(Global.ServerUrl + "/api/collocation/rankInfo?token=" + this.token + "&code=" + code,null,this.onCollocationRankInfo.bind(this),"get");
    }

	private onCollocationRankInfo(result:any):void
	{
		let data = this.parseResult(result);
		if (!data) return;
		this.event(GameManager.COLLOCATION_RANK_INFO,[data.collocation]);
	}

	//校验装扮合法性
	public CheckCollocation(skin:number,collocation:Array<number>,tipMsg:string = ""):boolean
	{
		let result:boolean = true;
		if (!skin || skin < 1 || skin > 3)//肤色异常
			result = false;
		else if (!collocation || collocation.length <= 0)//没有搭配信息
			result = false;
		else
		{
			//必须要有发型、眼睛、鞋子及(套装或上衣、下衣)
			let config = DressConfiger.GetInstance();
			let dressVo:DressVO;
			let existHairstyle:boolean = false;
			let existEye:boolean = false;
			let existShoes:boolean = false;
			let existSuit:boolean = false;
			let existJacket:boolean = false;
			let existLowerGarments:boolean = false;
			for (let i:number = 0; i < collocation.length; i++)
			{
				dressVo = config.GetDressByDressID(collocation[i]);
				if (!dressVo)
				{
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
			if (result)
			{
				if (!existHairstyle || !existEye || !existShoes)//没有发型、眼睛、鞋子
					result = false;
				else 
				{
					if (existSuit)//有套装
					{
						if (existJacket || existLowerGarments)//同时有上衣或下衣
							result = false;
					}
					else//无套装
					{
						if (!existJacket || !existLowerGarments)//没有上衣、下衣
							result = false;
					}
				}
			}
		}
		if (!result && tipMsg)
			UIUtils.ShowTextPrompt(tipMsg);
		return result;
	}

	private myCollocationListSort(a:any,b:any):number//我的搭配列表排序：参赛作品置顶、其他按序号从小到大
	{
		if (a.is_join) return -1;
		if (b.is_join) return 1;
		return a.number - b.number;
	}

	private parseResult(result)
	{
		try {
			let msg:any = JSON.parse(result);
			if (msg)
			{
				if (msg.code)//错误
				{
					//指定错误码：token过期 重新授权
					if (msg.code == 401)//token过期
					{
						this.WechatAuthorize();
					}
					else
					{
						let errorMsg:string = msg.msg ? msg.msg : "请求错误";
						// UIUtils.OpenPromptWin("",errorMsg,100,null,null,PromptWindow.BTN_TYPE2);
						UIUtils.ShowTextPrompt(errorMsg);
					}
					return null;
				}
				else
				{
					return msg.data;
				}
			}
		}
		catch (error){
			return null;
		}
	}
}