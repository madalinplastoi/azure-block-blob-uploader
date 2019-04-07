module media {
    export class DI_MediaUploadItem extends contracts.DataBindingWrapper<MsBlockBlobUploaderClient>{

        public IsCancelling: KnockoutObservable<boolean>;

        constructor(data: MsBlockBlobUploaderClient) {
            super(data);
            this.IsCancelling = ko.observable(false);
        }
    }
}