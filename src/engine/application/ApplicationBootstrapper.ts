//
// ApplicationBootstrapper.ts
//

import Nullable from "../core/common/Nullable.ts";
import NodeOS from "../platform/node/NodeOS.ts";
import NodeChildProcess from "../platform/node/NodeChildProcess.ts";
import ElectronProcess from "../platform/electron/ElectronProcess.ts";
import ElectronWindow from "../platform/electron/ElectronWindow.ts";
import ElectronWebContentsView from "../platform/electron/ElectronWebContentsView.ts";
import ElectronApp from "../platform/electron/ElectronApp.ts";
import IPCErrorChannelPacket from "./IPCErrorChannelPacket.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";

export default abstract class ApplicationBootstrapper {

	private static readonly APP_WEB_CACHE_FOLDER: string = "/AppData/local/Openpkw/WebViewCache";

	private static readonly MAIN_WINDOW_CONTENTS_PATH: string = "../resources/markup/MainWindow.html";

	private readonly mainWindowBuildConfig: Partial<ElectronWindow.BuildConfig>;
	private mainWindow: Nullable<ElectronWindow>;
	private mainWebContentsView: Nullable<ElectronWebContentsView>;
	private mainWindowOnError: boolean;

	protected constructor(mainWindowBuildConfig: Partial<ElectronWindow.BuildConfig>) {
		this.mainWindowBuildConfig = mainWindowBuildConfig;
		this.mainWindow = null;
		this.mainWebContentsView = null;
		this.mainWindowOnError = false;
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

		this.mainWindow = new ElectronWindow(this.mainWindowBuildConfig);
		this.mainWindow.center();

		this.mainWebContentsView = new ElectronWebContentsView();
		this.mainWindow.addWebContentView(this.mainWebContentsView);
		this.mainWebContentsView.autoAdaptToWindowBounds(this.mainWindow);
		this.mainWebContentsView.loadFile(ApplicationBootstrapper.MAIN_WINDOW_CONTENTS_PATH);

		this.onReady();
	}

	private registerAppEventListeners(): void {
		ElectronApp.registerEventListener("window-all-closed", this.onWindowAllClosedListener.bind(this));
		ElectronApp.registerEventListener("second-instance", this.onSecondInstanceListener.bind(this));
		ElectronApp.registerEventListener("ready", this.onReadyListener.bind(this));
	}

	private ipcErrorChannelListener(packet: IPCErrorChannelPacket): void {
		if (this.mainWindow == null || this.mainWebContentsView == null || this.mainWindowOnError == true) {
			return;
		}

		const messageBoxMessage: string = packet.errorName + ": " + packet.errorMessage;

		this.mainWindowOnError = true;
		this.mainWebContentsView.unload();
		NodeChildProcess.spawn("powershell.exe", ["Add-Type -AssemblyName PresentationCore, PresentationFramework; [System.Windows.MessageBox]::Show(\"" + messageBoxMessage + "\", \"Openpkw\", [System.Windows.MessageBoxButton]::OK, [System.Windows.MessageBoxImage]::Error);"], true);
		this.exit();
	}

	private registerIpcEventListeners(): void {
		IPCErrorChannel.registerErrorListener(this.ipcErrorChannelListener.bind(this));
	}

}
