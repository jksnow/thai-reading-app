import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, "..", "scripts", "transliterate.py");

export async function getTransliteration(word: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execAsync(`py "${scriptPath}" "${word}"`);

    if (stderr) {
      console.error("Python script error:", stderr);
      return null;
    }

    return stdout.trim() || null;
  } catch (error) {
    console.error("Error in transliteration:", error);
    return null;
  }
}
