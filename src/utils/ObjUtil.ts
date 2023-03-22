/*
* name;
*/
export default class ObjUtil{
    //基础属性深拷贝
    public static copyObj(copyFrom:Object, copyTo:Object):Object {
        if(!copyFrom || !copyTo) return copyTo;
        const keysTo = Object.keys(copyFrom);
        for (const key of keysTo) 
        {
            if (copyFrom[key] !== undefined) {
                copyTo[key] = copyFrom[key];
            }
        }
        return copyTo;
    }

    //对象深拷贝
    public static deepCopy(copyFrom:Object, copyTo:Object):Object {
        if(!copyFrom || !copyTo) return copyTo;
        const keysTo = Object.keys(copyFrom);
        for (const key of keysTo) {
            if (copyFrom[key] !== undefined) 
            {
                if (typeof copyFrom[key] === 'object') {
                    if (copyFrom[key] == null) {
                        copyTo[key] = null;
                    } else {
                        copyTo[key] = Array.isArray(copyFrom[key]) ? [] : {};
                        copyTo[key] = this.deepCopy(copyFrom[key],copyTo[key]);
                    }
                } else {
                    copyTo[key] = copyFrom[key];
                }
            }
        }
        return copyTo;
    }
}