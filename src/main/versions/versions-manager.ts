import path from 'path';

import { VersionsInfo } from '@common/types';

import { getCurrentPythonLibVersion, getLatestPythonLibVersion } from '@/utils';
import logger from '@/logger';
import { Store } from '@/store';
import { EventManager } from '@/events';
import { getElectronApp, isDev } from '@/app';

export class VersionsManager {
  private readonly checkInterval = 10 * 60 * 1000; // 10 minutes
  private intervalId: NodeJS.Timeout | null = null;
  private versionsInfo: VersionsInfo | null = null;

  constructor(
    private readonly eventManager: EventManager,
    private readonly store: Store,
  ) {
    this.init().catch((error) => {
      logger.error('Failed to initialize VersionsManager', { error });
    });
  }

  async getVersions(forceRefresh = false): Promise<VersionsInfo> {
    if (!forceRefresh && this.versionsInfo) {
      return this.versionsInfo;
    }
    const app = getElectronApp();
    if (!app) {
      logger.info('Electron app not available, returning cached versions info.');
      return {
        ...this.versionsInfo,
      };
    }

    logger.info('Checking for version updates...');
    // Get Reactor version using app.getVersion()
    const reactorCurrentVersion = app.getVersion();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const autoUpdater = require('electron-updater').autoUpdater;

    // Get current and available Aider versions using utility functions
    const aiderCurrentVersion = await getCurrentPythonLibVersion('aider-chat');
    const aiderAvailableVersion = await getLatestPythonLibVersion('aider-chat');

    let reactorAvailableVersion: string | null = null;
    let releaseNotes: string | null = null;
    if (!reactorCurrentVersion.endsWith('-dev') && !this.versionsInfo?.reactorNewVersionReady && !this.versionsInfo?.reactorDownloadProgress) {
      try {
        const result = await autoUpdater.checkForUpdates();
        if (result && result.updateInfo.version !== reactorCurrentVersion) {
          reactorAvailableVersion = result.updateInfo.version;
          releaseNotes = result.updateInfo.releaseNotes as string | null;
        } else {
          reactorAvailableVersion = null;
          releaseNotes = null;
        }
      } catch (error) {
        if (error instanceof Error) {
          // Don't show error box for this common case
          if (error.message !== 'No published versions on GitHub') {
            reactorAvailableVersion = null;
          }
        }
        logger.error('Failed to check for Reactor updates', { error });
      }

      // Check if auto-update is enabled and a new version was found
      if (reactorAvailableVersion && this.store.getSettings().reactorAutoUpdate) {
        logger.info('Auto-update enabled and new version found. Starting download...');
        void this.downloadLatestReactor();
      }
    }

    this.updateVersionsInfo({
      reactorCurrentVersion,
      aiderCurrentVersion,
      aiderAvailableVersion,
      reactorAvailableVersion,
      releaseNotes,
    });

    return this.versionsInfo!; // versionsInfo is guaranteed to be non-null after updateVersionsInfo
  }

  private updateVersionsInfo(partialInfo: Partial<VersionsInfo>): void {
    this.versionsInfo = {
      ...this.versionsInfo,
      ...partialInfo,
    };
    this.eventManager.sendVersionsInfoUpdated(this.versionsInfo);
  }

  private async init(): Promise<void> {
    const app = getElectronApp();
    if (!app) {
      logger.info('Skipping versions manager initialization in non-Electron environment');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const autoUpdater = require('electron-updater').autoUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true; // Install on quit after download
    if (isDev()) {
      autoUpdater.forceDevUpdateConfig = true;
      process.env.APPIMAGE = path.join(__dirname, 'dist', `reactor-${app.getVersion()}.AppImage`);
    }

    autoUpdater.on('download-progress', (progressObj) => {
      logger.debug('[AutoUpdater] Update download progress', {
        progress: progressObj.percent,
      });

      this.updateVersionsInfo({
        reactorDownloadProgress: Math.max(0, Math.min(100, progressObj.percent)),
      });
    });

    autoUpdater.on('update-downloaded', (event) => {
      logger.info('[AutoUpdater] Update downloaded', { event });
      this.updateVersionsInfo({
        reactorNewVersionReady: true,
        reactorAvailableVersion: undefined,
        reactorDownloadProgress: undefined,
      });

      if (event.releaseNotes) {
        this.store.setReleaseNotes(event.releaseNotes as string);
      }
    });

    autoUpdater.on('error', (error) => {
      logger.error('[AutoUpdater] Error during update process', { error });
      this.updateVersionsInfo({
        reactorDownloadProgress: undefined,
      });
    });

    // Schedule periodic checks
    this.intervalId = setInterval(async () => {
      try {
        await this.getVersions(true);
      } catch (error) {
        logger.error('Failed to fetch versions periodically', { error });
      }
    }, this.checkInterval);

    // Initial check
    await this.getVersions(true);
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Stopped periodic version checks.');
    }
  }

  public async downloadLatestReactor(): Promise<void> {
    const app = getElectronApp();
    if (!app) {
      logger.info('Electron app not available, skipping Reactor update download.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const autoUpdater = require('electron-updater').autoUpdater;

    logger.info('Starting Reactor update download...');
    try {
      // Check for updates first to ensure we have the latest info
      const updateCheckResult = await autoUpdater.checkForUpdates();
      if (updateCheckResult && updateCheckResult.updateInfo) {
        logger.info(`Update available: ${updateCheckResult.updateInfo.version}. Downloading...`);
        // Set autoDownload to true temporarily for this download action
        autoUpdater.autoDownload = true;
        await autoUpdater.downloadUpdate();
        logger.info('Update download initiated.');
        // Reset autoDownload back to false after initiating
        autoUpdater.autoDownload = false;
      } else {
        logger.info('No new update found or update check failed.');
      }
    } catch (error) {
      logger.error('Failed to download Reactor update', { error });
      this.updateVersionsInfo({
        reactorDownloadProgress: undefined,
      });
      autoUpdater.autoDownload = false; // Ensure it's reset on error
    }
  }
}
