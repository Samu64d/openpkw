//
// Main.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import NodeOS from "./engine/platform/node/NodeOS.ts";
import NodeChildProcess from "./engine/platform/node/NodeChildProcess.ts";
import ElectronApp from "./engine/platform/electron/ElectronApp.ts";
import ElectronProcess from "./engine/platform/electron/ElectronProcess.ts";
import ElectronIPC from "./engine/platform/electron/ElectronIPC.ts";
import ElectronWindow from "./engine/platform/electron/ElectronWindow.ts";
import ApplicationConfig from "./config/ApplicationConfig.ts";

export default class Main {

	public static readonly IPC_ERROR_CHANNEL: ElectronIPC.Channel = "ERROR_CHANNEL";

	public static getInstance(): Main {
		if (Main.instance == null) {
			throw new Error("Accessing uninitialized class instance.");
		}

		return Main.instance;
	}

	private static readonly MAIN_WINDOW_ICON_PATH: string = "../resources/icon/AppIcon.ico";
	private static readonly MAIN_WINDOW_CONTENTS_PATH: string = "../resources/markup/MainWindow.html";

	// Window default configuration
	private static readonly MAIN_WINDOW_CONFIG: Partial<ElectronWindow.BuildConfig> = {
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600
	};

	private static instance: Nullable<Main> = null;

	private mainWindow: Nullable<ElectronWindow> = null;
	private mainWindowError: boolean = false;

	private constructor() {
		ElectronProcess.disableSecurityWarnings();
		this.setupElectronApp();
		this.registerAppEventListeners();
		this.registerIpcEventListeners();
	}

	public getMainWindow(): Nullable<ElectronWindow> {
		return this.mainWindow;
	}

	public exit(): void {
		ElectronApp.exit();
	}

	private setupElectronApp(): void {
		// Switches
		ElectronApp.setSwitch("disable-http-cache");
		ElectronApp.setSwitch("force-color-profile", "srgb");

		// Paths
		ElectronApp.setWebCachePath(NodeOS.getHomeDir() + ApplicationConfig.APP_WEB_CACHE_FOLDER);
	}

	private onWindowAllClosedListener(): void {
		this.exit();
	}

	private onSecondInstanceListener(): void {
		const mainWindow: Nullable<ElectronWindow> = this.getMainWindow();
		if (mainWindow != null) {
			mainWindow.makeVisible();
		}
	}

	private onReadyListener(): void {
		if (ElectronApp.requestSingleInstanceLock() == false) {
			this.exit();
			return;
		}

		this.mainWindow = new ElectronWindow(Main.MAIN_WINDOW_CONFIG);
		this.mainWindow.setIcon(Main.MAIN_WINDOW_ICON_PATH);
		this.mainWindow.center();
		this.mainWindow.loadWebContents(Main.MAIN_WINDOW_CONTENTS_PATH);
		this.mainWindow.openDevTools(true);
	}

	private registerAppEventListeners(): void {
		ElectronApp.registerEventListener("window-all-closed", this.onWindowAllClosedListener.bind(this));
		ElectronApp.registerEventListener("second-instance", this.onSecondInstanceListener.bind(this));
		ElectronApp.registerEventListener("ready", this.onReadyListener.bind(this));
	}

	private onWindowErrorListener(channel: ElectronIPC.Channel, errorMessage: Nullable<string>): void {
		if (this.mainWindowError == true || this.mainWindow == null || errorMessage == null) {
			return;
		}

		this.mainWindowError = true;
		this.mainWindow.unloadWebContents();

		NodeChildProcess.spawn("powershell.exe", ["Add-Type -AssemblyName PresentationCore, PresentationFramework; [System.Windows.MessageBox]::Show(\"" + errorMessage + "\", \"Openpkw\", [System.Windows.MessageBoxButton]::OK, [System.Windows.MessageBoxImage]::Error);"], true);
		this.exit();
	}

	private registerIpcEventListeners(): void {
		ElectronIPC.registerRequestListener(Main.IPC_ERROR_CHANNEL, this.onWindowErrorListener.bind(this));
	}

	static {
		if (ElectronProcess.getType() == ElectronProcess.Type.MAIN) {
			Main.instance = new Main();
		}
	}

}
