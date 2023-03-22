import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";

/*
* 背景层
*/
export default class BackgroundLayer extends LayerBase 
{
	private border:Laya.Image;

    constructor()
    {
        super(LayerOrder.BackgroundLayer);
    }

    protected static instance:BackgroundLayer;
	public static GetInstance():BackgroundLayer
	{
		if (null == BackgroundLayer.instance)
		{
			BackgroundLayer.instance = new BackgroundLayer();
		}
		return BackgroundLayer.instance;
	}
}
