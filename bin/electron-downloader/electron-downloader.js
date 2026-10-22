//
// electron-downloader.ts
//

import * as Fs from "node:fs";
import * as Path from "node:path";
import * as Url from "node:url";
import * as Get from "@electron/get";
import * as ExtractZip from "@electron-internal/extract-zip";
import PackageJson from "../../package.json" with { type: "json" };

function extractFile(zipPath, distPath) {
	return ExtractZip.extract(zipPath, { dir: distPath }).then(() => {
		Fs.rm(zipPath, () => {
		});
	});
}

function download(version, downloadPath) {
	return Get.downloadArtifact({
		arch: "x64",
		artifactName: "electron",
		cacheRoot: downloadPath,
		force: false,
		platform: "win32",
		version: version
	})
}

function isCached(version, distPath) {
	const versionFilePath = Path.resolve(distPath, "./version");
	const electronPath = Path.resolve(distPath, "./electron.exe");

	try {
		if (Fs.readFileSync(versionFilePath, "utf-8").replace(/^v/, "") != version) {
			return false;
		}
	} catch {
		return false;
	}

	return Fs.existsSync(electronPath);
}

function main() {
	const rootPath = Path.resolve(Url.fileURLToPath(import.meta.url), "../../../");
	const cachePath = Path.resolve(rootPath, "./.cache");
	const downloadPath = Path.resolve(cachePath, "./downloads");
	const distPath = Path.resolve(rootPath, "./.cache/artefacts/electron");
	const version = PackageJson.dependencies.electron;

	if (isCached(version, distPath)) {
		process.exit(0);
	} else {
		download(version, downloadPath)
			.then((zipPath) => {
				extractFile(zipPath, distPath);
			})
			.catch((error) => {
				console.error(error.stack);
				process.exit(1);
			});;
	}
}

main();
