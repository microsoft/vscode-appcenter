export class Validators {
    public static ValidateAppCenterAppName(name: string): boolean {
        if (name.trim().length === 0) {
            return false;
        }
        if (name === 'React') {
            // exceptional case
            return false;
        }
        return true;
    }

    public static ValidateProjectName(name: string): boolean {
        if (!String(name).match(/^[$A-Z_][-0-9A-Z_$]*$/i)) {
            return false;
        }
        if (name === 'React') {
            // exceptional case
            return false;
        }
        return true;
    }

    public static ValidGitName(name: string): boolean {
        if (!name) {
            return false;
        }
        const regex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;
        return regex.test(name);
    }
}
