import { FastifyInstance } from "fastify";
import { CreateOrderController } from "@/infrastructure/http/controllers/create-order-controller";
import { UpdateOrderStatusController } from "@/infrastructure/http/controllers/update-order-status-controller";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/create-order", CreateOrderController);

  app.patch("/orders/:id/status", UpdateOrderStatusController);
}
