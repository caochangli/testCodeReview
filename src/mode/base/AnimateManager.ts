import SgsTemplet from "../../ui/controls/base/SgsTemplet";
import Dictionary from "../../utils/Dictionary";

/*
* 骨骼动画管理;
*/
export default class AnimateManager extends Laya.EventDispatcher
{
    public static ANIMATE_LOAD_COMPLETE:string = "ANIMATE_LOAD_COMPLETE";
    public static ANIMATE_ARR_LOAD_COMPLETE:string = "ANIMATE_ARR_LOAD_COMPLETE";
    
    private animateDic:Dictionary;//动画数据模版:url 对应 SgsTemplet | SgsSpineTemplet
    private animateContainerDic:Dictionary;//需要加载动画的容器，动画SgsTemplet | SgsSpineTemplet，对应Array<Sprite>
    private referenceDic:any;//资源引用

    constructor()
    {
        super();

        this.animateDic = new Dictionary();
        this.animateContainerDic = new Dictionary();
        this.referenceDic = {};
    }

    private static instance:AnimateManager;
    public static GetInstane():AnimateManager
    {
        if (!this.instance)
            this.instance = new AnimateManager();
        return this.instance;
    }

    /**
     * 加载显示某一骨骼动画,如果有parent 则加载完成后将动画显示在容器上
     * @param url 
     * @param parent 动画容器，可以不传，不传容器，视为预加载
     */
    public LoadAnimate(url:string,parent?:Laya.Sprite):void
    {
        if (!url) return;
        let temp:SgsTemplet = this.animateDic.getStringKey(url);
        if (temp)
        {
            if (!temp.isParserComplete)//模板还没解析完：等待解析完派发事件
            {}
            else if (!temp.checkTempletRes())//sk、png资源已被回收：回收旧模板重新加载：当不会出现先回收sk、png资源而不回收模板的情况时就不需要此判断了
            {
                this.destroyAnimate(url,true);
                temp = null;
            }
            else
            {
                if (parent)
                    parent.event(AnimateManager.ANIMATE_LOAD_COMPLETE,temp);
                this.event(AnimateManager.ANIMATE_LOAD_COMPLETE,temp);
                return; 
            }
        }
        if (!temp)
        {
            temp = new SgsTemplet();
            temp.name = url;
            temp.on(Laya.Event.COMPLETE,this,this.onSpineResComplete);
            temp.on(Laya.Event.ERROR,this,this.onSpineResError,[temp]);
            temp.loadAni(url);
            this.animateDic.addStringKey(url,temp);
        }
        if (parent)//如果有需要添加的容器，则加入等待队列
        {
            let arr:Array<Laya.Sprite> = this.animateContainerDic.get(temp);
            if (!arr)
                this.animateContainerDic.add(temp,[parent]);
            else if (arr.indexOf(parent) < 0)
                arr.push(parent);
        }
    }

    //销毁动画模版
    public DestroyAnimate(url:string):void
    {
        this.destroyAnimate(url);
        // this.delayClearAnimate(url);//旧动画组件未替换完前不能使用延迟回收策略：因为旧动画组件没有引用计数，延迟回收会出现真正回收时可能又打开界面了，但没有引用计数
    }

    //使用拥有此动画模板
    public HasTemplet(url:string):boolean
    {
        let temp:SgsTemplet = this.animateDic.getStringKey(url);
        return temp && temp.isParserComplete ? true : false;
    }

    //获取动画模板
    public GetTemplet(url:string):SgsTemplet
    {
        let temp:SgsTemplet = this.animateDic.getStringKey(url);
        return temp ? temp : null;
    }

    //资源是否在动画模板中
    public HasTempletRes(url:string):boolean
    {
        if (!this.animateDic || this.animateDic.count <= 0)
            return false;
        let result:boolean = false;
        this.animateDic.breakForEach((skUrl:string,element:SgsTemplet) => {
            if (url == skUrl || element.hasTempletRes(url))
            {
                result = true;
                return true;
            }
        });
        return result;
    }

    public get AnimateDic():Dictionary
    {
        return this.animateDic;
    }

    public get AnimateList():Array<string>
    {
        if (!this.animateDic || this.animateDic.count <= 0) 
            return null;
        let result = [];
        this.animateDic.forEach((key:string,element:SgsTemplet) => {
            result.push(key);
        });
        return result;
    }
    
    private onSpineResError(data:SgsTemplet):void//加载出错，错误信息包含连接地址，可以做响应清理
    {
        if (!data) return;
        data.off(Laya.Event.ERROR,this,this.onSpineResError);
        data.off(Laya.Event.COMPLETE,this,this.onSpineResComplete);

        let arr:Array<Laya.Sprite> = this.animateContainerDic.get(data);
        if(arr){
            arr.forEach(sp =>{
                //动画模版加载完毕，动画容器抛出事件，将动画显示到容器中
                if (sp && !sp.destroyed)
                    sp.event(AnimateManager.ANIMATE_LOAD_COMPLETE,data.name);
            });
            this.animateContainerDic.del(data);
        }
        
        //自身也抛出事件，以备不时之需
        this.event(AnimateManager.ANIMATE_LOAD_COMPLETE,data.name);
        this.ClearAllReferenceByUrl(data.name);//加载错误去掉计数
        this.destroyAnimate(data.name);//立刻销毁模板
    }
    
    private onSpineResComplete(data:SgsTemplet):void//骨骼动画数据模版加载完成
    {
        if (!data) return;
        data.off(Laya.Event.ERROR,this,this.onSpineResError);
        data.off(Laya.Event.COMPLETE,this,this.onSpineResComplete);

        let arr:Array<Laya.Sprite> = this.animateContainerDic.get(data);
        if(arr){
            arr.forEach(sp =>{
                //动画模版加载完毕，动画容器抛出事件，将动画显示到容器中
                if (sp && !sp.destroyed)
                    sp.event(AnimateManager.ANIMATE_LOAD_COMPLETE,data);
            });
            this.animateContainerDic.del(data);
        }
        //自身也抛出事件，以备不时之需
        this.event(AnimateManager.ANIMATE_LOAD_COMPLETE,data);
    }

    /**添加资源引用*/
    public AddReference(url:string):void
    {
        if (!url || url.length <= 0) return;
        let reference:number = 1;
        if (this.referenceDic[url])
        {
            reference = this.referenceDic[url];
            reference ++;
        }
        this.referenceDic[url] = reference;
    }

    /**删除资源引用*/
    public DelReference(url:string):void
    {
        if (!url || url.length <= 0) return;
        if (this.referenceDic[url])
        {
            let reference:number = this.referenceDic[url];
            if (reference <= 1)
                delete this.referenceDic[url];
            else
                this.referenceDic[url] = reference - 1;
        }
    }

    /**清空单个资源所有引用*/
    public ClearAllReferenceByUrl(url:string):void
    {
        if (!url || url.length <= 0) return;
        if (this.referenceDic[url])
            delete this.referenceDic[url];
    }

    /**获取资源引用*/
    public GetReference(url:string):number
    {
        if (!url || url.length <= 0) return 0;
        if (this.referenceDic[url])
            return this.referenceDic[url];
        return 0;
    }

    private waitClearAnimateDic:any = {};//待回收资源字典
    private clearAnimateIng:boolean = false;//是否清理中
    private delayClearAnimate(url:string):void
    {
        if (!url || url.length <= 0 || this.GetReference(url) > 0) return;
        this.waitClearAnimateDic[url] = Laya.Browser.now();
        if (!this.clearAnimateIng)//不在清理中
        {
            this.clearAnimateIng = true;
            Laya.timer.once(5000,this,this.onClearAnimate);//延迟5秒后清理
        }
    }

    private onClearAnimate():void
    {
        this.onLoopClearAnimate(false);
    }

    private onLoopClearAnimate(isFrameLoop:boolean):void//逐帧清理
    {
        let frameTm:number = Laya.stage.getFrameTm();//本帧开始时间
        let curTime:number = 0;//当前时间
        let isAllClear:boolean = true;//是否已全部清理
        let url:string = "";
        let templet:SgsTemplet;
        let containerArr:Array<Laya.Sprite>;
        for (url in this.waitClearAnimateDic)
        {
            curTime = Laya.Browser.now();
            if (curTime - this.waitClearAnimateDic[url] < 5000)//距离回收时间未超过5秒
            {
                isAllClear = false;
                continue;
            }
            else if (curTime - frameTm > 20)//本帧所用时间过长:50帧了 
            {
                isAllClear = false;
                break;
            }
            else
            {
                delete this.waitClearAnimateDic[url];
                if (this.GetReference(url) <= 0)
                {
                    templet = this.animateDic.getStringKey(url);
                    if (templet)
                    {
                        containerArr = this.animateContainerDic.get(templet);
                        if (containerArr) containerArr.splice(0);
                        templet.off(Laya.Event.ERROR,this,this.onSpineResError);
                        templet.off(Laya.Event.COMPLETE,this,this.onSpineResComplete);
                        templet.destroy();//如果未加载完成，销毁templet是否有问题
                        this.animateDic.del(url);
                        this.animateContainerDic.del(templet);
                    }
                }
            }
        }
        if (isAllClear)//已全部清理
        {
            Laya.timer.clear(this,this.onLoopClearAnimate);
            this.clearAnimateIng = false;
        }
        else
        {
            if (!isFrameLoop)//启动逐帧清理
                Laya.timer.frameLoop(5,this,this.onLoopClearAnimate,[true]);
        }
    }

    private destroyAnimate(url:string,force:boolean = false):void//销毁动画模板
    {
        if (!url || url.length <= 0 || (!force && this.GetReference(url) > 0)) return;
        let templet:SgsTemplet = this.animateDic.getStringKey(url);
        if (templet && !templet.destroyed )
        {
            let containerArr:Array<Laya.Sprite> = this.animateContainerDic.get(templet);
            if (containerArr) containerArr.splice(0);
            templet.off(Laya.Event.ERROR,this,this.onSpineResError);
            templet.off(Laya.Event.COMPLETE,this,this.onSpineResComplete);
            templet.destroy();//如果未加载完成，销毁templet是否有问题
            this.animateDic.del(url);
            this.animateContainerDic.del(templet);
        }
    }
}