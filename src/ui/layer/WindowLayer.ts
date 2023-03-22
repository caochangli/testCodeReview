
import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";

/*
* 弹窗层
*/
export default class WindowLayer extends LayerBase
{
    constructor()
    {
        super(LayerOrder.WindowLayer);
    }

    protected static instance:WindowLayer;
	public static GetInstance():WindowLayer
	{
		if (null == WindowLayer.instance)
		{
			WindowLayer.instance = new WindowLayer();
		}
		return WindowLayer.instance;
	}
	
}