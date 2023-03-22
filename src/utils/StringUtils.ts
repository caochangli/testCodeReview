/*
* name;
*/
export default class StringUtils
{
    constructor()
    {
        
    }

    // 类似于C#的 string.Format
    public static Format(str:string,... params):string
    {       
        if (!str) return "";                 
        let len:number = params.length;
        let args:Array<any>;
        if (len == 1 && params[0] instanceof Array)
        {
            args = params[0];
            len = args.length;
        }
        else
        {
            args = params;
        }
        for (let  i:number = 0; i < len; i++)
        {
            str = str.replace(new RegExp("\\{"+i+"\\}", "g"), args[i]);
        }
        return str;
    }

    /**
    * Pads p_string with specified character to a specified length from the right.
    *	@param p_string 原字符串
    *	@param p_search 要替换的字符
    *	@param p_replace 替换后的字符
    *	@returns String
    */
   public static replace(p_string:string, p_search:string,p_replace:string):string 
   {
       if (!p_search || p_search.length <= 0) return "";
       return p_string.replace(new RegExp(p_search,"gm"),p_replace);
   }
}