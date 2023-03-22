// import FontName from "../../enum/FontName";
// import Global from "../../Global";
// import WindowManager from "../../mode/base/WindowManager";
// import RES from "../../res/RES";
// import SystemContext from "../../SystemContext";
// import WindowBase from "../base/WindowBase";
// import SgsImage from "../controls/base/SgsImage";
// import SgsText from "../controls/base/SgsText";
// import DressAvatar from "../dressScene/DressAvatar";

// //保存图片
// export default class SaveWindow extends WindowBase
// {
//     private closeBtn:SgsImage;
//     private tipText:SgsText;
//     private reference:Laya.Sprite;

//     private imgElement:any;
//     private closeElement:any;
//     private dressAvatar:DressAvatar;
    

//     constructor()
//     {
//         super();
        
//         this.modal = true;
//         this.modalAlpha = 0.8;
//     }

//     protected init():void
//     {
//         super.init();

//         this.tipText = new SgsText();
//         this.tipText.width = this.width;
//         this.tipText.font = FontName.WRYH;
//         this.tipText.fontSize = 30;
//         this.tipText.color = "#ffffff";
//         this.tipText.align = "center";
//         this.tipText.text = "长按保存至手机";
//         this.tipText.visible = false;
//         this.addDrawChild(this.tipText);

//         this.closeBtn = new SgsImage();
//         this.closeBtn.pos(SystemContext.gameWidth - 73 - 29,29);
//         this.closeBtn.size(73,73);
//         this.closeBtn.source = RES.GetRes("baseMyDressBtn");
//         this.addChild(this.closeBtn);

//         this.reference = new Laya.Sprite();
//         this.reference.zOrder = Number.MAX_VALUE - 1;
//         this.addChild(this.reference);
//     }

//     protected enterWindow(dressAvatar:DressAvatar):void
//     {
//         super.enterWindow();

//         if (!dressAvatar) return;
//         this.dressAvatar = dressAvatar;
//         let saveData:{width:number,height:number,base64:string} = dressAvatar.SaveData;

//         this.reference.size(saveData.width,saveData.height);
//         this.reference.pos(this.dressAvatar.OffsetX + (SystemContext.gameWidth - this.dressAvatar.width >> 1) + Global.ModelOffsetX,
//                             SystemContext.gameHeight - this.reference.height >> 1);

//         this.imgElement = document.getElementById("mergeImg");
//         if (this.imgElement)
//         {
//             this.imgElement.style.display = "block";
//         }
//         else
//         {
//             this.imgElement = document.createElement("img");
//             this.imgElement.id = "mergeImg";
//             this.imgElement.crossOrigin = "";
//             document.getElementById("layaContainer").appendChild(this.imgElement);
//         }
//         this.imgElement.src = saveData.base64;
//         Laya.Utils.fitDOMElementInArea(this.imgElement,this.reference,0,0,this.reference.width,this.reference.height);

//         this.closeElement = document.getElementById("closeButton");
//         if (this.closeElement)
//         {
//             this.closeElement.style.display = "block";
//         }
//         else
//         {
//             this.closeElement = document.createElement("button");
//             this.closeElement.id = "closeButton";
//             this.closeElement.style.background = "rgba(0,0,0,0)";
//             this.closeElement.style.border = "rgba(0,0,0,0)";
//             this.closeElement.onclick = this.onCloseButton;
//             document.getElementById("layaContainer").appendChild(this.closeElement);
//         }
//         Laya.Utils.fitDOMElementInArea(this.closeElement,this.closeBtn,0,0,this.closeBtn.width,this.closeBtn.height);
        
//         this.updateTipTextPos();
//         this.tipText.visible = true;
//     }

//     protected onStageResize(event:Laya.Event = null):void//舞台尺寸变化
// 	{
//         super.onStageResize(event);

//         this.reference.pos(this.dressAvatar.OffsetX + (SystemContext.gameWidth - this.dressAvatar.width >> 1) + Global.ModelOffsetX,
//                             SystemContext.gameHeight - this.reference.height >> 1);
//         if (this.imgElement)
//             Laya.Utils.fitDOMElementInArea(this.imgElement,this.reference,0,0,this.reference.width,this.reference.height);
//         if (this.closeElement)
//             Laya.Utils.fitDOMElementInArea(this.closeElement,this.closeBtn,0,0,this.closeBtn.width,this.closeBtn.height);
//         this.updateTipTextPos();
//     }

//     protected updateTipTextPos():void
//     {
//         let y:number = this.reference.y + this.reference.height + 30;
//         if (y + this.tipText.height + 10 > SystemContext.gameHeight)
//             y = SystemContext.gameHeight - this.tipText.height - 10;
//         this.tipText.y = y;
//     }

//     private onCloseButton():void
//     {
//         WindowManager.GetInstance().CloseWindow("SaveWindow");
//     }

//     public destroy(): void 
//     {
//         if (this.imgElement)
//         {
//             this.imgElement.src = "";
//             this.imgElement.style.display = "none";
//             this.imgElement = null;
//         }
//         if (this.closeElement)
//         {
//             this.closeElement.style.display = "none";
//             this.closeElement = null;
//         }
//         super.destroy();
//         this.dressAvatar = null;    
//     }
// }