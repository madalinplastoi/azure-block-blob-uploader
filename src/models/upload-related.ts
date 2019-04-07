module models {
    export class Media {
        public Id: number;
        public Url: string;
        public Filename: string;
        public ThumbnailUrl: string;
        public JobId: number;
        public CreatedOn: Date;
        public Size: number;
        public CreatedBy: number;
        public TypeId: number;
        public UuId: string;

        constructor(data: any) {
            this.CreatedBy = data.CreatedBy;
            this.CreatedOn = moment(data.CreatedOn).toDate();
            this.Filename = data.Filename;
            this.Id = data.Id;
            this.Size = data.Size;
            this.JobId = data.JobId;
            this.ThumbnailUrl = data.ThumbnailUrl;
            this.Url = data.Url;
            this.TypeId = data.TypeId;
            this.UuId = data.UuId;
        }
    }

    export class MediaForRequest extends Media {
        public UserId: number;

        constructor(data: any) {
            super(data);
        }
    }

    export class MediaUploaderObject {
        public File: File;
        public JobId: number;
        public UserId: number;
    }
}
