class LiveRunService {
    broadcast(data: any) {
        console.log("Broadcast:", JSON.stringify(data));
    }
    async startStreamingSimulation(runId: string, agentName: string) {
        console.log(`Simulation started for ${agentName} (${runId})`);
        return true;
    }
    getAllRunIds(): string[] {
        return [];
    }
    getConnectionCount(): number {
        return 0;
    }
}
export default new LiveRunService();
