
import TipsEvent from "./../../event/TipsEvent";
import GameEventDispatcher from "./../../event/GameEventDispatcher";
import SgsSprite from "../controls/base/SgsSprite";
/*
* tonglifang toolTips基类，主要用于tips尺寸变化能通知到tipsmanager 更新位置;
*/
export default class ToolTipBase extends SgsSprite
{
    /**需要自动定位(tip坐标有底层控制)*/
    public needAutoPos:boolean = true;

    constructor()
    {
        super();

        this.mouseEnabled = false;
        this.zOrder = 1003;
    }


    //设置尺寸后会重新定位toolTip
    public size(w:number,h:number):Laya.Sprite
	{
		super.size(w,h);
        if (this.needAutoPos)
            GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_SIZE_CHNAGED_EVENT,this);
        return this;
	} 

    public get showWidth():number
    {
        return this.width * this.scaleX >> 0;
    }

    public get showHeight():number
    {
        return this.height * this.scaleY >> 0;
    }
}