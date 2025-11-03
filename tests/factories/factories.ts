import { vi, Mock } from "vitest";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { Logger } from "@/domain/interfaces/logger";
import { Status } from "@/domain/order/enterprise/types/status";
import { Order, OrderProps } from "@/domain/order/enterprise/entities/order";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";
import { InMemoryStoreRepository } from "@/mocks/in-memory-store-repository";
import { UniqueEntityID } from "@/shared/entities/unique-entity-id";

interface UseCaseMock {
  execute: Mock;
}

interface PublisherMock {
  publish: Mock;
}

export const generateValidClientId = (): string => {
  return "83f87c4f-5480-41f4-84e7-b624284c272c";
};

export const makeFakeOrderDto = (overrides?: any) => {
  return {
    id: "ad6409b3-0c27",
    clientId: generateValidClientId(),
    status: "pending" as Status,
    ...overrides,
  };
};

export const makeOrder = (overrides?: Partial<OrderProps> & { id?: string }): Order => {
  const defaultProps: OrderProps = {
    clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
    statusHistory: [
      {
        status: "pending" as Status,
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: null,
    ...overrides
  };

  const id = overrides?.id ? new UniqueEntityID(overrides.id) : undefined;
  return Order.create(defaultProps, id);
};

export const makeFakeLogger = (): Logger => {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
};

export const makeCreateOrder = () => {
  const fakeLogger = makeFakeLogger();
  const storeRepository = new InMemoryStoreRepository(fakeLogger);
  const createOrderUseCase = new CreateOrder(storeRepository, fakeLogger);

  return {
    sut: createOrderUseCase,
    dependencies: {
      storeRepository,
      fakeLogger,
    },
  };
};

export const makeFakeMessageBroker = (): IMessageBroker => {
  return {
    connect: vi.fn(),
    close: vi.fn(),
    publish: vi.fn(),
  };
};

export const makePublisherOrder = () => {
  const fakeLogger = makeFakeLogger();
  const fakeMessageBroker = makeFakeMessageBroker();

  const publisher = new PublisherOrder(fakeLogger, fakeMessageBroker as any);

  return {
    sut: publisher,
    dependencies: {
      fakeLogger,
      fakeMessageBroker,
    },
  };
};

export const makeUpdateOrderStatus = () => {
  const fakeLogger = makeFakeLogger();
  const storeRepository = new InMemoryStoreRepository(fakeLogger);
  const updateOrderStatusUseCase = new UpdateOrderStatus(
    storeRepository,
    fakeLogger
  );

  return {
    sut: updateOrderStatusUseCase,
    dependencies: {
      storeRepository,
      fakeLogger,
    },
  };
};

export const makeOrderOrchestrator = () => {
  const mockLogger = makeFakeLogger();
  const mockCreateOrder: UseCaseMock = { execute: vi.fn() };
  const mockPublisherOrder: PublisherMock = { publish: vi.fn() };
  const mockUpdateOrder: UseCaseMock = { execute: vi.fn() };

  const sut = new OrderOrchestrator(
    mockLogger as any,
    mockCreateOrder as any,
    mockPublisherOrder as any,
    mockUpdateOrder as any
  );

  return {
    sut,
    dependencies: {
      mockLogger,
      mockCreateOrder,
      mockPublisherOrder,
      mockUpdateOrder,
    },
  };
};
