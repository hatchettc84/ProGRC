import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogArchiverService {
  private readonly logDir = path.resolve(__dirname, '../../logs');
  private readonly archiveDir = path.join(this.logDir, 'archives');
  private readonly logger = new Logger(LogArchiverService.name);

  constructor() {
    this.createDirectories();
  }

  private createDirectories() {
    if (!fs.existsSync(this.archiveDir)) {
      fs.mkdirSync(this.archiveDir, { recursive: true });
    }
  }

  @Cron('0 0 * * *')
  handleLogArchiving() {
    const gzFiles = fs.readdirSync(this.logDir).filter(file => file.endsWith('.gz'));
    gzFiles.forEach(file => {
      const sourcePath = path.join(this.logDir, file);
      const fileStat = fs.statSync(sourcePath);
      const archiveDate = new Date(fileStat.mtime).toISOString().split('T')[0];
      const archiveDayDir = path.join(this.archiveDir, archiveDate);
      if (!fs.existsSync(archiveDayDir)) {
        fs.mkdirSync(archiveDayDir, { recursive: true });
      }
      const targetPath = path.join(archiveDayDir, file);
      try {
        fs.renameSync(sourcePath, targetPath);
      } catch (error) {
        this.logger.error(`Error moving file ${file}: ${error.message}`);
      }
    });
  }
}
