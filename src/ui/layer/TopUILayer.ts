import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";

/*
* 顶级UI层
*/
export default class TopUILayer extends LayerBase
{
    constructor()
    {
        super(LayerOrder.TopUILayer);
    }

    protected static instance:TopUILayer;
	public static GetInstance():TopUILayer
	{
		if (null == TopUILayer.instance)
		{
			TopUILayer.instance = new TopUILayer();
		}
		return TopUILayer.instance;
	}

}