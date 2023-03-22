import SgsHTMLDivElement from "./base/SgsHTMLDivElement";

/*
* name;
*/
export default class SgsPanelHtmlBase extends SgsHTMLDivElement
{
    protected drawed:boolean = false;//是否已渲染
    protected inited:boolean = false;//是否已初始化
    
    constructor()
    {
        super();
        this.visible = false;
    }

    public get Drawed():boolean
    {
        return this.drawed;
    }

    public get Inited():boolean
    {
        return this.inited;
    }

    public get Dataed():boolean
    {
        return false;
    }

    public get NeedLeaveDrawClear():boolean
    {
        return false;
    }

    /**进入渲染(进入可视区域时调用,滚动时会多次执行)*/
    public EnterDraw():void
    {
        if (this.drawed) return;
        this.drawed = true;
        this.visible = true;
        if (!this.inited)
        {
            this.inited = true;
            this.init();
        }
    }

    /**离开渲染(离开可视区域时调用,滚动时会多次执行)*/
    public LeaveDraw():void
    {
        if (!this.drawed) return;
        this.drawed = false;
        this.visible = false;
    }

    /**离开可视区域清理*/
    public LeaveDrawClear():void
    {
        
    }

    /**初始化(首次渲染时调用，仅执行一次)*/
    protected init():void
    {

    }
}