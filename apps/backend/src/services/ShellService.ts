import { exec } from 'child_process';
import LiveRunService from './LiveRunService';

export const runCommand = (command: string, cwd?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        LiveRunService.broadcast({ type: 'shell_output', command, output: 'Ausführung gestartet...' });
        
        exec(command, { cwd }, (error, stdout, stderr) => {
            const output = stdout || stderr || (error ? error.message : 'Abgeschlossen.');
            LiveRunService.broadcast({ type: 'shell_output', command, output });
            
            if (error) reject(error);
            else resolve(stdout);
        });
    });
};
