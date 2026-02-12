"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARTIFACTS_DIR = exports.BRANCH_NAME = exports.COMMIT_AUTHOR_EMAIL = exports.COMMIT_AUTHOR_NAME = exports.GITHUB_REPO_NAME = exports.GITHUB_REPO_OWNER = exports.GITHUB_TOKEN = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
exports.GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "your-username";
exports.GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "psy-nexus-runs";
exports.COMMIT_AUTHOR_NAME = process.env.COMMIT_AUTHOR_NAME || "Psy-Nexus Bot";
exports.COMMIT_AUTHOR_EMAIL = process.env.COMMIT_AUTHOR_EMAIL || "bot@psy-nexus.ai";
exports.BRANCH_NAME = process.env.BRANCH_NAME || "main";
exports.ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || "runs";
