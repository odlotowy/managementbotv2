import fs from "fs";
import path from "path";
import { command } from "./types";

const commands: command[] = [];

function loadCommands(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommands(filePath);
    } else if (
      (file.endsWith(".js") || file.endsWith(".ts")) &&
      !file.endsWith(".d.ts")
    ) {
      const commandModule = require(filePath);

      for (const key in commandModule) {
        commands.push(commandModule[key] as command);
      }
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

export { commands };
