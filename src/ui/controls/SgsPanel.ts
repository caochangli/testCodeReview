import SgsPanelItemBase from "./SgsPanelItemBase";
import SgsPanelHtmlBase from "./SgsPanelHtmlBase";
/*
* name;
*/
export default class SgsPanel extends Laya.Panel
{
    public static SCROLL_MAX:string = "SCROLL_MAX";

    protected curPage:number = 0;//当前页(从1开始)
    protected totalPage:number = 0;//总页数
    protected reqIng:boolean = false;//是否请求数据中

    protected isLeaveDrawClear:boolean = false;//离开渲染区域是否回收资源
    protected scrollClearValue:number = 0;//滚动回收阈值(超出屏幕多少像素后回收，默认0 表示panel尺寸)

    constructor()
    {
        super();
    }

    /**
     * 设置滚动回收资源
     * @param isLeaveDrawClear 离开渲染区域是否回收资源
     * @param scrollClearValue 滚动回收阈值(超出屏幕多少像素后回收，默认0 表示panel尺寸)
     * */
    public SetScrollClearRes(isLeaveDrawClear:boolean,scrollClearValue:number = 0):void
    {
        this.isLeaveDrawClear = isLeaveDrawClear;
        this.scrollClearValue = scrollClearValue;
    }

    public SetPage(curPage:number,totalPage:number):void
    {
        this.curPage = curPage;
        this.totalPage = totalPage;
        this.reqIng = false;
    }

    public UpdateDrawContent():void
    {
        if (this.vScrollBar)
            this.virtualDraw(this.vScrollBar);
        if (this.hScrollBar)
            this.virtualDraw(this.hScrollBar);
    }

    protected onScrollBarChange(scrollBar:Laya.ScrollBar):void
    {
        super.onScrollBarChange(scrollBar);
        
        this.virtualDraw(scrollBar);

        if(scrollBar.value == scrollBar.max)
        {
            this.event(SgsPanel.SCROLL_MAX);
            if (!this.reqIng && this.totalPage > this.curPage)
            {
                this.reqIng = true;
                this.event("reqNextPage",this.curPage + 1);
            }
        }
    }

    protected virtualDraw(scrollBar:Laya.ScrollBar):void//虚拟渲染：不在显示区域内的子项不渲染
    {
        let isVertical:boolean = scrollBar.isVertical;
        let start = scrollBar.value;
        let numChildren:number = this.numChildren;
        let item:SgsPanelItemBase | SgsPanelHtmlBase;
        if (isVertical)
        {
            let scrollClearValue = this.scrollClearValue ? this.scrollClearValue : this.height;
            for (let i:number = 0; i < numChildren; i++)
            {
                item = <SgsPanelItemBase | SgsPanelHtmlBase>this.getChildAt(i);
                item["isLeaveDrawClear"] = this.isLeaveDrawClear;
                if (item.y + item.height >= start && item.y <= start + this.height)
                    !item.Drawed && item.EnterDraw();
                else
                {
                    item.Drawed && item.LeaveDraw();
                    if (this.isLeaveDrawClear && item.Inited && item.Dataed && item.NeedLeaveDrawClear)//离开渲染区域时回收资源
                    {
                        if ((item.y + item.height < start - scrollClearValue) || (item.y > start + this.height + scrollClearValue))
                            item.LeaveDrawClear();
                    }
                }
            }
        }
        else
        {
            let scrollClearValue = this.scrollClearValue ? this.scrollClearValue : this.width;
            for (let i:number = 0; i < numChildren; i++)
            {
                item = <SgsPanelItemBase | SgsPanelHtmlBase>this.getChildAt(i);
                item["isLeaveDrawClear"] = this.isLeaveDrawClear;
                if (item.x + item.width >= start && item.x <= start + this.width)
                    !item.Drawed && item.EnterDraw();
                else
                {
                    item.Drawed && item.LeaveDraw();
                    if (this.isLeaveDrawClear && item.Inited && item.Dataed && item.NeedLeaveDrawClear)//离开渲染区域时回收资源
                    {
                        if ((item.x + item.width < start - scrollClearValue) || (item.x > start + this.width + scrollClearValue))
                            item.LeaveDrawClear();
                    }
                }           
            }
        }        
    }
}