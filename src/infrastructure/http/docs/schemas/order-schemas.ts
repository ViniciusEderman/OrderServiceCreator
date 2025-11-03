export const OrderSchemas = {
  orderId: {
    type: "string",
    format: "uuid",
    description: "Order ID"
  },
  clientId: {
    type: "string",
    format: "uuid", 
    description: "Client ID"
  },
  status: {
    type: "string",
    enum: ["pending", "accepted", "finished", "canceled"],
    description: "Order status"
  }
} as const;

export const OrderResponses = {
  201: {
    description: "Order created successfully",
    type: "object",
    properties: {
      id: OrderSchemas.orderId,
      clientId: OrderSchemas.clientId,
      status: OrderSchemas.status,
      createdAt: { type: "string", format: "date-time" }
    }
  },
  200: {
    description: "Status updated successfully",
    type: "object",
    properties: {
      id: OrderSchemas.orderId,
      clientId: OrderSchemas.clientId,
      currentStatus: OrderSchemas.status,
      statusHistory: { type: "array" }
    }
  },
  400: {
    description: "Invalid data",
    type: "object",
    properties: {
      error: { type: "string" }
    }
  },
  404: {
    description: "Order not found", 
    type: "object",
    properties: {
      error: { type: "string" }
    }
  }
} as const;
