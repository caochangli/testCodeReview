import ManagerBase from "./ManagerBase";
import ToolTips from "../../ui/tooltip/ToolTips";
import ToolTipBase from "../../ui/tooltip/ToolTipBase";
import TipsEvent from "../../event/TipsEvent";
import EventExpand from "../../event/EventExpand";
import GameEventDispatcher from "../../event/GameEventDispatcher";
import SceneManager from "./SceneManager";
import PromptLayer from "../../ui/layer/PromptLayer";
import SgsTexture from "../../ui/controls/base/SgsTexture";
import SgsText from "../../ui/controls/base/SgsText";
import SystemContext from "../../SystemContext";

/*
* name;
*/
export default class TipsManager extends ManagerBase
{
    public static LONG_DOWN_TRIGGER:string = "longDownTrigger";//长按触发
    public static CLICK_TRIGGER:string = "clickTrigger";//点击触发

    private toolTips:ToolTips;
    private currentTip:ToolTipBase;
    private viewArr:Array<ToolTipBase>;
    
    private delayEvent:TipsEvent;
    private curTipsEvent:TipsEvent;
    private tipsHideTime:number;
    // private targetPoint:Laya.Point;//手型对象相对舞台坐标
    // private targetArea:Laya.Rectangle;//手型对象相对舞台区域
    
    constructor()
    {
        super();
        
        // this.targetPoint = new Laya.Point();
        // this.targetArea = new Laya.Rectangle();
        this.viewArr = [];
    }

    private static instance:TipsManager;
    public static GetInstance():TipsManager
    {
        if (!this.instance)
            this.instance = new TipsManager();
        return this.instance;
    }

    public RegisterTips(val:any,triggerType:string,caller:any):void//注册tips对象
    {
        let eventType:string = "";
        if (triggerType == "" || triggerType == TipsManager.CLICK_TRIGGER)
            eventType = Laya.Event.CLICK;
        else
            eventType = EventExpand.LONG_DOWN;
        
        if (val) 
        {
            caller.on(eventType,this,this.onOverHandler);
        }
        else
        {
            caller.off(eventType,this,this.onOverHandler);
            TipsManager.GetInstance().HideTargetTips(caller);
        }
    }

    private onOverHandler(event:any):void
    {
        let tipsEvent:TipsEvent = TipsEvent.create(event instanceof Laya.Event ? event.currentTarget : event);
        TipsManager.GetInstance().onDelayShowTip(tipsEvent);
    }

    public get CurrentTip():ToolTipBase
    {
        return this.currentTip;
    }

    public get CurrentTarget():any
    {
        if (this.curTipsEvent)
           return this.curTipsEvent.target;
        return null;
    }

    public HideTargetTips(target:any):void
    {
        if (!target) return;
        if (this.curTipsEvent && target == this.curTipsEvent.target)
            this.TipsHide();
        else if (this.delayEvent && target == this.delayEvent.target)
            this.stopDelayTips();
    }

    public AddEventListener():void
    {
        super.AddEventListener();
        GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_OVER_EVENT,this,this.onDelayShowTip);
		GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_OUT_EVENT,this,this.onHideTip);
        GameEventDispatcher.GetInstance().on(TipsEvent.TIPS_SIZE_CHNAGED_EVENT,this,this.onTipsSizeChanged);
        Laya.stage.on(Laya.Event.MOUSE_DOWN,this,this.onStageDown);
    }

    public RemoveEventListener():void
    {
        super.RemoveEventListener();
    }

    private onDelayShowTip(event:TipsEvent):void
    {
        this.stopDelayTips();//先停止之前延迟的
        let now:number = new Date().getTime();
        if (now - this.tipsHideTime < 500 && !(SceneManager.GetInstance().IsGameScene))
            this.tipsShow(event);
        else//牌局中0.5秒后显示
        {
            this.TipsHide();
            this.delayEvent = event;
            Laya.timer.once(500,this,this.tipsShow,[event]);
        }
    }

    private onHideTip(target:any):void
    {
        if (target == this.CurrentTarget)
            this.TipsHide();
        else if (this.delayEvent && target == this.delayEvent.target)
            this.stopDelayTips();
    }

    private tipsShow(event:TipsEvent):void
    {
        this.TipsHide();
        this.delayEvent = null;
        this.curTipsEvent = event;
		if(this.curTipsEvent.target && this.curTipsEvent.target.ToolTip)
        {
			if (this.curTipsEvent.target.ToolTip instanceof Function)
            {
				this.currentTip = this.curTipsEvent.target.ToolTip.apply();
				if(this.currentTip instanceof Laya.Sprite)
                {
					if(this.viewArr.indexOf(this.currentTip) < 0)
						this.viewArr.push(this.currentTip);
					PromptLayer.GetInstance().addChild(this.currentTip);
				}
                else
                {	
					console.log("tips没有正确返回");
					return;
				}
			}
            else if (typeof this.curTipsEvent.target.ToolTip == "string") 
            {
                if(!this.toolTips)
                    this.toolTips = new ToolTips();
				PromptLayer.GetInstance().addChild(this.toolTips);
				this.toolTips.showMsg(this.curTipsEvent.target.ToolTip);
				this.currentTip = this.toolTips;
			}
            else
            {
				console.log("tips没有正确返回");
				return;
			}
            this.resetPos(this.currentTip);
		}
	}

    private resetPosMove(tip:ToolTipBase):void
    {
        if(!tip || !this.curTipsEvent || !this.curTipsEvent.target)
            return;
        if (!tip.needAutoPos) return;
        let xx:number = 0;
        let yy:number = 0;
        let p:Laya.Point;
        if(this.curTipsEvent.target instanceof Laya.Sprite)
            p = this.curTipsEvent.target.localToGlobal(new Laya.Point(0,0));
        else if(this.curTipsEvent.target instanceof SgsTexture || this.curTipsEvent.target instanceof SgsText)
            p = (this.curTipsEvent.target).globalPoint;
        else
            return;
        p = PromptLayer.GetInstance().globalToLocal(p);
        xx = p.x - tip.showWidth + (this.curTipsEvent.target.width >> 1);
        yy = p.y - tip.showHeight - 10;
        if (xx < 0)
            xx = p.x + (this.curTipsEvent.target.width >> 1);
        if (xx + tip.showWidth >= SystemContext.gameWidth - 10)
            xx = SystemContext.gameWidth - tip.showWidth - 10;
        if (yy < 0)
            yy = p.y + this.curTipsEvent.target.height + 10;
        if (yy + tip.showHeight >= SystemContext.gameHeight - 10)
            yy = SystemContext.gameHeight - tip.showHeight - 10;
        tip.x = xx;
        tip.y = yy;
    }

    private resetPos(tip:ToolTipBase):void//重置tips位置
    {
        if (!tip || !this.curTipsEvent) return;
        if (this.curTipsEvent.follow)//跟随鼠标
        {
            let p:Laya.Point = new Laya.Point(Laya.stage.mouseX,Laya.stage.mouseY);
            p = PromptLayer.GetInstance().globalToLocal(p);
            let xx:number = p.x;
            let yy:number = p.y;
            if (xx - tip.showWidth > 0)
                xx -= tip.showWidth;
            if (yy + tip.showHeight > SystemContext.gameHeight)
                yy -= tip.showHeight;
            tip.x = xx;
            tip.y = yy;
        }
        else
        {
            this.resetPosMove(tip);
        }
    }

    private stopDelayTips():void//停止延迟的tips
    {
        Laya.timer.clear(this,this.tipsShow);
        if (this.delayEvent)
        {
            this.delayEvent.recover();
            this.delayEvent = null;
        }
    }

	public TipsHide():void
    {
        Laya.timer.clearAll(this);
        this.currentTip = null;
		if(this.toolTips && this.toolTips.parent){
			this.toolTips.removeSelf();
		}
		this.viewArr.forEach(tip => {
			tip.removeSelf();
			tip.destroy();
		})
        this.viewArr.splice(0);
        if (this.curTipsEvent)
        {
            this.curTipsEvent.recover();
            this.curTipsEvent = null;
        }
        this.tipsHideTime = new Date().getTime();
	}

    private onTipsSizeChanged(tips:ToolTipBase):void//tips尺寸变化：重置tips位置
    {
        if (tips) this.resetPos(tips);
    }

    private onStageDown(event:Laya.Event):void
    {
        this.stopDelayTips();//先停止之前延迟的
        if (this.currentTip)//手机版:点击屏幕关闭tips
            this.TipsHide();
    }
}