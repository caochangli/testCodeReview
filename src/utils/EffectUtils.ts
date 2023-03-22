import SgsSkeletonEffect from "../ui/controls/base/SgsSkeletonEffect";

/*
* name;
*/
export default class EffectUtils
{
    constructor(){

    }

    /**
	 * 获取SgsSkeletonEffect
	 * @param autoRecoverSelf 自动回收自身：动画播放结束时回收自身，若循环播放则此属性无效
	 * @param autoClearTemplet 自动回收动画模板：回收自身时回收动画模板
	 * @param clearTempletFollow scene：随场景回收 ***window：随窗口回收
	 * @param forceFllowTarget 组件强制跟随回收对象：跟随此对象销毁而销毁，主要用于特效添加到其他层时使用 
	 * @param poolSign 对象池标记:存在表示回收至对象池
	 * @param clearPoolFollow scene：随场景回收 ***window：随窗口回收
	 * @param poolCount 对象池个数：限制对象池中对象个数 0表示不限制
	*/
	public static GetSkeletonEffect(autoRecoverSelf:boolean = false,autoClearTemplet:boolean = false,clearTempletFollow:string = "",
									forceFllowTarget:Laya.Sprite = null,poolSign:string = "",clearPoolFollow:string = "",poolCount:number = 0):SgsSkeletonEffect
	{
		let effect:SgsSkeletonEffect;
		if (poolSign)//启用对象池
		{
		effect = Laya.Pool.getItemByClass(poolSign,SgsSkeletonEffect);
		effect.poolStrategy(poolSign,clearPoolFollow,poolCount);
		}
		else
		{
		effect = new SgsSkeletonEffect();
		}
		effect.autoRecoverSelf = autoRecoverSelf;
		effect.forceFllowTarget = forceFllowTarget;
		effect.autoClearTemplet = autoClearTemplet;
		effect.clearTempletFollow = clearTempletFollow;
		return effect;
	}

    /**清理SgsSkeletonEffect对象池*/
    public static ClearSkeletonEffectPool(poolSign:string):void
	{
		let pools:Array<any> = Laya.Pool.getPoolBySign(poolSign);
		if (!pools) return;
		let length:number = pools.length;
		if (length > 0)
		{
			let effect:SgsSkeletonEffect;
			for (let i:number = 0; i < length; i++)
			{
				effect = pools[i];
				if (effect) effect.destroy();
			}
			pools = null;
			Laya.Pool.clearBySign(poolSign);
		}
		let dic = Laya.Pool["_poolDic"];
		if (dic) delete dic[poolSign];
	}
}