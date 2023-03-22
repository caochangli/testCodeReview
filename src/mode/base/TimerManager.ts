import DateUtils from "../../utils/DateUtils";

export default class TimerManager extends Laya.EventDispatcher
{
	public static SecondChanged:string = "second";
	public static TIMER_ZERO:string = "TIMER_ZERO";//到了零点
    public static HEARTBEAT_DISTANCE:number = 30;
	public static MINUTE_DISTANCE:number = 60;

	private isFirstSystemTime:boolean = true;//是否首次同步服务端时间
	private gameTimeSecond:number = 0;//客户端运行时间
    private serverTime:number = 0;//服务器时间
	private getServerTime:number = 0;//得到服务器时间时 客户端的运行时间

	protected timer:Laya.Timer;

	protected static instance:TimerManager;
	public static GetInstance():TimerManager
	{
		if(null == TimerManager.instance)
		{
			TimerManager.instance = new TimerManager();
		}
		return TimerManager.instance;
	}

	public constructor() 
	{
		super();
		this.timer = new Laya.Timer();
	}

	public Start():void
	{
		// this.timer.loop(1000,this,this.onTimer);
	}

    public InitHeartBeart():void
    {
		// WBMgr.GetInstance().On(ProtoBufId.CMSG_CRESPSYNCSYSTEMTIME,this,this.onReqsyncsysTimer);
        // WBMgr.GetInstance().SendSystemTime();

		// WBMgr.GetInstance().On(ProtoBufId.NETFRAME_CLIENT_RESPHEARTBEAT,this,this.onProtoHeartBeat);
        // WBMgr.GetInstance().SendHeartbeart();
    }

	// protected onReqsyncsysTimer(e:ServerProxyEvent):void//服务端时间返回
	// {
	// 	let pv:Protocol = <Protocol>e.Protocol;
	// 	this.getServerTime = this.gameTimeSecond;
	// 	this.serverTime = pv.ProtoVO.protoData.serverTimestamp;

	// 	if (this.isFirstSystemTime)
	// 	{
	// 		this.isFirstSystemTime = false;
	// 	}
	// }

	// protected onProtoHeartBeat(e:ServerProxyEvent):void//心跳
	// {
	// 	//心跳时同步服务端时间，减少与服务端时间误差
	// 	WBMgr.GetInstance().SendSystemTime();
	// }

	// protected onTimer():void
	// {
	// 	this.gameTimeSecond ++;
    //     if (this.gameTimeSecond % TimerManager.HEARTBEAT_DISTANCE == 0)
    //     {
	// 		if (!WBMgr.GetInstance().Closed)
	// 		{
	// 			WBMgr.GetInstance().SendHeartbeart();
	// 		}
    //     }

	// 	this.event(TimerManager.SecondChanged);

	// 	if ((this.ServerTime - 57600)%86400 == 0)//到了零点
	// 		this.event(TimerManager.TIMER_ZERO);
	// }

	// public Stop():void
	// {
	// 	this.timer.clearAll(this);
	// 	WBMgr.GetInstance().Off(ProtoBufId.CMSG_CRESPSYNCSYSTEMTIME,this,this.onReqsyncsysTimer);
	// 	WBMgr.GetInstance().Off(ProtoBufId.NETFRAME_CLIENT_RESPHEARTBEAT,this,this.onProtoHeartBeat);
	// }

	/**客户端运行时间(秒)*/
	public get GameTimeSecond():number
	{
		return this.gameTimeSecond;
	}

	/**服务器时间(时间搓 秒级)*/
	public get ServerTime():number
    {	
		let afterTime:number = this.gameTimeSecond - this.getServerTime;
		if (afterTime < 0) afterTime = 0;
        return this.serverTime + afterTime;
    }

	/**服务器时间*/
	public get ServerDate():Date
    {	
        return new Date(this.ServerTime*1000);
    }

	//获取本地时间对应的北京时间
	public get ServerUTC8Date():Date
	{
		let d:Date = new Date(this.ServerTime*1000);
		let localTime = d.getTime();
		let localOffset:number = d.getTimezoneOffset()*60000; //获得当地时间偏移的毫秒数,这里可能是负数
		let utc = localTime + localOffset; //utc即GMT时间
		let offset = 8; //时区，北京市+8  美国华盛顿为 -5
		let localSecondTime = utc + (3600000*offset);  //本地对应的毫秒数
		return new Date(localSecondTime);
    }

	//获取本地时间对应的北京时间
	public GetUTC8Date(second:number):Date
	{
		let d:Date = new Date(second*1000);
		let localTime = d.getTime();
		let localOffset:number = d.getTimezoneOffset()*60000; //获得当地时间偏移的毫秒数,这里可能是负数
		let utc = localTime + localOffset; //utc即GMT时间
		let offset = 8; //时区，北京市+8  美国华盛顿为 -5
		let localSecondTime = utc + (3600000*offset);  //本地对应的毫秒数
		return new Date(localSecondTime);
    }

	//打印当前服务器时间
	public LogServerTime():void
	{
		let d:Date = new Date(this.ServerTime*1000);
		console.log("服务器时间：" + DateUtils.DateFormat(d,"yyyy-MM-dd hh:mm:ss"));
	}	
}