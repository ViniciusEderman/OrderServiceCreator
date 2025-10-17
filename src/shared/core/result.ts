/*export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });*/

export class DomainError {
    public readonly code: string; 
    public readonly message: string;
    public readonly details?: Record<string, any>;

    constructor(code: string, message: string, details?: Record<string, any>) {
        this.code = code;
        this.message = message;
        this.details = details;
    }
}

export class InfraError {
  public readonly code: string;
  public readonly message: string;
  public readonly details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

export class Result<T, E = DomainError> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    private readonly _value?: T;
    private readonly _error?: E;

    private constructor(isSuccess: boolean, value?: T, error?: E) {
        if (isSuccess && error) {
            throw new Error("Result: success cannot have an error.");
        }
        if (!isSuccess && !error) {
            throw new Error("Result: failure must have an error.");
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this._value = value;
        this._error = error;
    }

    public getValue(): T {
        if (this.isFailure || this._value === undefined) {
            throw new Error("can't get the value of a failure result. Use isSuccess check first.");
        }
        return this._value;
    }

    public getError(): E {
        if (this.isSuccess || this._error === undefined) {
             throw new Error("can't get the error of a success result. Use isFailure check first.");
        }
        return this._error;
    }

    public static ok<U, F>(value: U): Result<U, F> {
        return new Result<U, F>(true, value);
    }

    public static fail<U, F>(error: F): Result<U, F> {
        return new Result<U, F>(false, undefined, error);
    }
}
