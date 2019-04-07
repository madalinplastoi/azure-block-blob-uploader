module validation {

    declare var $: any;

    export class Static {

        public static isValidBoolean(data: any): boolean {
            if (data != undefined && data != null) {
                var result: boolean = data === 'true' ? true : data === 'false' ? false : data;
                return result;
            }
            return false;
        }

        public static isValidNumber(data: any): boolean {
            if (data != undefined && data != null) return !isNaN(data);
            return false;
        }

        public static isValidPositiveNumber(data: any): boolean {
            if (data != undefined && data != null && data != "") return !isNaN(data) && data > 0;
            return false;
        }

        public static isValidString(data: string): boolean {
            if (data != undefined && data != null && data != '') return true;
            return false;
        }

        public static isValidObject(data: any): boolean {
            if (data != undefined && data != null) return true;
            return false;
        }

        public static isValidBaseResponse(data: contracts.IBaseResponse): boolean {
            if (data.IsSuccess) return true;
            else return false;
        }

        public static isValidResponse<T>(data: contracts.IResponse<T>): boolean {
            if (data.IsSuccess && data.Data != null && data.Data != undefined) return true;
            else return false;
        }

        public static isValidArray(data: any): boolean {
            if (data != undefined && data != null && Array.isArray(data)) return true;
            return false;
        }

        public static isValidArrayAndHasElements(data: any): boolean {
            if (data != undefined && data != null && Array.isArray(data) && data.length > 0) return true;
            return false;
        }

        public static isNonEmptyArray(data: Array<any>): boolean {
            if (data != null && data.length > 0) return true;
            else return false;
        }

        public static isValidEmail(data: string): boolean {
            if (data != undefined && data != null && data != '' && data != 'Undisclosed' && data != '-') return true;
            return false;
        }

        public static isValidJQueryFindResult(domElementsMatch: JQuery): boolean {
            return validation.Static.isValidObject(domElementsMatch) && validation.Static.isValidObject(domElementsMatch[0]);
        }

        public static isValidUrl(url): boolean {
            return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
        }

    }
}
