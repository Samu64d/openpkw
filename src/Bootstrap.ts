//
// Bootstrap.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import Exception from "./engine/core/exception/Exception.ts";
import NodeProcess from "./engine/platform/node/NodeProcess.ts";
import ElectronWindow from "./engine/platform/electron/ElectronWindow.ts";
import ApplicationBootstrapper from "./engine/application/ApplicationBootstrapper.ts";

export default class Bootstrap extends ApplicationBootstrapper {

	public static getInstance(): Bootstrap {
		if (Bootstrap.instance == null) {
			throw new Exception("Trying to access an uninitialized class instance");
		}

		return Bootstrap.instance;
	}

	private static instance: Nullable<Bootstrap> = null;

	private static readonly APP_WEB_CACHE_FOLDER: string = "/AppData/local/Openpkw/WebViewCache";

	private static readonly MAIN_WINDOW_CONFIG: Partial<ElectronWindow.BuildConfig> = {
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		title: "Openpkw - Open Pokemon World",
		icon: "../resources/icon/AppIcon.ico"
	};

	private static readonly MAIN_WINDOW_CONTENTS_PATH: string = "../resources/markup/MainWindow.html";

	private constructor() {
		super(Bootstrap.APP_WEB_CACHE_FOLDER, Bootstrap.MAIN_WINDOW_CONFIG, Bootstrap.MAIN_WINDOW_CONTENTS_PATH);
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
