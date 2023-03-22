

/*
* 场景manager管理基类，一般一个场景就一个manager ,用来管理数据通信相关事件监听，以及与场景内数据传递;
* 一般不要做成单例
*/
export default class ManagerBase extends Laya.EventDispatcher{
    constructor(){
        super();
    }
    /**
     * 添加事件监听
     */
    public AddEventListener():void{

    }

    // protected get proxy():WBMgr{
    //     return WBMgr.GetInstance();
    // }
    /**
     * 移除事件监听，
     */
    public RemoveEventListener():void{

    }
    /**
     * 销毁这个manager ,场景移除的时候调用
     * 移除事件监听，以及相关存储数据
     */
    public destroy():void{
        this.RemoveEventListener();
        this.offAll();
    }
    /**
     * 登出清理；
     */
    public ClearData():void{

    }

}