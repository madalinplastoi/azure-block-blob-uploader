module media {
    export class UIE_AddMediaToUploader extends contracts.UIEvent {
        constructor() {
            super();
        }

        execute(data: models.MediaUploaderObject): void {
            utils.messenger.sendMessage(utils.Notifications.addMediaToUploader, data);
        }
    }
}
