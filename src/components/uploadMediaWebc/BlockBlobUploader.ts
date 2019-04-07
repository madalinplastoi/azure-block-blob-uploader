module media {
    declare var $: JQueryStatic;

    export class MsBlobFile {
        public mediaItemId: number;
        public uuId: string;
        public stream: File;
        public sasUrl: string;
        public bytesUploaded: number;
        public status: string;
        public userId: number;
        public size: number;

        constructor(uuId: string, mediaItemId: number, stream: File, sasUrl: string, userId:number) {
            this.mediaItemId = mediaItemId;
            this.uuId = uuId;
            this.stream = stream;
            this.sasUrl = sasUrl;
            this.bytesUploaded = 0;
            this.status = '';
            this.userId = userId;
            this.size = stream.size;
        }
    }

    export class ExtendedMsBlobFile extends MsBlobFile {
        public title: string;
        public description: string;
        public filename: string;
        public progressId: string;
        constructor(title: string, description: string, filename: string, stream: File, progressId: string, userId:number) {
            super('', 0, stream, '', userId);
            this.title = title;
            this.description = description;;
            this.filename = filename;
            this.progressId = progressId;
        }
    }

    export class MsBlockBlobUploader {
        public uuId: string;
        private _uObject: MsBlobFile;

        private _uProgressCallback: Function;
        private _uSuccessCallback: Function;
        private _uErrorCallback: Function;
        private _uCancelCallback: Function;

        private _cancelUpload: boolean = false;
        private _fileReader: FileReader;
        private _readNextBlock: Function;

        private blockSize: number = 256 * 1024; // Each file will be split into 256 KB individual blocks
        private blockIdPrefix: string = "block-";
        private blockIdArray: Array<any> = [];
        private blockPointer: number = 0;
        private bytesRemain: number;

        private _currentRequest = null;

        private _self: MsBlockBlobUploader;

        constructor(id: string) {
            this.uuId = id;
        }

        public Init(uploadObject: MsBlobFile, successCallback, errorCallback, cancelCallback, progressCallback) {
            this._uObject = uploadObject;
            this.bytesRemain = this._uObject.stream.size;

            this._fileReader = new FileReader();
            this._fileReader.onloadend = this.readerOnLoadEnd.bind(this);

            this._uSuccessCallback = successCallback;
            this._uErrorCallback = errorCallback;
            this._uCancelCallback = cancelCallback;
            this._uProgressCallback = progressCallback;

            this._self = this;
            this._self._readNextBlock = this.readNextBlock;
        }

        public Upload(): void {
            if (this.uuId === undefined || this.uuId == '' || this.uuId == null) {
                console.error('Media Item UuId was  not computed! Please call video/generate media task before calling Upload.');
                return;
            }
            if (this._uObject.stream === undefined || this._uObject.stream == null) {
                console.error('No stream to upload!');
                return;
            }

            this._readNextBlock(this);
        }

        public Cancel(): void {
            this._cancelUpload = true;
            //if (this._currentRequest) this._currentRequest.abort();
        }

        private readNextBlock(self: MsBlockBlobUploader): void {
            if (self._cancelUpload) {
                self._cancelUpload = false;
                self._uCancelCallback(self._uObject);
                return;
            }

            var fileContent = self._uObject.stream.slice(self.blockPointer, self.blockPointer + self.blockSize);
            self._fileReader.readAsArrayBuffer(fileContent); // This will trigger the event handler readerOnloadend(evt)
        }

        private readerOnLoadEnd(event: any): void {
            var requestData: any;
            var self: MsBlockBlobUploader = this;

            if (self._cancelUpload) {
                self._cancelUpload = false;
                self._uCancelCallback(self._uObject);
                return;
            }

            if (event.target.readyState == 2/*FileReader.DONE*/) {
                var blockId = self.blockIdPrefix + self.pad(self.blockIdArray.length, 6);
                self.blockIdArray.push(btoa(blockId));
                requestData = new Uint8Array(event.target.result);
                var request = {
                    url: self._uObject.sasUrl + '&comp=block&blockid=' + self.blockIdArray[self.blockIdArray.length - 1],
                    type: "PUT",
                    data: requestData,
                    processData: false,
                    beforeSend: (xhr: XMLHttpRequest) => {
                        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                        xhr.setRequestHeader('Content-Length', requestData.length);
                    }
                };
                this._currentRequest = $.ajax(request)
                    .done(
                    (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                        self._uObject.bytesUploaded += requestData.length;

                        self._uProgressCallback(self._uObject);

                        self.blockPointer += self.blockSize;
                        self.bytesRemain -= self.blockSize;
                        if (self.bytesRemain > 0) {
                            if (self.bytesRemain < self.blockSize) {
                                self.blockSize = self.bytesRemain;
                            }
                            self.readNextBlock(self);
                        } else {
                            self.ajaxCommitBlockList(self);
                        }
                    })
                    .fail(
                    (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => {
                        self._uErrorCallback(jqXHR, textStatus, errorThrown, self.uuId);
                    });
            }
        }

        private ajaxCommitBlockList(self: MsBlockBlobUploader): void {
            var requestData: any;

            if (self._cancelUpload) {
                self._cancelUpload = false;
                self._uCancelCallback(self._uObject);
                return;
            }

            self._uObject.status = "Committing blocklist for " + self._uObject.stream.name + " in Azure Blob";
            self._uProgressCallback(self._uObject);

            requestData = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
            for (var i = 0; i < self.blockIdArray.length; i++) {
                requestData += '<Latest>' + self.blockIdArray[i] + '</Latest>';
            }
            requestData += '</BlockList>';

            var request = {
                url: self._uObject.sasUrl + '&comp=blocklist',
                type: "PUT",
                data: requestData,
                contentType: "text/plain; charset=UTF-8",
                crossDomain: true,
                cache: false,
                beforeSend: (xhr: XMLHttpRequest) => {
                    xhr.setRequestHeader('x-ms-blob-content-type', self._uObject.stream.type);
                    xhr.setRequestHeader('x-ms-version', "2012-02-12");
                    xhr.setRequestHeader('Content-Length', requestData.length);
                }
            };
            this._currentRequest = $.ajax(request)
                .done(
                (data: any, textStatus: string, jqXHR: JQueryXHR) => {
                    self._uSuccessCallback(self._uObject);
                })
                .fail(
                (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => {
                    self._uErrorCallback(jqXHR, textStatus, errorThrown);
                });
        }

        private pad(num: number, length: number): string {
            var str = '' + num;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
    }

    export class MsBlockBlobUploaderFactory {
        private static _instances: Array<MsBlockBlobUploader> = new Array<MsBlockBlobUploader>();

        static checkExistingInstance(uuId: string): MsBlockBlobUploader {
            var existingInstance = ko.utils.arrayFirst(MsBlockBlobUploaderFactory._instances, (item) => {
                return item.uuId == uuId;
            });
            return existingInstance;
        }

        public static getInstance(uuId: string): MsBlockBlobUploader {
            var result = MsBlockBlobUploaderFactory.checkExistingInstance(uuId);
            if (result == null) {
                result = new MsBlockBlobUploader(uuId);
                MsBlockBlobUploaderFactory._instances.push(result);
            }
            return result;
        }
    }

    export class MsBlockBlobUploaderClient {
        public _submitObject: ExtendedMsBlobFile = null;

        private _progressCallback: Function;
        private _successCallback: Function;
        private _errorCallback: Function;
        private _cancelCallback: Function;
        private _getSasUrl: string;
        private _publishUrl: string;
        private _uploaderClient;
        private _apiCustomeHeader: string;
        private _userId: number;

        public IsCancelling: boolean;

        public GuidId: string;
        public JobId: number;

        constructor(title: string, description: string, fileName: string, file: File, progressId: string,
            successCallback: Function, progressCallback: Function, errorCallback: Function, cancelCallback: Function,
            getSasUrl: string, publishUrl: string, 
            jobId?: number, apiCustomHeader?: string, userId?: number) {
            this._submitObject = new ExtendedMsBlobFile(title, description, fileName, file, progressId, userId);
            this._getSasUrl = getSasUrl;
            this._publishUrl = publishUrl;
            this._successCallback = successCallback;
            this._progressCallback = progressCallback;
            this._errorCallback = errorCallback;
            var context = this;
            this._cancelCallback = function () {
                cancelCallback(context);
            };
            this.GuidId = progressId;
            this.JobId = jobId;
            this.IsCancelling = false;
            this._apiCustomeHeader = apiCustomHeader;
            this._userId = userId;
        }

        public Start(): void {
            this.step1();
        }

        private step1(): void {
            if (this._submitObject === undefined || this._submitObject == null) {
                console.error('Create submit object before consuming Uploader Client');
                return;
            }

            this._submitObject.status = "Calling server to generate media item";
            this._progressCallback(this._submitObject);

            var self: MsBlockBlobUploaderClient = this;
            
            var promise = utils.Ajax.DoJsonPostWithProgress(this._getSasUrl, {
                Filename: this._submitObject.stream.name,
                JobId: this.JobId,
                UserId: this._userId,
                Size : this._submitObject.size
            });
            promise
                .then(function (data) {
                    if (data.IsSuccess) {
                        if (self.IsCancelling == false) {
                            self._submitObject.mediaItemId = data.Data.Id;
                            self._submitObject.uuId = data.Data.UuId;
                            self._submitObject.sasUrl = data.Data.Url;

                            self._submitObject.status = "Uploading file " + self._submitObject.stream.name + " to Azure Blob";
                            self._progressCallback(self._submitObject);

                            self._uploaderClient = MsBlockBlobUploaderFactory.getInstance(data.Data.UuId);
                            self._uploaderClient.Init(self._submitObject, self.step2.bind(self), self._errorCallback, self._cancelCallback, self._progressCallback);
                            self._uploaderClient.Upload();
                        } else {
                            self._cancelCallback();
                        }
                    }
                    else {
                        utils.Static.HandleUnsuccesfulAjaxResponse(data);
                    }
                }, function (error) {
                    self._errorCallback(error);
                });
        }

        private step2(submitObject: ExtendedMsBlobFile): void {
            var videoViewModel: any = {};
            videoViewModel.Id = submitObject.mediaItemId;
            videoViewModel.Title = submitObject.title;
            videoViewModel.Description = submitObject.description;
            videoViewModel.FileName = submitObject.filename;
            videoViewModel.Size = submitObject.stream.size;
            videoViewModel.JobId = this.JobId;
            videoViewModel.UuId = submitObject.uuId;
            videoViewModel.UserId = submitObject.userId;

            this._submitObject.status = "Calling server to publish " + this._submitObject.title + " to AssetWatch.";
            this._progressCallback(submitObject);

            var self = this;
            if (this.IsCancelling == false) {
                var promise = utils.Ajax.DoJsonPost(this._publishUrl, videoViewModel);
                promise
                    .then(function (data) {
                        data.progressId = self._submitObject.progressId;
                        self._successCallback(data.Data);

                    }, function (error) {
                        self._errorCallback(error);
                    });
            }
            else {
                this._cancelCallback();
            }
        }

        public cancelUpload() {
            this.IsCancelling = true;
            this._uploaderClient.Cancel();
        }
    }
}
