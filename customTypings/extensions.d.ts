/// <reference path="knockout.d.ts" />
interface JQueryModal {
    close(): void;
}

interface JQueryStatic {
    modal: JQueryModal;
}

interface IBootstrapDateOptions {
    format: string;
    viewMode: string;
    minViewMode: string;
}

interface JQuery {
    modal(options: any): JQuery;
    select2(): JQuery;
    datepicker(): JQuery;
    valid(): boolean;
    datepicker(options: IBootstrapDateOptions): JQuery;
    fileupload(settings: any);
    fileupload(key: string, settings: any);
    validate(opt1?:any): any;
}

interface KnockoutBindingHandlers {
    stopBinding: KnockoutBindingHandler;
}

declare module DataTables {
    export interface Settings {
        responsive?: boolean;
    }

    export interface ColumnLegacy {
        name: number;
    }

    export interface Api {
        _fnAjaxUpdate(): void;
    }
}

interface Window {
    regionLoaderIsOn: boolean;
    globalLoaderIsOn: boolean;
    AzureStorageEndpoint: string;
}
