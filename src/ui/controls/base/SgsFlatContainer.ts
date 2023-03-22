import SgsTexture from "./SgsTexture";
import SgsText from "./SgsText";
import SgsSprite from "./SgsSprite";
/*
* 扁平管理容器：管理sgsText、sgsTexture
* 派发事件数据为{target:textTure,currentTarget:this}
*/
export default class SgsFlatContainer extends Laya.EventDispatcher
{
    protected invalidateDisplayListFlag:boolean = false;
    /**父管理节点*/
    public parentContainer:any;
    /**渲染器(SgsSprite)*/
    public render:SgsSprite;
    /**子项列表*/
    protected childs:Array<any>;
    /**其他渲染器*/
    protected otherRenders:Array<SgsSprite>;
    /**其他渲染器子项*/
    protected otherChilds:Array<any>;

    protected _x:number = 0;
    protected _y:number = 0;
    protected _width:number = 0;
    protected _height:number = 0;
    protected _name:string = "";
    protected _visible:boolean = true;
    protected _scaleX:number = 1;
    protected _scaleY:number = 1;
    protected _mouseEnabled:boolean = false;
    protected _globalPoint:Laya.Point;
    protected _destroyed:boolean = false;

    public static SGSFLATCONTAINER_CLICK:string = "sgsFlatContainerClick";
    public static SGSFLATCONTAINER_OVER:string = "sgsFlatContainerOver";
    public static SGSFLATCONTAINER_OUT:string = "sgsFlatContainerOut";

    //额外层
    constructor(otherRenders:Array<SgsSprite> = null)
    {
        super();

        this.otherRenders = otherRenders;
        if (this.otherRenders)
        {
            this.otherChilds = [];
            let length:number = this.otherRenders.length;
            for (let i:number = 0; i < length; i++)
            {
                this.otherChilds.push([]);
            }
        }
        this.childs = [];
    }

    public get Render():SgsSprite
    {
        return this.render;
    }

    public set x(value:number)
    {
        this.pos(value,this._y);
    }

    public get x():number
    {
        return this._x;
    }

    public set y(value:number)
    {
        this.pos(this._x,value);
    }

    public get y():number
    {
        return this._y;
    }

    public get renderX():number
    {
        return this.parentContainer ? this.parentContainer.renderX + this.x * this.parentContainer.renderScaleX : this.x;
    }

    public get renderY():number
    {
        return this.parentContainer ? this.parentContainer.renderY + this.y * this.parentContainer.renderScaleY : this.y;
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

    public set width(value:number)
    {
        this.size(value,this._height);
    } 

    public get width():number
    {
        return this._width;
    } 

    public set height(value:number)
    {
        this.size(this._width,value);
    } 

    public get height():number
    {
        return this._height;
    }

    public set name(value:string)
    {
        this._name = value;
    }

    public get name():string
    {
        return this._name;
    }

    /**绘制*/
    public Draw(render:SgsSprite,index:number = -1):void
    {
        if (!render) return;
        this.render = render;
        //循环绘制子项
        let startIndex:number = index;
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                if (startIndex < 0)
                {
                    this.render.addDrawChild(child);
                }
                else//设置了索引，容器内子项以此为开始索引
                {
                    this.render.addDrawChildAt(child,startIndex);
                    startIndex = child.endIndex + 1;
                }
            });
        }

        if (this.otherChilds && this.otherChilds.length > 0)
        {
            let spStartIndex:number = -1;
            let i:number = 0;
            let otherRender:SgsSprite;
            this.otherChilds.forEach((childs:Array<any>) => {
                startIndex = index;
                spStartIndex = index;
                if (childs && this.otherRenders && this.otherRenders.length > i)
                {
                    otherRender = this.otherRenders[i];
                    if (otherRender)
                    {
                        childs.forEach((child:any) => {
                            if (child instanceof Laya.Sprite)
                            {
                                this.oherChildScale(child,child.scaleX,child.scaleY);
                                this.oherChildVisible(child,child.visible);
                                if (spStartIndex < 0)
                                    otherRender.addChild(child);
                                else 
                                {
                                    otherRender.addChildAt(child,spStartIndex);
                                    spStartIndex ++;
                                } 
                            }
                            else 
                            {
                                if (startIndex < 0)
                                {
                                    otherRender.addDrawChild(child);
                                }
                                else//设置了索引，容器内子项以此为开始索引
                                {
                                    otherRender.addDrawChildAt(child,startIndex);
                                    startIndex = child.endIndex + 1;
                                }
                            }
                        });
                    }
                }
                i ++;
            });
        }
    }

    public set index(index:number)
    {
        if (!this.render) return;
        //循环绘制子项
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                child.index = index;
                index = child.endIndex + 1;
            });
        }
    }

     /**清除*/
    public ClearDraw(destroy:boolean = true):void
    {
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                this.removeChildMouseEvent(child);
                if (this.render)
                    this.render.removeDrawChild(child,destroy);
                else if (child instanceof SgsFlatContainer)
                    child.ClearDraw(destroy);
                else
                    child.clear(destroy);
            });
        }
        this.render = null;

        if (this.otherChilds && this.otherChilds.length > 0)
        {
            let i:number = 0;
            let otherRender:SgsSprite;
            this.otherChilds.forEach((childs:Array<any>) => {
                if (childs && this.otherRenders && this.otherRenders.length > i)
                {
                    otherRender = this.otherRenders[i];
                    if (otherRender)
                    {
                        childs.forEach((child:any) => {
                            if (child instanceof Laya.Sprite)
                            {
                                if (destroy)
                                {
                                    child["parentContainer"] = null;
                                    child["otherRenderIndex"] = -1;
                                    child.destroy();
                                }
                                else
                                    otherRender.removeChild(child);
                            }
                            else
                                otherRender.removeDrawChild(child,destroy);                   
                        });
                    }
                }
                i ++;
            });
        }
        if (destroy)
        {
            this._destroyed = true;
            this.childs = [];
            this.otherRenders = null;
            this.otherChilds = null;
            this.offAll();
        }
    }

    public addText(child:SgsText):void//兼容老接口
    {
        this.addDrawChild(child);
    }

    public removeText(child:SgsText,destroy:boolean = true):void//兼容老接口
    {
        this.removeDrawChild(child,destroy);
    }

    public addTexture(child:SgsTexture):void//兼容老接口
    {
        this.addDrawChild(child);
    }

    public addTextureAt(child:SgsTexture,index:number):void//兼容老接口
    {
        this.addDrawChildAt(child,index);
    }

    public removeTexture(child:SgsTexture,destroy:boolean = true):void//兼容老接口
    {
        this.removeDrawChild(child,destroy);
    }

    /**添加子项 - 如果容器已绘制，则本次后增加的子项会绘制在本容器最后一个子项上面*/
    public addDrawChild(child:SgsText | SgsTexture | SgsFlatContainer):void
    {
        if (this.childs.indexOf(child) != -1) return;
        child.parentContainer = this;
        if (this.render)//容器已绘制：新增加的子项保持在本容器子项最上面 
        {
            let endIndex:number = this.endIndex;
            if (endIndex >= 0 && endIndex < this.render.drawCount)
            {
                this.render.addDrawChildAt(child,endIndex + 1);
            }
            else
            {
                this.render.addDrawChild(child);
            }     
        }
        this.childs.push(child);
        if (child instanceof SgsTexture || child instanceof SgsText)
        {
            if (this._mouseEnabled) 
            {
                child.mouseEnabled = true;
                this.addChildMouseEvent(child);
            }
        }
    }

    /**添加子项
     * @param index 索引(注意：单个SgsText、SgsTexture很可能有多个渲染命令，请使用getTextStartIndex、getEndIndex、getTextureStartIndex、getTextureEndIndex获取索引后再设置索引)
    */
    public addDrawChildAt(child:SgsText | SgsTexture | SgsFlatContainer,index:number = 0):void
    {
        if (this.childs.indexOf(child) != -1) return;
        if (index < 0) return;
        child.parentContainer = this;
        if (this.render) this.render.addDrawChildAt(child,index);
        this.childs.splice(index,0,child); 
        if (child instanceof SgsTexture || child instanceof SgsText)
        {
            if (this._mouseEnabled) 
            {
                child.mouseEnabled = true;
                this.addChildMouseEvent(child);
            }
        }
    }

    /**移除子项*/
    public removeDrawChild(child:SgsText | SgsTexture | SgsFlatContainer,destroy:boolean = true):void
    {
        let index:number = this.childs.indexOf(child);
        if (index == -1) 
        {
            if (destroy && !child.drawed)//可能是先移除了，本次需要destroy
            {
                if (child instanceof SgsFlatContainer)
                    child.ClearDraw(destroy);
                else
                    child.clear(destroy);
            }
            return;
        }
        child.parentContainer = null;
        this.childs.splice(index,1);
        if (this.render) this.render.removeDrawChild(child,destroy);
        if (child instanceof SgsTexture || child instanceof SgsText)
        {
            if (this._mouseEnabled)
            {
                child.mouseEnabled = false;
                this.removeChildMouseEvent(child);
            }
        }  
    }

    public addOtherChild(otherRenderIndex:number,child:SgsText | SgsTexture | SgsFlatContainer | Laya.Sprite):void
    {
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex) return;
        let otherRender:SgsSprite = this.otherRenders[otherRenderIndex];
        if (!otherRender || this.otherChilds[otherRenderIndex].indexOf(child) != -1) return;
        if (child instanceof Laya.Sprite)
        {
            child["parentContainer"] = this;
            child["otherRenderIndex"] = otherRenderIndex;
        }
        else 
            child.parentContainer = this;
        if (this.render)
        {
            if (child instanceof Laya.Sprite)
            {
                this.oherChildScale(child,child.scaleX,child.scaleY);
                this.oherChildVisible(child,child.visible);
                let endIndex:number = this.getOtherEndIndex(otherRenderIndex,true);
                if (endIndex >= 0 && endIndex < otherRender.numChildren)
                    otherRender.addChildAt(child,endIndex + 1);
                else
                    otherRender.addChild(child);
            }
            else
            {
                let endIndex:number = this.getOtherEndIndex(otherRenderIndex,false);
                if (endIndex >= 0 && endIndex < otherRender.drawCount)
                    otherRender.addDrawChildAt(child,endIndex + 1);
                else
                    otherRender.addDrawChild(child);
            }
        }
        this.otherChilds[otherRenderIndex].push(child);
    }

    public addOtherChildAt(otherRenderIndex:number,child:SgsText | SgsTexture | SgsFlatContainer | Laya.Sprite,index:number = 0):void
    {
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex) return;
        let otherRender:SgsSprite = this.otherRenders[otherRenderIndex];
        if (!otherRender || this.otherChilds[otherRenderIndex].indexOf(child) != -1 || index < 0) return;
        if (child instanceof Laya.Sprite)
        {
            child["parentContainer"] = this;
            child["otherRenderIndex"] = otherRenderIndex;
        }
        else 
            child.parentContainer = this;
        if (this.render) 
        {
            if (child instanceof Laya.Sprite)
            {
                this.oherChildScale(child,child.scaleX,child.scaleY);
                this.oherChildVisible(child,child.visible);
                otherRender.addChildAt(child,index);
            }
            else
                otherRender.addDrawChildAt(child,index);
        }
        this.otherChilds[otherRenderIndex].splice(index,0,child); 
    }

    public removeOherChild(otherRenderIndex:number,child:SgsText | SgsTexture | SgsFlatContainer | Laya.Sprite,destroy:boolean = true):void
    {
        // if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex) return;
        // let otherRender:SgsSprite = this.otherRenders[otherRenderIndex];
        // if (!otherRender) return;
        // let index:number = this.otherChilds[otherRenderIndex].indexOf(child);
        // if (index == -1) return;
        let isInvalid:boolean = false;
        if (!this.otherRenders || this.otherRenders.length <= otherRenderIndex) isInvalid = true;
        let otherRender:SgsSprite = !isInvalid ? this.otherRenders[otherRenderIndex] : null;
        if (!otherRender) isInvalid = true;
        let index:number = !isInvalid ? this.otherChilds[otherRenderIndex].indexOf(child) : -1;
        if (index == -1) isInvalid = true;
        if (isInvalid)//无效
        {
            if (destroy)//可能是先移除了，本次需要destroy
            {
                if (child instanceof Laya.Sprite)
                {
                    if (!child.parent)
                    {
                        child["parentContainer"] = null;
                        child["otherRenderIndex"] = -1;
                        child.destroy();
                    }
                }   
                else 
                {
                    if (!child.drawed)
                    {
                        child.parentContainer = null;
                        if (child instanceof SgsFlatContainer)
                            child.ClearDraw(destroy);
                        else
                            child.clear(destroy);
                    }
                }
            }
            return;
        }
        if (child instanceof Laya.Sprite)
        {
            child["parentContainer"] = null;
            child["otherRenderIndex"] = -1;
        }
        else 
            child.parentContainer = null;
        this.otherChilds[otherRenderIndex].splice(index,1);
        if (this.render)
        {
            if (child instanceof Laya.Sprite)
            {
                if (destroy)
                    child.destroy();
                else
                    otherRender.removeChild(child);
            }
            else
                otherRender.removeDrawChild(child,destroy);
        } 
    }

    public oherChildPos(child:Laya.Sprite,x:number,y:number):void
    {
        if (!child) return;
        child["oherX"] = x;
        child["oherY"] = y;
        if (child["parentContainer"])
        {
            let parentContainer = child["parentContainer"];
            child.pos(parentContainer.renderX + x * parentContainer.renderScaleX,parentContainer.renderY + y * parentContainer.renderScaleY);
        }
        else
            child.pos(x,y);
    }

    public oherChildScale(child:Laya.Sprite,scaleX:number,scaleY:number):void
    {
        if (!child) return;
        child["oherScaleX"] = scaleX;
        child["oherScaleY"] = scaleY;
        if (child["parentContainer"])
        {
            let parentContainer = child["parentContainer"];
            child.scale(parentContainer.renderScaleX * scaleX,parentContainer.renderScaleY * scaleY);
            //设置缩放会影响到坐标
            this.oherChildPos(child,this.getOherChildX(child),this.getOherChildY(child));
        }
        else
            child.scale(scaleX,scaleY);
    }

    public oherChildVisible(child:Laya.Sprite,visible:boolean):void
    {
        if (!child) return;
        child["oherVisible"] = visible;
        if (child["parentContainer"])
            child.visible = !child["parentContainer"].renderVisible ? false : visible;
        else
            child.visible = visible;
    }

    public getOherChildX(child:Laya.Sprite):number
    {
        if (!child) return 0;
        if (child.hasOwnProperty("oherX")) return child["oherX"];
        return child.x;
    }

    public getOherChildY(child:Laya.Sprite):number
    {
        if (!child) return 0;
        if (child.hasOwnProperty("oherY")) return child["oherY"];
        return child.y;
    }

    public getOherChildScaleX(child:Laya.Sprite):number
    {
        if (!child) return 0;
        if (child.hasOwnProperty("oherScaleX")) return child["oherScaleX"];
        return child.scaleX;
    }

    public getOherChildScaleY(child:Laya.Sprite):number
    {
        if (!child) return 0;
        if (child.hasOwnProperty("oherScaleY")) return child["oherScaleY"];
        return child.scaleY;
    }

    public getOherChildVisible(child:Laya.Sprite):boolean
    {
        if (!child) return false;
        if (child.hasOwnProperty("oherVisible")) return child["oherVisible"];
        return child.visible;
    }

    public set visible(value:boolean)
    {
        if (this._visible == value) return;
        this._visible = value;
        this.resetChildsVisible();
    }

    public get visible():boolean
    {
        return this._visible;
    }

    public get renderVisible():boolean
    {
        if (this.parentContainer && !this.parentContainer.renderVisible) return false;
        return this._visible;
    }

    public set scaleX(value:number)
    {
        if (this._scaleX == value) return;
        this._scaleX = value;
        this.resetChildsScale();
    }

    public get scaleX():number
    {
        return this._scaleX;
    }

    public set scaleY(value:number)
    {
        if (this._scaleY == value) return;
        this._scaleY = value;
        this.resetChildsScale();
    }

    public get scaleY():number
    {
        return this._scaleY;
    }

    public get renderScaleX():number
    {
        return this.parentContainer ? this.parentContainer.renderScaleX * this._scaleX : this._scaleX;
    }

    public get renderScaleY():number
    {
        return this.parentContainer ? this.parentContainer.renderScaleY * this._scaleY : this._scaleY;
    }

    public set mouseEnabled(value:boolean)
    {
        if (this._mouseEnabled == value) return;
        this._mouseEnabled = value;
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                if (child instanceof SgsTexture || child instanceof SgsText)
                {
                    child.mouseEnabled = this._mouseEnabled;
                    if (this._mouseEnabled)
                        this.addChildMouseEvent(child);
                    else
                        this.removeChildMouseEvent(child);
                }
            });
        }
    }

    public get mouseEnabled():boolean
    {
        return this._mouseEnabled;
    }

     /**是否已绘制*/
    public get drawed():boolean
    {
        // if (this.childs && this.childs.length > 0)
        // {
        //     return this.childs[0].drawed;
        // }
        // return false;
        return this.render ? true : false;
    }

    /**开始索引*/
    public get startIndex():number
    {
        if (this.childs && this.childs.length > 0)
        {
            return this.childs[0].startIndex;
        }
        return -1;
    }

    /**结束索引*/
    public get endIndex():number
    {
        if (this.childs && this.childs.length > 0)
        {
            return this.childs[this.childs.length - 1].endIndex;
        }
        return -1;
    }

    /**获取本SgsFlatContainer管理的类在指定层绘制的最后索引*/
    protected getOtherEndIndex(otherRenderIndex:number,isSprite:boolean):number
    {
        if (!this.otherChilds || this.otherChilds.length <= otherRenderIndex) return -1;
        let childs:Array<any> = this.otherChilds[otherRenderIndex];
        if (childs)
        {
            let length:number = childs.length;
            let child:any;
            for (let i:number = length - 1; i >= 0; i--)
            {
                if (isSprite)
                {
                    if (childs[i] instanceof Laya.Sprite)
                    {
                        child = childs[i];
                        break;
                    }
                }
                else
                {
                    if (!(childs[i] instanceof Laya.Sprite))
                    {
                        child = childs[i];
                        break;
                    }
                }
            }
            if (child)
            {
                if (isSprite)
                {
                    let otherRender = this.otherRenders && this.otherRenders.length > otherRenderIndex ? this.otherRenders[otherRenderIndex] : null;
                    return otherRender && !otherRender.destroyed ? otherRender.getChildIndex(child) : -1;
                }
                else
                    return child.endIndex;
            }
        }
        return -1;
    }

     /**设置位置*/
    public pos(x:number,y:number):void
    {
        if (this._x == x && this._y == y)
            return;
        this._x = x >> 0;
        this._y = y >> 0;
        this.resetChildsPos();
    } 

    /**设置尺寸*/
    public size(width:number, height:number):void
    {
        this._width = width;
        this._height = height;
        this.invalidateDisplayList();
    }

    protected addChildMouseEvent(child:any):void
    {
        child.on(Laya.Event.CLICK,this,this.onTextureClick);
        child.on(Laya.Event.ROLL_OVER,this,this.onSomeTextureOver);
        child.on(Laya.Event.ROLL_OUT,this,this.onSomeTextureOut);
    }

    protected removeChildMouseEvent(child:any):void
    {
        child.off(Laya.Event.CLICK,this,this.onTextureClick);
        child.off(Laya.Event.ROLL_OVER,this,this.onSomeTextureOver);
        child.off(Laya.Event.ROLL_OUT,this,this.onSomeTextureOut);
    }

    protected onTextureClick(textTure:SgsTexture):void
    {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_CLICK,{target:textTure,currentTarget:this});
    }

    protected onSomeTextureOver(textTure:SgsTexture):void
    {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_OVER,{target:textTure,currentTarget:this});
    }

    protected onSomeTextureOut(textTure:SgsTexture):void
    {
        this.event(SgsFlatContainer.SGSFLATCONTAINER_OUT,{target:textTure,currentTarget:this});
    }

    /**父对象位置变化后重置子项位置*/
    protected resetChildsPos():void
    {
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                if (child instanceof SgsFlatContainer)
                    child.resetChildsPos();
                else
                    child.resetPos();
            });
        }

        if (this.otherChilds && this.otherChilds.length > 0)
        {
            this.otherChilds.forEach((childs:Array<any>) => {
                if (childs)
                {
                    childs.forEach((child:any) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildPos(child,this.getOherChildX(child),this.getOherChildY(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsPos();
                        else
                            child.resetPos();                            
                    });
                }
            });
        }
    }

    /**父对象visible变化后重置子项渲染*/
    protected resetChildsVisible():void
    {
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                if (child instanceof SgsFlatContainer)
                    child.resetChildsVisible();
                else
                   child.resetVisible();     
            });
        }

        if (this.otherChilds && this.otherChilds.length > 0)
        {
            this.otherChilds.forEach((childs:Array<any>) => {
                if (childs)
                {
                    childs.forEach((child:any) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildVisible(child,this.getOherChildVisible(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsVisible();
                        else
                            child.resetVisible();     
                    });
                }
            });
        }
    }

    /**父对象缩放变化后重置子项渲染*/
    protected resetChildsScale():void
    {
        if (this.childs && this.childs.length > 0)
        {
            this.childs.forEach((child:any)=>{
                if (child instanceof SgsFlatContainer)
                    child.resetChildsScale();
                else
                    child.resetScale();
            });
        }

        if (this.otherChilds && this.otherChilds.length > 0)
        {
            this.otherChilds.forEach((childs:Array<any>) => {
                if (childs)
                {
                    childs.forEach((child:any) => {
                        if (child instanceof Laya.Sprite)
                            this.oherChildScale(child,this.getOherChildScaleX(child),this.getOherChildScaleY(child));
                        else if (child instanceof SgsFlatContainer)
                            child.resetChildsScale();
                        else
                            child.resetScale();     
                    });
                }
            });
        }
    }

    public ResetDrawPos():void
    {
        this.resetChildsPos();
    }

    public ResetDrawVisible():void
    {
        this.resetChildsVisible();
    }

    public ResetDrawScale():void
    {
        this.resetChildsScale();
    }

    /**稍后执行updateDisplayList*/
    protected invalidateDisplayList():void
    {
        if (!this.invalidateDisplayListFlag)
        {
            this.invalidateDisplayListFlag = true;
            Laya.timer.callLater(this,this.updateDisplayList,[this.width,this.height]);
        }
    }

    /** 绘制对象和/或设置其子项的大小和位置 - 自身尺寸变化后执行 */
    protected updateDisplayList(unscaledWidth:number, unscaledHeight:number):void
    {
        this.invalidateDisplayListFlag = false;

        this.layout();
    }

    /**布局 - 尺寸改变后执行*/
    protected layout():void
    {

    }
}