import { injectable, container } from "tsyringe";
import { QwenClient } from "./QwenClient";

@injectable()
export class LLMFactory {
  getClient() {
    // Wir lassen den Container die Instanz mit Logger auflösen
    return container.resolve(QwenClient);
  }
}
