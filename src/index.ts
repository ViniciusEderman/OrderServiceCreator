import "reflect-metadata";
import { env } from "@/infrastructure/config/env";
import { createServer } from "@/infrastructure/http/http-server";
import "@/shared/container/container";

async function bootstrap() {
  try {
    const app = await createServer();

    await app.listen({ port: Number(env.PORT) || 3000, host: "0.0.0.0" });
    console.log(`server running at http://localhost:${env.PORT || 3000}`);

  } 
  catch (err) {
    console.error("failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
