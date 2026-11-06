import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function runTerminalCommand(command: string): Promise<{
  stdout: string;
  stderr: string;
}> {
  const { stdout, stderr } = await execAsync(command, {
    maxBuffer: 10 * 1024 * 1024,
  });
  return { stdout, stderr };
}
