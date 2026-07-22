import * as fs from 'fs';
import { injectable } from 'tsyringe';

@injectable()
export class Logger {
  public log(msg: string, ...args: any[]) { console.log(`[LOG] ${msg}`, ...args); }
  public info(msg: string, ...args: any[]) { console.info(`[INFO] ${msg}`, ...args); }
  public warn(msg: string, ...args: any[]) { console.warn(`[WARN] ${msg}`, ...args); }
  public error(msg: string, ...args: any[]) { console.error(`[ERR] ${msg}`, ...args); }
}

const loggerInstance = new Logger();
export default loggerInstance;
