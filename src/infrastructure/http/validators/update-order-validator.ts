import { z } from "zod";

export const UpdateOrderSchema = z.object({
  newStatus: z.enum(['pending', 'accepted', 'finished', 'canceled']).describe("new status - based on an existing order"),
});

export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;
