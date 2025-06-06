import { BaseException, IllegalArgumentException } from '../exceptions';

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | undefined
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    | Object

export class JSONObject extends Map<string, JSONValue> {


    constructor(object?: { [x: string]: JSONValue }) {
        super()
        if (object) {
            for (const [key, value] of Object.entries(object)) {
                if (value === null || value === undefined) {
                    // ignore
                } else if (value.constructor == Object) {
                    this.set(key, new JSONObject(value as { [x: string]: JSONValue }));
                } else if (value.constructor == Array) {
                    this.set(key, new JSONArray(value));
                } else {
                    this.set(key, value)
                }
            }
        }


    }

    getJSONObject(key: string): JSONObject {
        if (super.has(key)) {
            if (super.get(key) instanceof JSONObject) {
                return super.get(key) as JSONObject
            } else {
                throw new IllegalArgumentException('Value cannot be converted to JSONObject')
            }
        }

        throw new BaseException(`Value for Key: '${key}' not found`);
    }

    getString(key: string): string {
        if (super.has(key)) {
            try {
                if (typeof super.get(key) === 'string') {
                    return super.get(key) as string;
                }

                throw new IllegalArgumentException('Value cannot be converted to string')
            } catch (e) {
                throw new IllegalArgumentException('Value cannot be converted to string', e)
            }
        }
        throw new BaseException(`Value for Key: '${key}' not found`);
    }

    getNumber(key: string): number {
        if (super.has(key)) {
            const number = Number(super.get(key));
            if (!isNaN(number)) {
                return number;
            }
            throw new IllegalArgumentException('Value cannot be converted to number')
        }
        throw new BaseException(`Value for Key: '${key}' not found`);
    }

    getBoolean(key: string): boolean {
        if (super.has(key)) {
            if (typeof super.get(key) === 'boolean') {
                return super.get(key) as boolean;
            } else if (super.get(key) === 'true' || super.get(key) === 'false') {
                return Boolean(super.get(key));
            }
            throw new IllegalArgumentException('Value cannot be converted to boolean')
        }
        throw new BaseException(`Value for Key: '${key}' not found`);
    }

    getArray(key: string): JSONArray {
        if (super.has(key)) {
            if (super.get(key) instanceof JSONArray) {
                return super.get(key) as JSONArray;
            }
            else if (super.get(key) instanceof Array) {
                return new JSONArray(super.get(key) as Array<JSONValue>);
            }
            throw new IllegalArgumentException('Value cannot be converted to array')
        }
        throw new BaseException(`Value for Key: '${key}' not found`);
    }

    public toJSON(): { [x: string]: JSONValue } {
        const obj: { [x: string]: JSONValue } = {};
        for (const [key, value] of this.entries()) {
            if (value == null) {
                obj[key] = value;
            } else if (value instanceof JSONObject || value instanceof JSONArray) {
                obj[key] = value.toJSON();
            } else {
                obj[key] = value
            }
        }
        return obj;
    }
}


export class JSONArray extends Array<JSONValue> {

    constructor(array?: Array<JSONValue>) {
        super();
        if (array) {
            for (let item of Object.values(array)) {
                item = JSON.parse(JSON.stringify(item))

                if (item == null) {
                    this.push(item);
                }
                else if (item.constructor == Object) {
                    this.push(new JSONObject(item as { [x: string]: JSONValue }));
                }
                else if (item.constructor == Array) {
                    this.push(new JSONArray(item));
                }
                else {
                    this.push(item)
                }
            }
        }
    }

    public toJSON(): Array<JSONValue> {
        const arr: Array<JSONValue> = [];
        for (const value of this) {
            if (value == null) {
                arr.push(value);
            } else if (value instanceof JSONObject || value instanceof JSONArray) {
                arr.push(value.toJSON());
            } else {
                arr.push(value)
            }
        }
        return arr;
    }
}