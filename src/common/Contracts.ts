/// <reference path="../../customtypings/knockout.d.ts" />
module contracts {
    export interface IBaseResponse {
        IsSuccess: boolean;
        Message: string;
        ReturnUrl: string;
        RequestedUrl: string;
    }

    export interface IResponse<T> {
        IsSuccess: boolean;
        Message: string;
        ReturnUrl: string;
        Data: T;
        RequestedUrl: string;
        RelatedId?: number;
    }

    export interface IWebComponent {
        prepareDataBindings(data?: any, data1?: any, data2?: any, data3?: any, data4?: any, data5?: any, data6?: any): void;

        activate(data?: any, data1?: any, data2?: any, data3?: any, data4?: any, data5?: any, data6?: any): void;

        canDeactivate(): boolean;
    }

    export class BaseWebComponent {
        public _isOperationFailed: KnockoutObservable<boolean>;
        protected _statusMessage: KnockoutObservable<string>;
        protected _statusAction: KnockoutObservable<string>;
        protected _mediator: utils.DecoratedMediator;

        constructor() {
            this._isOperationFailed = ko.observable(false);
            this._statusMessage = ko.observable('');
            this._statusAction = ko.observable('');
        }

        protected reset(context: any, e: Event): void {
            e.preventDefault();
            this._isOperationFailed(false);
            this._statusMessage('');
            this._statusAction('');
        }

        public setStatusMessage(message: string): void {
            this._statusMessage(message);
        }
    }

    export interface IActionProxy {
        execute(): void;
    }

    export class ActionProxy implements IActionProxy {
        public static handleRequestError(error): void {
            console.error("Server call error: " + error);
            toastr.error("An error has occured, please contact support", "Error", {
                closeButton: true,
                timeOut: 0,
                extendedTimeOut: 0
            });
        }

        public execute(model1?: any,
                       model2?: any,
                       model3?: any,
                       model4?: any,
                       model5?: any): void {
        }
    }

    export interface IUIEvent {
        execute(): void;
    }

    export class UIEvent implements IUIEvent {
        public execute(model?: any): void {
        }
    }

    export interface IModal {
        onLoaded(): void;

        prepareDataBindings(data1?: any, data2?: any, data3?: any): void;
    }

    declare var $: any;

    export class ModalWebComponent {
        public Meta: any;
        public editMode: boolean;

        constructor(onLoadedCallback: () => void, editMode?: boolean) {
            if (editMode === undefined) this.editMode = false;
            else this.editMode = editMode;
            $('#app-modal').on('shown.bs.modal', function (event) {
                onLoadedCallback();
            })
        }
    }

    export class DataBindingWrapper<T> {
        public m: T;

        constructor(m: T) {
            this.m = m;
        }
    }

    export class Tuple<T, U> {
        constructor(public data1: T, public data2: U) {
        }
    }
}
