import { FastifyInstance } from "fastify";
import { CreateOrderController } from "@/infrastructure/http/controllers/create-order-controller";
import { UpdateOrderStatusController } from "@/infrastructure/http/controllers/update-order-status-controller";
import { ApiAuthPlugin } from "@/infrastructure/http/plugins/api-auth";

export async function orderRoutes(app: FastifyInstance) {
  app.post(
    "/create-order",
    {
      onRequest: [ApiAuthPlugin],
      schema: {
        tags: ["Orders"],
        summary: "Create a new order",
        description: "Creates a new order with initial status",
        body: {
          type: "object",
          required: ["clientId", "status"],
          properties: {
            clientId: {
              type: "string",
              description: "UUID from client",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "finished", "canceled"],
              description: "initial order status",
            },
          },
        },
        response: {
          201: {
            description: "Order created successfully",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              clientId: { type: "string" },
              status: {
                type: "string",
                enum: ["pending", "accepted", "finished", "canceled"],
              },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          400: {
            description: "Invalid data payload",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    CreateOrderController
  );

  app.patch(
    "/orders/:id/status",
    {
      onRequest: [ApiAuthPlugin],
      schema: {
        tags: ["Orders"],
        summary: "Update order status",
        description: "Updates the status of an existing order",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "order id" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          required: ["newStatus"],
          properties: {
            newStatus: {
              type: "string",
              enum: ["pending", "accepted", "finished", "canceled"],
              description: "new status to order",
            },
          },
        },
        response: {
          200: {
            description: "Status updated successfully",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              clientId: { type: "string", format: "uuid" },
              currentStatus: { type: "string" },
              statusHistory: { type: "array" },
            },
          },
          400: {
            description: "Update error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            description: "Order not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    UpdateOrderStatusController
  );
}
