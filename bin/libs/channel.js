var ChannelTyp = function (){};
ChannelTyp.CHATOL = 210100; // 官方 - 外部访问after
ChannelTyp.CHATOLWD = 110101; // 官方微端
ChannelTyp.CHAT4399 = 220001; // 4399
ChannelTyp.CHAT4399WD = 120002; // 4399微端
ChannelTyp.CHATBaiDu = 220003; // 百度
ChannelTyp.CHATBaiDuWD = 120004; // 百度微端
ChannelTyp.CHATFeiHuo = 220005; // 飞火
ChannelTyp.CHATFeiHuoWD = 120006; // 飞火微端
ChannelTyp.CHATQQ = 120007; // QQ - 外部访问after
ChannelTyp.CHATQQWD = 1008; // QQ微端
ChannelTyp.CHAT7K7K = 220009; // 7K7K
ChannelTyp.CHAT7K7KWD = 1010; // 7K7K微端
ChannelTyp.CHAT11DuiZhan = 1011; // 11对战
ChannelTyp.CHAT11DuiZhanWD = 1012; // 11对战微端
ChannelTyp.CHATKuaiWan = 220013; // 快玩
ChannelTyp.CHATKuaiWanWD = 120014; // 快玩微端
ChannelTyp.CHAT602 = 220015; // 602
ChannelTyp.CHAT602WD = 120016; // 602微端
ChannelTyp.CHATZiXia = 220017; // ZiXia
ChannelTyp.CHATZiXiaWD = 120018; // ZiXia微端
ChannelTyp.CHAT3DM = 220019; // 3dm
ChannelTyp.CHAT3DMWD = 120020; // 3dm微端
ChannelTyp.CHATShunWang = 220021; // 顺网
ChannelTyp.CHATShunWangWD = 120022; // 顺网微端
ChannelTyp.CHATWeGame = 321023; // Wegame安卓
ChannelTyp.CHATWeGameWD = 120024; // Wegame微端
ChannelTyp.CHATDuoWan = 220025; // 多玩YY
ChannelTyp.CHATDuoWanWD = 1026; // 多玩YY微端
ChannelTyp.CHATOLAndroid = 310027; // 官方安卓
ChannelTyp.CHATOLIOS = 420028; // 官方IOS
ChannelTyp.CHAT4399Android = 320029; // 4399安卓
ChannelTyp.CHAT4399IOS = 420030; // 4399IOS
ChannelTyp.CHATLenovo = 120031; // 联想cps
ChannelTyp.CHATFeiHuoAds = 121032; // 飞火广告
ChannelTyp.CHATSteam = 120061; // Steam
ChannelTyp.CHATWeGameIOS = 420034; // WegameIOS
ChannelTyp.CHATShunWangH5 = 520103; // 顺网H5
ChannelTyp.CHATYingYongBaoAndroid = 1036; // 应用宝安卓
ChannelTyp.CHATHuYaAndroid = 320037; // 虎牙安卓
ChannelTyp.CHATOLAndroidReplicate1 = 311038; // 官方安卓马甲包1
ChannelTyp.CHATIQiYi = 1039; // 爱奇艺
ChannelTyp.CHATIQiYiWD = 1040; // 爱奇艺微端
ChannelTyp.CHATMumuAndroid = 320041; // Mumu安卓
ChannelTyp.CHATQQLobby = 120042; // QQ大厅 - 外部访问after
ChannelTyp.CHAT233Android = 320043; // 233乐园安卓
ChannelTyp.CHAT2144 = 220044; // 2144
ChannelTyp.CHAT360WD = 120045; // 360微端
ChannelTyp.CHATBiLiBiLiAndroid = 320046; // B站安卓
ChannelTyp.CHATYokaXiaoMiAndroid = 320047; // 游卡小米安卓
ChannelTyp.CHATOLAndroidReplicate2 = 311048; // 官方安卓马甲包2
ChannelTyp.CHATTouTiaoAndroid = 320049; // 头条安卓
ChannelTyp.CHATSteamChinaWD = 120062; // SteamChina微端
ChannelTyp.CHATOLWDReplicate1 = 1051; // 官网微端市场投放包
ChannelTyp.CHATXiaoMiAndroid = 320052; // 小米安卓
ChannelTyp.CHATYokaHuPu = 320053; // 游卡虎扑
ChannelTyp.CHATWeGameReplicate1 = 321054; // Wegame安卓马甲包1
ChannelTyp.CHATIQiYiH5 = 520055; // 爱奇艺H5
ChannelTyp.CHATVivoAndroid = 320056; // Vivo安卓
ChannelTyp.CHATLenovoReplicate1 = 1057; // 联想cps马甲包1
ChannelTyp.CHATHaoYouKuaiBaoAndroid = 320024; // 好游快爆安卓
ChannelTyp.CHATMoMoYuAndroid = 320025; // 摸摸鱼安卓
ChannelTyp.CHATFeiHuoAds1 = 121058; // 飞火广告包1
ChannelTyp.CHATFeiHuoAds2 = 221059; // 飞火广告包2
ChannelTyp.CHATLenovoAds1 = 121060;//联想广告包1    微端+联运+广告
ChannelTyp.CHAT360 = 220061;// 360网页端
ChannelTyp.CHATOLPioneer  = 210999;////官网体验服
ChannelTyp.CHATOLTencentStartWD = 120063;//腾讯云start

var converts = {};//渠道转换(老渠道转换成新渠道)
converts[100] = ChannelTyp.CHATOL;
converts[101] = ChannelTyp.CHATOLWD;
converts[1001] = ChannelTyp.CHAT4399;
converts[1002] = ChannelTyp.CHAT4399WD;
converts[1003] = ChannelTyp.CHATBaiDu;
converts[1004] = ChannelTyp.CHATBaiDuWD;
converts[1005] = ChannelTyp.CHATFeiHuo;
converts[1006] = ChannelTyp.CHATFeiHuoWD;
converts[1007] = ChannelTyp.CHATQQ;
converts[1009] = ChannelTyp.CHAT7K7K;
converts[1013] = ChannelTyp.CHATKuaiWan;
converts[1014] = ChannelTyp.CHATKuaiWanWD;
converts[1015] = ChannelTyp.CHAT602;
converts[1016] = ChannelTyp.CHAT602WD;
converts[1017] = ChannelTyp.CHATZiXia;
converts[1018] = ChannelTyp.CHATZiXiaWD;
converts[1019] = ChannelTyp.CHAT3DM;
converts[1020] = ChannelTyp.CHAT3DMWD;
converts[1021] = ChannelTyp.CHATShunWang;
converts[1022] = ChannelTyp.CHATShunWangWD;
converts[1023] = ChannelTyp.CHATWeGame;
converts[1024] = ChannelTyp.CHATWeGameWD;
converts[1025] = ChannelTyp.CHATDuoWan;
converts[1027] = ChannelTyp.CHATOLAndroid;
converts[1028] = ChannelTyp.CHATOLIOS;
converts[1029] = ChannelTyp.CHAT4399Android;
converts[1030] = ChannelTyp.CHAT4399IOS;
converts[1031] = ChannelTyp.CHATLenovo;
converts[1032] = ChannelTyp.CHATFeiHuoAds;
converts[1033] = ChannelTyp.CHATSteam;
converts[1034] = ChannelTyp.CHATWeGameIOS;
converts[1035] = ChannelTyp.CHATShunWangH5;
converts[1037] = ChannelTyp.CHATHuYaAndroid;
converts[1038] = ChannelTyp.CHATOLAndroidReplicate1;
converts[1041] = ChannelTyp.CHATMumuAndroid;
converts[1042] = ChannelTyp.CHATQQLobby;
converts[1043] = ChannelTyp.CHAT233Android
converts[1044] = ChannelTyp.CHAT2144;
converts[1045] = ChannelTyp.CHAT360WD;
converts[1046] = ChannelTyp.CHATBiLiBiLiAndroid;
converts[1047] = ChannelTyp.CHATYokaXiaoMiAndroid
converts[1048] = ChannelTyp.CHATOLAndroidReplicate2;
converts[1049] = ChannelTyp.CHATTouTiaoAndroid;
converts[1050] = ChannelTyp.CHATSteamChinaWD
converts[1052] = ChannelTyp.CHATXiaoMiAndroid;
converts[1053] = ChannelTyp.CHATYokaHuPu;
converts[1054] = ChannelTyp.CHATWeGameReplicate1;
converts[1055] = ChannelTyp.CHATIQiYiH5;
converts[1056] = ChannelTyp.CHATVivoAndroid;

//获取转换渠道
function getConvertChannel(channel)
{
	if (converts[channel])
		return converts[channel];
	return channel;
}

//获取渠道登陆地址
//channel 渠道号
//defaultOfficial 是否默认官网
function getLoginUrl(channel,defaultOfficial)
{
	channel = getConvertChannel(channel);
	var loginUrl = '';
	if (channel == ChannelTyp.CHATOL)//官网
		loginUrl = 'https://web.sanguosha.com';
	else if (channel == ChannelTyp.CHAT4399)//4399
		loginUrl = 'http://my.4399.com/yxxsgs/';
	else if (channel == ChannelTyp.CHATBaiDu)//百度
		loginUrl = 'http://youxi.baidu.com/sgs/index/';
	else if (channel == ChannelTyp.CHATFeiHuo)//飞火
		loginUrl = 'http://lyapi.sanguosha.com/feihuo/logout';
	else if (channel == ChannelTyp.CHAT7K7K)//7k7k
		loginUrl = 'http://g.7k7k.com/games/sgsxq/';
	else if (channel == ChannelTyp.CHATKuaiWan)//快玩
		loginUrl = 'https://web.kuaiwan.com/kwsgs/server_list.html';	
	else if (channel == ChannelTyp.CHAT602)//602
		loginUrl = 'http://sgs.602.com/';
	else if (channel == ChannelTyp.CHATZiXia)//紫霞
		loginUrl = 'https://game.zixia.com/zxxsgs/';
	else if (channel == ChannelTyp.CHAT3DM)//3DM
		loginUrl = 'https://yeyou.3dmgame.com/yy/xsgs/';
	else if (channel == ChannelTyp.CHATShunWang)//顺网
		loginUrl = 'http://sgs.swjoy.com';
	else if (channel == ChannelTyp.CHATDuoWan)//yy
		loginUrl = 'http://xxjj.yy.com/';
	else if (channel == ChannelTyp.CHATLenovo)//联想
		loginUrl = 'https://lyapi.sanguosha.com/lenovo/logout';

	if (!loginUrl && defaultOfficial)//找不到登录页，默认官网
		loginUrl = 'https://web.sanguosha.com';
	return loginUrl;
}

//获取微端下载地址
//channel 渠道号
//defaultOfficial 是否默认官网
function getWDUrl(channel,defaultOfficial)
{
	channel = getConvertChannel(channel);
	var wdUrl = '';
	if (channel == ChannelTyp.CHATOL)//官网
		wdUrl = 'https://dlsgsnew.sanguosha.com/pc/sgs/Sgsc10thinstall.exe';
	else if (channel == ChannelTyp.CHAT4399)//4399
		wdUrl = 'https://my.4399.com/yxxsgs/wd-down';
	else if (channel == ChannelTyp.CHATBaiDu)//百度
		wdUrl = 'https://dlsgsnew.sanguosha.com/pc/baidu/Sgsc10thinstall.exe';
	else if (channel == ChannelTyp.CHATFeiHuo)//飞火
		wdUrl = 'https://dlsgsnew.sanguosha.com/pc/feihuo/Sgsc10thinstall.exe';
	else if (channel == ChannelTyp.CHATKuaiWan)//快玩
		wdUrl = 'https://dl.kuaiwan.com/kuaiwan/custom/exe/kw_kwsgs.exe';	
	else if (channel == ChannelTyp.CHAT602)//602
		wdUrl = 'http://down.602.com/zc602_sgs.exe';
	else if (channel == ChannelTyp.CHATZiXia)//紫霞
		wdUrl = 'https://game.zixia.com/zxxsgs/zixia_xsgs.exe';
	else if (channel == ChannelTyp.CHAT3DM)//3DM
		wdUrl = 'http://dl10.cudown.com/3dmgame_xsgs.exe';
	else if (channel == ChannelTyp.CHATShunWang)//顺网
		wdUrl = 'http://download.swjoy.com/sgs/sgs.exe';

	if (!wdUrl && defaultOfficial)//找不到微端，默认官网
		wdUrl = 'https://web.sanguosha.com';
	return wdUrl;
}