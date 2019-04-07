/// <reference path="../../customtypings/knockout.d.ts" />

module utils {

    declare var $: any;

    export var KEYCODE = {
        Tab: 9,
        Enter: 13,
        Comma: 188,
        Space: 32,
        Delete: 8
    };

    export class Static {

        public static CheckIeAndReturnVersion() {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        }

        public static PrepareActivityLoader(): void {
            $.ajaxSetup({cache: false});

            var overlay = $("#overlay")
            var loader = $("#img-load");

            var winH = $(window).height();
            var winW = $(window).width();

            overlay.css('top', 0);
            overlay.css('width', winW);
            overlay.css('height', winH);

            var left = (winW / 2) - 64;

            loader.css('top', winH / 2);
            loader.css('left', left);
        }

        public static BindSelect2Validation(target): void {
            target.select2().on("change", function (e) {
                if (e.val == "") {
                    var $error = $('<div class="error-inner">' + 'This field is required' + '</div>');
                    utils.Static.StyleValidationError($error, $(e.target));
                } else {
                    utils.Static.HideValidationError(e.target);
                }
            });
        }

        public static StyleValidationError(error, target): void {
            var isSelect2Elm = false;
            var element = target;

            if (target.hasClass('select2-hidden-accessible')) {
                var parent = $(element).parent();
                element = $(parent).find('.select2');
                isSelect2Elm = true;
            }
            var errorLeft = (element.width() / 2) - 10;
            var errorTop = -27;
            if (element.is("textarea")) {
                errorTop = -28;
            }

            var $errorWrappers = element.parent().find('.tooltip');
            if ($errorWrappers.length > 0) {
                $errorWrappers.remove();
                element.parent().removeClass('has-error');
            }

            var $errorWrapper = $('<div class="tooltip fade top in"><div class="tooltip-arrow"></div></div>');
            $errorWrapper.append(error);
            $errorWrapper.css('top', errorTop);

            element.after($errorWrapper);
            element.parent().addClass('has-error');
        }

        public static HideValidationError(target): void {
            var element = $(target);
            if ($(target).hasClass('select2-hidden-accessible')) {
                var parent = $(element).parent();
                element = $(parent).find('.select2');
            }
            var $errorWrapper = element.parent().find('.tooltip');
            if ($errorWrapper.length > 0) $errorWrapper.remove();
            element.parent().removeClass('has-error');
        }

        public static StyleInlineTemplateError(error, target): void {
            var element = target;

            var errorLeft = (element.width() / 2) - 10;
            var errorTop = -element.height() - 10;
            if (element.is("textarea")) {
                errorTop = -30;
            }

            var $errorWrappers = element.parent().find('.tmpl-summary');
            if ($errorWrappers.length > 0) {
                $errorWrappers.remove();
                element.parent().removeClass('has-error');
            }

            var $errorWrapper = $('<div class="tmpl-summary fade top in"></div>');
            $errorWrapper.append(error);

            element.after($errorWrapper);
            element.parent().addClass('has-error');
        }

        public static HideInlineTemplateError(target): void {
            var element = $(target);
            var $errorWrapper = element.parent().find('.tmpl-summary');
            if ($errorWrapper.length > 0) $errorWrapper.remove();
            element.parent().removeClass('has-error');
        }

        public static ShowModal(htmlAsString: string): void {
            var modalContainer: JQuery = $('#app-modal');
            var modalContent: JQuery = modalContainer.find('.modal-content');

            modalContent.empty();
            modalContent.html(htmlAsString);

            modalContainer.modal('show');
        }

        public static ShowModalAndBindViewModel(htmlAsString: string, viewModel: any): void {
            utils.Static.ShowModal(htmlAsString);
            ko.applyBindings(viewModel, document.getElementById('modal-content-wrapper'));
        }

        public static CloseModal(): void {
            var modalContentWrapper: JQuery = $('#modal-content-wrapper');
            if (modalContentWrapper.length > 0)
                modalContentWrapper.remove();
            $('#app-modal').modal('hide');
        }

        public static SubscribeCallbackToModalShownEvent(callback: Function) {
            $('#app-modal').on('shown.bs.modal', function (event) {
                callback();
            })
        }

        public static HandleUnsuccesfulAjaxResponse(data: any) {
            var options: ToastrOptions = (<ToastrOptions> /*</>*/{closeButton: true, timeOut: 0, extendedTimeOut: 0});
            var message: string = (<string>/*</>*/data.Message);

            if (data.IsSessionExpired)
                toastr.warning(message, 'Warning', options);
            else
                toastr.error(message, 'Error', options);
        }

        public static ShowWarningMessage(message): void {
            var options: ToastrOptions = (<ToastrOptions> /*</>*/{closeButton: true, timeOut: 0, extendedTimeOut: 0});
            toastr.warning(message, 'Warning', options);
        }

        public static InitCustomFormatValidationMethods(): void {
            $.validator.addMethod("isSelected", function (value, element, arg) {
                return value != null && value != "";
            });

            $.validator.addMethod("isValidUrl", function (value, element, arg) {
                if (validation.Static.isValidString(value))
                    return validation.Static.isValidUrl(value);
                return true;
            });

            $.validator.addMethod("pwcheck", function (value, element) {
                return /(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/.test(value);
            });

            if (validator) {
                $.validator.addMethod("isOptionalUUID", function (value, element, arg) {
                    if (!validation.Static.isValidString(value)) return true;
                    return validator.isUUID(value, 4);
                });
            }

            $.validator.addMethod("isNotInArray", function (value, element, arg: Array<number>) {
                if (validation.Static.isValidPositiveNumber(value)) {
                    if (arg.filter(f => f == value).length > 0) return false;
                }
                return true;
            });
        }

        public static isValidImageFile(filename) {
            if (!(/\.(gif|jpeg|jpg|png)$/i).test(filename)) return false;
            return true;
        }

        public static isValidDocumentFile(filename) {
            if (!(/\.(doc|docx|xls|xlsx|rtf|pdf|txt)$/i).test(filename)) return false;
            return true;
        }

        public static isValidVideoFile(fileName) {
            var isValid = true;

            if (!(/\.(mp4|ogv|ogg|webm|flv|mov|avi|wmv)$/i).test(fileName)) {
                isValid = false;
            }

            return isValid;
        }

        public static isValidSize(fileSize) {
            var isValid = true;

            if (fileSize > utils.WebClientConfig.MaxUploadSizeInBytes) {
                isValid = false;
            }

            if (fileSize <= 0) {
                isValid = false;
            }

            return isValid;
        }

        public static SetMenuItemAsActive(mnuItemDOMid: string, subMenuDOMid?: string) {
            var $mnuWrapper: JQuery = $('#left-side-nav');
            if ($mnuWrapper.length <= 0) return;

            var items = $mnuWrapper.find('li.active');
            if (items !== undefined && items.length > 0) {
                items.removeClass('active');
            }

            var item = $mnuWrapper.find('#' + mnuItemDOMid);
            if (item.length > 0) item.addClass('active');

            if (validation.Static.isValidString(subMenuDOMid)) {
                var subMenus = $mnuWrapper.find('.sub-menu');
                if (subMenus !== undefined && subMenus.length > 0) {
                    subMenus.removeClass('bordered');
                    subMenus.hide();
                }
                $('#' + subMenuDOMid).show();
                $('#' + subMenuDOMid).parent().addClass('active');
                var $toggleIcon = $('#' + subMenuDOMid).parent().find(".toggle-icon");
                $toggleIcon.addClass('fa-angle-down');
            }
        }

        public static SetMenuItemAsActiveForPipelines(mnuItemDOMid: string, parentDOMid: string) {
            var $mnuWrapper: JQuery = $('#left-side-nav');
            if ($mnuWrapper.length <= 0) return;

            var items = $mnuWrapper.find('li.active');
            if (items !== undefined && items.length > 0) {
                items.removeClass('active');
            }
            var itemJquerySelector = '';
            if (validation.Static.isValidString(parentDOMid)) {
                itemJquerySelector = '#' + parentDOMid + ' #' + mnuItemDOMid;

                var pipelineItems = $('#' + parentDOMid).find('li.active');
                if (pipelineItems !== undefined && pipelineItems.length > 0) {
                    pipelineItems.removeClass('active');
                }
            } else {
                itemJquerySelector = '#' + mnuItemDOMid;
            }

            var item = $mnuWrapper.find(itemJquerySelector);
            if (item.length > 0) item.addClass('active');
        }

        public static UpdateUrlParameter(uri, key, value): string {
            // remove the hash part before operating on the uri
            var i = uri.indexOf('#');
            var hash = i === -1 ? '' : uri.substr(i);
            uri = i === -1 ? uri : uri.substr(0, i);

            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";

            if (!value) {
                // remove key-value pair if value is empty
                uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), '');
                if (uri.slice(-1) === '?') {
                    uri = uri.slice(0, -1);
                }
                // replace first occurrence of & by ? if no ? is present
                if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
            } else if (uri.match(re)) {
                uri = uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                uri = uri + separator + key + "=" + value;
            }
            return uri + hash;
        }

        public static GetQueryStringValue(key): string {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        public static OpenUrlInANewWindow(url: string): void {
            var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
            var win = window.open(url, "_blank", strWindowFeatures);
        }

        public static toMoney = function (value, currencyName: string = '$') {
            if (validation.Static.isValidNumber(value)) {
                var valueAsNumber = Number(value);
                return currencyName + (valueAsNumber.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
            } else return '-';
        };

        public static toMoney_ShortFormat = function (value, currencyName: string = '$') {
            if (validation.Static.isValidNumber(value)) {
                console.log('Value is: ' + value);
                var numberAsValue = Number(value);
                var suffixes = ['', 'K', 'M', 'B'];
                var length = (numberAsValue + '').length;
                var index = Math.floor((length - 1) / 3);
                if (index != 0 && index <= 3) {
                    const normalisedNumber = numberAsValue / Math.pow(10, length - 4);
                    var round = normalisedNumber % 10 >= 5 ? true : false;
                    var shortNumber = normalisedNumber / 10;
                    //if (round) {
                    //    shortNumber += 1;
                    //}
                    shortNumber = shortNumber * Math.pow(10, length - 3);
                    shortNumber = shortNumber / Math.pow(1000, index);
                    var n = shortNumber.toPrecision(3);
                    var n1 = parseFloat;

                    if ((n1 + "").length == 1)
                        return currencyName + (shortNumber + "").substring(0, 1) + suffixes[index];
                    else if ((n1 + "").length == 2)
                        return currencyName + (shortNumber + "").substring(0, 2) + suffixes[index];
                    else if ((n1 + "").length == 3)
                        return currencyName + (shortNumber + "").substring(0, 3) + suffixes[index]
                    else return currencyName + shortNumber.toPrecision(3) + suffixes[index];
                } else return currencyName + numberAsValue;

            } else return '-';

        }

        public static FormatUrlForHrefBinding(url: string): string {
            if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1)
                return url;
            else return 'http://' + url;
        }

        public static FormatUrlForDisplay(url: string): string {
            var result: string = '';
            var formattedUrl: string = url;
            if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
                formattedUrl = url.replace(/(^\w+:|^)\/\//, '');
            }
            if (formattedUrl.indexOf("www.") > -1) result = formattedUrl;
            else result = 'www.' + formattedUrl;

            result = result.replace(/\/$/, "");
            return result;
        }

        public static goBackProgramatically(): void {
            var historyObj = window.history;
            historyObj.go(-1);
        }

        public static GenerateEmailWithFormat(firstName: string, lastName: string, emailFormat: string): string {
            var email = emailFormat;
            if (email.indexOf("{m}") >= 0)
                email = email.replace("{m}", '');
            if (email.indexOf("{first}") >= 0)
                email = email.replace("{first}", firstName);
            if (email.indexOf("{last}") >= 0)
                email = email.replace("{last}", lastName);
            if (email.indexOf("{f}") >= 0)
                email = email.replace("{f}", validation.Static.isValidString(firstName) ? firstName.substring(0, 1) : '');
            if (email.indexOf("{l}") >= 0)
                email = email.replace("{l}", validation.Static.isValidString(lastName) ? lastName.substring(0, 1) : '');
            return email.toLowerCase();
        }

        private static getGuidPart(): string {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        public static NewGuid(): string {
            return (
                utils.Static.getGuidPart() +
                utils.Static.getGuidPart() +
                "-" +
                utils.Static.getGuidPart() +
                "-" +
                utils.Static.getGuidPart() +
                "-" +
                utils.Static.getGuidPart() +
                "-" +
                utils.Static.getGuidPart() +
                utils.Static.getGuidPart() +
                utils.Static.getGuidPart()
            );
        }

        public static DoSPANavigationWithFragment(fragment: string) {
            var url = window.location.href;
            var index = url.lastIndexOf('#');
            if (index > -1) {
                var newUrl = url.substring(0, index) + fragment;
                window.location.href = newUrl;
            }
        }

        public static FixSearchResultsPagesRedirect(dtAjaxUrl: string, sectionUrlPart: string, sectionRedirectUrl: string) {
            var ajaxUrl = dtAjaxUrl;
            if (window.location.href.indexOf(sectionUrlPart) > -1) {
                ajaxUrl = dtAjaxUrl;
            } else {
                var absoluteUrl = window.location.href + sectionRedirectUrl;
                if (history.pushState) window.history.pushState({path: absoluteUrl}, '', absoluteUrl);
            }
        }

        public static trimInside(value: string) {
            return value.replace(/\s/g, "");
        }

        public static CheckIfObjectWithObservablesIsEmpty(obj: KnockoutObservable<any>) {
            if (obj() != null) {
                if (obj().constructor === Array) {
                    if (obj() != null && obj().length > 0) return false;
                } else if (typeof obj() == "boolean") {
                    if (obj() == true) return false;
                } else if (typeof obj() == "number") {
                    if (obj() != null) return false;
                } else if (typeof obj() == "string") {
                    if (obj() != null && obj() != '') return false;
                } else if (typeof obj() == "object")
                    if (obj() != null && obj() != '') return false;
            }
            return true;
        }

        public static ResetObservableToDefaultValue(obj: KnockoutObservable<any>) {
            if (obj() != null) {
                if (obj().constructor === Array)
                    obj([]);
                else if (typeof obj() == "boolean")
                    obj(false);
                else if (typeof obj() == "number")
                    obj(null);
                else if (typeof obj() == "string")
                    obj('');
                else if (typeof obj() == "object")
                    obj(null);
            }
        }

        public static attachChangeEventOnInput(id: string, callback: Function): void {
            var textInput: any = document.getElementById(id);

            // Init a timeout variable to be used below
            var timeout = null;

            // Listen for keystroke events
            textInput.onkeyup = function (e) {

                // Clear the timeout if it has already been set.
                // This will prevent the previous task from executing
                // if it has been less than <MILLISECONDS>
                clearTimeout(timeout);

                // Make a new timeout set to go off in 800ms
                timeout = setTimeout(function () {
                    if (callback != null && callback !== undefined)
                        callback(textInput.value);
                }, 500);
            };
        }
    }
}
