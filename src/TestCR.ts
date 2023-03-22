import AnimateManager from "./mode/base/AnimateManager";
import SgsTemplet from "./ui/controls/base/SgsTemplet";
import Dictionary from "./utils/Dictionary";
import ObjUtil from "./utils/ObjUtil";


/*
* name;
*/
export default class TestCR extends Laya.EventDispatcher
{
    constructor()
    {
        super();
    }

    public AddFun():void
    {
        var list = [1,2,3,4,5,6];
        while (list.length > 0)
        {
            console.log(list[0]);
        }
    }
}