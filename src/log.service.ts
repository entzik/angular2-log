import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Logger, Notification } from './logger';

import { Subject } from 'rxjs/Rx'
import { LogLevel } from './log-level';
import { LogServiceConsoleAdmin } from './log-service-consol-admin'

@Injectable()
export class LogService {

  loggers: Map<string, Logger> = null;

  private _serviceNotification: Subject<any> = null;

  constructor(private http:Http) {
    this.loggers = new Map<string, Logger>();
    this._serviceNotification = new Subject();
    window['logAdmin'] = new LogServiceConsoleAdmin(this);
    window['logLevel'] = LogLevel;
  }


  set level(level: string) {
    this._serviceNotification.next({ type: 'LEVEL', payload: level });
  }

  set serverSide(serverSide:boolean) {
    this._serviceNotification.next({ type: 'SERVER_SIDE', payload: serverSide });
  }

  private openLogger(loggerName: string): Logger {
    var existingLogger = this.loggers.get(loggerName);
    if (!existingLogger) {
      existingLogger = new Logger(loggerName, this.http);
      this.loggers.set(loggerName, existingLogger);
      this._serviceNotification.subscribe(
        notif => {
          existingLogger.onServiceNotification(notif);
        });
    }

    return existingLogger;
  }

  private closeLogger(loggerName: string) {
    var existingLogger = this.loggers.get(loggerName);
    if (existingLogger) {
      this.loggers.delete(loggerName);
      existingLogger.closePublication();
    }

    return existingLogger;
  }

  /**
   * Redirect log to a given logger.
   *
   * If the asked logger does not yet exists it will be created
   *
   * @param  {string} loggerName
   * @return {Logger}
   */
  public to(loggerName: string): Logger {
    if (this.loggers.has(loggerName)) {
      return this.loggers.get(loggerName);
    } else {
      return this.openLogger(loggerName);
    }
  }
}
