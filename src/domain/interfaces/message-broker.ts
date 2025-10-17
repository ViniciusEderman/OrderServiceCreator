import { DomainError, Result } from "@/shared/core/result";

export interface IMessageBroker {
  connect(): Promise<void>;
  publish(queue: string, message: any): Promise<Result<void, DomainError>>;
  close(): Promise<void>;
}
