module proxies {
    export class MediaModelProxy {
        private static _instance: proxies.MediaModelProxy;

        constructor() {
            if (proxies.MediaModelProxy._instance) {
                throw new Error("Error: Instantiation failed: Use MediaModelProxy.getInstance() instead of new.");
            }
            proxies.MediaModelProxy._instance = this;
        }

        public static getInstance(): proxies.MediaModelProxy {
            if (proxies.MediaModelProxy._instance == null || proxies.MediaModelProxy._instance === undefined) {
                proxies.MediaModelProxy._instance = new proxies.MediaModelProxy();
            }
            return proxies.MediaModelProxy._instance;
        }

        public static API_DeleteMedia(media: models.MediaForRequest): Q.Promise<any> {
            var deferred = Q.defer();

            utils.Ajax.DoJsonPostWithProgress(utils.ApiRoutes.DeleteMedia_Url(), media).then(
                function (data: any) {
                    if (data.IsSuccess) {
                        deferred.resolve(new models.Media(data.Data));
                    } else {
                        utils.Static.HandleUnsuccesfulAjaxResponse(data);
                    }
                },
                function (error: any) {
                    deferred.reject(error.message)
                });
            return deferred.promise;
        }
    }
}
