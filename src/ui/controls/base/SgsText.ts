import SgsSprite from "./SgsSprite";
import Global from "../../../Global";
import EventExpand from "../../../event/EventExpand";
import TipsManager from "../../../mode/base/TipsManager";

/*
* 绘制文本：支持字体、字号、颜色、加粗、斜体、描边宽度、描边颜色、自动换行、水平对齐方式、垂直对齐方式
* Created by caochangli
*/
export default class SgsText extends Laya.EventDispatcher
{
    public name:string = "";
    /**父管理节点*/
    public parentContainer:any;
    /**渲染器*/
    protected render:SgsSprite;

    protected _x:number = 0;
    protected _y:number = 0;
    protected _width:number = 0;
    protected _height:number = 0;
    // protected _scale:number = 1;
    protected _italic:boolean = false;
    protected _bold:boolean = false;
    protected _fontSize:number = Laya.Text.defaultFontSize;
    protected _font:string = Laya.Text.defaultFont;
    protected _color:string = "#000000";
    protected _stroke:number = 0;
    protected _strokeColor:string = "#000000";
    protected _wordWrap:boolean = false;
    protected _leading:number = 0;
    protected _align:string = "left";
    protected _valign:string = "top";
    protected _text:string = "";
    protected _visible:boolean = true;
    protected _mouseEnabled:boolean = false;
    protected _globalPoint:Laya.Point;
    protected _destroyed:boolean = false;

    protected _textWidth:number = 0;
    protected _textHeight:number = 0;
    protected _lines:Array<any>;
    protected _lineWidths:Array<number>;
    protected _charSize:any;
    protected _ctxFont:string = "";
    protected _typesetChanged:boolean = false;
    protected _fontChanged:boolean = false;

    protected cmds:Array<any> = null;
    protected _longDowned:boolean = false;//是否已长按
    protected tipTriggerType:string = "";//tips触发类型(点击、长按 默认点击)
    protected toolTip:any = "";
    // protected buttonMode:boolean = false;//鼠标手型

    public mouseOffsetX:number = 0;
    public mouseOffsetY:number = 0;

    //测量文本尺寸
    public static measureText(txt:string,font:string,fontSize:number,bold:boolean = false,italic:boolean = false):any
    {
        let ctxFont:string = (italic ? "italic " : "") + (bold ? "bold " : "") + fontSize + "px " + font;
        if (Laya.Browser.context.font != ctxFont)
            Laya.Browser.context.font = ctxFont;
        return Laya.Browser.context.measureText(txt);
    }

    //测量文字宽度
    public static measureTextWidth(txt:string,font:string,fontSize:number,bold:boolean = false,italic:boolean = false):number
    {
        return this.measureText(txt,font,fontSize,bold,italic).width;
    }
    
    constructor(text:string = "")
    {
        super();

        this._lines = [];
        this._lineWidths = [];
        this._charSize = {};
        this.text = text;
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
        return this.parentContainer ? this.parentContainer.renderX + this.x : this.x;
    }

    public get renderY():number
    {
        // let yy:number = UIUtils.GetTextOffsetInBrowser(this.font,this.fontSize) + this.y;
        // return this.parentContainer ? this.parentContainer.renderY + yy : yy;
        return this.parentContainer ? this.parentContainer.renderY + this.y : this.y;
    }

    public resetPos():void
    {
        if (this.cmds) this.drawText();
    }

    public set width(value:number)
    {
        if (this._width == value) return;
        this._width = value;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get width():number
    {
        if (this._width != 0) return this._width;
        return this.textWidth;
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
        return this.textHeight;
    }

    public size(width:number,height:number):void
    {
        let isChange:boolean = false;
        if (this._width != width) {
            this._width = width;
            this._typesetChanged = true;
            isChange = true;
        }   
        if (this._height != height) {
             this._height = height;
             isChange = true;
        }
        if (isChange)
            this.invalidateUpdate();
    } 

    public get renderWidth():number
    {
        return this.width * this.renderScaleX;
    }

    public get renderHeight():number
    {
        return this.height * this.renderScaleY;
    }

    public get alpha():number
    {
        return 1;
    }

    // public set scale(value:number)
    // {
    //     if (this._scale == value) return;
    //     this._scale = value;
    //     this.invalidateUpdate();
    // }

    // public get scale():number
    // {
    //     return this._scale;
    // }

    public get renderScaleX():number
    {
        return 1;
    }

    public get renderScaleY():number
    {
        return 1;
    }

    public resetScale():void
    {
        // if (this.cmd) 
    }

    public set italic(value:boolean)
    {
        if (this._italic == value) return;
        this._italic = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get italic():boolean
    {
        return this._italic;
    }

    public set bold(value:boolean)
    {
        if (this._bold == value) return;
        this._bold = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get bold():boolean
    {
        return this._bold;
    }

    public set fontSize(value:number)
    {
        if (this._fontSize == value) return;
        this._fontSize = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get fontSize():number
    {
        return this._fontSize;
    }

    public set font(value:string)
    {
        if (this._font == value) return;
        this._font = value;
        this._fontChanged = true;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get font():string
    {
        return this._font;
    }    

    protected get renderFont():string
    {
        if (!this._ctxFont || this._fontChanged)
            this._ctxFont = (this._italic ? "italic " : "") + (this._bold ? "bold " : "") + this._fontSize + "px " + this._font;
        this._fontChanged = false;
        return this._ctxFont;
    }

    public set color(value:string)
    {
        if (this._color == value) return;
        this._color = value;
        this.invalidateUpdate();
    }

    public get color():string
    {
        return this._color;
    }

    public set strokeColor(value:string)
    {
        if (this._strokeColor == value) return;
        this._strokeColor = value;
        this.invalidateUpdate();
    }

    public get strokeColor():string
    {
        return this._strokeColor;
    }

    public set stroke(value:number)
    {
        if (this._stroke == value) return;
        this._stroke = value;
        this.invalidateUpdate();
    }

    public get stroke():number
    {
        return this._stroke;
    }

    public set wordWrap(value:boolean)
    {
        if (this._wordWrap == value) return;
        this._wordWrap = value;
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get wordWrap():boolean
    {
        return this._wordWrap;
    }

    public set leading(value:number)
    {
        if (this._leading == value) return;
        this._leading = value;
        this.invalidateUpdate();
    }

    public get leading():number
    {
        return this._leading;
    }

    public set align(value:string)
    {
        if (this._align == value) return;
        this._align = value;
        this.invalidateUpdate();
    }

    public get align():string
    {
        return this._align;
    }

    public set valign(value:string)
    {
        if (this._valign == value) return;
        this._valign = value;
        this.invalidateUpdate();
    }

    public get valign():string
    {
        return this._valign;
    }

    public set text(value:string)
    {
        if (this._text == value) return;
        this._text = value + "";
        this._typesetChanged = true;
        this.invalidateUpdate();
    }

    public get text():string
    {
        return this._text;
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
        if (this.cmds) this.drawText();
    }

    public get mouseEnabled():boolean
    {
        return this._mouseEnabled;
    }

    public set mouseEnabled(value:boolean)
    {
        this._mouseEnabled = value;
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

    public get textWidth():number
    {
        if (this._typesetChanged) this.typeset();
        return this._textWidth;
    }

    public get textHeight():number
    {
        let lines:Array<any> = this.lines;
        if (lines)
        {
            if (lines.length > 1)
                return this._textHeight + (lines.length - 1) * this._leading;
            return this._textHeight;
        }
        return 0;
    }

    /**行数*/
    public get lineNum():number
    {
        let lines:Array<any> = this.lines;
        return lines ? lines.length : 0;
    }

    /**行文字列表*/
    public get lines():Array<any>
    {
        if (this._typesetChanged) this.typeset();
        return this._lines;
    }
    
    /**单行高度*/
    public get lineHeight():number
    {
        let lines:Array<any> = this.lines;
        if (lines)
        {
            if (lines.length > 1)
                return this._textHeight / lines.length;
            return this._textHeight;
        }
        return 0;
    }

    /**绘制*/
    public draw(sgsSprite:SgsSprite,index:number = -1):void
    {   
        this.render = sgsSprite;
        this.drawText(index);
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
            this._lines = null;
            this._lineWidths = null;
            this._charSize = null;
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
        if (!this.render) return;
        this.drawText();
    }

    protected drawText(index:number = -1):void//绘制文字
    {
        if (!this.lines) return;
        let graphicsCmds:Array<any> = this.render.graphics.cmds;
        let cmdsLength:number = this.cmds ? this.cmds.length : 0;
        let lines:Array<any> = this.lines;
        let length:number = lines.length;
        let lineHeight:number = this.lineHeight;
        if (length == 0)//空文本:删除多余渲染命令，更新一行渲染命令
        {
            this.delDrawCmd(1);
            cmdsLength = this.cmds ? this.cmds.length : 0;
            if (cmdsLength > 0)
                this.updateLineText(this.cmds[0],this.text,this.renderX,this.renderY);   
            else
                this.drawLineText(this.text,this.renderX,this.renderY,"",index);
            return;   
        }
       
        let curAlign:string = this.align;
        let sx:number = this.renderX;
        let sy:number = this.renderY;
        if (this._width > 0)
        {
            if (this.align == "center") 
                sx += this._width * 0.5;
            else if (this.align == "right") 
                sx += this._width;
        }
        else
        {
            curAlign = "left";
        }
        if (this._height > 0)
        {
            if (this.valign == "middle")
                sy += (this._height - this.textHeight >> 1);
            else if (this.valign == "bottom")
                sy += (this._height - this.textHeight);
        }
        
        if (cmdsLength > length)//本次文本行数少于已绘制行数：删除多余行
        {
            this.delDrawCmd(length);
            cmdsLength = this.cmds ? this.cmds.length : 0;
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
        else//更新绘制:新增命令索引使用本文本最后一个渲染命令索引+1
        {
            let lastIndex:number = this.getCmdIndex(this.cmds[this.cmds.length - 1]);
            index = lastIndex + 1;
        }
        for (var i:number = 0; i < length; i++)
        {
            if (i < cmdsLength)//更新
            {
                this.updateLineText(this.cmds[i],lines[i],sx,sy,curAlign);
            }
            else//新增
            {
                this.drawLineText(lines[i],sx,sy,curAlign,index);
                if (index >= 0) index ++;//存在索引控制
            }
            sy += lineHeight + this.leading;
        }
    }

    protected drawLineText(text:string,x:number,y:number,align:string = "",index:number = -1):void//绘制单行文字
    {
        if (this.stroke > 0)//描边
        {
            this.render.graphics.fillBorderText(this.renderVisible ? text : "",x,y,this.renderFont,this.color,align,this.stroke,this.strokeColor);
        }
        else
        {
            this.render.graphics.fillText(this.renderVisible ? text : "",x,y,this.renderFont,this.color,align);
        }
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

    protected updateLineText(cmd:Laya.FillTextCmd,text:string,x:number,y:number,align:string = ""):void//更新单行文字
    {
        if (!cmd) return;
        cmd.text = this.renderVisible ? text : "";
        cmd.x = x;
        cmd.y = y;
        cmd.font = this.renderFont;
        cmd.color = this.color;
        cmd.textAlign = align;
        
        cmd["_lineWidth"] = this.stroke;
        cmd["_borderColor"] = this.strokeColor;
        // if (cmd.length >= 7)//描边
        // {
        //     cmd. = this.strokeColor;
        //     cmd[6] = this.stroke;
        //     cmd[7] = align;
        // }
        // else
        // {
            
        // }
    }

    protected delDrawCmd(retainCount:number):void//删除渲染命令(用于删除多余行命令，参数为：要保留的行数)
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

    protected typeset():void//排版文本:进行宽高计算
    {
		this._typesetChanged = false;
        this._textWidth = this._textHeight = 0;
        if (!this._lines || !this._lineWidths) return;
        this._lines.length = 0;
        this._lineWidths.length = 0;
		if (!this._text)//空文本 
            return;
        let lastCtxFont:string = this._ctxFont;
        let ctxFont:string = this.renderFont;
		Laya.Browser.context.font = ctxFont;
        if (!this._charSize.width || lastCtxFont != ctxFont)
        {
            let measureResult = Laya.Browser.measureYouText(ctxFont);//SgsText.YouMeasureText(ctxFont);
            this._charSize.width = measureResult.width;
            this._charSize.height = (measureResult.height || this._fontSize);
        }
		this.parseLines(this._text);
		this.evalTextSize();
	}

	protected parseLines(text:string):void//分析文本换行
    {
		var needWordWrapOrTruncate = this._wordWrap;// || this.overflow == Laya.Text.HIDDEN;
		if (needWordWrapOrTruncate)
			var wordWrapWidth = this.getWordWrapWidth();
		var lines = text.replace(/\r\n/g,"\n").split("\n");
        var line:any;
		for (var i = 0, n = lines.length; i < n; i++)
        {
			line = lines[i];
			if (needWordWrapOrTruncate)
				this.parseLine(line,wordWrapWidth);
			else 
            {
				this._lineWidths.push(this.getTextWidth(line));
				this._lines.push(line);
			}
		}
	}

	protected parseLine(line,wordWrapWidth):void//解析行文本
    {
		var ctx = Laya.Browser.context;
		var lines = this._lines;
		var maybeIndex = 0;
		var execResult;
		var charsWidth=NaN;
		var wordWidth=NaN;
		var startIndex=0;
		charsWidth = this.getTextWidth(line);
		if (charsWidth <= wordWrapWidth){
			lines.push(line);
			this._lineWidths.push(charsWidth);
			return;
		}
		charsWidth=this._charSize.width;
		maybeIndex=Math.floor(wordWrapWidth / charsWidth);
		(maybeIndex==0)&& (maybeIndex=1);
		charsWidth=this.getTextWidth(line.substring(0,maybeIndex));
		wordWidth=charsWidth;
		for (var j=maybeIndex,m=line.length;j < m;j++)
        {
			charsWidth=this.getTextWidth(line.charAt(j));
			wordWidth+=charsWidth;
			if (wordWidth > wordWrapWidth)
            {
				if (this._wordWrap)
                {
					var newLine=line.substring(startIndex,j);
					if (newLine.charCodeAt(newLine.length-1)< 255)
                    {
						execResult=/(?:\w|-)+$/.exec(newLine);
						if (execResult){
							j=execResult.index+startIndex;
							if (execResult.index==0)
								j+=newLine.length;
							else
							newLine=line.substring(startIndex,j);
						}
					}
                    else if (Laya.Text.RightToLeft)
                    {
						execResult=/([\u0600-\u06FF])+$/.exec(newLine);
						if(execResult){
							j=execResult.index+startIndex;
							if (execResult.index==0)
								j+=newLine.length;
							else
							newLine=line.substring(startIndex,j);
						}
					}
					lines.push(newLine);
					this._lineWidths.push(wordWidth-charsWidth);
					startIndex=j;
					if (j+maybeIndex < m)
                    {
						j+=maybeIndex;
						charsWidth=this.getTextWidth(line.substring(startIndex,j));
						wordWidth=charsWidth;
						j--;
					}
                    else 
                    {
						lines.push(line.substring(startIndex,m));
						this._lineWidths.push(this.getTextWidth(lines[lines.length-1]));
						startIndex=-1;
						break;
					}
				}
                // else if (this.overflow == Laya.Text.HIDDEN)
                // {
				// 	lines.push(line.substring(0,j));
				// 	this._lineWidths.push(this.getTextWidth(lines[lines.length-1]));
				// 	return;
				// }
			}
		}
		if (this._wordWrap && startIndex !=-1)
        {
			lines.push(line.substring(startIndex,m));
			this._lineWidths.push(this.getTextWidth(lines[lines.length-1]));
		}
	}

    protected evalTextSize():void//计算文本尺寸
    {
		var nw=NaN,nh=NaN;
		nw = Math.max.apply(this,this._lineWidths);
		nh = this._lines.length * this._charSize.height;
		this._textWidth = nw;
		this._textHeight = nh;
	}

    protected getTextWidth(text):number//获取文本宽度
    {
		return Laya.Browser.context.measureText(text).width;
	}

	protected getWordWrapWidth():number//获取换行所需的宽度
    {
		var w = this._width;
		if (w <= 0)
			w = this._wordWrap ? 100 : Laya.Browser.width;
		w <= 0 && (w = 100);
		return w;
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

    protected onSelfDown(event:SgsText):void
    {
        this._longDowned = false;
        Laya.timer.once(Global.LongClickTime,this,this.onLongTimer,[event]);
    }

    protected onSelfUp(event:SgsText):void
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