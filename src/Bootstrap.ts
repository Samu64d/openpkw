//
// Bootstrap.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import Exception from "./engine/core/error/Exception.ts";
import ElectronProcess from "./engine/platform/electron/ElectronProcess.ts";
import ElectronWindow from "./engine/platform/electron/ElectronWindow.ts";
import ApplicationBootstrapper from "./engine/application/ApplicationBootstrapper.ts";

export default class Bootstrap extends ApplicationBootstrapper {

	public static getInstance(): Bootstrap {
		if (Bootstrap.instance == null) {
			throw new Exception("Accessing uninitialized class instance");
		}

		return Bootstrap.instance;
	}

	private static instance: Nullable<Bootstrap> = null;

	private static readonly MAIN_WINDOW_CONFIG: Partial<ElectronWindow.BuildConfig> = {
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		icon: "../resources/icon/AppIcon.ico"
	};

	protected constructor() {
		super(Bootstrap.MAIN_WINDOW_CONFIG);
	}

	static {
		if (ElectronProcess.getType() == ElectronProcess.Type.MAIN) {
			Bootstrap.instance = new Bootstrap();
		}
	}

}
