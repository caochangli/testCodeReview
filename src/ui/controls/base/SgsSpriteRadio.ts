import SgsSpriteCheckBox from "./SgsSpriteCheckBox";
/*
* 普通Radio:状态改变后派发Laya.Event.CHANGE事件，手动设置selected属性不派发事件。
*/
export default class SgsSpriteRadio extends SgsSpriteCheckBox
{
    constructor()
    {
        super();
    }

    protected dispEventChange(event:Laya.Event):void
    {
        if (!this.selected)
        {
            this.selected = true;
            event.type = Laya.Event.CHANGE;
            if (this.eventDispatcher) this.eventDispatcher.event(Laya.Event.CHANGE,event);
        }
    }
}