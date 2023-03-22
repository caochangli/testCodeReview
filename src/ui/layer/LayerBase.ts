import SystemContext from "./../../SystemContext";
import GameEventDispatcher from "./../../event/GameEventDispatcher";
/*
* 层级基类
*/
export default class LayerBase extends Laya.Sprite
{
    constructor(layerOrder)
    {
        super();

        this.zOrder = layerOrder;

        this.on(Laya.Event.ADDED, this, this.onAddToStage);
        this.on(Laya.Event.REMOVED, this, this.onRemoveToStage);
    }

    /** 获取层级序号 */
    public get LayerOrder():number
    {
        return this.zOrder;
    }

    protected onAddToStage(event?:Laya.Event):void
    {   
        GameEventDispatcher.GetInstance().on(Laya.Event.RESIZE, this, this.onGameResize);
        GameEventDispatcher.GetInstance().on(GameEventDispatcher.GAME_ADAPTATION, this, this.onGameAdaptation);

        this.onGameResize();
        this.onGameAdaptation();
    }
    
    protected onRemoveToStage(event?:Laya.Event):void
    {
        GameEventDispatcher.GetInstance().off(Laya.Event.RESIZE, this, this.onGameResize);
        GameEventDispatcher.GetInstance().off(GameEventDispatcher.GAME_ADAPTATION, this, this.onGameAdaptation);
    }

    public addChild(child:Laya.Node):Laya.Node
	{
        var addChild:Laya.Node = super.addChild(child);
        this.addChildToLayer();
		return addChild;
	}

    public addChildAt(node:Laya.Node, index:number):Laya.Node
    {
        var addChild:Laya.Node = super.addChildAt(node,index);
        this.addChildToLayer();
        return addChild;
    } 

    public addChildren(...args: any[]):void
    {
        super.addChildren(...args);
        this.addChildToLayer();
    } 

    public removeChild(child:Laya.Node):Laya.Node
	{
        var removeChild:Laya.Node = super.removeChild(child);
        this.removeChildToLayer();
		return removeChild;
	}

    public removeChildAt(index:number):Laya.Node
	{
        var removeChild:Laya.Node = super.removeChildAt(index);
        this.removeChildToLayer();
		return removeChild;
	}

    public removeChildByName(name:string):Laya.Node
	{
        var removeChild:Laya.Node = super.removeChildByName(name);
        this.removeChildToLayer();
		return removeChild;
	}

    public removeChildren(beginIndex:number, endIndex:number):Laya.Node
	{
        var removeChild:Laya.Node = super.removeChildren(beginIndex,endIndex);
        this.removeChildToLayer();
		return removeChild;
    }
    
    protected addChildToLayer():void//添加子项到层
    {
        if (this && !this.parent && this.numChildren > 0)//层级还未添加到舞台
            Laya.stage.addChild(this);
    }

    protected removeChildToLayer():void//从层中移除子项
    {
        if (this && this.parent && this.numChildren <= 0)
            Laya.stage.removeChild(this);
    }

    protected onGameResize():void//游戏尺寸变化
	{
        if (!this.scrollRect)
        {
            this.scrollRect = new Laya.Rectangle(0,0,SystemContext.gameWidth,SystemContext.gameHeight);
        }
        else
        {
            this.scrollRect.width = SystemContext.gameWidth;
            this.scrollRect.height = SystemContext.gameHeight;
        }
    }

    protected onGameAdaptation():void//游戏适配
    {
        // this.x = SystemContext.GamePaddingLeft;
        // this.y = SystemContext.GamePaddingTop;
        // this.scale(SystemContext.gameScale,SystemContext.gameScale);
    }
}