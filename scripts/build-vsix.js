const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building bundled production extension via esbuild...');
execSync('npx esbuild@0.17.19 src/extension.ts --bundle --outfile=out/extension.js --platform=node --external:vscode --target=node16', { stdio: 'inherit' });

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const releaseDir = path.join(__dirname, '..', 'release', version);

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const vsixPath = path.join(releaseDir, `console-log-cleaner-${version}.vsix`);
const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vsix-'));

// 1. Create extension directory
const extDir = path.join(tmpDir, 'extension');
fs.mkdirSync(extDir, { recursive: true });

// Copy package.json, README.md, LICENSE, and out/
fs.copyFileSync('package.json', path.join(extDir, 'package.json'));
fs.copyFileSync('README.md', path.join(extDir, 'README.md'));
fs.copyFileSync('LICENSE', path.join(extDir, 'LICENSE'));

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir('out', path.join(extDir, 'out'));

// 2. Create [Content_Types].xml
const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="vsixmanifest" ContentType="text/xml" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="txt" ContentType="text/plain" />
  <Default Extension="xml" ContentType="text/xml" />
</Types>`;
fs.writeFileSync(path.join(tmpDir, '[Content_Types].xml'), contentTypes);

// 3. Create extension.vsixmanifest
const manifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Id="${pkg.name}" Version="${pkg.version}" Publisher="${pkg.publisher}" />
    <DisplayName>${pkg.displayName}</DisplayName>
    <Description xml:space="preserve">${pkg.description}</Description>
    <Tags>${pkg.keywords ? pkg.keywords.join(',') : ''}</Tags>
    <Categories>${pkg.categories ? pkg.categories.join(',') : ''}</Categories>
    <License>extension/LICENSE</License>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" Version="${pkg.engines.vscode}" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true" />
  </Assets>
</PackageManifest>`;
fs.writeFileSync(path.join(tmpDir, 'extension.vsixmanifest'), manifest);

// Zip into VSIX file
if (fs.existsSync(vsixPath)) {
  fs.unlinkSync(vsixPath);
}

execSync(`cd "${tmpDir}" && zip -r -q "${vsixPath}" extension "[Content_Types].xml" extension.vsixmanifest`, { stdio: 'inherit' });
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`VSIX package created successfully at ${vsixPath}`);
