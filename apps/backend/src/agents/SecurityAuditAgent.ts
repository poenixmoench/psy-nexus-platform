import { BaseAgent } from './BaseAgent'

export class SecurityAuditAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    await this.updateProgress(1, 20)
    const securityPrompt = `Du bist Expert Security Auditor mit OWASP Top 10 Knowledge. Führe umfassendes Security Audit durch. Checke: 1) SQL Injection, 2) XSS, 3) CSRF, 4) Auth Issues, 5) Data Exposure, 6) Dependencies, 7) Input Validation, 8) Crypto Issues. Für jedes Issue: Severity, Description, PoC, Fix.\n\nCode:\n${prompt}`
    await this.updateProgress(2, 50)
    const auditReport = await this.callOllama(securityPrompt, 0.2)
    await this.updateProgress(3, 75)
    return `SECURITY_AUDIT:\n${auditReport}`
  }
}
