/*
* name;
*/
export default class HtmlUtils{
    constructor(){

    }

    public static HtmlEscape(str:string):string
    {
        var s = "";
        if(str == null)return "";
        if(str.length == 0) return "";
        s = str.replace(/&/g,"&amp;");
        s = s.replace(/</g,"&lt;");
        s = s.replace(/>/g,"&gt;");
        s = s.replace(/ /g,"&nbsp;");
        s = s.replace(/\'/g,"&#39;");
        s = s.replace(/\"/g,"&quot;");
        return s;  
    }

    public static HtmlUnEscape(str:string):string
    {
        var s = "";
        if(str == null)return "";
        if(str.length == 0) return "";
        s = str.replace(/&amp;/g,"&");
        s = s.replace(/&lt;/g,"<");
        s = s.replace(/&gt;/g,">");
        s = s.replace(/&nbsp;/g," ");
        s = s.replace(/&#39;/g,"\'");
        s = s.replace(/&quot;/g,"\"");
        return s; 
    }

    public static GetHtmlImgUrl(str:string):Array<string>{
        let urlArr:Array<string> = [];
        if(!str){
            return urlArr;
        }
        // str = "this is test string <img src=\"http:yourweb.com/test.jpg\" width='50' > 123 and the end <img src=\"所有地址也能匹配.jpg\" /> 33! <img src=\"/uploads/attached/image/20120426/20120426225658_92565.png\" alt=\"\" />"
        //匹配图片（g表示匹配所有结果i表示区分大小写）
        let imgReg = /<img.*?(?:>|\/>)/gi;
        //匹配src属性
        let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        let arr = str.match(imgReg);
        console.log('所有已成功匹配图片的数组：'+arr);
        for (var i = 0; i < arr.length; i++) {
            var src = arr[i].match(srcReg);
            if(src[1]){
                urlArr.push(src[1]);
            }
            
        }
        return urlArr;
    }
}