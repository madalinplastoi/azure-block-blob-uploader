module media {
    export class DI_MediaItem extends contracts.DataBindingWrapper<models.Media>{
        constructor(media: models.Media) {
            super(media);
        }
    }
}
