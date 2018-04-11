import NodeCache = require("node-cache");
import { Md5 } from "ts-md5/dist/md5";
import { models } from "../appcenter/api";
import { AppCenterCache } from "./baseCache";

export class AppCenterAppsCache extends AppCenterCache<models.AppResponse[]> {
    private static instance: AppCenterAppsCache;
    private KEY_PREFIX: string = "_apps";

    private constructor() {
        super();
        this.cache = new NodeCache();
    }

    public static getInstance(): AppCenterCache<models.AppResponse[]> {
        if (!this.instance) {
            this.instance = new AppCenterAppsCache();
        }
        return this.instance;
    }

    public async cacheDiffersFrom(key: string, items: models.AppResponse[]): Promise<boolean> {
        const cachedItems = await this.get(key);
        if (!cachedItems || !items) {
            return true;
        }
        if (cachedItems.length !== items.length) {
            return true;
        }
        let differs: boolean = false;
        cachedItems.every((cachedItem) => {
            const matches = items.filter((item) => {
                return this.compareItems(cachedItem, item);
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

    protected getKeyPrefix(): string {
        return this.KEY_PREFIX;
    }

    private compareItems(cachedItem: models.AppResponse, item: models.AppResponse): boolean {
        const hashOfTheCachedObject = Md5.hashStr(JSON.stringify(cachedItem));
        const hashOfTheIncomingObject = Md5.hashStr(JSON.stringify(item));
        return hashOfTheCachedObject === hashOfTheIncomingObject;
    }
}
