---
title: "Running Reactor with Docker"
sidebar_label: "Docker"
---

# Running Reactor with Docker

Reactor provides a Docker image that allows you to run the application in headless mode and interact with it through your web browser. This is particularly useful for:
- Running Reactor on a remote server
- Containerizing your development environment
- Deploying Reactor in cloud environments
- Running multiple isolated instances

## Quick Start

### Pull and Run

The Docker image is published to the GitHub Container Registry (ghcr.io):

```bash
docker pull ghcr.io/DrOlu/reactor:latest
```

Run the container with persistent data and configuration volumes:

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v /path/to/your/data:/app/data \
  -v ~/.reactor:/root/.reactor \
  ghcr.io/DrOlu/reactor:latest
```

After starting the container, access Reactor in your browser at:
```
http://localhost:24337
```

## Configuration

### Persistent Data Volume

Reactor stores all configuration, settings, and project data in the `/app/data` directory. To preserve your data across container restarts, you must mount this directory as a volume.

**Example:**

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  ghcr.io/DrOlu/reactor:latest
```

This will:
- Create a directory `~/reactor-data` on your host machine
- Mount it to `/app/data` inside the container
- Persist all settings, API keys, project configurations, and logs

### Mounting Global Configuration Directory

The `~/.reactor` directory on your host machine contains global configuration and custom files that you may want to persist:

- **Agent profiles** (`.reactor/agents/`) - Custom agent configurations
- **Skills** (`.reactor/agents/`) - Reusable skills for agent mode
- **Custom commands** (`.reactor/commands/`) - User-defined commands
- **Hooks** (`.reactor/hooks/`) - Custom hooks for automation
- **Custom prompts** (`.reactor/prompts/`) - Custom prompt templates
- **Rules** (`.reactor/rules/`) - Custom rules and guidelines

Since the Docker container runs as the `root` user, the home directory inside the container is `/root`. To persist these global configurations, mount `~/.reactor` to `/root/.reactor`.

**Example:**

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  ghcr.io/DrOlu/reactor:latest
```

This will:
- Mount your `~/.reactor` directory from the host to `/root/.reactor` inside the container
- Persist all your agent profiles, skills, custom commands, hooks, and prompts
- Ensure your custom configurations are available across container restarts

**Note:** The `~/.reactor` directory will be created on your host machine automatically the first time you run Reactor (outside of Docker), or you can create it manually before running the container.

### Opening Projects

You can open projects in Reactor using two methods:

#### Method 1: Using the `REACTOR_PROJECTS` Environment Variable

Set the `REACTOR_PROJECTS` environment variable to automatically open projects when the container starts. The variable accepts a comma-separated list of project paths.

**Example:**

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/projects:/projects \
  -e REACTOR_PROJECTS="/projects/my-app,/projects/other-app" \
  ghcr.io/DrOlu/reactor:latest
```

**Important:** The project paths specified in `REACTOR_PROJECTS` must be accessible from within the container. This means each project directory must be mounted as a volume.

#### Method 2: Opening Projects via the UI

Alternatively, you can open projects directly from the Reactor interface after the container is running:

1. Access Reactor in your browser at `http://localhost:24337`
2. Click the "Open Project" button in the top toolbar
3. Type the **full path** to your project as it exists inside the container
4. Click "Open"

**Example paths:**
- `/projects/my-app` (if mounted)
- `/workspace/my-project` (if mounted)

**Important:** The path you enter must be the path as seen from inside the Docker container, not your host machine path. Ensure the project directory is mounted as a volume.

### Project Volume Mounting

To access your projects from within the Docker container, you need to mount each project directory as a volume.

**Example with multiple projects:**

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/projects/my-app:/projects/my-app \
  -v ~/projects/other-app:/projects/other-app \
  -e REACTOR_PROJECTS="/projects/my-app,/projects/other-app" \
  ghcr.io/DrOlu/reactor:latest
```

**Directory structure:**
```
Host machine:                     Inside container:
~/projects/my-app/    →         /projects/my-app/
~/projects/other-app/  →         /projects/other-app/
~/.reactor/       →         /root/.reactor/
~/reactor-data/     →         /app/data/
```

### Port Configuration

By default, Reactor runs on port `24337`. You can change the exposed port mapping using Docker's `-p` flag.

**Example - Use a different host port:**

```bash
docker run -d \
  --name reactor \
  -p 8080:24337 \
  -v ~/reactor-data:/app/data \
  ghcr.io/DrOlu/reactor:latest
```

Now access Reactor at `http://localhost:8080`.

### Authentication

For production environments, you may want to enable authentication. Reactor supports Basic Auth via environment variables.

**Example:**

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -e REACTOR_USERNAME=admin \
  -e REACTOR_PASSWORD=your-secure-password \
  ghcr.io/DrOlu/reactor:latest
```

When you access `http://localhost:24337`, you'll be prompted for username and password.

## Complete Examples

### Example 1: Single Project Setup

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/my-project:/workspace/project \
  -e REACTOR_PROJECTS="/workspace/project" \
  ghcr.io/DrOlu/reactor:latest
```

### Example 2: Multiple Projects with Authentication

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/projects:/projects \
  -e REACTOR_PROJECTS="/projects/frontend,/projects/backend,/projects/api" \
  -e REACTOR_USERNAME=myuser \
  -e REACTOR_PASSWORD=mypassword \
  ghcr.io/DrOlu/reactor:latest
```

### Example 3: Manual Project Opening (No Environment Variable)

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/projects:/projects \
  ghcr.io/DrOlu/reactor:latest
```

Then:
1. Open `http://localhost:24337` in your browser
2. Click "Open Project"
3. Enter `/projects/my-app` (or any mounted project path)
4. Click "Open"

### Example 4: Docker Compose Setup

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  reactor:
    image: ghcr.io/DrOlu/reactor:latest
    container_name: reactor
    ports:
      - "24337:24337"
    volumes:
      # Persistent data directory
      - ./reactor-data:/app/data
      # Global configuration (agent profiles, skills, custom commands, hooks, prompts)
      - ~/.reactor:/root/.reactor
      # Mount your projects
      - ./projects/frontend:/projects/frontend
      - ./projects/backend:/projects/backend
    environment:
      # Auto-open projects
      - REACTOR_PROJECTS=/projects/frontend,/projects/backend
      # Optional: Authentication
      - REACTOR_USERNAME=admin
      - REACTOR_PASSWORD=secure-password
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:24337/', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 404 ? 0 : 1)}).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s
```

Run with:
```bash
docker-compose up -d
```

### Example 5: Specific Version

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -v ~/projects:/projects \
  ghcr.io/DrOlu/reactor:1.0.0
```

## Accessing Reactor

Once your container is running, access the web interface:

```
http://localhost:24337
```

If you changed the port mapping:
```
http://localhost:YOUR_MAPPED_PORT
```

If you enabled authentication, you'll be prompted to log in with the username and password you set.

## Managing the Container

### View Logs

```bash
docker logs reactor
```

### Follow Logs in Real-time

```bash
docker logs -f reactor
```

### Stop the Container

```bash
docker stop reactor
```

### Start a Stopped Container

```bash
docker start reactor
```

### Remove the Container

```bash
docker rm reactor
```

### Enter the Container (for debugging)

```bash
docker exec -it reactor /bin/bash
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACTOR_PORT` | Port for the web server | `24337` | No |
| `REACTOR_USERNAME` | Basic auth username | - | No |
| `REACTOR_PASSWORD` | Basic auth password | - | No |
| `REACTOR_PROJECTS` | Comma-separated list of project paths | - | No |

## Troubleshooting

### Container Fails to Start

Check the logs for error messages:
```bash
docker logs reactor
```

### Cannot Access Reactor in Browser

1. Verify the container is running:
   ```bash
   docker ps
   ```

2. Check the port mapping:
   ```bash
   docker port reactor
   ```

3. Ensure no firewall is blocking the port

4. Try accessing from inside the container:
   ```bash
   docker exec -it reactor curl http://localhost:24337
   ```

### Projects Not Accessible

1. Verify the project directory is mounted:
   ```bash
   docker inspect reactor | grep -A 10 Mounts
   ```

2. Check the path exists inside the container:
   ```bash
   docker exec -it reactor ls -la /projects/my-app
   ```

3. Ensure you're using the correct path when opening projects (container path, not host path)

### Data Not Persisted

Ensure you're mounting the `/app/data` volume:
```bash
-v ~/reactor-data:/app/data
```

Without this volume mount, all data will be lost when the container is removed.

### Global Configuration Not Persisted

If your agent profiles, skills, custom commands, hooks, or prompts are not persisting:

1. Ensure you're mounting the `~/.reactor` directory:
   ```bash
   -v ~/.reactor:/root/.reactor
   ```

2. Verify the directory exists on your host:
   ```bash
   ls -la ~/.reactor
   ```

3. Check if it's mounted correctly inside the container:
   ```bash
   docker exec -it reactor ls -la /root/.reactor
   ```

**Note:** The `~/.reactor` directory will be created automatically the first time you run Reactor outside of Docker, or you can create it manually before running the container.

### Permission Issues

If you encounter permission errors accessing mounted volumes:

1. Ensure the host directory has appropriate permissions
2. Consider using the same user ID for the container:
   ```bash
   docker run -d \
     --name reactor \
     -p 24337:24337 \
     -v ~/reactor-data:/app/data \
     -u $(id -u):$(id -g) \
     ghcr.io/DrOlu/reactor:latest
   ```

### Health Check Failing

The container includes a health check that verifies the server is responding. If the health check fails:

1. Check the container logs for errors
2. Ensure the port is not conflicting with other services
3. Verify there's enough system resources (memory, CPU)

## Advanced Usage

### Custom Aider Version

You can use a custom version of Aider by setting the `REACTOR_AIDER_VERSION` environment variable (see [Custom Aider Version](./custom-aider-version.md) for details):

```bash
docker run -d \
  --name reactor \
  -p 24337:24337 \
  -v ~/reactor-data:/app/data \
  -v ~/.reactor:/root/.reactor \
  -e REACTOR_AIDER_VERSION="0.36.1" \
  ghcr.io/DrOlu/reactor:latest
```

### Extra Python Packages

To install additional Python packages, see [Extra Python Packages](./extra-python-packages.md).

### Using the REST API

Once running, you can interact with Reactor via its REST API. See [REST API](../features/rest-api.md) for complete API documentation.

**Example API call:**

```bash
curl -X POST http://localhost:24337/api/get-context-files \
  -H "Content-Type: application/json" \
  -d '{"projectDir": "/projects/my-app"}'
```

## Security Considerations

1. **Authentication**: Always enable Basic Auth in production environments
2. **HTTPS**: For remote access, use a reverse proxy with SSL/TLS termination
3. **Network Isolation**: Consider using Docker networks to isolate Reactor
4. **Volume Permissions**: Ensure sensitive data volumes have appropriate permissions
5. **Regular Updates**: Keep the Docker image updated for security patches

## Support

For issues, questions, or contributions:
- GitHub Repository: https://github.com/DrOlu/reactor
- Documentation: https://github.com/DrOlu/reactor
- Issues: https://github.com/DrOlu/reactor/issues
