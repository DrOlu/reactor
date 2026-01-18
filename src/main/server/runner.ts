import { normalizeBaseDir } from '@common/utils';
import { ProjectData } from '@common/types';

import logger from '@/logger';
import { initManagers } from '@/managers';
import { performStartUp } from '@/start-up';
import { Store } from '@/store';
import { REACTOR_DATA_DIR } from '@/constants';
import { getDefaultProjectSettings } from '@/utils';
import { ModelManager } from '@/models';
import { AgentProfileManager } from '@/agent';

export const addProjectsFromEnv = async (store: Store, modelManager: ModelManager, agentProfileManager: AgentProfileManager): Promise<void> => {
  const reactorProjectsEnv = process.env.REACTOR_PROJECTS;
  if (!reactorProjectsEnv) {
    return;
  }

  const projectPaths = reactorProjectsEnv
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (projectPaths.length === 0) {
    return;
  }

  logger.info('REACTOR_PROJECTS environment variable found', { projectPaths });

  const openProjects = store.getOpenProjects();

  // Create all projects from the env var
  const projectsFromEnv: ProjectData[] = [];

  for (const projectPath of projectPaths) {
    logger.info('Creating project from REACTOR_PROJECTS', {
      projectPath,
    });

    const providerModels = await modelManager.getProviderModels();
    const defaultAgentProfileId = agentProfileManager.getDefaultAgentProfileId();

    const newProject: ProjectData = {
      baseDir: projectPath.endsWith('/') ? projectPath.slice(0, -1) : projectPath,
      settings: getDefaultProjectSettings(store, providerModels.models || [], projectPath, defaultAgentProfileId),
      active: false,
    };

    projectsFromEnv.push(newProject);
  }

  // Override open projects with the ones from env var
  if (projectsFromEnv.length > 0) {
    // Preserve active state from existing projects if they match
    const normalizedOpenProjects = openProjects.map((p) => normalizeBaseDir(p.baseDir));

    projectsFromEnv.forEach((project) => {
      const normalizedPath = normalizeBaseDir(project.baseDir);
      const existingIndex = normalizedOpenProjects.indexOf(normalizedPath);
      if (existingIndex >= 0) {
        project.active = openProjects[existingIndex].active;
      }
    });

    // Set the first project as active if none are active
    if (!projectsFromEnv.some((p) => p.active)) {
      projectsFromEnv[0].active = true;
    }

    store.setOpenProjects(projectsFromEnv);
    logger.info(`Overridden open projects with ${projectsFromEnv.length} project(s) from REACTOR_PROJECTS`);
  }
};

const main = async (): Promise<void> => {
  // Force headless mode for node-runner
  if (!process.env.REACTOR_HEADLESS) {
    process.env.REACTOR_HEADLESS = 'true';
  }

  logger.info('------------ Starting Reactor Node Runner... ------------');

  const updateProgress = ({ step, message, info, progress }: { step: string; message: string; info?: string; progress?: number }) => {
    logger.info(`[${step}] ${message}${info ? ` (${info})` : ''}${progress !== undefined ? ` [${Math.round(progress)}%]` : ''}`);
  };

  try {
    await performStartUp(updateProgress);
    logger.info('Startup complete');

    const store = new Store();
    await store.init(REACTOR_DATA_DIR);

    // Initialize managers first
    const { modelManager, agentProfileManager } = await initManagers(store);

    // Check for REACTOR_PROJECTS environment variable and add projects
    await addProjectsFromEnv(store, modelManager, agentProfileManager);

    logger.info('Reactor Node Runner is ready!');
    logger.info('API server is running. You can now interact with Reactor via HTTP API or Socket.IO clients.');
  } catch (error) {
    logger.error('Failed to start Reactor Node Runner:', error);
    process.exit(1);
  }
};

// Only run main if this file is being executed directly (not imported for testing)
if (!process.env.VITEST) {
  main().catch((error) => {
    logger.error('Unhandled error in main:', error);
    process.exit(1);
  });
}
