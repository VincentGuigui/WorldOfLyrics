export default class StringUtils {

    public static appendUrlParameters(source: string, parameters: string): string {
        if (source.indexOf('?') === -1) {
            return source + '?' + parameters;
        } else {
            return source + '&' + parameters;
        }
    }

    public static base64Encode(str: string): string {
         return Base64.encode(this.stringToUint8Array(str));
    }

    public static stringToUint8Array(str: string): Uint8Array {
        const arr = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            arr[i] = str.charCodeAt(i);
        }
        return arr;
    }
}