//
// download-electron.ts
//

import * as Fs from "node:fs";
import * as Path from "node:path";
import * as Url from "node:url";
import * as Get from "@electron/get";
import * as ExtractZip from "@electron-internal/extract-zip";
import PackageJson from "../../package.json" with { type: "json" };

function main() {
	const version = PackageJson.dependencies.electron;
	const rootPath = Path.resolve(Url.fileURLToPath(import.meta.url), "../../../");
	const cachePath = Path.resolve(rootPath, "./.cache");
	const downloadsPath = Path.resolve(cachePath, "./downloads");
	const artefactPath = Path.resolve(cachePath, "./artefacts/electron");
	const versionFilePath = Path.resolve(artefactPath, "./version");
	const executableFilePath = Path.resolve(artefactPath, "./electron.exe");

	try {
		if (Fs.readFileSync(versionFilePath, "utf-8").replace(/^v/, "") == version) {
			process.exit(0);
		}
	} catch {
	}

	if (Fs.existsSync(executableFilePath)) {
		process.exit(0);
	};

	return Get.downloadArtifact({
		arch: "x64",
		artifactName: "electron",
		cacheRoot: downloadsPath,
		force: false,
		platform: "win32",
		version: version
	}).then((zipFilePath) => {
		return ExtractZip.extract(zipFilePath, { dir: artefactPath }).then(() => {
			Fs.rmSync(zipFilePath);
		});
	}).catch((error) => {
		console.error(error.stack);
		process.exit(1);
	});
}

main();
