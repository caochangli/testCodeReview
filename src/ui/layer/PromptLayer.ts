import LayerBase from "./LayerBase";
import { LayerOrder } from "../../enum/base/layerOrder";
import SystemContext from "../../SystemContext";
import TextPromptUI from "../controls/TextPromptUI";

/*
* 提示信息层
*/
export default class PromptLayer extends LayerBase
{
	private textPromptUIs:Array<TextPromptUI>;//文字提示UI数组
	private textPromptPool:Array<TextPromptUI>;//问题提示UI对象池
	private textPromptGap:number = 3;//文字提示UI垂直间距
	
    constructor()
    {
        super(LayerOrder.PromptLayer);

		this.textPromptUIs = [];
		this.textPromptPool = [];
    }

    protected static instance:PromptLayer;
	public static GetInstance():PromptLayer
	{
		if (null == PromptLayer.instance)
		{
			PromptLayer.instance = new PromptLayer();
		}
		return PromptLayer.instance;
	}	

	public ShowTextPrompt(msg:string, time:number = 3000):void
	{
		let textPromptUI:TextPromptUI;
		let startY:number = 0;//提示y坐标
		let length:number = this.textPromptUIs.length;
		if (length > 0)
		{
			textPromptUI = this.textPromptUIs[length - 1];
			startY = textPromptUI.y + textPromptUI.height + this.textPromptGap;
			if (length >= 3)//超过3条
			{
				textPromptUI = this.textPromptUIs.shift();
				textPromptUI.Clear();
				this.textPromptPool.push(textPromptUI);
			}
		}
		if (this.textPromptPool.length)
			textPromptUI = this.textPromptPool.shift();
		else
			textPromptUI = new TextPromptUI();
		textPromptUI.HideComplete = this.textPromptComplete.bind(this);
		textPromptUI.Show(msg,time);
		textPromptUI.x = SystemContext.gameWidth - textPromptUI.width >> 1;
		textPromptUI.y = length > 0 ? startY : SystemContext.gameHeight - textPromptUI.height >> 1;
		this.textPromptUIs.push(textPromptUI);

		this.layoutTextPrompt();
	}

	public ClearTextPrompt():void
	{
		if (!this.textPromptUIs) return;
		let textPromptUI:TextPromptUI;
		while(this.textPromptUIs.length)
		{
			textPromptUI = this.textPromptUIs.pop();
			if(textPromptUI)
			{
				textPromptUI.Clear();
				this.textPromptPool.push(textPromptUI);
			}
		}
	}

	private textPromptComplete(textPromptUI:TextPromptUI):void
	{
		if (!textPromptUI || !this.textPromptUIs) return;
		let index:number = this.textPromptUIs.indexOf(textPromptUI);
		if (index != -1)
		{
			this.textPromptUIs.splice(index,1);
			textPromptUI.Clear();
			this.textPromptPool.push(textPromptUI);
			this.layoutTextPrompt();
		}
	}

	private layoutTextPrompt():void
	{
		if (!this.textPromptUIs || this.textPromptUIs.length <= 0) return;
		let totalHeight:number = 0;
		this.textPromptUIs.forEach((textPromptUI:TextPromptUI)=>{
			totalHeight += textPromptUI.height;
		});
		totalHeight += (this.textPromptUIs.length - 1) * this.textPromptGap;
		let startY:number = SystemContext.gameHeight - totalHeight >> 1;
		this.textPromptUIs.forEach((textPromptUI:TextPromptUI)=>{
			textPromptUI.x = SystemContext.gameWidth - textPromptUI.width >> 1;
			textPromptUI.UpMove(startY);
			startY += textPromptUI.height + this.textPromptGap;
		}); 
	}
}