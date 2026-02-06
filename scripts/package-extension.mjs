import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'manifest.json');

async function readManifestVersion() {
  const manifestContent = await fs.readFile(manifestPath, 'utf8');
  let manifest;

  try {
    manifest = JSON.parse(manifestContent);
  } catch (error) {
    throw new Error('manifest.json is not valid json');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    throw new Error('manifest.json is missing a valid version string');
  }

  if (manifest.version.trim().length === 0) {
    throw new Error('manifest.json version must not be empty');
  }

  return manifest.version.trim();
}

async function ensureFilesExist(fileList) {
  const missing = [];

  for (const relativePath of fileList) {
    const targetPath = path.join(projectRoot, relativePath);

    try {
      await fs.access(targetPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        missing.push(relativePath);
      } else {
        throw error;
      }
    }
  }

  if (missing.length > 0) {
    const message = 'required files are missing: ' + missing.join(', ');
    throw new Error(message);
  }
}

async function collectOptionalFiles(fileList) {
  const resolved = [];

  for (const relativePath of fileList) {
    const targetPath = path.join(projectRoot, relativePath);

    try {
      await fs.access(targetPath);
      resolved.push(relativePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const warning = 'warning: optional file not found and will be skipped: ' + relativePath;
        console.warn(warning);
      } else {
        throw error;
      }
    }
  }

  return resolved;
}

function ensureZipAvailable() {
  const result = spawnSync('zip', ['-v'], { stdio: 'ignore' });

  if (result.error) {
    throw new Error('zip command is not available in the current environment');
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error('zip command returned a non-zero status while probing availability');
  }
}

async function prepareDistDirectory(distPath) {
  await fs.mkdir(distPath, { recursive: true });
}

async function removeIfExists(targetPath) {
  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function createZipArchive(outputPath, filesToInclude) {
  const result = spawnSync('zip', ['-r', outputPath, ...filesToInclude], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error('zip command failed with a non-zero status');
  }
}

async function writePackageInfo(distPath, version, outputName) {
  const infoPath = path.join(distPath, 'package-info.json');
  const data = {
    version,
    artifact: outputName
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(infoPath, content + '\n', 'utf8');
}

async function main() {
  try {
    const version = await readManifestVersion();
    const distPath = path.join(projectRoot, 'dist');
    const outputName = 'rsearch-' + version + '.zip';
    const outputPath = path.join(distPath, outputName);

    const requiredFiles = [
      'manifest.json',
      'content.js',
      'popup.js',
      'popup.html',
      'background.js',
      'styles.css'
    ];

    const optionalFiles = [
      'icon.svg',
      'icon16.png',
      'icon48.png',
      'icon128.png'
    ];

    await ensureFilesExist(requiredFiles);
    const resolvedOptional = await collectOptionalFiles(optionalFiles);

    ensureZipAvailable();
    await prepareDistDirectory(distPath);
    await removeIfExists(outputPath);

    const filesToArchive = requiredFiles.concat(resolvedOptional);
    createZipArchive(outputPath, filesToArchive);
    await writePackageInfo(distPath, version, outputName);

    console.log('package created at ' + outputPath);
  } catch (error) {
    console.error('packaging failed: ' + error.message);
    process.exit(1);
  }
}

main();
