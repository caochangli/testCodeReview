import SceneManager from "./SceneManager";
import Dictionary from "../../utils/Dictionary";
import ResourceItem from "../../res/ResourceItem";
import RES from "../../res/RES";
import ResourceEvent from "../../res/ResourceEvent";
import SceneBase from "../../ui/base/SceneBase";
/*
* 静默资源管理类
*/
export default class SilenceResManager
{
    private silenceResDic:Dictionary;

    constructor()
    {
        this.silenceResDic = new Dictionary();
    }

    protected static instance:SilenceResManager;
	public static GetInstance():SilenceResManager
	{
		if (null == SilenceResManager.instance)
		{
			SilenceResManager.instance = new SilenceResManager();
		}
		return SilenceResManager.instance;
	}

    /**加载静默资源*/
    public LoadSilenceRes(resArr:Array<string>):void
    {
        if (!resArr || resArr.length <= 0) return;
        this.StopSilenceRes();
        let length:number = resArr.length;
        let groupName:string = "";
        let groupList:Array<ResourceItem>;
        let resItem:ResourceItem;
        let groups:Array<ResourceItem>;
        for (let i:number = 0; i < length; i++)
        {
            groupName = resArr[i];
            groupList = RES.GetGroupByName(groupName);
            groupName = groupName + "_silence";
            if (groupList && groupList.length)
            {
                if (this.silenceResDic.has(groupName))
                    groups = this.silenceResDic.getStringKey(groupName);
                else
                    groups = new Array();

                let len:number = groupList.length;
                for (let j:number = 0; j < len; j++)
                {
                    resItem = groupList[j];
                    if (!RES.IsResLoadedLocal(resItem.url))
                        groups.push(resItem);
                }
                if (groups && groups.length)
                    this.silenceResDic.addStringKey(groupName,groups);
            }
        }
        if (this.silenceResDic.count)
        {
            this.addResEvent();
            let priority:number = this.silenceResDic.count - 1;
            this.silenceResDic.forEach((groupName:string,groups:Array<ResourceItem>) => {
                RES.DelGroupKeys(groupName);
                let keys = [];
                for (let i:number = 0; i < groups.length; i++)
                {
                    keys.push(groups[i].name);
                }
                RES.CreateGroup(groupName,keys);
                RES.LoadSilenceGroup(groupName,[...groups],priority);
                priority --;
            });
        }
    }

    /** 停止加载静默资源(仅能停止资源组队列中还未开始加载的组) */
    public StopSilenceRes():void
    {
        if (this.silenceResDic.count <= 0) return;
        let isStop:boolean = false;
        this.silenceResDic.forEach((groupName:string,groups:Array<ResourceItem>) => {
            // if (this.isClearSilenceRes(groupName))
            // {
                isStop = RES.StopGroup(groupName);
                if (!isStop)//该资源组已在加载中，无法完全停止
                    this.clearSilenceRes(groupName);
            // }
        });
        this.loadSilenceEnd();
    }

    /** 暂停加载静默资源*/
    public PauseSilenceRes():void
    {
        if (this.silenceResDic.count <= 0) return;
        let isStop:boolean = false;
        this.silenceResDic.forEach((groupName:string,groups:Array<ResourceItem>) => {
            // if (this.isClearSilenceRes(groupName))
            // {
                isStop = RES.StopGroup(groupName);
                if (!isStop)//该资源组已在加载中，无法完全停止
                    this.clearSilenceRes(groupName);
            // }
        });
        this.removeResEvent();
    }

    /** 恢复加载静默资源*/
    public RecoverySilenceRes():void
    {
        if (this.silenceResDic.count <= 0) return;
        let groupNames:Array<string> = [];
        let sIndex:number = -1;
        this.silenceResDic.forEach((groupName:string,groups:Array<ResourceItem>) => {
            sIndex = groupName.indexOf("_silence");
            if (sIndex == -1)
                groupNames.push(groupName);
            else
                groupNames.push(groupName.substring(0,sIndex));
        });
        this.removeResEvent();
        this.silenceResDic.destroy();
        if (groupNames && groupNames.length)
            this.LoadSilenceRes(groupNames);
    }

    private loadSilenceEnd():void
    {
        this.removeResEvent();
        this.silenceResDic.destroy();
    }

    private addResEvent():void
	{
		RES.AddEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
		RES.AddEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
	}

	private removeResEvent():void
	{
		RES.RemoveEventListener(ResourceEvent.GROUP_COMPLETE, this, this.onSceneResourceLoadComplete);
		RES.RemoveEventListener(ResourceEvent.GROUP_LOAD_ERROR, this, this.onResourceError);
	} 

    private onSceneResourceLoadComplete(event:ResourceEvent):void
    {
        if (this.silenceResDic.has(event.groupName))
        {
            this.clearSilenceRes(event.groupName);
            this.silenceResDic.del(event.groupName);
            if (this.silenceResDic.count <= 0)//静默资源全部加载完
            {
                this.loadSilenceEnd();
            }
        }
	}

	private onResourceError(event:ResourceEvent):void
	{
        if (this.silenceResDic.has(event.groupName))
        {
            this.clearSilenceRes(event.groupName);
            this.silenceResDic.del(event.groupName);
            if (this.silenceResDic.count <= 0)//静默资源全部加载完
            {
                this.loadSilenceEnd();
            }
        }
    }

    private clearSilenceRes(groupName:string):void//清理静默资源
    {
        // let curScene:SceneBase = SceneManager.GetInstance().CurrentScene;
        // let nextScene:SceneBase = SceneManager.GetInstance().NextScene;
        // let curResNames:Array<string> = curScene ? curScene.ResNames : null;
        // let nextResNames:Array<string> = nextScene ? nextScene.ResNames : null;
        // if ((!curResNames || curResNames.indexOf(groupName) == -1) && (!nextResNames || nextResNames.indexOf(groupName) == -1))
        // {
        //     RES.ClearResByGroup(groupName,false,true);//静默资源加载完后，从内存清理掉
        // }
        // if (this.isClearSilenceRes(groupName))
        // {
            let groupList:Array<any> = this.silenceResDic.getStringKey(groupName);
            RES.ClearSilenceResByGroup(groupName,groupList,false,true);//静默资源加载完后，从内存清理掉
            RES.DelGroupKeys(groupName);
        // }    
    }

    private isClearSilenceRes(groupName:string):boolean
    {
        let curScene:SceneBase = SceneManager.GetInstance().CurScene;
        let nextScene:SceneBase = SceneManager.GetInstance().NextScene;
        let curResNames:Array<string> = curScene ? curScene.ResNames : null;
        let nextResNames:Array<string> = nextScene ? nextScene.ResNames : null;
        if ((!curResNames || curResNames.indexOf(groupName) == -1) && (!nextResNames || nextResNames.indexOf(groupName) == -1))
            return true;
        return false;
    }
}