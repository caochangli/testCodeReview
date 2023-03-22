
import GameEventDispatcher from "./event/GameEventDispatcher";

/*
* name;
*/
export default class SystemContext
{
    /** 设计宽度 */
    public static designWidth:number = 750;

    /** 设计高度 */
    public static designHeight:number = 1496;

    /** 游戏宽度 */
    public static gameWidth:number = 750;

     /** 游戏高度(按750宽度缩放至全屏后动态计算高度) */
    public static gameHeight:number = 0;

    constructor()
    {
        
    }

    /** 更新游戏尺寸
     * @param screenWidth 屏幕宽度
     * @param screenHeight 屏幕高度
     */
    public static UpdateGameSize(screenWidth:number,screenHeight:number)
    {
        this.gameWidth = this.stageWidth;
        this.gameHeight = this.stageHeight;
        GameEventDispatcher.GetInstance().event(Laya.Event.RESIZE);
    }   

    /** 获取舞台宽度 */
    public static get stageWidth():number
    {
        // if (Global.Plantform == PlantformSDK.OPPO)
        // { 
        //     return Laya.stage.width + SystemContext.canvasX/2;
        // }
        return Laya.stage.width;
    }

    /** 获取舞台高度 */
    public static get stageHeight():number
    {
        // if (Global.Plantform == PlantformSDK.OPPO)
        // { 
        //     return Laya.stage.height + SystemContext.canvasY/2;
        // }
        return Laya.stage.height;
    }

    public static get canvasX():number
    {
        return Laya.Browser.clientWidth * Laya.Browser.pixelRatio - Laya.stage.width * Laya.stage.clientScaleX >> 1;        
    }

    public static get canvasY():number
    {
        return Laya.Browser.clientHeight * Laya.Browser.pixelRatio - Laya.stage.height * Laya.stage.clientScaleY >> 1;        
    }
    
}