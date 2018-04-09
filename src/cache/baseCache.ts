import NodeCache = require("node-cache");

export abstract class AppCenterCache<T> {

    protected cache: NodeCache;

    public invalidateCache() {
        this.cache.flushAll();
    }

    public set(key: string, value: T) {
        this.cache.set(key + this.getKeyPrefix(), value);
    }

    public async get(key: string): Promise<T | null> {
        const self = this;
        key = key + this.getKeyPrefix();
        return new Promise<T | null>((resolve, reject) => {
            self.cache.get<T>(key, function (err, value) {
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

    public abstract async cacheDiffersFrom(key: string, items: T): Promise<boolean>;

    protected abstract getKeyPrefix(): string;
}
