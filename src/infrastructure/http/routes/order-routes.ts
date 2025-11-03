import { FastifyInstance } from "fastify";
import { CreateOrderController } from "@/infrastructure/http/controllers/create-order-controller";
import { UpdateOrderStatusController } from "@/infrastructure/http/controllers/update-order-status-controller";
import { ApiAuthPlugin } from "@/infrastructure/http/plugins/api-auth";
import { CreateOrderDocs, UpdateOrderStatusDocs } from "@/infrastructure/http/docs/index";

export async function orderRoutes(app: FastifyInstance) {
  app.post(
    "/create-order",
    {
      onRequest: [ApiAuthPlugin],
      schema: CreateOrderDocs,
    },
    CreateOrderController
  );

  app.patch(
    "/orders/:id/status",
    {
      onRequest: [ApiAuthPlugin],
      schema: UpdateOrderStatusDocs,
    },
    UpdateOrderStatusController
  );
}
