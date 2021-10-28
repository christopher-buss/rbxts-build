import path from "path";
import yargs from "yargs";
import { PLACEFILE_NAME } from "../constants";
import { getSettings } from "../util/getSettings";
import { getWindowsPath } from "../util/getWindowsPath";
import { identity } from "../util/identity";
import { run } from "../util/run";
import { platform, runPlatform } from "../util/runPlatform";

const command = "open";

async function handler() {
	const projectPath = process.cwd();
	const settings = await getSettings(projectPath);

	await runPlatform({
		darwin: () => run("open", [PLACEFILE_NAME]),
		linux: async () => {
			const fsPath = await getWindowsPath(path.join(projectPath, PLACEFILE_NAME));
			return run("powershell.exe", ["/c", `start ${fsPath}`]);
		},
		win32: () => run("start", [PLACEFILE_NAME]),
	});

	if (settings.watchOnOpen !== false) {
		const rojo = platform === "linux" && settings.wslUseExe ? "rojo.exe" : "rojo";
		const rbxtsc = settings.dev ? "rbxtsc-dev" : "rbxtsc";
		run(rojo, ["serve"]).catch(console.warn);
		run(rbxtsc, ["-w"].concat(settings.rbxtscArgs ?? [])).catch(console.warn);
	}
}

export = identity<yargs.CommandModule>({ command, handler });
