import SgsTexture from "./SgsTexture";
import SgsText from "./SgsText";
import SgsFlatContainer from "./SgsFlatContainer";
import Global from "../../../Global";
import EventExpand from "../../../event/EventExpand";
import TipsManager from "../../../mode/base/TipsManager";

/*
* name;
*/
export default class SgsSprite extends Laya.Sprite 
{
    protected _realDraw:boolean = true;//以真实绘制情况做事件响应区域(当mouseThrough为true且未设置hitArea时)

    protected drawContaniers:Array<SgsFlatContainer>;
    protected textureList:Array<SgsTexture | SgsText>;
    protected lastRolloverTexute:SgsTexture | SgsText;

    protected startX:number = 0;
    protected startY:number = 0;
    protected endX:number = 0;
    protected endY:number = 0;
    protected startAlpha:number = 1;
    protected endAlpha:number = 1;
    protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected _toolTip:any = "";//注意如果sprite的texure设置了toolTip，可能会有问题
    // protected buttonMode:boolean = false;//鼠标手型

	public constructor() 
    {
		super();
        this.drawContaniers = [];
        this.textureList = [];
	}

    public getGraphicBounds(realSize?: boolean):Laya.Rectangle//重构Graphic界限
    {
        if (!this._realDraw)
        {
            return super.getGraphicBounds(realSize);
        }
        else
        {
            let localP:Laya.Point = new Laya.Point(Laya.stage.mouseX,Laya.stage.mouseY);
            localP = this.globalToLocal(localP);
            let hitRect:Laya.Rectangle = Laya.MouseManager.instance ? Laya.MouseManager.instance["_rect"] : null;
            if (hitRect)
            {
                hitRect.setTo(0,0,this.width,this.height);
                if (!hitRect.contains(localP.x,localP.y))//还未进入本sprite区域：按设置的宽高返回
                    return hitRect;
            }

            let rect:Laya.Rectangle = new Laya.Rectangle();
            let sgsTexture:SgsTexture | SgsText = this.getTextureByPosition(Laya.stage.mouseX,Laya.stage.mouseY);
            // let localP:Laya.Point = new Laya.Point(Laya.stage.mouseX,Laya.stage.mouseY);
            // localP = this.globalToLocal(localP);
            if (sgsTexture)//找到了：直接返回一个包含该点的区域
            {
                rect.setTo(localP.x - 1,localP.y - 1,2,2);
            }
            else
            {
                rect.setTo(localP.x + 1,localP.y + 1,0,0);
            }
            return rect;
        }
    }
    
    /**添加绘制子项*/
    public addDrawChild(child:SgsText | SgsTexture | SgsFlatContainer):void
    {
        if (child instanceof SgsFlatContainer)
        {
            if (this.drawContaniers.indexOf(child) == -1)
                this.drawContaniers.push(child);
            child.Draw(this);
        }
        else
        {
            if (this.textureList.indexOf(child) == -1)
                this.textureList.push(child);
            child.draw(this);
        }
    }

    /**添加绘制子项
     * @param index 索引(注意：单个SgsText、SgsTexture很可能有多个渲染命令，请使用getTextStartIndex、getEndIndex、getTextureStartIndex、getTextureEndIndex获取索引后再设置索引)
     */
    public addDrawChildAt(child:SgsText | SgsTexture | SgsFlatContainer,index:number):void
    {
        if (child instanceof SgsFlatContainer)
        {
            if (this.drawContaniers.indexOf(child) == -1)
                this.drawContaniers.splice(index,0,child);
            child.Draw(this,index);
        }
        else
        {
            if (this.textureList.indexOf(child) == -1)
                this.textureList.splice(index,0,child);
            child.draw(this,index);
        }
    }

    /**删除绘制子项*/
    public removeDrawChild(child:SgsText | SgsTexture | SgsFlatContainer,destroy:boolean = true):void
    {
        if (child instanceof SgsFlatContainer)
        {
            child.ClearDraw(destroy);
            if (!this.drawContaniers || this.drawContaniers.length <= 0) return;
            let index:number = this.drawContaniers.indexOf(child);
            if (index > -1)
            {
                this.drawContaniers.splice(index,1);
            }
        }
        else
        {
            child.clear(destroy);
            if (!this.textureList || this.textureList.length <= 0) return;
            let index:number = this.textureList.indexOf(child);
            if (index > -1)
            {
                this.textureList.splice(index,1);
            }
        }
    }

    /**获取绘制子项的开始索引*/
    public getDrawChildStartIndex(child:SgsText | SgsTexture | SgsFlatContainer):number
    {
        return child.startIndex;
    }

    /**获取绘制子项的结束索引*/
    public getDrawChildEndIndex(child:SgsText | SgsTexture | SgsFlatContainer):number
    {
        return child.endIndex;
    }

    public setDrawChildIndex(child:SgsText | SgsTexture | SgsFlatContainer,index:number):void
    {
        child.index = index;   
    }

    /**已绘制子项个数*/
    public get drawCount():number
    {
        let graphicsCmds:Array<any> = this.graphics.cmds;
        if (graphicsCmds)
        {
            return graphicsCmds.length;
        }
        else if (this.graphics["_one"])
        {
            return 1;
        }
        return 0;
    }

    /**以真实绘制区域响应事件 默认true*/
    public set realDraw(value:boolean)
    {
        this._realDraw = value;
    }

    public set TipTriggerType(val:string)
	{
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
			this.addSelfEvent();
    }

    public get ToolTip():any
    {   
        return this._toolTip;
    }

    public set ToolTip(val:any)
    {
        // if(val)
        // {
        //     this.on(Laya.Event.ROLL_OUT,this,this.tipsRollOut);
        //     this.on(Laya.Event.ROLL_OVER,this,this.onRollOver);
        // }
        // else
        // {
        //     this.off(Laya.Event.ROLL_OUT,this,this.tipsRollOut);
        //     this.off(Laya.Event.ROLL_OVER,this,this.onRollOver);
        //     TipsManager.GetInstance().HideTargetTips(this);
        // }
        if (this._toolTip == val) return;
        this._toolTip = val;
        TipsManager.GetInstance().RegisterTips(val,this.tipTriggerType,this);
    }

    // public get ButtonMode():boolean
    // {
    //     return this.buttonMode;
    // }

    // public set ButtonMode(value:boolean)
    // {
    //     if (value)
    //     {
    //         this.on(Laya.Event.MOUSE_OVER,this,this.onButtonMode);
    //         this.on(Laya.Event.MOUSE_OUT,this,this.onButtonMode);
    //     }
    //     else
    //     {
    //         this.off(Laya.Event.MOUSE_OVER,this,this.onButtonMode);
    //         this.off(Laya.Event.MOUSE_OUT,this,this.onButtonMode);
    //         SgsMouseManager.ButtonMode(this,false);
    //     }
    //     this.buttonMode = value;
    // }

    // private onButtonMode(event:Laya.Event):void
    // {
    //     if (this.buttonMode) {
    //         SgsMouseManager.ButtonMode(this,event.type == Laya.Event.MOUSE_OVER ? true : false);
    //     }
    // }

    public get StartX():number
	{
		return this.startX;
	}

	public set StartX(val:number)
	{
		this.startX = val;
	}

	public get EndX():number
	{
		return this.endX;
	}

	public set EndX(val:number)
	{
		this.endX = val;
	}
	public get StartY():number
	{
		return this.startY;
	}

	public set StartY(val:number)
	{
		this.startY = val;
	}

	public get EndY():number
	{
		return this.endY;
	}

	public set EndY(val:number)
	{
		this.endY = val;
	}

    public set StartAlpha(val:number)
    {
        this.startAlpha = val;
    }

    public set EndAlpha(val:number)
    {
        this.endAlpha = val;
    }

    public get StartAlpha():number
    {   
        return this.startAlpha;
    }

    public get EndAlpha():number
    {
        return this.endAlpha;
    }

    public addDrawClick():void
    {
        this.on(Laya.Event.CLICK,this,this.onClick);
    }

    public removeDrawClick():void
    {
        this.off(Laya.Event.CLICK,this,this.onClick);
    }
    
    public addDrawMouseEvent():void
    {
        this.on(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
        this.on(Laya.Event.ROLL_OUT,this,this.onRollOut);
        this.on(Laya.Event.MOUSE_DOWN,this,this.onMouseDown);
        this.on(Laya.Event.MOUSE_UP,this,this.onMouseUp);
    }

    public removeDrawMouseEvent():void
    {
        this.off(Laya.Event.MOUSE_MOVE,this,this.onMouseMove);
        this.off(Laya.Event.ROLL_OUT,this,this.onRollOut);
        this.off(Laya.Event.MOUSE_DOWN,this,this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP,this,this.onMouseUp);
    }

    protected onRollOut(e:Laya.Event):void
    {
        if (this.lastRolloverTexute)
        {
            this.lastRolloverTexute.event(Laya.Event.ROLL_OUT,this.lastRolloverTexute);
            this.lastRolloverTexute = null;
        }
    }

    public onMouseMove(event:Laya.Event):void
    {
        let target:SgsSprite = event.currentTarget as SgsSprite;
        if (target && target instanceof SgsSprite)
        {
            let tex:SgsTexture | SgsText = target.getTextureByPosition(event.stageX,event.stageY);
            if (this.lastRolloverTexute != tex)
            {
                if (this.lastRolloverTexute && !this.isInOverlap(this.lastRolloverTexute,event.stageX,event.stageY))
                {
                    this.lastRolloverTexute.event(Laya.Event.ROLL_OUT,this.lastRolloverTexute);
                    this.lastRolloverTexute = null;
                }
                if (tex)
                {
                    tex.event(Laya.Event.ROLL_OVER,tex);
                    this.lastRolloverTexute = tex;
                }
            }
            if (tex)
            {
                tex.event(Laya.Event.MOUSE_MOVE,tex);
            }
        }
    }
    /**
     * 当前over区域是否在上一个over的SgsTexure上
     */
    private isInOverlap(tex1:SgsTexture | SgsText,sx:number,sy:number):boolean{
        let flag:boolean = false;
        let localP:Laya.Point = new Laya.Point(sx,sy);
        localP = this.globalToLocal(localP);
        if (tex1.renderX + tex1.renderWidth > localP.x && localP.x >= tex1.renderX && tex1.renderY + tex1.renderHeight > localP.y && localP.y >= tex1.renderY)
        {
            flag = true;
        }
        return flag;
    }

    protected onMouseDown(event:Laya.Event):void
    {
        let target:SgsSprite = event.currentTarget as SgsSprite;
        if (target && target instanceof SgsSprite)
        {
            let tex:SgsTexture | SgsText = target.getTextureByPosition(event.stageX,event.stageY);
            if (tex)
            {
                tex.event(Laya.Event.MOUSE_DOWN,tex);
                this.lastRolloverTexute = tex;
            }
        }
    }

    protected onMouseUp(event:Laya.Event):void
    {
        let target:SgsSprite = event.currentTarget as SgsSprite;
        if (target && target instanceof SgsSprite)
        {
            let tex:SgsTexture | SgsText = target.getTextureByPosition(event.stageX,event.stageY);
            if (tex)
            {
                tex.event(Laya.Event.MOUSE_UP,tex);
                this.lastRolloverTexute = tex;
            }
        }
    }

    protected onClick(event:Laya.Event):void
    {
        let target:SgsSprite = event.currentTarget as SgsSprite;
        if (target && target instanceof SgsSprite)
        {
           let tex:SgsTexture | SgsText = target.getTextureByPosition(event.stageX,event.stageY);
           if(tex)
           {
             tex.event(Laya.Event.CLICK,tex);
           }
        }
    }

    // protected tipsRollOut(e:Laya.Event):void
    // {
    //     if (this.toolTip)
    //     {
    //         let event:TipsEvent = new TipsEvent();
    //         event.target = this;
    //         GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_OUT_EVENT,event);
    //     }
    // }

    // protected onRollOver(e:Laya.Event):void
    // {
    //     if(this.toolTip)
    //     {
    //         let event:TipsEvent = new TipsEvent();
    //         event.target = this;
    //         event.stageX = e.stageX;
    //         event.stageY = e.stageY;
    //         let localP:Laya.Point = new Laya.Point(e.stageX,e.stageY);
    //         localP = this.globalToLocal(localP);
    //         event.offsetX = localP.x;
    //         event.offsetY = localP.y;
    //         GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_OVER_EVENT,event);
    //     }
    // }

    protected getTextureByPosition(x:number,y:number):SgsTexture | SgsText
    {
        let result:SgsTexture | SgsText = null;
        let cmds = this.graphics.cmds;
        cmds = cmds ? cmds : [this.graphics["_one"]];
        if(cmds)
        {
            let length:number = this.textureList.length;
            let tex:SgsTexture | SgsText;
            let localP:Laya.Point = new Laya.Point(x,y);
            localP = this.globalToLocal(localP);
            for(let i:number = length - 1 ; i > -1; i--)
            {
                tex = this.textureList[i];
                if (tex.mouseEnabled && tex.renderVisible && tex.alpha >= 0.01 && tex.renderX <= localP.x && tex.renderY <= localP.y && tex.renderX + tex.renderWidth >= localP.x && tex.renderY + tex.renderHeight >= localP.y)
                {
                    tex.mouseOffsetX = localP.x - tex.renderX;
                    tex.mouseOffsetY = localP.y - tex.renderY;
                    result = tex;
                    break;
                }
            }
        }
        return result;
    }

    // public UpdateTweenPos(pos:number):void
	// {

	// 	this.x = this.startX + (this.endX - this.startX) * pos;
	// 	this.y = this.startY + (this.endY - this.startY) * pos;
        
	// }
    
    // public TweenPos:number = 0;
    // protected easePos:number = 0;
    // protected tweenDura:number = 0;
    // protected tweenEase:Function;
    // protected tweenParams:Array<number>;//暂定number
    // /**
    //  * 自定义实现不同的Tween效果，
    //  * 比如默认Laya.Ease.backIn 不支持设置过冲量，由这里实现支持过冲量设置等相关其他参数，目前从底层
    //  * tween看到最多支持两个不同的扩展参数；所以tweenParams就只保存两个数据
    //  * 
    //  */
    // public UpdateSelfTweenPos():void{
    //     let pos:number = this.TweenPos;
    //     if(this.tweenEase){
    //         if(this.tweenParams && this.tweenParams.length == 1){
    //             // /1.70158
    //             pos = this.tweenEase(this.TweenPos * this.tweenDura,0,1,this.tweenDura,this.tweenParams[0]);
    //         }else if(this.tweenParams && this.tweenParams.length == 2){
    //             pos = this.tweenEase(this.TweenPos * this.tweenDura,0,1,this.tweenDura,this.tweenParams[0],this.tweenParams[1]);
    //         }else{
    //             pos = this.tweenEase(this.TweenPos * this.tweenDura,0,1,this.tweenDura);
    //         }
            
    //     }
    //     this.UpdateTweenPos(pos);
    // }

    // /**
    //  * 
    //  * @param dura 
    //  * @param delay 
    //  * @param ease 
    //  * @param s1 额外参数 (例：指定过冲量，此处数值越大，过冲越大。)
    //  * @param s2 额外参数 
    //  */
    // public StartSelfTween(dura:number,delay:number,ease?:Function,s1?:number,s2?:number):void
    // {
    //     this.TweenPos = 0;
    //     this.tweenEase = ease;
    //     this.tweenDura = dura;
    //     if(!this.tweenParams){
    //         this.tweenParams = [];
    //     }
    //     this.tweenParams.splice(0);
    //     if(s1 !== undefined && s1 !== null && s1 !== NaN){
    //         this.tweenParams.push(s1);
    //     }
    //     if(s2 !== undefined && s2 !== null && s2 !== NaN){
    //         this.tweenParams.push(s2);
    //     }
    //     let tween:Laya.Tween = Laya.Tween.to(this,{TweenPos:1},dura,null,null,delay,true);
    //     tween.update = new Laya.Handler(this,this.UpdateSelfTweenPos);
    // }


    // public CompleteTweenPos():void
	// {
	// 	this.startX = this.endX;
	// 	this.startY = this.endY;
	// 	this.x = this.endX;
	// 	this.y = this.endY;
	// }

    // public UpdateTweenAlpha(pos:number):void
    // {
    //     if (this.destroyed) return;
    //     this.alpha = this.startAlpha + (this.endAlpha - this.startAlpha) * pos;
    // }

    // public CompleteTweenAlpha():void
    // {
    //     if (this.destroyed) return;
    //     this.alpha = this.startAlpha = this.endAlpha;
    // }

    public RemoveDrawChildren():void
    {
        // this.drawContaniers.forEach(child => {
        //     child.ClearDraw(true);
        // });
        // this.textureList.forEach(child => {
        //     child.clear(true);
        // });
        //caochangli 修改新的遍历回收方式：遍历执行子项销毁方法时，会引起销毁其他子项从而改变了drawContaniers的长度，而导致遍历遗漏
        let drawContanier:SgsFlatContainer;
        while (this.drawContaniers.length > 0)
        {
            drawContanier = this.drawContaniers.shift();
            // if (!drawContanier.destroyed)
            drawContanier.ClearDraw(true);
        }
        let drawChild:SgsTexture | SgsText;
        while (this.textureList.length > 0)
        {
            drawChild = this.textureList.shift();
            // if (!drawChild.destroyed)
            drawChild.clear(true);
        }
        this.drawContaniers.length = 0;
        this.textureList.length = 0;
    }

    //是否已长按
    public get longDowned():boolean
    {
        return this._longDowned;
    }

    protected addSelfEvent():void
    {
        this.on(Laya.Event.MOUSE_DOWN,this,this.onSelfDown);
        this.on(Laya.Event.MOUSE_UP,this,this.onSelfUp);
        this.on(Laya.Event.MOUSE_OUT,this,this.onSelfUp);
    }

    protected removeSelfEvent():void
    {
        this.off(Laya.Event.MOUSE_DOWN,this,this.onSelfDown);
        this.off(Laya.Event.MOUSE_UP,this,this.onSelfUp);
        this.off(Laya.Event.MOUSE_OUT,this,this.onSelfUp);
    }

    protected onSelfDown(event:Laya.Event):void
    {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime,this,this.onLongTimer,[event.currentTarget]);
    }

    protected onSelfUp(event:Laya.Event):void
    {
        Laya.timer.clear(this,this.onLongTimer);
    }

    protected onLongTimer(event):void
    {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN,event);
    }

    public destroy(destroyChild:boolean=true):void
    {
        Laya.timer.clear(this,this.onLongTimer);
        this.removeSelfEvent();
        this.ToolTip = null;
        // this.ButtonMode = false;
        Laya.Tween.clearTween(this);
        this.RemoveDrawChildren();
        this.lastRolloverTexute = null;
        this.removeDrawClick();
        this.removeDrawMouseEvent();
        super.destroy(destroyChild);
    }
}