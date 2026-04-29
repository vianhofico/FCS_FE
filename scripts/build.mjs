import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

const typecheckCode = await run("npx", ["tsc", "-p", "tsconfig.json", "--noEmit", "--pretty", "false"]);
if (typecheckCode !== 0) process.exit(typecheckCode);

const buildCode = await run("npx", ["vite", "build"]);
process.exit(buildCode);
