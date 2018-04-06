import * as vscode from "vscode";
import { Strings } from "../strings";

/**
 * T: type of the cache item.
 * Z: type of the object that loads T items.
 */
export abstract class AppCenterCache<T, Z> {
    protected _cache: T[];

    public get cache(): T[] {
        return this._cache;
    }

    public hasCache(): boolean {
        return this._cache && this._cache.length > 0;
    }

    public invalidateCache() {
        this._cache = [];
    }

    public async updateCacheInBackground(loader: Z) {
        this.updateCache(loader).catch(() => {
            // Ignore.
        });
    }

    public async updateCacheWithProgress(loader: Z, display: (items: T[]) => any): Promise<any> {
        if (this.hasCache()) {
            display(this._cache);
        }
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, () => {
            return this.updateCache(loader, display);
        });
    }

    protected updateCache(loader: Z, display: (items: T[]) => any = function () { }) {
        return this.loadItems(loader).then((cachedItems: T[]) => {
            if (cachedItems && cachedItems.length) {
                const displayChanges = this.сacheDiffersFrom(cachedItems);
                this._cache = cachedItems;
                if (displayChanges) {
                    display(cachedItems);
                }
            }
        });
    }

    protected сacheDiffersFrom(items: T[]): boolean {
        const compareItemsFunction = this.compareItems;
        if (!this.cache || !items) {
            return true;
        }
        if (this.cache.length !== items.length) {
            return true;
        }
        let differs: boolean = false;
        this.cache.every((cachedItem) => {
            const matches = items.filter((item) => {
                return compareItemsFunction(cachedItem, item);
            });
            // If we find no matches to this cache item in items, then arrays differ.
            if (matches.length === 0) {
                differs = true;
                return false; // Stop the execution of every();
            }
            return true;
        });
        return differs;
    }

    protected abstract async loadItems(loader: Z): Promise<T[]>;

    protected abstract compareItems(cachedItem: T, item: T): boolean;
}
