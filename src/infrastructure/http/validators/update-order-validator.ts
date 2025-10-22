import { z } from "zod";

export const UpdateOrderSchema = z.object({
  newStatus: z.enum(['pending', 'accepted', 'finished', 'canceled']),
});

export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;
