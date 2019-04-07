module media {
    declare var $: JQueryStatic;

    export class MediaWebc extends contracts.BaseWebComponent implements contracts.IWebComponent {
        private static _self: MediaWebc;

        private _items: KnockoutObservableArray<DI_MediaItem>;
        public _itemsCount: KnockoutComputed<number>;
        private _jobId: number;
        private _isDisabled: KnockoutObservable<boolean>;
        // this field should be used only if the code will call the api.
        private _customApiHeader: string;
        // this field should be used only if the code will call the api.
        private _userId: number;

        constructor() {
            super();
            this._items = ko.observableArray([]);
            this._isDisabled = ko.observable(true);
            this._itemsCount = ko.computed({
                owner: this,
                read: () => {
                    return this._items().length;
                }
            });
            MediaWebc._self = this;
        }

        prepareDataBindings(data: Array<models.Media>): void {
            if (data != null) {
                var items = ko.utils.arrayMap(data, (item: models.Media) => {
                    return new DI_MediaItem(item);
                });
                this._items.push.apply(this._items, items);
            }
        }

        public activate(data: Array<models.Media>, jobId?: number, userId?: number, apiCustomeHeader?: string): void {
            ko.bindingHandlers.stopBinding = {
                init: function () {
                    return {controlsDescendantBindings: true};
                }
            };
            (<any> /*</>*/ ko.virtualElements.allowedBindings).stopBinding = true;
            this.prepareDataBindings(data);
            this._jobId = jobId;
            this._userId = userId;
            this._mediator = new utils.DecoratedMediator(this);
            this.initFileUpload();
            this._customApiHeader = apiCustomeHeader;
            this._isDisabled(false);
            ko.applyBindings(this, document.getElementById('media-items-wrapper'));
        }

        canDeactivate() {
            this._mediator.destroy();
            return true;
        }

        private initFileUpload() {
            $('#upload-media-form').fileupload({
                dropZone: $('#media-items-wrapper'),
                dataType: 'json',
                url: '',
                add: function (e, data) {
                    utils.Ajax.StartActivity();
                    if (utils.Static.isValidImageFile(data.files[0].name)) {
                        if (utils.Static.isValidSize(data.files[0].size)) {
                            var cachedData = data;
                            var cachedSize = data.files[0].size;
                            var $this = $(this);

                            var useResize = true;
                            var isIE = utils.Static.CheckIeAndReturnVersion();
                            if (isIE > -1 && (isIE <= 8.0 || isIE <= 9.0)) useResize = false;

                            if (useResize) {
                                $this.fileupload('process', {
                                    files: data.files,
                                    process: [
                                        {
                                            action: 'load',
                                            fileTypes: /^image\/(gif|jpeg|png)$/,
                                            maxFileSize: 30000000 // 30MB
                                        },
                                        {
                                            action: 'resize',
                                            maxWidth: 300,
                                            maxHeight: 300,
                                            minWidth: 300,
                                            minHeight: 300,
                                            crop: false,
                                            disabled: false,
                                        },
                                        {
                                            action: 'save'
                                        }
                                    ],
                                }).done(function (e) {
                                    cachedData.files = e.files;
                                    var uie = new UIE_AddMediaToUploader();
                                    var uploadObject = new models.MediaUploaderObject();
                                    uploadObject.File = cachedData.files[0];
                                    uploadObject.JobId = MediaWebc._self._jobId;
                                    uie.execute(uploadObject);
                                });
                            } else {
                                var uie = new UIE_AddMediaToUploader();
                                var uploadObject = new models.MediaUploaderObject();
                                uploadObject.File = cachedData.files[0];
                                uploadObject.JobId = MediaWebc._self._jobId;
                                uie.execute(uploadObject);
                            }

                        } else {
                            utils.Ajax.StopActivity();
                            toastr.warning(data.Message, 'Incorrect file size!', {
                                closeButton: true,
                                timeOut: 0,
                                extendedTimeOut: 0
                            });
                        }
                    } else if (utils.Static.isValidVideoFile(data.files[0].name)) {
                        if (utils.Static.isValidSize(data.files[0].size)) {
                            var uie = new UIE_AddMediaToUploader();
                            var uploadObject = new models.MediaUploaderObject();
                            uploadObject.File = data.files[0];
                            uploadObject.JobId = MediaWebc._self._jobId;
                            uie.execute(uploadObject);
                        } else {
                            utils.Ajax.StopActivity();
                            toastr.warning(data.Message, 'Incorrect file size!', {
                                closeButton: true,
                                timeOut: 0,
                                extendedTimeOut: 0
                            });
                        }
                    } else {
                        utils.Ajax.StopActivity();
                        toastr.warning(data.Message, 'Incorrect file format!', {
                            closeButton: true,
                            timeOut: 0,
                            extendedTimeOut: 0
                        });
                    }
                },
                progress: function (e, data) {
                },
                done: function (e, data) {
                }
            });
        }

        @utils.message(utils.Notifications.mediaSavedSuccessful)
        public serverEvent_whenMediaIsSaved(message: string, data: models.Media) {
            var existingItem = this.getDIById(data.UuId);
            if (existingItem == null) {
                this._items.push(new DI_MediaItem(data));
            } else {
                this._items.replace(existingItem, new DI_MediaItem(data));
            }
        }


        private getDIById(imageUuId: string): DI_MediaItem {
            return ko.utils.arrayFirst(this._items(), (item: DI_MediaItem) => {
                return item.m.UuId == imageUuId;
            });
        }

        public uiEvent_WhenUserTriggersRemoveMedia(data: DI_MediaItem) {
            var ap = new AP_RemoveMedia();
            var dataToSend = new models.MediaForRequest(data.m);
            ap.execute(dataToSend);
        }

        @utils.message(utils.Notifications.mediaRemovedSuccessful)
        public serverEvent_MediaRemovedSuccessfull(message: string, data: models.Media) {
            var existingItem = this.getDIById(data.UuId);
            if (existingItem != null) {
                this._items.remove(existingItem);
            }
        }
    }
}
