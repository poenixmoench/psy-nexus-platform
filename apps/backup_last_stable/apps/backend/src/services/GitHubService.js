"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
const githubConfig_1 = require("../config/githubConfig");
class GitHubService {
    constructor() {
        this.octokit = null;
        this.maxRetries = 3;
        this.isEnabled = false;
        if (!githubConfig_1.GITHUB_TOKEN || !githubConfig_1.GITHUB_REPO_OWNER || !githubConfig_1.GITHUB_REPO_NAME) {
            console.warn("⚠️ GitHubService: Token/Owner/Repo not set.");
            return;
        }
        this.octokit = new rest_1.Octokit({ auth: githubConfig_1.GITHUB_TOKEN });
        this.isEnabled = true;
        console.log(" [OK]  GitHubService initialized");
    }
    static getInstance() {
        if (!GitHubService.instance) {
            GitHubService.instance = new GitHubService();
        }
        return GitHubService.instance;
    }
    async pushRunResults(runId, status) {
        if (!this.isEnabled || !this.octokit) {
            console.warn(`[${runId}] GitHub not enabled.`);
            return { success: false, commitSha: "", url: "" };
        }
        const files = this.formatArtifactFiles(runId, status);
        const totalAgents = status.results.length;
        const totalTokens = status.totalTokens || 0;
        const message = `Run ${runId}: ${totalAgents} agents, ${totalTokens} tokens, status: completed`;
        let lastError = "";
        let lastSha = "";
        let lastUrl = "";
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${this.maxRetries}...`);
                const refResponse = await this.octokit.git.getRef({
                    owner: githubConfig_1.GITHUB_REPO_OWNER,
                    repo: githubConfig_1.GITHUB_REPO_NAME,
                    ref: `heads/${githubConfig_1.BRANCH_NAME}`,
                });
                const parentCommitSha = refResponse.data.object.sha;
                const currentCommit = await this.octokit.git.getCommit({
                    owner: githubConfig_1.GITHUB_REPO_OWNER,
                    repo: githubConfig_1.GITHUB_REPO_NAME,
                    commit_sha: parentCommitSha,
                });
                const treeItems = [];
                for (const file of files) {
                    const blob = await this.octokit.git.createBlob({
                        owner: githubConfig_1.GITHUB_REPO_OWNER,
                        repo: githubConfig_1.GITHUB_REPO_NAME,
                        content: Buffer.from(file.content).toString("base64"),
                        encoding: "base64",
                    });
                    treeItems.push({
                        path: file.path,
                        mode: "100644",
                        type: "blob",
                        sha: blob.data.sha,
                    });
                }
                const tree = await this.octokit.git.createTree({
                    owner: githubConfig_1.GITHUB_REPO_OWNER,
                    repo: githubConfig_1.GITHUB_REPO_NAME,
                    tree: treeItems,
                    base_tree: currentCommit.data.tree.sha,
                });
                const commit = await this.octokit.git.createCommit({
                    owner: githubConfig_1.GITHUB_REPO_OWNER,
                    repo: githubConfig_1.GITHUB_REPO_NAME,
                    message: message,
                    tree: tree.data.sha,
                    parents: [parentCommitSha],
                    author: { name: githubConfig_1.COMMIT_AUTHOR_NAME, email: githubConfig_1.COMMIT_AUTHOR_EMAIL },
                    committer: { name: githubConfig_1.COMMIT_AUTHOR_NAME, email: githubConfig_1.COMMIT_AUTHOR_EMAIL },
                });
                await this.octokit.git.updateRef({
                    owner: githubConfig_1.GITHUB_REPO_OWNER,
                    repo: githubConfig_1.GITHUB_REPO_NAME,
                    ref: `heads/${githubConfig_1.BRANCH_NAME}`,
                    sha: commit.data.sha,
                });
                lastSha = commit.data.sha;
                lastUrl = `https://github.com/${githubConfig_1.GITHUB_REPO_OWNER}/${githubConfig_1.GITHUB_REPO_NAME}/commit/${commit.data.sha}`;
                console.log(`Success! SHA: ${lastSha.substring(0, 8)}`);
                return { success: true, commitSha: lastSha, url: lastUrl };
            }
            catch (error) {
                lastError = error.message || String(error);
                console.error(`Attempt ${attempt} failed: ${lastError}`);
                if (attempt < this.maxRetries) {
                    await new Promise(r => setTimeout(r, attempt * 2000));
                }
            }
        }
        console.error(`GitHub failed after ${this.maxRetries} attempts`);
        return { success: false, commitSha: lastSha, url: lastUrl };
    }
    formatArtifactFiles(runId, status) {
        const files = [];
        const runFolder = `${githubConfig_1.ARTIFACTS_DIR}/${runId}`;
        const metadata = { runId, status: status.status, startTime: status.startTime, endTime: status.endTime, totalTokens: status.totalTokens, agentCount: status.results.length, timestamp: new Date().toISOString() };
        files.push({ path: `${runFolder}/metadata.json`, content: JSON.stringify(metadata, null, 2) });
        files.push({ path: `${runFolder}/workflow.json`, content: JSON.stringify(status, null, 2) });
        status.results.forEach((result) => {
            const stepIndex = String(result.step).padStart(3, "0");
            const agentSlug = result.agent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const stepContent = `# Step ${result.step}: ${result.agent}\n\n**Role:** ${result.role}\n**Model:** ${result.llmModel}\n**Tokens:** ${result.tokens}\n**Response Time:** ${result.responseTime}ms\n\n## Output\n\n\`\`\`\n${result.output}\n\`\`\`\n`;
            files.push({ path: `${runFolder}/step-${stepIndex}-${agentSlug}.md`, content: stepContent });
        });
        return files;
    }
}
exports.GitHubService = GitHubService;
