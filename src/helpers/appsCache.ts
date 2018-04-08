import NodeCache = require("node-cache");
import { Md5 } from "ts-md5/dist/md5";
import { models } from "../appcenter/api";
import { AppCenterCache } from "./interfaces";

export class AppCenterAppsCache implements AppCenterCache<models.AppResponse[]> {

    private cache: NodeCache;
    private static instance: AppCenterAppsCache;

    private constructor() {
        this.cache = new NodeCache();
    }

    public static getInstance(): AppCenterCache<models.AppResponse[]> {
        if (!this.instance) {
            this.instance = new AppCenterAppsCache();
        }
        return this.instance;
    }

    public invalidateCache() {
        this.cache.flushAll();
    }

    public set(key: string, value: models.AppResponse[]) {
        this.cache.set(key, value);
    }

    public async get(key: string): Promise<models.AppResponse[] | null> {
        const self = this;
        return new Promise<models.AppResponse[] | null>((resolve, reject) => {
            self.cache.get<models.AppResponse[]>(key, function (err, value) {
                if (err) {
                    return reject(err);
                } else {
                    if (value) {
                        return resolve(value);
                    } else {
                        return resolve(null);
                    }
                }
            });
        });
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

    private compareItems(cachedItem: models.AppResponse, item: models.AppResponse): boolean {
        const hashOfTheCachedObject = Md5.hashStr(JSON.stringify(cachedItem));
        const hashOfTheIncomingObject = Md5.hashStr(JSON.stringify(item));
        return hashOfTheCachedObject === hashOfTheIncomingObject;
    }
}
