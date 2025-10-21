import { Status } from "@/domain/order/enterprise/types/status";
import { z } from "zod";

export const UpdateOrderSchema = z.object({
  newStatus: z.custom<Status>((val) => {
    return val === "pending" || val === "accepted" || val === "rejected";
  }),
});

export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;
