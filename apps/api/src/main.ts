import { buildApp } from "./app";
import { buildContainer } from "./container";
import { getPrisma } from "./infrastructure/prisma";

const port = Number(process.env.PORT ?? 3000);
const app = buildApp(buildContainer(getPrisma()));
app.listen(port);
// eslint-disable-next-line no-console
console.log(`API listening on http://localhost:${port}`);
