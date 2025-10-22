import { Entity } from "@/shared/entities/entity";
import { Status } from "@/domain/order/enterprise/types/status";
import { UniqueEntityID } from "@/shared/entities/unique-entity-id";
import { Optional } from "@/shared/entities/optional";

export interface OrderProps {
  statusHistory: Array<{ status: Status; updatedAt: Date }>;
  clientId: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Order extends Entity<OrderProps> {
  get statusHistory() {
    return this.props.statusHistory;
  }

  get clientId() {
    return this.props.clientId;
  }

  get currentStatus(): Status {
    return this.props.statusHistory[this.props.statusHistory.length - 1].status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<OrderProps, "createdAt" | "updatedAt">,
    id?: UniqueEntityID
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || null,
      },
      id
    );

    return order;
  }

  public updateStatus(newStatus: Status) {
    if (this.currentStatus === newStatus) return;

    const now = new Date();
    this.props.statusHistory = [
      ...this.props.statusHistory,
      { status: newStatus, updatedAt: now },
    ];
    this.props.updatedAt = now;
  }
}
