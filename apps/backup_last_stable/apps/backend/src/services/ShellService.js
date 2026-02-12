"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const child_process_1 = require("child_process");
const LiveRunService_1 = __importDefault(require("./LiveRunService"));
const runCommand = (command, cwd) => {
    return new Promise((resolve, reject) => {
        LiveRunService_1.default.broadcast({ type: 'shell_output', command, output: 'Ausführung gestartet...' });
        (0, child_process_1.exec)(command, { cwd }, (error, stdout, stderr) => {
            const output = stdout || stderr || (error ? error.message : 'Abgeschlossen.');
            LiveRunService_1.default.broadcast({ type: 'shell_output', command, output });
            if (error)
                reject(error);
            else
                resolve(stdout);
        });
    });
};
exports.runCommand = runCommand;
