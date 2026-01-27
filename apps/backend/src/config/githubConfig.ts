import dotenv from "dotenv";
dotenv.config();
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
export const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "your-username";
export const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "psy-nexus-runs";
export const COMMIT_AUTHOR_NAME = process.env.COMMIT_AUTHOR_NAME || "Psy-Nexus Bot";
export const COMMIT_AUTHOR_EMAIL = process.env.COMMIT_AUTHOR_EMAIL || "bot@psy-nexus.ai";
export const BRANCH_NAME = process.env.BRANCH_NAME || "main";
export const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || "runs";
