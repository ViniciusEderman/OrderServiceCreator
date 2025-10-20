import { container } from "tsyringe";
import { FastifyInstance } from "fastify";
import { CreateOrderController } from "@/infrastructure/http/controllers/create-order-controller";
import { UpdateOrderStatusController } from "@/infrastructure/http/controllers/update-order-status-controller";

export async function orderRoutes(app: FastifyInstance) {
  const controller = container.resolve(CreateOrderController);
  const updateController = container.resolve(UpdateOrderStatusController);

  app.post("/create-order", (req, reply) => controller.handle(req, reply));

  app.patch("/orders/:id/status", (req, reply) => updateController.handle(req, reply));
}
