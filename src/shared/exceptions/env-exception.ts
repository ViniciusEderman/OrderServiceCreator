import { BaseException } from './base-exception';

export class EnvException extends BaseException {
    constructor(key: string) {
        super(`Missing environment variable: ${key}`, 500);
    }
}
