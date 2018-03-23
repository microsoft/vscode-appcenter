export class ProjectRootNotFoundError extends Error {
    constructor(message?: string) {
        let msg: string = 'No project root path found.';
        if (message) {
            msg = `${msg} ${message}`;
        }
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}