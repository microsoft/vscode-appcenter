import { AppCenterCache } from "../cache/baseCache";
import { AppCenterLoader, AppCenterView, Profile } from "../helpers/interfaces";
import { Strings } from "../strings";

export class AppCenterController<T> {

    private _loader: AppCenterLoader<T>;
    private _view: AppCenterView<T> | null;
    private _cache: AppCenterCache<T[]>;
    private _profile: Profile;

    public constructor(profile: Profile, loader: AppCenterLoader<T>, cache: AppCenterCache<T[]>, view: AppCenterView<T> | null = null) {
        this._loader = loader;
        this._cache = cache;
        this._view = view;
        this._profile = profile;
    }

    public detachView() {
        this._view = null;
    }

    public attachView(view: AppCenterView<T>) {
        this._view = view;
    }

    public isViewAttached(): boolean {
        return this._view !== null;
    }

    public load(background: boolean = false) {
        if (background || !this.isViewAttached()) {
            this.loadInBackground();
        } else {
            this.loadWithUI();
        }
    }

    private loadInBackground(): Promise<any> {
        return this._loader.load().then((items: T[]) => {
            if (items && items.length) {
                this._cache.set(this._profile.userId, items);
            }
        }).catch(() => { });
    }

    private async loadWithUI(): Promise<any> {
        const cacheForCurrentUser = await this._cache.get(this._profile.userId);
        if (cacheForCurrentUser && this.isViewAttached()) {
            (this._view as AppCenterView<T>).display(cacheForCurrentUser);
        }
        if (this.isViewAttached()) {
            return (this._view as AppCenterView<T>).showProgress(Strings.GetAppsListMessage, this.updateItemsAndDisplayNew.bind(this));
        } else {
            return this.updateItemsAndDisplayNew();
        }
    }

    private updateItemsAndDisplayNew(): Promise<any> {
        return this._loader.load().then(async (items: T[]) => {
            if (items && items.length) {
                const displayChanges = await this._cache.cacheDiffersFrom(this._profile.userId, items);
                this._cache.set(this._profile.userId, items);
                if (displayChanges && this.isViewAttached()) {
                    (this._view as AppCenterView<T>).display(items);
                }
            }
        });
    }
}
