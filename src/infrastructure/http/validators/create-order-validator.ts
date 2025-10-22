import { z } from "zod";

export const CreateOrderSchema = z.object({
  clientId: z.string().min(1, "clientId is required").describe("UUID for client"),
  status: z.enum(['pending', 'accepted', 'finished', 'canceled']).describe("status in order creation"),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
