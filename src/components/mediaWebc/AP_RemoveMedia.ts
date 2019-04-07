module media {
    export class AP_RemoveMedia extends contracts.ActionProxy {
        constructor() {
            super();
        }

        execute(data: models.MediaForRequest): void {
            proxies.MediaModelProxy.API_DeleteMedia(data).then(
                function (data: any) {
                    utils.messenger.sendMessage(utils.Notifications.mediaRemovedSuccessful, data);
                },
                function (error) {
                    contracts.ActionProxy.handleRequestError(error);
                });
        }
    }
}
