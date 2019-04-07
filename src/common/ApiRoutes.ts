module utils {
    export class ApiRoutes {
        public static DeleteMedia_Url() {
            return "/Media/delete-media";
        }

        public static InitializeUploadTask_Url() {
            return "/Media/generate-saas-for-media";
        }

        public static PublishMediaItem_Url() {
            return "/Media/publish-media";
        }
    }
}
