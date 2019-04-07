module utils {
    export class Notifications {
        @setMessageName() static addMediaToUploader: INamedMessage<models.MediaUploaderObject>;
        @setMessageName() static mediaSavedSuccessful: INamedMessage<any>;
        @setMessageName() static mediaRemovedSuccessful: INamedMessage<any>;
    }
}
