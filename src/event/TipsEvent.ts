/*
* name;
*/
export default class TipsEvent
{
    public static TIPS_OVER_EVENT:string = "TIPS_OVER_EVENT";
    public static TIPS_OUT_EVENT:string = "TIPS_OUT_EVENT";
    public static TIPS_SIZE_CHNAGED_EVENT:string = "TIPS_SIZE_CHNAGED_EVENT";

    public static pool:Array<TipsEvent> = [];

    public target:any;
    // /**
    //  * 鼠标所在舞台位置x
    //  */
    // public stageX:number;
    // /**
    //  * 鼠标所在舞台位置y
    //  */
    // public stageY:number;
    // /**
    //  * 相对target 所在位置偏移x
    //  */
    // public offsetX:number;
    // /**
    //  * 相对target 所在位置偏移y
    //  */
    // public offsetY:number;
    // /**
    //  * tips 显示位置，top,left,bottom,right,center ,默认顶部
    //  */
    // public pos:string = "top";

    public follow:boolean = false;

    constructor()
    {

    }

    public initData(target:any,follow:boolean):void
    {
        this.target = target;
        this.follow = follow;
    }

    public clear():void
    {
        this.target = null;
        this.follow = false;
    }

    public recover():void
    {
        this.clear();
        if (TipsEvent.pool.indexOf(this) == -1)
            TipsEvent.pool.push(this);
    }

    public static create(target:any,follow:boolean = false):TipsEvent
    {
        let event:TipsEvent;
        if (TipsEvent.pool.length)
            event = TipsEvent.pool.pop();
        else
            event = new TipsEvent();
        event.initData(target,follow);
        return event;
    }
}