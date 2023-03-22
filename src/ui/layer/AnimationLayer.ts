import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";
/*
* 动画层
*/
export default class AnimationLayer extends LayerBase
{
    constructor()
    {
        super(LayerOrder.AnimationLayer);
    }

    protected static instance:AnimationLayer;
	public static GetInstance():AnimationLayer
	{
		if (null == AnimationLayer.instance)
		{
			AnimationLayer.instance = new AnimationLayer();
		}
		return AnimationLayer.instance;
	}

}