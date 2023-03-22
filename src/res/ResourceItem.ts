/*
* 资源管理 - 单个资源类
* Created by caochangli on 2017-11-15. 
*/
export default class ResourceItem
{
    public name:string = "";
    public url:string = "";
    public type:string = ""; 
    public data:any;

    constructor(name:string, url:string, type:string)
    {
        this.name = name;
        this.url = url;
        this.type = type;
    }
}