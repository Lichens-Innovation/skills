import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";

/** Config file at project root (repo where the PR is created). */
const CONFIG_FILENAME = "skills-configs.json";

/** Keys that can be prompted interactively when missing. Prompt message per key. */
const PROMPTS = {
  tasksManagerSystemBaseUrl: "Tasks manager base URL (e.g. https://your-company.atlassian.net): ",
};

/**
 * Prompt the user for a value via stdin.
 * @param {string} message
 * @returns {Promise<string>}
 */
const prompt = (message) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((fulfill) => {
    rl.question(message, (answer) => {
      rl.close();
      fulfill((answer ?? "").trim());
    });
  });
};

/**
 * Load skills-configs.json; create file if missing. For any key in PROMPTS that
 * is missing or empty, ask the user and persist. Returns the full config object.
 * @param {string} [projectRoot]
 * @returns {Promise<Record<string, string>>} All config entries (key/value)
 */
export const getConfigs = async (projectRoot = process.cwd()) => {
  const configPath = join(projectRoot, CONFIG_FILENAME);
  /** @type {Record<string, string>} */
  let config = {};

  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf8");
      const parsed = JSON.parse(raw);
      config = { ...(parsed ?? {}) };
    } catch {
      config = {};
    }
  }

  let changed = false;
  for (const [key, message] of Object.entries(PROMPTS)) {
    if (!config[key]) {
      const answer = await prompt(message);
      if (answer) {
        config[key] = answer.trim();
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
  }

  return config;
};

/**
 * Convenience: return only tasksManagerSystemBaseUrl (used in step 6).
 * @returns {Promise<string|null>}
 */
export const getTasksManagerSystemBaseUrl = async () => {
  const configs = await getConfigs();
  return configs.tasksManagerSystemBaseUrl ?? null;
};

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  getConfigs()
    .then((configs) => {
      process.stdout.write(JSON.stringify(configs));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
