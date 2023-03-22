import LoadingUI from "../../ui/loading/LoadingUI";
import TopUILayer from "../../ui/layer/TopUILayer";

/*
* name;
*/
export default class LoadingManager
{
    public static loadingUI:LoadingUI;

    constructor()
    {
    }

    public static ShowLoading(delay:number = 1000):void
    {
        if (!this.loadingUI)
            this.loadingUI = new LoadingUI();
        this.loadingUI.Show(delay);
        if (!this.loadingUI.parent)
            TopUILayer.GetInstance().addChild(this.loadingUI);
    }

    public static ShowLoadProgress(curValue:number,maxValue:number):void
    {
        if (this.loadingUI)
            this.loadingUI.ShowProgress(curValue,maxValue);
    }

    public static ShowLoadError(errorMsg:string,winName:string = ""):void
    {
        if (this.loadingUI)
            this.loadingUI.ShowError(errorMsg,winName);
    }

    public static CloseLoading():void
    {
        // if (this.loadingUI)
        // {
        //     this.loadingUI.destroy();
        //     this.loadingUI = null;
        // }
        if (this.loadingUI)
            this.loadingUI.Hide();
    }
}