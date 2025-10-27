import { container } from "tsyringe";

import { StoreRepository } from "@/domain/interfaces/store-repository";
import { IMessageBroker } from "@/domain/interfaces/message-broker";
import { Logger } from "@/domain/interfaces/logger";
import { CreateOrder } from "@/domain/order/application/use-cases/create-order";
import { PublisherOrder } from "@/domain/order/application/use-cases/publisher-order";
import { OrderOrchestrator } from "@/domain/order/application/use-cases/order-orchestrator";
import { UpdateOrderStatus } from "@/domain/order/application/use-cases/update-status-order";

import { WinstonLogger } from "@/infrastructure/logging/winston-logger";
import { Rabbit } from "@/infrastructure/rabbitmq/rabbit-mq-broker";
import { PrismaStoreRepository } from "@/infrastructure/repositories/prisma-store-repository";


container.registerSingleton<StoreRepository>(
  "StoreRepository",
  PrismaStoreRepository
);

container.registerSingleton<IMessageBroker>(
  "MessageBroker",
  Rabbit
);

container.registerSingleton<Logger>("Logger", WinstonLogger);

container.registerSingleton<PublisherOrder>(PublisherOrder);

container.registerSingleton<CreateOrder>(CreateOrder);

container.registerSingleton<UpdateOrderStatus>(UpdateOrderStatus);

container.registerSingleton<OrderOrchestrator>(OrderOrchestrator);
