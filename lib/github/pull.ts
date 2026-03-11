import simpleGit from "simple-git";
import logger from "@/lib/logger";

const git = simpleGit();

export const pullFromRemote = async (): Promise<{ success: boolean; summary?: string }> => {
  if (process.env.GITHUB_PULL_ENABLED !== "true") {
    return { success: false, summary: "Pull is disabled" };
  }

  try {
    const remote = process.env.GITHUB_REMOTE || "origin";
    const branch = process.env.GITHUB_BRANCH || "main";
    const result = await git.pull(remote, branch, ["--no-tags"]);

    logger.info({ result: result.summary }, "Git pull successful");
    return {
      success: true,
      summary: `Updated ${result.summary.changes} files, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`,
    };
  } catch (error) {
    logger.error({ error }, "Git pull failed");
    return { success: false, summary: String(error) };
  }
};
