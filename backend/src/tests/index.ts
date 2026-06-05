import "./analyzer.test";
import { runRouteTests } from "./routes.test";

runRouteTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
