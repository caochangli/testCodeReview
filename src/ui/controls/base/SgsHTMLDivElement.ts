/*
* name;
*/
export default class SgsHTMLDivElement extends Laya.HTMLDivElement
{
    // protected buttonMode:boolean = false;
    public static HTML_REPAINT:string = "HTML_REPAINT";
    /**
     * 重新布局，当元素过多时应该会影响性能，主要用于图片加载
     */
    protected needRelayout:boolean = false;
    
    constructor()
    {
        super();
        this.on(Laya.Event.LINK, this, this.onLink);
    }

    public get element():Laya.HTMLDivParser
    {
        return this["_element"];
    }

    public get styleHeight():number
    {
        return this.height;
    }

    public set styleHeight(val:number)
    {
        this.height = val;
    }

    public get fontFamily():string
    {
        return this.style.family;
    }

    public set fontFamily(value:string)
    {
        this.style.family = value;
    }

    public get fontSize():number
    {
        return this.style.fontSize;
    }

    public set fontSize(value:number)
    {
        this.style.fontSize = value;
    }

    public get color():string
    {
        return this.style.color;
    }

    public set color(value: string)
    {
        this.style.color = value;
    }

    public get strokeColor():string
    {
        return this.style.strokeColor;
    }

    public set strokeColor(value: string)
    {
        this.style.strokeColor = value;
    }

    public get leading():number
    {
        return this.style.leading;
    }

    public set leading(val:number)
    {
        this.style.leading = val;
    }

    public get letterSpacing():number
    {
        return this.style.letterSpacing;
    }

    public set letterSpacing(val:number)
    {
        this.style.letterSpacing = val;
    }

    public set italic(value:boolean)
    {
        this.style.italic = value;
    }

    public get italic():boolean
    {
        return this.style.italic;
    }

    public get bold():boolean
    {
        return this.style.bold;
    }

    public set bold(val:boolean)
    {
        this.style.bold = val;
    }

    public get wordWrap():boolean
    {
        return this.style.wordWrap;
    }

    public set wordWrap(val: boolean)
    {
        this.style.wordWrap = val;
    }

    public get align(): string
    {
        return this.style.align;
    }

    public set align(val: string)
    {
        this.style.align = val;
    }

    public get valign(): string
    {
        return this.style.valign;
    }

    public set valign(val: string)
    {
        this.style.valign = val;
    }

    public set NeedRelayout(val:boolean){
        this.needRelayout = val;
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

    public set innerHTML(text:string)
    {
        Laya.superSetter(SgsHTMLDivElement,this, "innerHTML",text);
        //在设置文本后将textDecoration属性设置为none
        if(this.style && !this.style.textDecoration)
        {
            this.style.textDecoration = "none";
        }
        if(this["_element"] && this["_element"]["_children"])
        {
            let childs:Array<any> = this["_element"]["_children"];
            let length = childs.length;
            let htmlItem:any;
            for(let i=0; i<length; ++i)
            {
                htmlItem = childs[i];
                if(htmlItem && htmlItem.style)
                    if(!htmlItem.style.textDecoration)
                        htmlItem.style.textDecoration = "none";
            }
        }
    }
    
    // private onButtonMode(event:Laya.Event):void
    // {
    //     if (this.buttonMode) {
    //         SgsMouseManager.ButtonMode(this,event.type == Laya.Event.MOUSE_OVER ? true : false);
    //     }
    // }

    private onLink(href:string)
    {
        let target:any = this.parent;
        while (target){
            target.event(Laya.Event.LINK,[href]);
            target=target.parent;
        }
    }

    public repaint():void{
        super.repaint();
        if(this.needRelayout){
            // this.layout();
            this.event(SgsHTMLDivElement.HTML_REPAINT,this);
        }
        
    }
}