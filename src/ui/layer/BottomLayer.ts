import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";

/*
* 最低层
*/
export default class BottomLayer extends LayerBase 
{
    constructor()
    {
        super(LayerOrder.BottomLayer);
    }

    protected static instance:BottomLayer;
	public static GetInstance():BottomLayer
	{
		if (null == BottomLayer.instance)
		{
			BottomLayer.instance = new BottomLayer();
		}
		return BottomLayer.instance;
	}
}
