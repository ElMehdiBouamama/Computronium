import { Collection } from "discord.js";

/** 
 * Creates a deep copy of the object instance
 * @param instance The object to clone
 */
export const deepCopy = <T>(instance: T): T => {
    if (instance == null) {
        return instance;
    }

    // handle Dates
    if (instance instanceof Date) {
        return new Date(instance.getTime()) as any;
    }

    // handle Array types
    if (instance instanceof Array) {
        var cloneArr = [] as any[];
        (instance as any[]).forEach((value) => { cloneArr.push(value) });
        // for nested objects
        return cloneArr.map((value: any) => deepCopy(value)) as any;
    }

    if (instance instanceof Collection) {
        return instance.clone() as any;
    }

    // handle objects
    if (instance instanceof Object) {
        var copyInstance = {
            ...(instance as { [key: string]: any }
            )
        } as { [key: string]: any };
        for (var attr in instance) {
            if ((instance as Object).hasOwnProperty(attr))
                copyInstance[attr] = deepCopy(instance[attr]);
        }
        return copyInstance as T;
    }
    // handling primitive data types
    return instance;
}