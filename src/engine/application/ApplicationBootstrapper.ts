//
// ApplicationBootstrapper.ts
//

import Nullable from "../core/common/Nullable.ts";
import NodeOS from "../platform/node/NodeOS.ts";
import NodeChildProcess from "../platform/node/NodeChildProcess.ts";
import ElectronProcess from "../platform/electron/ElectronProcess.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import ElectronWindow from "../platform/electron/ElectronWindow.ts";
import ElectronApp from "../platform/electron/ElectronApp.ts";

export default abstract class ApplicationBootstrapper {

	public static readonly IPC_ERROR_CHANNEL: ElectronIPC.Channel = "ERROR_CHANNEL";

	private static readonly APP_WEB_CACHE_FOLDER: string = "/AppData/local/Openpkw/WebViewCache";

	private static readonly MAIN_WINDOW_CONTENTS_PATH: string = "../resources/markup/MainWindow.html";

	private readonly mainWindowConfig: Partial<ElectronWindow.BuildConfig>;
	private mainWindow: Nullable<ElectronWindow> = null;
	private mainWindowError: boolean = false;

	protected constructor(mainWindowConfig: Partial<ElectronWindow.BuildConfig>) {
		this.mainWindowConfig = mainWindowConfig;
		this.setupElectron();
		this.registerAppEventListeners();
		this.registerIpcEventListeners();
	}

	public getMainWindow(): Nullable<ElectronWindow> {
		return this.mainWindow;
	}

	public abstract onReady(): void;

	public abstract onExit(): void;

	public exit(): void {
		this.onExit();
		ElectronApp.exit();
	}

	private setupElectron(): void {
		ElectronProcess.disableSecurityWarnings();
		ElectronApp.setSwitch("disable-http-cache");
		ElectronApp.setSwitch("force-color-profile", "srgb");
		ElectronApp.setWebCachePath(NodeOS.getHomeDir() + ApplicationBootstrapper.APP_WEB_CACHE_FOLDER);
	}

	private onWindowAllClosedListener(): void {
		this.exit();
	}

	private onSecondInstanceListener(): void {
		const mainWindow: Nullable<ElectronWindow> = this.getMainWindow();

		if (mainWindow == null) {
			return;
		}

		mainWindow.makeVisible();
	}

	private onReadyListener(): void {
		if (ElectronApp.requestSingleInstanceLock() == false) {
			this.exit();
			return;
		}

		this.mainWindow = new ElectronWindow(this.mainWindowConfig);
		this.mainWindow.center();
		this.mainWindow.loadWebContents(ApplicationBootstrapper.MAIN_WINDOW_CONTENTS_PATH);
		this.onReady();
	}

	private registerAppEventListeners(): void {
		ElectronApp.registerEventListener("window-all-closed", this.onWindowAllClosedListener.bind(this));
		ElectronApp.registerEventListener("second-instance", this.onSecondInstanceListener.bind(this));
		ElectronApp.registerEventListener("ready", this.onReadyListener.bind(this));
	}

	private onWindowErrorListener(channel: ElectronIPC.Channel, errorMessage: Nullable<string> = null): void {
		if (this.mainWindowError == true || this.mainWindow == null || errorMessage == null) {
			return;
		}

		this.mainWindowError = true;
		this.mainWindow.unloadWebContents();
		NodeChildProcess.spawn("powershell.exe", ["Add-Type -AssemblyName PresentationCore, PresentationFramework; [System.Windows.MessageBox]::Show(\"" + errorMessage + "\", \"Openpkw\", [System.Windows.MessageBoxButton]::OK, [System.Windows.MessageBoxImage]::Error);"], true);
		this.exit();
	}

	private registerIpcEventListeners(): void {
		ElectronIPC.registerRequestListener(ApplicationBootstrapper.IPC_ERROR_CHANNEL, this.onWindowErrorListener.bind(this));
	}

}
