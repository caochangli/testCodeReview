import StringUtils from "./StringUtils";

/*
* name;
*/
export default class DateUtils
{
    constructor()
    {

    }

    /**
     * 对指定的时间按照指定的格式进行格式化 
     * @param date
     * @param format	日期格式参考 yyyy-MM-dd hh:mm:ss"
     */		
    public static DateFormat(date:Date,format:string = "yyyy-MM-dd"):string
    {
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return format;
    }

    /**
     * 对指定的时间戳按指定的格式进行格式化 
     * @param time 秒
     * @param format
     */		
    public static TimeFormat(time:number,format:string = "yyyy-MM-dd hh:mm:ss"):string
    {
        return DateUtils.DateFormat(new Date(time*1000),format);
    }

    /**
     * 对指定时间字符串按指定的格式进行格式化 
     * @param timeStr 时间格式字符串
     * @param format
     */		
    public static TimeStrFormat(timeStr:string,format:string = "yyyy-MM-dd hh:mm:ss"):string
    {
        let date:Date = DateUtils.StringFormatToDate(timeStr);
        return DateUtils.DateFormat(new Date(date.getTime()),format);
    }

    public static StringFormatToDate(format:string = "YYYY-MM-DD JJ:NN:SS"):Date
    {
        //兼容浏览器:格式转换为"YYYY/MM/DD JJ:NN:SS"
        format = StringUtils.replace(format,"-","/");
        let date:Date = new Date(format);
        return date;
    }
}