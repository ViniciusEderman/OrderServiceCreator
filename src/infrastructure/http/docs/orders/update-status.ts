import { OrderSchemas, OrderResponses } from "@/infrastructure/http/docs/schemas/order-schemas";

export const UpdateOrderStatusDocs = {
  tags: ["Orders"],
  summary: "Update order status", 
  description: "Updates the status of an existing order",
  params: {
    type: "object",
    properties: {
      id: OrderSchemas.orderId
    },
    required: ["id"]
  },
  body: {
    type: "object", 
    required: ["newStatus"],
    properties: {
      newStatus: OrderSchemas.status
    }
  },
  response: {
    200: OrderResponses[200],
    400: OrderResponses[400],
    404: OrderResponses[404]
  }
} as const;