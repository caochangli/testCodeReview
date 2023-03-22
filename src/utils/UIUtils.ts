import SgsTexture from "../ui/controls/base/SgsTexture";
import SgsFlatImage from "../ui/controls/base/SgsFlatImage";
import SgsImage from "../ui/controls/base/SgsImage";
import SystemContext from "../SystemContext";
import Global from "../Global";
import ImageFlatButton from "../ui/window/ImageFlatButton";
import ImageSpriteButton from "../ui/window/ImageSpriteButton";
import WindowManager from "../mode/base/WindowManager";
import PromptWindow from "../ui/window/PromptWindow";
import PromptLayer from "../ui/layer/PromptLayer";


/*
* name;
*/
export default class UIUtils
{
    constructor()
    {

    }

    
    public static BgAdaptation(bg:SgsTexture | SgsFlatImage | SgsImage):void
    {
        let gameWidth:number = SystemContext.gameWidth;
        let gameHeight:number = SystemContext.gameHeight;
        let bgWidth:number = Global.BgWidth;
        let bgHeight:number = Global.BgHeight;
        if (gameHeight == bgHeight) 
        {
            bg.size(gameWidth, gameHeight);
        }
        else if (gameHeight > bgHeight) //舞台高度大于背景图高度:拉大背景图使其高度与舞台高度一致
        {
            let per = gameHeight / bgHeight;
            bg.size(Math.ceil(bgWidth * per), gameHeight);
        }
        else 
        {
            bg.size(bgWidth, bgHeight);
        }
        bg.pos(gameWidth - bg.width >> 1, 0); //gameHeight - bg.height >> 1);//背景水平居中、垂直不居中
    }

    //创建文字是图片的按钮
    public static CreateImageFlatButton(bgRes:string,textRes:string):ImageFlatButton
    {
        let btn:ImageFlatButton = new ImageFlatButton();
        btn.InitSkin(bgRes);
        btn.InitTextSkin(textRes);
        return btn;
    }

    //创建文字是图片的按钮
    public static CreateImageSpriteButton(bgRes:string,textRes:string):ImageSpriteButton
    {
        let btn:ImageSpriteButton = new ImageSpriteButton();
        btn.InitSkin(bgRes);
        btn.InitTextSkin(textRes);
        return btn;
    }

    /**显示文字提示(无操作)*/
    public static ShowTextPrompt(msg:string,time:number = 5000):void
    {
        if (msg) PromptLayer.GetInstance().ShowTextPrompt(msg,time);
    }

     /**清理文字提示(无操作)*/
    public static ClearTextPrompt():void
    {
        PromptLayer.GetInstance().ClearTextPrompt();
    }

    /**打开提示窗
     * @param title 标题
     * @param desc 描述
     * @param descPaddingLeft 描述水平边距
     * @param okHandler 确认回调
     * @param cancelHandler 取消回调
     * @param btnType 按钮类型 参考：PromptWindow.BTN_TYPE1
     * 
    */
    public static OpenPromptWin(title:string,desc:string,descPaddingLeft:number = 140,okHandler:Laya.Handler = null,cancelHandler:Laya.Handler = null,btnType:string = PromptWindow.BTN_TYPE1):void
    {
        WindowManager.GetInstance().OpenWindow("PromptWindow",title,desc,descPaddingLeft,okHandler,cancelHandler,btnType);
    }

}