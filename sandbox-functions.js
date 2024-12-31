import { execSync } from "node:child_process";

define('memoryUsage', (_, { respond }) => {
  respond(process.memoryUsage.rss());
});

define('uptime', (_, { respond }) => {
  respond(execSync("uptime -p", { encoding: "utf8" }).trim());
});
