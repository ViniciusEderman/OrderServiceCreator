import { OrderSchemas, OrderResponses } from "@/infrastructure/http/docs/schemas/order-schemas";

export const CreateOrderDocs = {
  tags: ["Orders"],
  summary: "Create a new order",
  description: "Creates a new order with initial status",
  body: {
    type: "object",
    required: ["clientId", "status"],
    properties: {
      clientId: OrderSchemas.clientId,
      status: OrderSchemas.status
    }
  },
  response: {
    201: OrderResponses[201],
    400: OrderResponses[400]
  }
} as const;
