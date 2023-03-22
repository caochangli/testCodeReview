import FontName from "../../../enum/FontName";
import RES from "../../../res/RES";
import ComboboxRenderItem from "./ComboboxRenderItem";
import TopUILayer from "../../layer/TopUILayer";
import SystemContext from "../../../SystemContext";

export default class SgsComboBox extends Laya.ComboBox
{
    protected _listSkin:string = "";
    protected _listSizeGrid:string = "";
    protected _scrollBarHide:boolean = false;
    protected _scrollBarAutoHide:boolean = false;
    protected _gap:number = 0;
    protected _data:Array<{label:string,value:number}>;
    
    constructor(skin?:string,labels?:string) 
    {
        super(skin,labels);

        this.labelColors = "#FAEDD9,#FAEDD9,#FAEDD9,gray";
        this.labelSize = 16;
        this.itemSize = 16;
        this.visibleNum = 10;
        this.labelFont = FontName.ST;
        this.scrollBarSkin = RES.GetAtlasUrl("hscrollMin");
        this.autoSize = false;
        this.sizeGrid = "10,25,10,10,0";
        this.itemRender = ComboboxRenderItem;

        this.Width = this.width;
    }

    //下拉框背景
    public set listSkin(value:string)
    {
        this._listSkin = value;
    }

    //下拉框九宫格
    public set listSizeGrid(value:string)
    {
        this._listSizeGrid = value;
    }

    //下拉框滚动条掩藏
    public set scrollBarHide(value:boolean)
    {
        this._scrollBarHide = value;
    }
 
     //下拉框滚动条自动掩藏
     public set scrollBarAutoHide(value:boolean)
     {
        this._scrollBarAutoHide = value;
     }

     //下拉框和button按钮间距
     public set gap(value:number)
     {
        this._gap = value;
     }

    //下拉数据
    public set data(data:Array<{label:string,value:number}>)
    {
        this._data = data;
        let labels:string = "";
        data.forEach((item:{label:string,value:number})=>{
            labels += item.label + ",";
        });
        this.labels = labels.slice(0,labels.length - 1);
    }

    public set isOpen(value:boolean)
    {
        Laya.superSetter(SgsComboBox,this,"isOpen",value);
        if (this._isOpen)
        {
            if (this._list)
            {
                if (this._list.scrollBar)
                {
                    this._list.scrollBar.hide = this._scrollBarHide;
                    this._list.scrollBar.autoHide = this._scrollBarAutoHide;
                }
                this._list.removeSelf();
                TopUILayer.GetInstance().addChild(this._list);
                let p:Laya.Point = this.localToGlobal(Laya.Point.TEMP.setTo(0,0));
                p = TopUILayer.GetInstance().globalToLocal(p);
				var py = p.y + this._button.height + this._gap;
				py = py + this._listHeight <= SystemContext.gameHeight ? py : p.y - this._gap - this._listHeight;
				this._list.pos(p.x,py);
            }
        }
    }

    //设置宽度：button和下拉List宽度保持一致
    public set Width(value:number)
    {
        this.width = value;
        this.list.width = value;
    }

    public get SelectedValue():number
    {
        return this._data[this.selectedIndex.toString()].value;
    }

    public set SelectedValue(value:number)
    {
        this.selectedIndex = this.getIndexByValue(value);
    }

    protected getIndexByValue(value:number):number
    {
        let result:number = 0;
        for(let i:number = 0 ; i < this._data.length; i++)
        {
            if(this._data[i].value == value)
            {
                result = i;
                break;
            }
        }
        return result;
    }

    protected changeItem():void
    {
        super.changeItem();
        let box:Laya.Box = this.list.getCell(0);
        if (box)
        {
            if (!this.labels || this.labels.length <= 0)
                box.width = this.list.width;
            this._listHeight = Math.min(this._visibleNum,this._labels.length) * box.height;
            if (!this._listHeight)
                this._listHeight = this._itemHeight;
            this.drawListSkin(box.width,this._listHeight);
            Laya.timer.callLater(this,this.resetListHeightHandler)
        }
    }

    protected resetListHeightHandler():void
    {
        this._list.height = this._listHeight;
    }
    
    protected drawListSkin(width:number,height:number)//绘制下拉框背景
    {
        if (!this.list) return;
        this.list.graphics.clear();
        let tex:Laya.Texture = RES.GetRes(this._listSkin);
        if (!tex) return;
        if (this._listSizeGrid && this._listSizeGrid.length >= 4)//九宫格
        {
            let grid:Array<string> = this._listSizeGrid.split(",");
            if (grid[0] == "0") grid[0] = "1";
            if (grid[1] == "0") grid[1] = "1";
            if (grid[2] == "0") grid[2] = "1";
            if (grid[3] == "0") grid[3] = "1";
            let sw:number = tex.width;
            let sh:number = tex.height;
            let top:number = parseInt(grid[0]);
            let right:number = parseInt(grid[1]);
            let bottom:number = parseInt(grid[2]);
            let left:number = parseInt(grid[3]);
            //九宫格编号规则
            //8,1,2
            //7,9,3
            //6,5,4    
            let tempTex = Laya.Texture.createFromTexture(tex,left,0,sw - left - right,top);
            this.list.graphics.drawTexture(tempTex,left,0,width - left - right,top);

            tempTex = Laya.Texture.createFromTexture(tex,sw - right,0,right,top);
            this.list.graphics.drawTexture(tempTex,width - right,0,right,top);

            tempTex = Laya.Texture.createFromTexture(tex,sw - right,top,right,sh - top - bottom);
            this.list.graphics.drawTexture(tempTex,width - right,top,right,height - top - bottom);

            tempTex = Laya.Texture.createFromTexture(tex,sw - right,sh - bottom,right,bottom);
            this.list.graphics.drawTexture(tempTex,width - right,height - bottom,right,bottom);

            tempTex = Laya.Texture.createFromTexture(tex,left,sh - bottom,sw - left - right,bottom);
            this.list.graphics.drawTexture(tempTex,left,height - bottom,width - left - right,bottom);

            tempTex = Laya.Texture.createFromTexture(tex,0,sh - bottom,left,bottom);
            this.list.graphics.drawTexture(tempTex,0,height - bottom,left,bottom);

            tempTex = Laya.Texture.createFromTexture(tex,0,top,left,sh - top - bottom);
            this.list.graphics.drawTexture(tempTex,0,top,left,height - top - bottom);

            tempTex = Laya.Texture.createFromTexture(tex,0,0,left,top);
            this.list.graphics.drawTexture(tempTex,0,0,left,top);

            tempTex = Laya.Texture.createFromTexture(tex,left,top,sw - left - right,sh - top - bottom);
            this.list.graphics.drawTexture(tempTex,left,top,width - left - right,height - top - bottom);
        }
        else
        {
            this.list.graphics.drawTexture(tex,width,height);
        }
    }
    
    public destroy():void
    {
        this.isOpen = false;
        //引擎底层静态event对象持有此对象，导致无法回收
        var eventEmpty = Laya.Event.EMPTY;
		if (eventEmpty)
		{
			if (eventEmpty.currentTarget === this)
				eventEmpty.currentTarget = null;
			if (eventEmpty.target === this)
				eventEmpty.target = null;
		}
        super.destroy();
    }
}