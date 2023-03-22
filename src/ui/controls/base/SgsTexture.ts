import SgsSprite from "./SgsSprite";
import Global from "../../../Global";
import EventExpand from "../../../event/EventExpand";
import TipsManager from "../../../mode/base/TipsManager";

/*
* 绘制纹理：支持缩放、尺寸、九宫格
*/
export default class SgsTexture extends Laya.EventDispatcher
{
    /**空纹理*/
    public static EmptyTexture:Laya.Texture;

    public name:string = "";
    /**父管理节点*/
    public parentContainer:any;
    /**渲染器*/
    protected render:SgsSprite;

    protected _x:number = 0;
    protected _y:number = 0;
    protected _width:number = 0;
    protected _height:number = 0;
    protected _scaleX:number = 1;
    protected _scaleY:number = 1;
    protected _matrix:Laya.Matrix;
    protected _alpha:number = 1;
    protected _color:string = "";
    protected _gray:boolean = false;
    protected _sizeGrid:Array<string>;
    protected _texture:Laya.Texture;
    protected _visible:boolean = true;
    protected _mouseEnabled:boolean = false;
    protected _globalPoint:Laya.Point;
    protected _destroyed:boolean = false;

    protected gridTextures:Array<Laya.Texture>;
    protected cmds:Array<any> = null;//[0:texture,1:x,2:y,3:width,4:height,5:matrix,6:alpha]

    protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected toolTip:any = "";
    // protected buttonMode:boolean = false;//鼠标手型

    public mouseOffsetX:number = 0;
    public mouseOffsetY:number = 0;
    
    constructor(texture:Laya.Texture = null)
    {
        super();
        
        this.texture = texture ? texture : SgsTexture.EmptyTexture;
    }    
    
    public get Render():SgsSprite
    {
        return this.render;
    }

    public set Cmds(value:Array<any>)
    {
        this.cmds = value;
    }

    public get Cmds():Array<any>
    {
        return this.cmds;
    }

    public set x(value:number)
    {
        if (this._x == value) return;
        this._x = value;
        this.invalidateUpdate();
    }

    public get x():number
    {
        return this._x;
    }

    public set y(value:number)
    {
        if (this._y == value) return;
        this._y = value;
        this.invalidateUpdate();
    }

    public get y():number
    {
        return this._y;
    }

    public pos(x:number,y:number):void
    {
        this.x = x >> 0;
        this.y = y >> 0;
    }

    public get renderX():number
    {
        return this.parentContainer ? this.parentContainer.renderX + this.x * this.parentContainer.renderScaleX : this.x;
    }

    public get renderY():number
    {
        return this.parentContainer ? this.parentContainer.renderY + this.y * this.parentContainer.renderScaleY : this.y;
    }

    public resetPos():void
    {
        if (this.cmds) this.drawTexture();
    }

    public set width(value:number)
    {
        if (this._width == value) return;
        this._width = value;
        this.invalidateUpdate();
    }

    public get width():number
    {
        if (this._width != 0) return this._width;
        if (this._texture) return this._texture.width;
        return 0;
    }

    public set height(value:number)
    {
        if (this._height == value) return;
        this._height = value;
        this.invalidateUpdate();
    }

    public get height():number
    {
        if (this._height != 0) return this._height;
        if (this._texture) return this._texture.height;
        return 0;
    }

    public size(width:number,height:number):void
    {
        let isChange:boolean = false;
        if (this._width != width) {
            this._width = width;
            isChange = true;
        }   
        if (this._height != height) {
             this._height = height;
             isChange = true;
        }
        if (isChange)
            this.invalidateUpdate();
    } 

    public set scaleX(value:number)
    {
        if (this._scaleX == value) return;
        this._scaleX = value;
        this.invalidateUpdate();
    }

    public get scaleX():number
    {
        return this._scaleX;
    }

    public set scaleY(value:number)
    {
        if (this._scaleY == value) return;
        this._scaleY = value;
        this.invalidateUpdate();
    }

    public get scaleY():number
    {
        return this._scaleY;
    }

    public set scale(value:number)
    {
        this.scaleX = value;
        this.scaleY = value;
    }

    public get renderScaleX():number
    {
        return this.parentContainer ? this.parentContainer.renderScaleX * this._scaleX : this._scaleX;
    }

    public get renderScaleY():number
    {
        return this.parentContainer ? this.parentContainer.renderScaleY * this._scaleY : this._scaleY;
    }

    public resetScale():void
    {
        if (this.cmds) this.drawTexture();
    }

    public get renderWidth():number
    {
        return this.width * this.renderScaleX;
    }

    public get renderHeight():number
    {
        return this.height * this.renderScaleY;
    }

    /**九宫格,数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。*/
    public set sizeGrid(value:string)
    {
        if (value && value.length > 0)
        {
            this._sizeGrid = value.split(",");
            if (this._sizeGrid && this._sizeGrid.length >= 4)
            {
                //九宫格中出现0会导致部分区域没有纹理而出现混乱
                if (this._sizeGrid[0] == "0") this._sizeGrid[0] = "1";
                if (this._sizeGrid[1] == "0") this._sizeGrid[1] = "1";
                if (this._sizeGrid[2] == "0") this._sizeGrid[2] = "1";
                if (this._sizeGrid[3] == "0") this._sizeGrid[3] = "1";
            }
            this.changeGridTextures();
        }
        else
        {
            this._sizeGrid = null;
            this.clearGridTextures();
        }
        this.invalidateUpdate();
    }

    public set texture(value:Laya.Texture)
    {
        if (!value)//texture不能为空，引擎底层报错
            value = SgsTexture.EmptyTexture;
        if (this._texture == value) return;
        this._texture = value;
        this.changeGridTextures();
        this.invalidateUpdate();
    }

    public get texture():Laya.Texture
    {
        return this._texture;
    }

    public get visible():boolean
    {
        return this._visible;
    }

    public set visible(value:boolean)
    {
        if (this._visible == value) return;
        this._visible = value;
        this.invalidateUpdate();
    }

    public get renderVisible():boolean
    {
        if (this.parentContainer && !this.parentContainer.renderVisible) return false;
        return this._visible;
    }

    public resetVisible():void
    {
        if (this.cmds) this.drawTexture();
    }

    public get mouseEnabled():boolean
    {
        return this._mouseEnabled;
    }

    public set mouseEnabled(value:boolean)
    {
        this._mouseEnabled = value;
    }

    public set matrix(value:Laya.Matrix)
    {
        if (this._matrix == value) return;
        this._matrix = value;
        this.invalidateUpdate();
    }

    public get matrix():Laya.Matrix
    {
        return this._matrix;
    }

    public set alpha(value:number)
    {
        if (this._alpha == value) return;
        this._alpha = value;
        this.invalidateUpdate();
    }

    public get alpha():number
    {
        return this._alpha;
    }

    public set color(value:string)//颜色滤镜-颜色
    {
        if (this._color == value) return;
        this._color = value;
        this.invalidateUpdate();
    }

    public get color():string
    {
        return this._color;
    }

    public set gray(value:boolean)//灰白滤镜
    {
        if (this._gray == value) return;
        this._gray = value;
        this.invalidateUpdate();
    }

    public get gray():boolean
    {
        return this._gray;
    }

    public get textureWidth():number
    {
        if (this._texture) return this._texture.width;
        return 0;
    }

    public get textureHeight():number
    {
        if (this._texture) return this._texture.height;
        return 0;
    }

    /**是否已绘制*/
    public get drawed():boolean
    {
        return this.cmds ? true : false;
    }

    /**是否在显示列表中显示*/
    public get displayedInStage():boolean
    {
        if (!this.drawed) return false;
        if (!this.render) return false;
        return this.render.displayedInStage;
    }

    /**是否已destroy*/
    public get destroyed():boolean
    {
        return this._destroyed;
    }

    /**相对舞台坐标*/
    public get globalPoint():Laya.Point
    {
        if (!this._globalPoint)
            this._globalPoint = new Laya.Point();
        if (this.render && this.drawed)
        {
            this._globalPoint.setTo(this.renderX,this.renderY);
            this._globalPoint = this.render.localToGlobal(this._globalPoint);
        }
        else
        {
            this._globalPoint.setTo(0,0);
        }
        return this._globalPoint;
    }

    /**开始索引*/
    public get startIndex():number
    {
        if (!this.render || !this.cmds || this.cmds.length <= 0) return -1;
        return this.getCmdIndex(this.cmds[0]);
    }

    /**结束索引*/
    public get endIndex():number
    {
        if (!this.render || !this.cmds || this.cmds.length <= 0) return -1;
        return this.getCmdIndex(this.cmds[this.cmds.length - 1]);
    }

    /**设置索引*/
    public set index(index:number)
    {
        if (!this.render || !this.cmds || this.cmds.length <= 0) return;
        let graphicsCmds:Array<any> = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0) return;//本渲染器仅有一个或没有绘制子项(仅有一个时在_one中)
        graphicsCmds.splice(this.startIndex,this.cmds.length);
        for (let i:number = 0; i < this.cmds.length; i++)
        {
            graphicsCmds.splice(index,0,this.cmds[i]);
            index ++;
        }
    }

    /**绘制*/
    public draw(sgsSprite:SgsSprite,index:number = -1):void
    {
        this.render = sgsSprite;
        if (!this._texture) return;
        this.drawTexture(index);
    }

    /**清理*/
    public clear(destroy:boolean = true):void
    {
        if (this.render && this.cmds)
        {
            let graphicsCmds:Array<any> = this.render.graphics.cmds;
            let cmd:any;
            let index:number = -1;
            while (this.cmds.length > 0)
            {
                cmd = this.cmds.shift();
                if (graphicsCmds && graphicsCmds.length > 0)//不止一个绘制子项
                {
                    index = graphicsCmds.indexOf(cmd);
                    if (index > -1)
                    {
                        graphicsCmds.splice(index,1);
                        cmd.recover();
                        if (!graphicsCmds || graphicsCmds.length <= 0)//渲染器上已无任何绘制子项
                            this.render.graphics.clear();//清理_one 防止再次渲染时又被渲染上去
                    }
                }
                else if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd)//渲染器上仅绘制一个纹理且是我的cmd
                    this.render.graphics.clear();
            }
            this.render = null;
            this.cmds = null;
        }
        if (destroy)
        {
            this._destroyed = true;
            this.parentContainer = null;
            this._texture = null;
            this.clearGridTextures();
            Laya.timer.clear(this,this.onLongTimer);
            this.removeSelfEvent();
            this.ToolTip = null;
            this.offAll();
        }
    }

    /**碰撞 传入坐标为相对渲染器SgsSprite坐标*/
    public contains(x:number,y:number):boolean
    {
        if (this.renderX <= x && this.renderY <= y && this.renderX + this.renderWidth >= x && this.renderY + this.renderHeight >= y)
            return true;
        return false;
    }

    protected update():void
    {
        this.invalidateUpdateFlag = false;
        if (!this.render || !this._texture) return;
        this.drawTexture();
    }

    protected drawTexture(index:number = -1):void//绘制纹理
    {
        let cmdsLength:number = this.cmds ? this.cmds.length : 0;
        if (this._sizeGrid && this._sizeGrid.length >= 4)
        {
            var top:number = parseInt(this._sizeGrid[0]);
            var right:number = parseInt(this._sizeGrid[1]);
            var bottom:number = parseInt(this._sizeGrid[2]);
            var left:number = parseInt(this._sizeGrid[3]);
        }
        if (!this.gridTextures || this.gridTextures.length < 9//无九宫格纹理
        || this._width == 0 || this._height == 0//未设置宽高
        || this._width < left + right || this._height < top + bottom)//设置的宽高比九宫格小
        {
            this.delDrawCmd(1);//删除上次可能渲染的九宫格命令，保留一个渲染命令
            cmdsLength = this.cmds ? this.cmds.length : 0;
            if (cmdsLength > 0)
                this.updateSingleTexture(this.cmds[0],this._texture,this.renderX,this.renderY,this.width,this.height);
            else
                this.drawSingleTexture(this._texture,this.renderX,this.renderY,this.width,this.height,index);
            return;
        }
        if (cmdsLength <= 0)//首次绘制:绘制命令索引使用外部传入的index
        {
            if (index == -1)//外部传入的索引为-1表示增加到最后
            {
                let graphicsCmds:Array<any> = this.render.graphics.cmds;
                if (graphicsCmds && graphicsCmds.length > 0) index = graphicsCmds.length;
                else if (this.render.graphics["_one"]) index = 1;
                else index = 0;
            }  
        }
        else//更新绘制:新增命令索引使用本纹理最后一个渲染命令索引+1
        {
            let lastIndex:number = this.getCmdIndex(this.cmds[this.cmds.length - 1]);
            index = lastIndex + 1;
        }
        index = this.drawGrid(0,this.renderX + left * this.renderScaleX,this.renderY,this._width - left - right,top,index);
        index = this.drawGrid(1,this.renderX + (this._width - right) * this.renderScaleX,this.renderY,right,top,index);
        index = this.drawGrid(2,this.renderX + (this._width - right) * this.renderScaleX,this.renderY + top * this.renderScaleY,right,this._height - top - bottom,index);
        index = this.drawGrid(3,this.renderX + (this._width - right) * this.renderScaleX,this.renderY + (this._height - bottom) * this.renderScaleY,right,bottom,index);
        index = this.drawGrid(4,this.renderX + left * this.renderScaleX,this.renderY + (this._height - bottom) * this.renderScaleY,this._width - left - right,bottom,index);
        index = this.drawGrid(5,this.renderX,this.renderY + (this._height - bottom) * this.renderScaleY,left,bottom,index);
        index = this.drawGrid(6,this.renderX,this.renderY + top * this.renderScaleY,left,this._height - top - bottom,index);
        index = this.drawGrid(7,this.renderX,this.renderY,left,top,index);
        index = this.drawGrid(8,this.renderX + left * this.renderScaleX,this.renderY + top * this.renderScaleY,this._width - left - right,this._height - top - bottom,index);
    }

    protected drawGrid(gridNumber:number,x:number,y:number,width:number,height:number,index:number):number//绘制格子：用于九宫格绘制
    {
        let cmdsLength:number = this.cmds ? this.cmds.length : 0;
        if (cmdsLength >= gridNumber + 1)
        {
            this.updateSingleTexture(this.cmds[gridNumber],this.gridTextures[gridNumber],x,y,width,height);
            return index;
        }
        else
        {
            this.drawSingleTexture(this.gridTextures[gridNumber],x,y,width,height,index);
            return index + 1;
        }
    }

    protected drawSingleTexture(texture:Laya.Texture,x:number,y:number,width:number,height:number,index:number = -1):void//绘制单个纹理
    {
        let drwaAlpha:number = Math.max(this._alpha,0.01);//首次绘制时透明度小于0.01将无法绘制
        let drawCmd = this.render.graphics.drawTexture(texture,x,y,this.getDrawSize(width,true),this.getDrawSize(height,false),this._matrix,drwaAlpha,this._color,null,null,this._gray);
        if (!drawCmd) return;//本次cmd没有绘制成功：纹理不存在、纹理被destroy或没有bitmap、透明度<0.01、
        if (!this.cmds) this.cmds = [];
        let graphicsCmds:Array<any> = this.render.graphics.cmds;
        if (!graphicsCmds || graphicsCmds.length <= 0)//本渲染器上第一个绘制内容
        {
            this.cmds.push(this.render.graphics["_one"]);
        }
        else
        {
            this.cmds.push(graphicsCmds[graphicsCmds.length - 1]);
            if (index >= 0 && index < graphicsCmds.length)//调整索引
            {
                let cmd:any = graphicsCmds.pop();
                graphicsCmds.splice(index,0,cmd);
            }
        }
    }

    protected updateSingleTexture(cmd:Laya.DrawTextureCmd,texture:Laya.Texture,x:number,y:number,width:number,height:number):void//更新单个纹理
    {
        if (!cmd || !texture) return;

        let oldColor = cmd.color;
        let oldGray = cmd.gray;

        if (cmd.texture) cmd.texture["_removeReference"]();
        cmd.texture = texture;
        cmd.texture["_addReference"]();
        cmd.x = x;
        cmd.y = y;
        cmd.width = this.getDrawSize(width,true);
        cmd.height = this.getDrawSize(height,false);
        cmd.matrix = this._matrix;
        cmd.alpha = this._alpha;
        cmd.color = this._color;
        cmd.gray = this._gray;

        if (cmd.color || cmd.gray)//需要颜色滤镜或灰掉
        {
            if (!cmd.colorFlt)
                cmd.colorFlt = new Laya.ColorFilter();
            if (cmd.color)//使用颜色滤镜
            {
                if (oldColor != cmd.color)
                    cmd.colorFlt.setColor(cmd.color);
            }
            else if (oldGray != cmd.gray)//灰掉
                cmd.colorFlt.gray();
        }
        else
            cmd.colorFlt = null;
    }

    protected delDrawCmd(retainCount:number):void//删除渲染命令(用于删除多余纹理命令，参数为：要保留的个数)
    {
        if (!this.render || !this.render.graphics.cmds || !this.cmds) return;
        let graphicsCmds:Array<any> = this.render.graphics.cmds;
        let cmd:any;
        while (this.cmds.length > retainCount)
        {
            cmd = this.cmds.pop();
            if (graphicsCmds && graphicsCmds.length > 0)
            {
                let index:number = graphicsCmds.indexOf(cmd);
                if (index > -1) 
                {
                    graphicsCmds.splice(index,1);
                    cmd.recover();
                }
            }
        }
    }

    protected getDrawSize(value:number,isWidth:boolean):number//获取绘制尺寸：用于处理显示掩藏和尺寸为0的特殊情况
    {
        //0在绘制时会以纹理原始尺寸绘制：故设置成0.01
        if (!this.renderVisible || this._texture === SgsTexture.EmptyTexture) return 0.01;
        let drawSize:number = isWidth ? value * this.renderScaleX : value * this.renderScaleY;
        if (drawSize == 0) return 0.01;
        return drawSize;
    }
    
    protected changeGridTextures():void//纹理变化：重置九宫格纹理
    {
        this.clearGridTextures();
        
        if (!this._texture) return;
        if (!this._sizeGrid || this._sizeGrid.length < 4) return;
        let sw:number = this._texture.width;
        let sh:number = this._texture.height;
        let top:number = parseInt(this._sizeGrid[0]);
        let right:number = parseInt(this._sizeGrid[1]);
        let bottom:number = parseInt(this._sizeGrid[2]);
        let left:number = parseInt(this._sizeGrid[3]);
        if (top + bottom >= sh || left + right >= sw) return;//九宫格异常
        if (!this.gridTextures) this.gridTextures = [];
        //九宫格编号规则
        //8,1,2
        //7,9,3
        //6,5,4    
        this.gridTextures.push(this.createTextrue(left,0,sw - left - right,top));//1
        this.gridTextures.push(this.createTextrue(sw - right,0,right,top));//2
        this.gridTextures.push(this.createTextrue(sw - right,top,right,sh - top - bottom));//3
        this.gridTextures.push(this.createTextrue(sw - right,sh - bottom,right,bottom));//4
        this.gridTextures.push(this.createTextrue(left,sh - bottom,sw - left - right,bottom));//5
        this.gridTextures.push(this.createTextrue(0,sh - bottom,left,bottom));//6
        this.gridTextures.push(this.createTextrue(0,top,left,sh - top - bottom));//7
        this.gridTextures.push(this.createTextrue(0,0,left,top));//8
        this.gridTextures.push(this.createTextrue(left,top,sw - left - right,sh - top - bottom));//9
    }

    protected clearGridTextures():void
    {
        if (!this.gridTextures) return;
        let texture:Laya.Texture;
        while (this.gridTextures.length > 0)
        {
            texture = this.gridTextures.shift();
            texture = null;
        }
        this.gridTextures = null;
    }

    protected getCmdIndex(cmd:any):number
    {
        if (!this.render || !this.cmds || this.cmds.length <= 0) return -1;
        let index:number = -1;
        let graphicsCmds:Array<any> = this.render.graphics.cmds;
        if (graphicsCmds && graphicsCmds.length > 0)
            index = graphicsCmds.indexOf(cmd);
        else 
            if (this.render.graphics["_one"] && this.render.graphics["_one"] === cmd) index = 0;
        return index;
    }

    private invalidateUpdateFlag:boolean = false;
    protected invalidateUpdate():void
    {
        if (!this.render) return;
        if (this.drawed)
        {
            if (!this.invalidateUpdateFlag)
            {
                this.invalidateUpdateFlag = true;
                Laya.timer.callLater(this,this.update);
            }
        }
        else//未绘制时立即绘制，防止延后绘制出现层级异常
        {
            this.update();
        }
    }

    private createTextrue(x:number,y:number,width:number,height:number):Laya.Texture
    {
        if (!this._texture) return null;
        let texture:Laya.Texture;
        texture = Laya.Texture.createFromTexture(this._texture,x,y,width,height);
        return texture;
    }

    public set TipTriggerType(val:string)
	{
        this.tipTriggerType = val;
        if (this.tipTriggerType == TipsManager.LONG_DOWN_TRIGGER)
			this.addSelfEvent();
    }

    public get ToolTip():any
    {
        return this.toolTip;
    }

    public set ToolTip(val:any)
    {
        // if(val)
        // {
        //     this.mouseEnabled = true;
        //     this.on(Laya.Event.ROLL_OVER,this,this.rollOverHandler);
        //     this.on(Laya.Event.ROLL_OUT,this,this.rollOutHandler);
        // }
        // else
        // {
        //     this.off(Laya.Event.ROLL_OVER,this,this.rollOverHandler);
        //     this.off(Laya.Event.ROLL_OUT,this,this.rollOutHandler);
        //     TipsManager.GetInstance().HideTargetTips(this);
        // }
        if (this.toolTip == val) return;
        this.toolTip = val;
        TipsManager.GetInstance().RegisterTips(val,this.tipTriggerType,this);
    }

    // private rollOverHandler(tex:SgsTexture):void
    // {
    //     if (this.toolTip)
    //     {
    //         let event:TipsEvent = new TipsEvent();
    //         event.target = this;
    //         event.stageX = Laya.stage.mouseX;
    //         event.stageY = Laya.stage.mouseY;
    //         event.offsetX = this.mouseOffsetX;
    //         event.offsetY = this.mouseOffsetY;
    //         GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_OVER_EVENT,event);
    //     }
    // }

    // private rollOutHandler(tex:SgsTexture):void
    // {
    //     if (this.toolTip && TipsManager.GetInstance().CurrentTarget === this)
    //     {
    //         let event:TipsEvent = new TipsEvent();
    //         event.target = this;
    //         GameEventDispatcher.GetInstance().event(TipsEvent.TIPS_OUT_EVENT,event);
    //     }
    // }

    // public get ButtonMode():boolean
    // {
    //     return this.buttonMode;
    // }

    // public set ButtonMode(value:boolean)
    // {
    //     if (value)
    //     {
    //         this.mouseEnabled = true;
    //         this.on(Laya.Event.MOUSE_OVER,this,this.onOverButtonMode);
    //         this.on(Laya.Event.MOUSE_OUT,this,this.onOutButtonMode);
    //     }
    //     else
    //     {
    //         this.off(Laya.Event.MOUSE_OVER,this,this.onOverButtonMode);
    //         this.off(Laya.Event.MOUSE_OUT,this,this.onOutButtonMode);
    //         SgsMouseManager.ButtonMode(this,false);
    //     }
    //     this.buttonMode = value;
    // }

    // private onOverButtonMode(event:SgsTexture):void
    // {
    //     if (this.buttonMode) {
    //         SgsMouseManager.ButtonMode(this,true);
    //     }
    // }

    // private onOutButtonMode(event:SgsTexture):void
    // {
    //     SgsMouseManager.ButtonMode(this,false);
    // }

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

    protected onSelfDown(event:SgsTexture):void
    {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime,this,this.onLongTimer,[event]);
    }

    protected onSelfUp(event:SgsTexture):void
    {
        Laya.timer.clear(this,this.onLongTimer);
    }

    protected onLongTimer(event):void
    {
        this._longDowned = true;
        event.type = EventExpand.LONG_DOWN;
        this.event(EventExpand.LONG_DOWN,event);
    }
}
