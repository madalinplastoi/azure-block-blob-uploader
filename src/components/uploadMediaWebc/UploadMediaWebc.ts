module media {
    export class UploadMediaWebc extends contracts.BaseWebComponent implements contracts.IWebComponent {

        private static _instance: UploadMediaWebc;

        public _items: KnockoutObservableArray<DI_MediaUploadItem>;

        public ItemsCount: KnockoutComputed<number>;
        private _count: number;
        private _customApiHeader: string;
        private _userId: number;

        constructor() {
            super();
            if (UploadMediaWebc._instance != null) throw new Error("Use UploadMediaWebc.getInstance()");
            this._items = ko.observableArray([]);
            this.ItemsCount = ko.computed({
                owner: this,
                read: () => {
                    if (this._items().length > 0) {
                        window.onbeforeunload = function (e) {
                            return "You have videos that are uploading for your account. If you continue to navigate from this page, the videos will be lost.";
                        };
                    }
                    else {
                        window.onbeforeunload = null;
                    }
                    return this._items().length;
                }
            });
            UploadMediaWebc._instance = this;
        }

        prepareDataBindings(data?: any): void {
        }

        canDeactivate() {
            this._mediator.destroy();
            return true;
        }

        activate(userId?: number,apiCustomHeader?:string): void {
          
            ko.applyBindings(this, document.getElementById("media-items-uploader-wrapper"));
            this._mediator = new utils.DecoratedMediator(this);
            this._userId = userId;
            this.prepareDataBindings(null);
            this._count = 0;
            this._customApiHeader = apiCustomHeader;
        }

        @utils.message(utils.Notifications.addMediaToUploader)
        public uiEvent_addMediaUploader(message: string, uploaderData: models.MediaUploaderObject) {
            if (uploaderData != null) {
                this._count++;
                var UploaderClient = new MsBlockBlobUploaderClient('random title', 'random description', uploaderData.File.name, uploaderData.File, this._count.toString(),
                    function (data) {
                        var itemToRemove = ko.utils.arrayFirst(UploadMediaWebc._instance._items(), function (i) {
                            return i.m._submitObject.uuId == data.UuId;
                        });
                        if (itemToRemove != null) {
                            if (itemToRemove.m.IsCancelling == false) {
                                UploadMediaWebc._instance._items.remove(itemToRemove);
                                if (UploadMediaWebc._instance._items().length == 0) {
                                    utils.Ajax.StopActivity();
                                }
                                utils.messenger.sendMessage(utils.Notifications.mediaSavedSuccessful, data);
                            } else {
                                //cancelling;
                            }
                        }

                    }, function (submitObject) {

                        var kbUploaded = submitObject.bytesUploaded / 1024;
                        var kbFilesize = submitObject.stream.size / 1024;
                        var progress = parseInt((kbUploaded / kbFilesize * 100).toString(), 10);

                        $('#bar' + submitObject.progressId).css(
                            'width',
                            progress + '%'
                        );
                        $('#bar' + submitObject.progressId).html(progress + "%");


                    }, function (error) {

                    }, function (uploaderClient) {
                        var itemToRemove = ko.utils.arrayFirst(UploadMediaWebc._instance._items(), function (i) {
                            return i.m.GuidId == uploaderClient.GuidId;
                        });
                        if (itemToRemove != null) {
                            UploadMediaWebc._instance._items.remove(itemToRemove);
                        }

                    },
                    utils.ApiRoutes.InitializeUploadTask_Url(), utils.ApiRoutes.PublishMediaItem_Url(),
                    uploaderData.JobId, this._customApiHeader, this._userId);
                var di = new DI_MediaUploadItem(UploaderClient);

                this._items.push(di);
                utils.Ajax.StartActivity();
                UploaderClient.Start();
            }
        }

        public removeObjectUploader(uploaderId: string) {

        }

        public cancelUploadProcess(uploaderId: string) {
            var itemToRemove = ko.utils.arrayFirst(UploadMediaWebc._instance._items(), function (i) {
                return i.m.GuidId == uploaderId;
            });
            if (itemToRemove != null) {
                itemToRemove.m.cancelUpload();
                itemToRemove.IsCancelling(true);
            }
        }

        public static getInstance(): UploadMediaWebc {
            if (UploadMediaWebc._instance == null) new UploadMediaWebc();
            return UploadMediaWebc._instance;
        }
    }
}
