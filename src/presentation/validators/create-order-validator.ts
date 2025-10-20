import { z } from "zod";
import { Status } from "@/domain/order/enterprise/types/status";

export const CreateOrderSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  status: z.custom<Status>((val) => {
    return val === "pending" || val === "accepted" || val === "rejected";
  }),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
