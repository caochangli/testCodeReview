import ViewStackBase from "./ViewStackBase";
/*
* name;
*/
export default class ViewStack
{
    private render:Laya.Sprite;

    private _x:number = 0;
    private _y:number = 0;
    private _childList:Array<any>;
    private _childUIList:Array<any>;
    private _childInitDataList:Array<any>;
    private _selectedIndex:number = -1;

    constructor(render:Laya.Sprite)
    {
        this.render = render;
        if (this.render)
            this.render.on("destroyEvent",this,this.onFollowDestroy);
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

    public pos(x:number,y:number):void
    {
        if (this._x == x && this._y == y)
            return;
        this._x = x >> 0;
        this._y = y >> 0;
        this.resetChildsPos();
    } 

    //设置子项列表
    public set childList(value:Array<any>)
    {
        this.clearChilds();
        if (!value || value.length <= 0) return;
        this._childList = [];
        this._childUIList = [];
        for (let i:number = 0; i < value.length; i++)
        {
            this._childList.push(value[i]);
            this._childUIList.push(null);
        }
    }

    /**设置子项列表初始化数据*/
    public set childInitDataList(value:Array<any>)
    {
        if (!value || value.length <= 0) return;
        this._childInitDataList = [];
        for (let i:number = 0; i < value.length; i++)
        {
            this._childInitDataList.push(value[i]);
        }
    }

    public get selectedIndex():number
    {
        return this._selectedIndex;
    }

    public set selectedIndex(value:number)
    {
        if (this.selectedIndex == value) return;
        this._selectedIndex = value;
        this.updataView();
    }

    public get selectedChild():ViewStackBase
    {
        return this.getChildAt(this.selectedIndex);
    }

    public getChildAt(index:number):ViewStackBase
    {
        if (!this._childUIList) return null;
        if (index < 0 || index >= this._childUIList.length) return null;
        return this._childUIList[index];
    }

    private updataView():void//更新容器
    {
        if (!this.render) return;
        if (!this._childList || this.selectedIndex < 0)
        {
            this.selectedIndex = -1;
            return;
        }
        if (this.selectedIndex >= this._childList.length)
            this.selectedIndex = this._childList.length - 1;
        let showChild:ViewStackBase;
        let child:ViewStackBase;
        for (let i:number = 0; i < this._childUIList.length; i++)
        {
            child = this._childUIList[i];
            if (!child) continue;
            if (child.destroyed)//已被destroy
            {
                child = this._childList[i] = null;
                continue;
            }
            if (i == this.selectedIndex)//当前view
            {
                if (!child.parent)
                {
                    this.render.addChild(child);
                    child.Reset();
                }
                showChild = child;
            }
            else
            {
                if (child.parent)
                {
                    this.render.removeChild(child);
                    child.Remove();
                }
            }
        }
        if (!showChild)
        {
            let childClass:any = this._childList[this.selectedIndex];
            if (childClass == "") return;
            let initData:any = this._childInitDataList ? this._childInitDataList[this.selectedIndex] : null;
            if (initData != undefined)
                showChild = new childClass(initData);
            else
                showChild = new childClass();
            if (showChild)
            {   
                showChild.pos(this._x,this._y);
                this.render.addChild(showChild);
                showChild.StartLoadRes();
                this._childUIList[this.selectedIndex] = showChild;
            }
        }
    }

    private resetChildsPos():void
    {
        if (this._childUIList && this._childUIList.length > 0)
        {
            this._childUIList.forEach((child:ViewStackBase)=>{
                if (child && !child.destroyed)
                    child.pos(this._x,this._y);
            });
        }
    }

    protected readyCloseChilds():void
    {
        if (this._childUIList)
        {
            let len:number = this._childUIList.length;
            let child:ViewStackBase;
            for (let i:number = 0; i < len; i++)
            {
                child = this._childUIList[i];
                if (child && !child.destroyed) 
                    child.ReadyClose();
            }
        }
    }

    protected clearChilds():void
    {
        this._childList = null;
        if (this._childUIList)
        {
            let child:ViewStackBase;
            while (this._childUIList.length > 0)
            {
                child = this._childUIList.pop();
                if (child)
                    child.destroy();
            }
            this._childUIList = null;
        }
    }

    //准备清理
    public ReadyClose():void
    {
        this.readyCloseChilds();
    }

    //清理
    public destroy():void
    {
        this.clearChilds();
        this._childInitDataList = null;
        if (this.render)
        {
            this.render.off("destroyEvent",this,this.onFollowDestroy);
            this.render = null;
        }
    }

    protected onFollowDestroy(target:Laya.Sprite):void//回收跟随的对象destroy了
    {
        this.destroy();
    }
}