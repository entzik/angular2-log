import { LogService } from './log.service';
import { Logger, Notification } from './logger';

export class LogServiceConsoleAdmin {
    constructor(
        private logService: LogService
    ) {
    }

    public showLoggers(): void {
        console.log('active loggers')
        console.log('==============')
        let it: IterableIterator<Logger> = this.logService.loggers.values();
        let ir: IteratorResult<Logger> = it.next();
        while (!ir.done) {
            let logger: Logger = ir.value;
            console.log(logger.name + ' => Level = ' + logger.levelName + ', serverSide = ' + logger.serverSide);

            ir = it.next();
        }
        console.log('==============')
    }

    public setLogLevel(loggerName: string, level: number) {
        this.logService.to(loggerName).level = level;
        this.showLoggers();
    }
}