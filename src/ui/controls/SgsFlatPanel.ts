import LayoutEnum from "../../enum/base/LayoutEnum";
import Dictionary from "./../../utils/Dictionary";
import SgsSprite from "./base/SgsSprite";
import SgsFlatPanelItemBase from "./SgsFlatPanelItemBase";

/*
* 扁平panel，采用分层、虚拟布局方式(适用于itemRenderer一样且尺寸一样)
*/
export default class SgsFlatPanel extends Laya.Panel
{
    public static ITEM_CLICK:string = "ITEM_CLICK";//子项点击事件DataProvider
    public static ITEM_CUSTOM_EVENT:string = "ITEM_CUSTOM_EVENT";//子项自定义事件

    protected contentSp:SgsSprite;//内容容器
    protected otherRenders:Array<SgsSprite>;//其他渲染器(分层渲染层)
    protected itemRenderer:any;//item呈现器
    protected eventLayerIndex:number = -2;
    protected layoutType:number = 0;//布局类型(参考：LayoutEnum枚举)
    protected vGap:number = 0;//垂直间距
    protected hGap:number = 0;//水平间距
    protected col:number = 0;//最多列数(网格布局使用)
    protected paddingLeft:number = 0;//左边距
    protected paddingTop:number = 0;//顶边距
    protected layoutFun:Function;//布局函数
    protected itemCreateFunction:Laya.Handler;//子项创建时自定义函数
    protected itemRendererFunction:Laya.Handler;//呈现器自定义函数
    protected dataProvider:Array<any>;//列表数据源
    protected selectedIndexs:Array<number>;//选中索引列表
    protected scrollStopUpdate:boolean = false;//滚动时停止更新

    protected isLeaveDrawClear:boolean = false;//离开渲染区域是否回收资源
    protected scrollClearValue:number = 0;//滚动回收阈值(超出屏幕多少像素后回收，默认0 表示panel尺寸)
    protected setScrollClearValue:number = 0;//设置的滚动回收阈值(超出屏幕多少像素后回收，默认0 表示panel尺寸)

    protected itemWidth:number = 0;
    protected itemHeight:number = 0;
    protected itemMaxCountChanged:boolean = true;
    protected itemMaxCount:number = 0;
    protected startIndex:number = -1;
    protected endIndex:number = -1;
    protected itemUIDic:Object;
    // protected itemPoolDic:Object;
    protected itemPools:Array<SgsFlatPanelItemBase>;
    protected invalidItemUIs:Array<SgsFlatPanelItemBase>;//舞台上本次失效的ui列表
    // protected invalidPools:Array<SgsFlatPanelItemBase>;//对象池中本次失效的ui列表
    protected itemLoadStatusDic:Dictionary;//ui列表加载状态

    /**
     * @param itemRenderer item呈现器
     * @param otherLayerNum 额外层级数量
     * @param eventLayerIndex 哪一层接受事件(-1 表示contentSp接受事件，>=0表示额外层接受事件)
     * */
    constructor(itemRenderer:any = SgsFlatPanelItemBase,otherLayerNum:number = 0,eventLayerIndex:number = -2)
    {
        super();

        this.itemRenderer = itemRenderer;
        this.eventLayerIndex = eventLayerIndex;
        this.itemUIDic = {};
        // this.itemPoolDic = {};
        this.itemPools = [];
        this.invalidItemUIs = [];
        // this.invalidPools = [];
        this.itemLoadStatusDic = new Dictionary();
        
        this.contentSp = new SgsSprite();
        this.addChild(this.contentSp);
        if (eventLayerIndex == -1)
        {
            this.contentSp.addDrawClick();
            this.contentSp.addDrawMouseEvent();
        }
        
        if (otherLayerNum > 0)//创建分层
        {
            this.otherRenders = [];
            let layerSp:SgsSprite;
            for (let i:number = 0; i < otherLayerNum; i++)
            {
                layerSp = new SgsSprite();
                this.addChild(layerSp);
                if (eventLayerIndex == i)
                {
                    layerSp.addDrawClick();
                    layerSp.addDrawMouseEvent();
                }
                this.otherRenders.push(layerSp);
            }
        }

        //计算单个itemRenderer尺寸
        let itemUI:SgsFlatPanelItemBase = new this.itemRenderer(this.otherRenders);
        itemUI.RendererIndex = -1;
        // this.itemPoolDic[itemUI.RendererIndex] = itemUI;
        this.itemPools.push(itemUI);
        this.itemWidth = itemUI.width;
        this.itemHeight = itemUI.height;
    }

    public set width(val:number)
    {
        if (val == this.width) return;
        this.itemMaxCountChanged = true;
        Laya.superSetter(SgsFlatPanel,this,"width",val);
    }

    public get width():number
    {
        return this["_width"];
    }

    public set height(val:number)
    {
        if (val == this.height) return;
        this.itemMaxCountChanged = true;
        Laya.superSetter(SgsFlatPanel,this,"height",val);
    }

    public get height():number
    {
        return this["_height"];
    }

    /**
     * 设置滚动回收资源
     * @param isLeaveDrawClear 离开渲染区域是否回收资源
     * @param scrollClearValue 滚动回收阈值(超出屏幕多少像素后回收，默认0表示panel尺寸)
     * */
    public SetScrollClearRes(isLeaveDrawClear:boolean,scrollClearValue:number = 0):void
    {
        this.isLeaveDrawClear = isLeaveDrawClear;
        this.setScrollClearValue = scrollClearValue;
        this.itemMaxCountChanged = true;
    }

    /**
     * 设置布局
     * @param layoutType 布局类型：参考LayoutEnum枚举
     * @param vGap 垂直间距
     * @param hGap 水平间距
     * @param col 列数：网格布局时用于一行最多几列
     * @param paddingLeft 左边距
     * @param paddingTop 顶边距
     * */
    public SetLayout(layoutType:number = LayoutEnum.VerticalLayout,vGap:number = 0,hGap:number = 0,col:number = 0,paddingLeft:number = 0,paddingTop:number = 0):void
    {
        this.layoutType = layoutType;
        this.vGap = vGap;
        this.hGap = hGap;
        this.col = col;
        this.paddingLeft = paddingLeft;
        this.paddingTop = paddingTop;
        
        if (this.layoutType == LayoutEnum.VerticalLayout)//垂直布局
            this.layoutFun = this.setVerticalLayout;
        else if (this.layoutType == LayoutEnum.HorizontalLayout)//水平布局
            this.layoutFun = this.setHorizontalLayout;
        else if (this.layoutType == LayoutEnum.TileLayout)//网格布局
            this.layoutFun = this.setTileLayout;
    }

    //子项创建时自定义函数(在创建子项时执行itemCreateFunction(itemRenderer))
    public set ItemCreateFunction(val:Laya.Handler)
    {
        this.itemCreateFunction = val;
        if (val.once) val.once = false;
        // if (this.itemPoolDic && this.itemPoolDic[-1] && this.itemCreateFunction)//默认创建的子项派发创建事件
        //     this.itemCreateFunction.runWith([this.itemPoolDic[-1]]);
        let length:number = this.itemPools ? this.itemPools.length : 0;
        if (length > 0 && this.itemCreateFunction)//默认创建的子项派发创建事件
        {
            let itemUI:SgsFlatPanelItemBase;
            for (let i:number = 0; i < length; i++)
            {
                itemUI = this.itemPools[i];
                if (itemUI && itemUI.RendererIndex == -1)
                {
                    this.itemCreateFunction.runWith([itemUI]);
                    break;
                }
            }
        }
    }

    //设置呈现器自定义函数(在呈现器的updateRenderer(index,rendererData,itemRenderer)之前执行)
    public set ItemRendererFunction(val:Laya.Handler)
    {
        this.itemRendererFunction = val;
        if (val.once) val.once = false;
    }

    //获取数据索引 - 根据数据属性匹配
    public GetIndexByProperty(val:string | number,property:string):number
    {
        if (property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return -1;
        for (let i:number = 0; i < this.dataProvider.length; i++)
        {
            if (this.dataProvider[i][property] == val)
                return i;
        }
        return -1;
    }

    public get DataProvider():Array<any> 
    {
        return this.dataProvider;
    }

    /** 列表数据源 */
    public set DataProvider(value:Array<any>)
    {
        Laya.timer.clear(this,this.onDelayLoacation);
        this.dataProvider = value;
        if (this.selectedIndexs)//重置数据后，重置选中状态
            this.selectedIndexs.length = 0;
        let length:number = this.dataProvider ? this.dataProvider.length : 0;
        let itemUI:SgsFlatPanelItemBase;
        if (length <= 0)//数据为空
        {
            for (let index in this.itemUIDic)
            {
                itemUI = this.itemUIDic[index];
                itemUI.off(Laya.Event.CLICK,this,this.onItemUIClick);
                itemUI.off(SgsFlatPanel.ITEM_CUSTOM_EVENT,this,this.onItemUICustomEvent);
                this.contentSp.removeDrawChild(itemUI,false);
                // this.itemPoolDic[itemUI.RendererIndex] = itemUI;
                this.itemPools.push(itemUI);
            }
            this.itemUIDic = {};
            this.updateLayerSize(0,0);
            return;
        }

        if (this.layoutType == LayoutEnum.VerticalLayout)//垂直布局
            this.updateLayerSize(this.width,this.paddingTop + this.itemHeight * length + this.vGap * (length - 1));
        else if (this.layoutType == LayoutEnum.HorizontalLayout)//水平布局
            this.updateLayerSize(this.paddingLeft + this.itemWidth * length + this.hGap * (length - 1),this.height);
        else if (this.layoutType == LayoutEnum.TileLayout)//网格布局
            this.updateLayerSize(this.width,this.paddingTop + Math.floor((length - 1) / this.col) * (this.itemHeight + this.vGap) + this.itemHeight);
        
        //数据变化后清空每个对象保存的数据，防止数据中部分属性变化但对象是同一个对象而导致无法更新ui
        for (let index in this.itemUIDic)
        {
            itemUI = this.itemUIDic[index];
            if (this.isLeaveDrawClear && itemUI.RendererData)
                itemUI.LeaveDrawClear();
            itemUI.ResetRendererData();
        }
        // for (let index in this.itemPoolDic)
        // {
        //     itemUI = this.itemPoolDic[index];
        //     if (this.isLeaveDrawClear && itemUI.RendererData)
        //         itemUI.LeaveDrawClear();
        //     itemUI.ResetRendererData();
        // }
        if (this.itemPools.length > 0)
        {
            this.itemPools.forEach(element => {
                if (this.isLeaveDrawClear && element.RendererData)
                    element.LeaveDrawClear();
                element.ResetRendererData();
            });
        }

        this.startIndex = -1;
        this.endIndex = -1;
        this.updateRenderers();
    }

    //选中个数
    public get SelectedCount():number
    {
        return this.selectedIndexs ? this.selectedIndexs.length : 0;
    }

    //选中索引列表
    public get SelectedIndexs():Array<number> 
    {
        return this.selectedIndexs;
    }

    //获取itemRenderer选中状态
    public GetSelected(index:number):boolean
    {
        return this.selectedIndexs && this.selectedIndexs.indexOf(index) != -1 ? true : false;
    }

    //获取选中UI - 单选
    public GetSelectedItemUI():SgsFlatPanelItemBase
    {
        if (!this.itemUIDic || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        return this.itemUIDic[this.selectedIndexs[0]];
    }

    //获取选中UI列表 - 多选
    public GetSelectedItemUIs():Array<SgsFlatPanelItemBase>
    {
        if (!this.itemUIDic || !this.selectedIndexs || this.selectedIndexs.length <= 0)
            return null;
        let result:Array<SgsFlatPanelItemBase> = [];
        let selectedLength:number = this.selectedIndexs.length;
        let itemUI:SgsFlatPanelItemBase;
        for (let i:number = 0; i < selectedLength; i++)
        {
            itemUI = this.itemUIDic[this.selectedIndexs[i]];
            if (itemUI)
                result.push(itemUI);
        }
        return result;
    }

    //获取选中数据 - 单选：property表示返回数据中指定属性的选中列表
    public GetSelectedData(property:string = ""):any
    {
        if (!this.dataProvider || this.dataProvider.length <= 0 || !this.selectedIndexs || this.selectedIndexs.length <= 0) 
            return null;
        if (property)
            return this.dataProvider[this.selectedIndexs[0]][property];
        else
            return this.dataProvider[this.selectedIndexs[0]];
    }

    //获取选中数据列表 - 多选：property表示返回数据中指定属性的选中列表
    public GetSelectedDatas(property:string = ""):Array<any>
    {
        if (!this.dataProvider || this.dataProvider.length <= 0 || !this.selectedIndexs || this.selectedIndexs.length <= 0) 
            return null;
        let selectedLength:number = this.selectedIndexs.length;
        let dataLength:number = this.dataProvider.length;
        let result:Array<any> = [];
        let selectedIndex:number = -1;
        let data:any;
        for (let i:number = 0; i < selectedLength; i++)
        {
            selectedIndex = this.selectedIndexs[i];
            data = selectedIndex >= 0 && selectedIndex < dataLength ? this.dataProvider[selectedIndex] : null;
            if (data)
            {
                if (property)
                    result.push(data[property]);
                else
                    result.push(data);
            }
        }
        return result;
    }

    //设置选中列表 - 根据数据属性匹配(整个列表覆盖)
    public SetSelectedDatas(val:Array<string | number>,property:string):void
    {
        if (!val || val.length <= 0 || property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return;
        let index:number = -1;
        val.forEach(element => {
            index = this.GetIndexByProperty(element,property);
            if (index >= 0)
                this.SetSelected(index,true,true);
        });
    }

    //设置选中列表(整个列表覆盖,null表示取消所有选中)
    public set SelectedIndexs(val:Array<number>)
    {
        this.selectedIndexs = val;
        if (this.itemUIDic)
        {
            let itemUI:SgsFlatPanelItemBase;
            let selected:boolean = false;
            for (let index in this.itemUIDic)
            {
                selected = this.selectedIndexs && this.selectedIndexs.indexOf(Number(index)) != -1 ? true : false;
                itemUI = this.itemUIDic[index];
                if (itemUI && itemUI.Selected != selected)
                    itemUI.Selected = selected;
            }
        }
    }

    //设置itemRenderer选中状态
    public SetSelected(index:number,selected:boolean,multiSelect:boolean = false):void
    {
        if (!this.selectedIndexs)
            this.selectedIndexs = [];
        if (multiSelect)//多选
        {
            let itemUI:SgsFlatPanelItemBase;
            let selectedIndex:number = this.selectedIndexs.indexOf(index);
            if (selected)//选中
            {
                if (selectedIndex == -1)//不存在
                {
                    this.selectedIndexs.push(index);
                    itemUI = this.itemUIDic ? this.itemUIDic[index] : null;
                    if (itemUI && !itemUI.Selected) 
                        itemUI.Selected = true;
                }
            }
            else//取消
            {
                if (selectedIndex != -1)//存在
                {
                    this.selectedIndexs.splice(selectedIndex,1);
                    itemUI = this.itemUIDic ? this.itemUIDic[index] : null;
                    if (itemUI && itemUI.Selected) 
                        itemUI.Selected = false;
                }
            }
        }
        else//单选
        {
            this.selectedIndexs.length = 0;
            if (selected)
                this.selectedIndexs.push(index);
            this.SelectedIndexs = this.selectedIndexs;
        }
    }

    //设置定位子项
    public SetLocationData(val:string | number,property:string):void
    {
        if (!val || property == "" || !this.dataProvider || this.dataProvider.length <= 0)
            return;
        let index:number = this.GetIndexByProperty(val,property);
        if (index <= -1) return;
        if (!this.vScrollBar && !this.hScrollBar) return;
        Laya.timer.clear(this,this.onDelayLoacation);
        Laya.timer.frameOnce(2,this,this.onDelayLoacation,[index]);
    }

    private onDelayLoacation(index:number):void
    {
        let scrollX:number = this.hScrollBar ? this.hScrollBar.value : 0;
        let scrollY:number = this.vScrollBar ? this.vScrollBar.value : 0;
        if (this.layoutType == LayoutEnum.TileLayout)
        {
            if (this.vScrollBar)
                scrollY = this.paddingTop + Math.floor(index / this.col) * (this.itemHeight + this.vGap);
            else
                scrollX = this.paddingLeft + Math.ceil(index % this.col) * (this.itemWidth + this.hGap);
        }
        else if (this.layoutType == LayoutEnum.VerticalLayout)//垂直布局
            scrollY = this.paddingTop + index * (this.itemHeight + this.vGap);
        else if (this.layoutType == LayoutEnum.HorizontalLayout)//水平布局
            scrollX = this.paddingLeft + index * (this.itemWidth + this.hGap);
        let vScrollBarMax:number = this.vScrollBar ? this.vScrollBar.max : 0;
        let hScrollBarMax:number = this.hScrollBar ? this.hScrollBar.max : 0;
        if (scrollX > hScrollBarMax) 
            scrollX = hScrollBarMax;
        if (scrollY > vScrollBarMax)
            scrollY = vScrollBarMax;
        this.scrollTo(scrollX,scrollY);
    }

    //设置panel内容尺寸
    public SetContentSize(width:number,height:number):void
    {
        this.updateLayerSize(width,height);
    } 

    //当前渲染的子项列表
    public get CurDrawRenderers():Array<SgsFlatPanelItemBase>
    {
        if (!this.itemUIDic) return null;
        let result:Array<SgsFlatPanelItemBase> = [];
        for (let index in this.itemUIDic)
        {
            result.push(this.itemUIDic[index]);
        }
        return result.sort(this.itemUIsSort);
    }

    //获取指定索引渲染子项(有可能返回null)
    public GetDrawRenderer(index:number):SgsFlatPanelItemBase
    {
        if (this.itemUIDic && this.itemUIDic[index])
            return this.itemUIDic[index];
        return null;
    }

    protected updateRenderers():void//更新呈现器
    {
        let dataLength:number = this.dataProvider ? this.dataProvider.length : 0;
        if (dataLength <= 0) return;
        //计算itemRenderer数量
        this.updateItemMaxCount();
        let vStart:number = this.vScrollBar ? -this.paddingTop + this.vScrollBar.value : -this.paddingTop;
        let hStart:number = this.hScrollBar ? -this.paddingLeft + this.hScrollBar.value : -this.paddingLeft;
        this.drawRenderers(vStart,hStart);
    }

    protected drawRenderers(vStart:number,hStart:number):void
    {
        let dataLength:number = this.dataProvider ? this.dataProvider.length : 0;
        //计算开始、结束索引
        let startIndex:number = -1;
        let endIndex:number = -1;
        if (this.layoutType == LayoutEnum.VerticalLayout)//垂直布局
            startIndex = Math.floor((vStart - this.scrollClearValue) / (this.itemHeight + this.vGap));
        else if (this.layoutType == LayoutEnum.HorizontalLayout)//水平布局
            startIndex = Math.floor((hStart - this.scrollClearValue)/ (this.itemWidth + this.hGap));
        else if (this.layoutType == LayoutEnum.TileLayout)//网格布局
            startIndex = Math.floor((vStart - this.scrollClearValue) / (this.itemHeight + this.vGap)) * this.col;
        if (startIndex < 0) startIndex = 0;
        endIndex = startIndex + this.itemMaxCount - 1;
        if (endIndex >= dataLength) endIndex = dataLength - 1;
        if (startIndex == this.startIndex && endIndex == this.endIndex) return;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        //找到舞台和对象池中不在本次索引范围内的对象
        this.invalidItemUIs.length = 0;
        // this.invalidPools.length = 0;
        let itemUI:SgsFlatPanelItemBase;
        for (let index in this.itemUIDic)
        {
            itemUI = this.itemUIDic[index];
            if (itemUI.RendererIndex < startIndex || itemUI.RendererIndex > endIndex)
                this.invalidItemUIs.push(itemUI);
        }
        // for (let index in this.itemPoolDic)
        // {
        //     itemUI = this.itemPoolDic[index];
        //     if (itemUI.RendererIndex < startIndex || itemUI.RendererIndex > endIndex)
        //         this.invalidPools.push(itemUI);
        // }
        //更新可视区域
        let itemData:any;
        let selected:boolean = false;
        for (let index:number = startIndex; index <= endIndex; index++)
        {
            itemData = this.dataProvider[index];
            itemUI = this.itemUIDic[index];
            if (itemUI)//在舞台上找到对应索引的ui
            {
            }
            else if (this.invalidItemUIs.length > 0)//舞台上有已失效的ui
            {
                itemUI = this.invalidItemUIs.shift();
                delete this.itemUIDic[itemUI.RendererIndex];
                this.itemUIDic[index] = itemUI;
            }
            else
            {
                // itemUI = this.itemPoolDic[index];
                // if (itemUI)//从对象池的找到对应索引的ui
                // {
                //     delete this.itemPoolDic[index];
                // }
                // else if (this.invalidPools.length > 0)//对象池中有失效的ui
                // {
                //     itemUI = this.invalidPools.shift();
                //     delete this.itemPoolDic[itemUI.RendererIndex];
                // }
                if (this.itemPools.length > 0)
                {
                    itemUI = this.itemPools.shift();
                }
                else
                {
                    itemUI = new this.itemRenderer(this.otherRenders);
                    if (this.itemCreateFunction)//派发创建事件
                        this.itemCreateFunction.runWith([itemUI]);
                }
                this.itemUIDic[index] = itemUI;
                this.contentSp.addDrawChild(itemUI);
            }
            this.layoutFun(index,itemUI);
            if (this.isLeaveDrawClear && itemUI.RendererData && itemUI.RendererData != itemData)//重新赋值前回收之前的资源
                itemUI.LeaveDrawClear();
            itemUI.RendererIndex = index;
            itemUI.ItemRendererFunction = this.itemRendererFunction;
            itemUI.ParentPanel = this;
            itemUI.RendererData = itemData;
            selected = this.selectedIndexs && this.selectedIndexs.indexOf(Number(index)) != -1 ? true : false;
            if (itemUI.Selected != selected)
                itemUI.Selected = selected;
            itemUI.on(Laya.Event.CLICK,this,this.onItemUIClick);
            itemUI.on(SgsFlatPanel.ITEM_CUSTOM_EVENT,this,this.onItemUICustomEvent);
        }

        let invalidLength:number = this.invalidItemUIs.length;
        if (invalidLength)//舞台上多余ui
        {
            for (let i:number = 0; i < invalidLength; i++)
            {
                itemUI = this.invalidItemUIs[i];
                delete this.itemUIDic[itemUI.RendererIndex];
                itemUI.off(Laya.Event.CLICK,this,this.onItemUIClick);
                itemUI.off(SgsFlatPanel.ITEM_CUSTOM_EVENT,this,this.onItemUICustomEvent);
                this.contentSp.removeDrawChild(itemUI,false);
                // this.itemPoolDic[itemUI.RendererIndex] = itemUI;
                this.itemPools.push(itemUI);
            }
        }
        this.invalidItemUIs.length = 0;
        // this.invalidPools.length = 0;
    }
    
    protected setVerticalLayout(index:number,itemUI:SgsFlatPanelItemBase):void
    {
        itemUI.pos(this.paddingLeft,this.paddingTop + index * (this.itemHeight + this.vGap));
    }

    protected setHorizontalLayout(index:number,itemUI:SgsFlatPanelItemBase):void
    {
        itemUI.pos(this.paddingLeft + index * (this.itemWidth + this.hGap),this.paddingTop);
    }

    protected setTileLayout(index:number,itemUI:SgsFlatPanelItemBase):void
    {
        itemUI.pos(this.paddingLeft + Math.ceil(index % this.col) * (this.itemWidth + this.hGap),this.paddingTop + Math.floor(index / this.col) * (this.itemHeight + this.vGap));
    }

    protected updateItemMaxCount():void//更新呈现器最大个数
    {
        if (!this.itemMaxCountChanged) return;
        this.itemMaxCountChanged = false;
        this.scrollClearValue = 0;
        if (this.layoutType == LayoutEnum.VerticalLayout)//垂直布局
        {
            if (this.isLeaveDrawClear)
            {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.height;
                this.itemMaxCount = Math.ceil((this.height + this.scrollClearValue * 2) / (this.itemHeight + this.vGap));
            }
            else
                this.itemMaxCount = Math.ceil(this.height / (this.itemHeight + this.vGap)) + 1;
        }
        else if (this.layoutType == LayoutEnum.HorizontalLayout)//水平布局
        {
            if (this.isLeaveDrawClear)
            {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.width;
                this.itemMaxCount = Math.ceil((this.width + this.scrollClearValue * 2) / (this.itemWidth + this.hGap));
            } 
            else
                this.itemMaxCount = Math.ceil(this.width / (this.itemWidth + this.hGap)) + 1;
        }
        else if (this.layoutType == LayoutEnum.TileLayout)//网格布局
        {
            if (this.isLeaveDrawClear)
            {
                this.scrollClearValue = this.setScrollClearValue ? this.setScrollClearValue : this.height;
                this.itemMaxCount = this.col * Math.ceil((this.height + this.scrollClearValue * 2) / (this.itemHeight + this.vGap));
            }
            else
                this.itemMaxCount = this.col * (Math.ceil(this.height / (this.itemHeight + this.vGap)) + 1);
        } 
    }

    protected updateLayerSize(width:number,height:number,isDelayRefresh:boolean = true):void//更新层级尺寸：确保滚动条正确
    {
        //仅接受事件的层设置尺寸，若没有接受事件的层 则默认contentSp设置尺寸(总要有一个层设置尺寸，否则滚动区域无法滚动)
        let sizeSp:SgsSprite;
        if (this.eventLayerIndex <= -1)
        {
            this.contentSp.size(width,height);
            sizeSp = this.contentSp;
        }
        if (this.otherRenders)
        {
            for (let i:number = 0; i < this.otherRenders.length; i++)
            {
                if (this.eventLayerIndex == i)
                {
                    this.otherRenders[i].size(width,height);
                    sizeSp = this.otherRenders[i];
                }
            }
        }
        if (isDelayRefresh)
        {
            if (sizeSp)
                sizeSp.event(Laya.Event.RESIZE,this.contentSp);//派发尺寸变化事件，让panel重新计算滚动
        } 
        else
            this.refresh();
    }

    protected onScrollBarChange(scrollBar:Laya.ScrollBar):void
    {
        super.onScrollBarChange(scrollBar);

        if (!this.scrollStopUpdate)//滚动时停止更新
            this.updateRenderers();

        this.event("scrollChange");
    }

    protected onItemUIClick(event:SgsFlatPanelItemBase):void
    {
        this.event(SgsFlatPanel.ITEM_CLICK,[event.RendererIndex,event.RendererData,event]);
    }

    protected onItemUICustomEvent(event:SgsFlatPanelItemBase,customData:any):void
    {
        this.event(SgsFlatPanel.ITEM_CUSTOM_EVENT,[event.RendererIndex,event.RendererData,event,customData]);
    }

    protected itemUIsSort(a:SgsFlatPanelItemBase,b:SgsFlatPanelItemBase):number
    {
        return a.RendererIndex - b.RendererIndex;
    }

    public UpdateItemLoadStatus(rendererIndex:number,loadStatus:number):void
    {
        if (this.itemLoadStatusDic)
        {
            if (loadStatus == 0)
                this.itemLoadStatusDic.del(rendererIndex);
            else
                this.itemLoadStatusDic.addNumberKey(rendererIndex,loadStatus);
        }
    }

    public GetItemLoadStatus(rendererIndex:number):number
    {
        if (this.itemLoadStatusDic && this.itemLoadStatusDic.has(rendererIndex))
            return this.itemLoadStatusDic.getNumberKey(rendererIndex);
        return 0;
    }

    public destroy():void
    {
        Laya.timer.clear(this,this.onDelayLoacation);
        // if (this.itemPoolDic)
        // {
        //     let itemUI:SgsFlatPanelItemBase;
        //     for (let index in this.itemPoolDic)
        //     {
        //         itemUI = this.itemPoolDic[index];
        //         this.contentSp.removeDrawChild(itemUI,true);
        //     }
        //     this.itemPoolDic = null;
        // }
        if (this.itemPools)
        {
            this.itemPools.forEach(element => {
                this.contentSp.removeDrawChild(element,true);
            });
            this.itemPools = null;
        }
        super.destroy();
        this.itemUIDic = null;
        this.itemRenderer = null;
        this.otherRenders = null;
        this.invalidItemUIs = null;
        // this.invalidPools = null;
        this.layoutFun = null;
        this.itemCreateFunction = null;
        this.itemRendererFunction = null;
        this.dataProvider = null;
        this.selectedIndexs = null;
        this.itemLoadStatusDic = null;
    }
}