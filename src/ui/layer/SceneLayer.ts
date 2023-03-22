import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";
/*
* 场景层
*/
export default class SceneLayer extends LayerBase
{
    constructor()
    {
        super(LayerOrder.SceneLayer);
    }

    protected static instance:SceneLayer;
	public static GetInstance():SceneLayer
	{
		if (null == SceneLayer.instance)
		{
			SceneLayer.instance = new SceneLayer();
		}
		return SceneLayer.instance;
	}

}