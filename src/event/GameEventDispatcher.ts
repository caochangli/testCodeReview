export default class GameEventDispatcher extends Laya.EventDispatcher 
{
	public static DIANJIANG_INFO_CHANGE_EVENT:string = "DIANJIANG_INFO_CHANGE_EVENT";
	public static GAME_ADAPTATION:string = "GAME_ADAPTATION";//游戏适配(游戏区域坐标、缩放)
	public static STAGE_FOCUS:string = "STAGE_FOCUS";//舞台获得焦点
	public static STAGE_BLUR:string = "STAGE_BLUR";//舞台失去焦点
	public static STAGE_VISIBILITY:string = "STAGE_VISIBILITY";//舞台可见性变化(是否进入后台)
	public static WINDOW_CLOSED:string = "windowClosed";//弹窗已关闭(包括移除和掩藏)
	public static AIHELP:string = "AIHELP";
	public static AIHELP_POPUP_WIN:string = "AIHELP_POPUP_WIN";
	public static PREVENT_ADDICTION:string = "PREVENT_ADDICTION";

	public static GAME_AUDIO_CHANGE:string = "GAME_AUDIO_CHANGE";//通知有人语音说话
	public static GAME_QR_BUY_COMMPLETE:string = "GAME_QR_BUY_COMMPLETE";//二维码购买成功

	public static ACTIVITY_SWITCH_TAB:string = "ACTIVITY_SWITCH_TAB";


	// 武将信息界面
	public static GAME_GENERAL_INFO_SELECT_SKIN:string = "GAME_GENERAL_INFO_SELECT_SKIN";//选中皮肤
	public static GAME_GENERAL_PLAY_SKILL_SOUND:string = "GAME_GENERAL_PLAY_SKILL_SOUND";//播放技能音效
	
	public static CARD_AVATAR_SKILL_CHANGE:string = "CARD_AVATAR_SKILL_CHANGE";
	public static SKILL_STATE_DATA_CHANGE:string = "CARD_LABLE_STATE_CHANGE";
	public static SHARE_SUCCESS:string = "SHARE_SUCCESS";
	public static UPDATE_GAME_ROUND_RECORD:string = "UPDATE_GAME_ROUND_RECORD";
	public static OPEN_GAME_ROUND_RECORD:string = "OPEN_GAME_ROUND_RECORD";
	public static CARD_UNLOCK_WINDOW_CLOSED:string = "CARD_UNLOCK_WINDOW_CLOSED";
	public static ENTER_ROUND:string = "ENTER_ROUND";

	public static UPDATE_BROADCAST_STATE:string = "UPDATE_BROADCAST_STATE";//更新直播画面状态(用于打开、关闭窗口时掩藏、恢复直播画面)
	
	public constructor() 
	{
		super();
	}

	protected static instance:GameEventDispatcher;
	public static GetInstance():GameEventDispatcher
	{
		if(null == GameEventDispatcher.instance)
		{
			GameEventDispatcher.instance = new GameEventDispatcher();
		}
		return GameEventDispatcher.instance;
	}
}