/// <reference path="../../customtypings/q.d.ts" />
/// <reference path="../../customtypings/extensions.d.ts" />
module utils {
    declare var $: any;
    declare var window: Window;

    export class Ajax {
        public static StartActivity(): void {
            if (!window.regionLoaderIsOn && !window.globalLoaderIsOn) {
                $("html").addClass("effect");
                $("#overlay").fadeIn();
            }
        }

        public static StopActivity(): void {
            $("#overlay").fadeOut();
            $("html").removeClass("effect");
            window.globalLoaderIsOn = false;
        }

        public static StartModalActivity(): void {
            $("#modal-spinner").fadeIn();
            $("#actions").fadeOut();
        }

        public static StopModalActivity(): void {
            $("#modal-spinner").fadeOut();
            $("#actions").fadeIn();
        }

        public static ShowRegionSpinner(spinnerDOMid: string, contentDOMid: string = ''): void {
            if (validation.Static.isValidString(contentDOMid))
                $('#' + contentDOMid).hide();
            $('#' + spinnerDOMid).show();
            window.regionLoaderIsOn = true;
        }


        public static HideRegionSpinner(spinnerDOMid: string, contentDOMid: string = ''): void {
            if (validation.Static.isValidString(contentDOMid))
                $('#' + contentDOMid).fadeIn('slow');
            $('#' + spinnerDOMid).hide();
            window.regionLoaderIsOn = false;
        }

        public static ShowGlobalSpinner(contentDOMid: string = ''): void {
            if (validation.Static.isValidString(contentDOMid))
                $('#' + contentDOMid).hide();
            utils.Ajax.StartActivity();
            window.globalLoaderIsOn = true;
        }

        public static HideGlobalSpinner(contentDOMid: string = ''): void {
            utils.Ajax.StopActivity();
            if (validation.Static.isValidString(contentDOMid))
                $('#' + contentDOMid).fadeIn('slow');
        }

        public static DoJsonGet(url: string, beforeSendFunction?: Function, completeFunction?: Function): Q.Promise<any> {
            var ajaxSettings = {
                url: url,
                type: 'GET',
                dataType: "json",
                beforeSend: function () {
                    if (beforeSendFunction) beforeSendFunction();
                },
                complete: function () {
                    if (completeFunction) completeFunction();
                }
            };
            return Q($.ajax(ajaxSettings));
        }

        public static DoJsonGetWithProgress(url: string): Q.Promise<any> {
            var ajaxSettings = {
                url: url,
                type: 'GET',
                dataType: "json",
                beforeSend: function () {
                    utils.Ajax.StartActivity();
                },
                complete: function () {
                    utils.Ajax.StopActivity();
                }
            };
            return Q($.ajax(ajaxSettings));
        }

        public static DoJsonPost(url: string, data: any, beforeSendFunction?: Function, completeFunction?: Function): Q.Promise<any> {
            var ajaxSettings = {
                url: url,
                type: 'POST',
                data: ko.mapping.toJSON(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                beforeSend: function () {
                    if (beforeSendFunction) beforeSendFunction();
                },
                complete: function () {
                    if (completeFunction) completeFunction();
                }
            };
            return Q($.ajax(ajaxSettings));
        }

        public static DoJsonPostWithProgress(url: string, data: any): Q.Promise<any> {
            var ajaxSettings = {
                url: url,
                type: 'POST',
                data: ko.mapping.toJSON(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                beforeSend: function () {
                    utils.Ajax.StartActivity();
                },
                complete: function () {
                    utils.Ajax.StopActivity();
                }
            };
            return Q($.ajax(ajaxSettings));
        }

        static JSONPGetToPromise(url: string, callbackName: string): Q.Promise<any> {
            var ajaxSettings = {
                url: url,
                jsonpCallback: callbackName,
                contentType: "application/json",
                dataType: 'jsonp',
                type: 'GET'
            };
            return Q($.ajax(ajaxSettings));
        }
    }

    export class Page {
        public static StartLoading(): void {
            //utils.Ajax.ShowRegionSpinner('page-load-spinner', 'page-content');
            utils.Ajax.ShowGlobalSpinner('page-content');
        }

        public static EndLoading(timeout?: number, callback?: Function): void {
            setTimeout(function () {
                //utils.Ajax.HideRegionSpinner('page-load-spinner', 'page-content');
                utils.Ajax.HideGlobalSpinner('page-content');
                if (callback) callback();
            }, timeout !== undefined ? timeout : 500);
        }
    }
}
