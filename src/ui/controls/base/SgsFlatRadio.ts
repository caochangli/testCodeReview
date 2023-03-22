
import SgsFlatCheckBox from "./SgsFlatCheckBox";
import SgsSprite from "./SgsSprite";
/*
* 扁平Radio:状态改变后派发Laya.Event.CHANGE事件，手动设置selected属性不派发事件。
*/
export default class SgsFlatRadio extends SgsFlatCheckBox
{
    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super(otherRenders);
    }

    protected dispEventChange(event:Laya.Event):void
    {
        if (!this.selected)
        {
            this.selected = !this.selected;
            this.event(Laya.Event.CHANGE,this);
        }
    }
}