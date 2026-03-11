import simpleGit from "simple-git";
import logger from "@/lib/logger";

const git = simpleGit();

export const commitAndPush = async (message: string, files: string[] = ["content/"]): Promise<boolean> => {
  if (process.env.GITHUB_AUTO_COMMIT !== "true") return false;

  try {
    for (const file of files) {
      await git.add(file);
    }

    const status = await git.status();
    if (!status.staged.length) {
      logger.debug("No changes to commit");
      return false;
    }

    const prefix = process.env.GITHUB_COMMIT_PREFIX || "content:";
    await git.commit(`${prefix} ${message}`);

    const remote = process.env.GITHUB_REMOTE || "origin";
    const branch = process.env.GITHUB_BRANCH || "main";
    await git.push(remote, branch);

    logger.info({ message, files }, "Git commit and push successful");
    return true;
  } catch (error) {
    logger.error({ error, message }, "Git commit/push failed");
    return false;
  }
};
