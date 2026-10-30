//
// Bootstrap.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import Exception from "./engine/core/exception/Exception.ts";
import NodeProcess from "./engine/platform/node/NodeProcess.ts";
import ElectronWindow from "./engine/platform/electron/ElectronWindow.ts";
import ApplicationContents from "./engine/application/ApplicationContents.ts";
import ApplicationBootstrapper from "./engine/application/ApplicationBootstrapper.ts";
import CanvasApplication from "./engine/application/CanvasApplication.ts";

export default class Bootstrap extends ApplicationBootstrapper {

	public static getInstance(): Bootstrap {
		if (Bootstrap.instance == null) {
			throw new Exception("Trying to access an uninitialized class instance");
		}

		return Bootstrap.instance;
	}

	private static instance: Nullable<Bootstrap> = null;


	private static readonly MAIN_WINDOW_BUILD_CONFIG: Partial<ElectronWindow.BuildConfig> = {
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		title: "Openpkw",
		icon: "../resources/icon/app_icon.ico"
	};

	private static readonly APPLICATION_CONTENT: ApplicationContents = ApplicationContents.BUILD_FOR(CanvasApplication, "./lib/Renderer.js");

	private static readonly WEB_VIEW_CACHE_PATH: string = "/AppData/local/Openpkw/WebViewCache";

	private constructor() {
		super(Bootstrap.MAIN_WINDOW_BUILD_CONFIG, Bootstrap.APPLICATION_CONTENT, Bootstrap.WEB_VIEW_CACHE_PATH);
	}

	public override onReady(): void {
	}

	public override onExit(): void {
	}

	static {
		if (NodeProcess.getType() == NodeProcess.Type.MAIN) {
			Bootstrap.instance = new Bootstrap();
		}
	}

}
