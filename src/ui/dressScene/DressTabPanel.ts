
/*
* name;
*/
export default class DressTabPanel extends Laya.Panel
{
    constructor()
    {
        super();
    }

    protected onScrollBarChange(scrollBar:Laya.ScrollBar):void
    {
        super.onScrollBarChange(scrollBar);
        this.event("scrollChange");
    }
}
