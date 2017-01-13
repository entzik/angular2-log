import { Headers, Http } from '@angular/http';
import { EventEmitter } from '@angular/core';
import { AsyncSubject, Subject } from 'rxjs/Rx';
import { RequestOptionsArgs } from '@angular/http/src/interfaces';

import { LogLevel, LevelNames } from './log-level';

const SERVER_LOG_ENDPOINT: string = '/api/webuilogbridge/v1/log';

export interface Notification {
    type: string;
    payload: any;
}

interface LogRequest {
    level: number,
    mesage: string
}

interface ServerLogRequest {
    application: string,
    lines: LogRequest[]
}

export class Logger {
    private logTopicSubject: EventEmitter<LogRequest> = null;
    serverSide: boolean = false;
    level: number = LogLevel.info;

    constructor(
        public name: string,
        private http: Http
    ) {
        this.logTopicSubject = new EventEmitter<LogRequest>(true);
        this.logTopicSubject.asObservable().bufferTime(1000).subscribe((payload: LogRequest[]) => {
            payload.forEach((request: LogRequest) => {
                let t = [];
                switch (request.level) {
                    case LogLevel.debug: {
                        t.push(...["%s | %cDebug: ", this.name, "color:green"]);
                    } break;

                    case LogLevel.warn: {
                        t.push(...["%s | %cWarning: ", this.name, "color:orange"]);
                    } break;

                    case LogLevel.info: {
                        t.push(...["%s | %cInfo: ", this.name, "color:blue"]);
                    } break;

                    case LogLevel.error: {
                        t.push(...["%s | %cError: ", this.name, "color:red"]);
                    } break;
                }
                t.push(request.mesage);
                console.log.apply(console, t);
            });
            if (this.serverSide) {
                let jwt: string = sessionStorage.getItem('jwt');
                let application: string = sessionStorage.getItem('application-name');

                let headers: Headers = new Headers();
                headers.append('Authorization', `Bearer jwt` + jwt);
                let reqOptions: RequestOptionsArgs = <RequestOptionsArgs>{
                    headers: headers,
                };
                this.http.post(SERVER_LOG_ENDPOINT, JSON.stringify(<ServerLogRequest>{
                    application: application,
                    lines: payload,
                }), reqOptions);
            }

        })
    }

    public closePublication() {
        this.logTopicSubject.complete();
    }

    public getLevelName(): string {
        return LevelNames[this.level];
    }

    onServiceNotification(notif: Notification) {
        if (notif.type === 'LEVEL') {
            this.level = LogLevel[notif.payload];
        } else if (notif.type === 'SERVER_SIDE') {
            this.serverSide = notif.payload;
        }
    };

    debug(contentProvider: () => string) {
        if (this.level > LogLevel.debug) {
            return;
        } else
            this.logTopicSubject.emit(<LogRequest>{
                level: LogLevel.debug,
                mesage: contentProvider()
            })
    }

    info(contentProvider: () => string) {
        if (this.level > LogLevel.info) {
            return;
        } else
            this.logTopicSubject.emit(<LogRequest>{
                level: LogLevel.info,
                mesage: contentProvider()
            })
    }

    warn(contentProvider: () => string) {
        if (this.level > LogLevel.warn) {
            return;
        } else
            this.logTopicSubject.emit(<LogRequest>{
                level: LogLevel.warn,
                mesage: contentProvider()
            })
    }

    error(contentProvider: () => string) {
        if (this.level > LogLevel.error) {
            return;
        } else
            this.logTopicSubject.emit(<LogRequest>{
                level: LogLevel.error,
                mesage: contentProvider()
            })
    }
}
