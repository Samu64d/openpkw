//
// Main.ts
//

import * as Electron from "electron";

import Nullable from "./core/foundation/Nullable.ts";
import System from "./core/platform/System.ts";
import Process from "./core/platform/Process.ts";
import Window from "./core/platform/Window.ts";
import ApplicationConfig from "./config/ApplicationConfig.ts";

Process.setEnvironmentVar("ELECTRON_DISABLE_SECURITY_WARNINGS", "true");

export default class Main {

	public static readonly IPC_ERROR_CHANNEL: string = "ERROR_CHANNEL";

	public static getInstance(): Main {
		if (Main.instance == null) {
			throw new Error("Accessing uninitialized class instance.");
		}

		return Main.instance;
	}

	private static instance: Nullable<Main> = null;

	private static readonly MAIN_WINDOW_ICON_PATH: string = "../resources/icon/AppIcon.ico";

	private static readonly MAIN_WINDOW_CONTENTS_PATH: string = "../resources/markup/MainWindow.html";

	// Window default configuration
	private static readonly MAIN_WINDOW_CONFIG: Partial<Window.BuildConfig> = {
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600
	};

	private static main(): void {
		Main.instance = new Main(Electron.app);
	}

	private readonly electronApp: Electron.App;
	private readonly userDataPath: string;
	private mainWindow: Nullable<Window> = null;
	private mainWindowError: boolean = false;

	private constructor(app: Electron.App) {
		this.electronApp = app;

		this.setAppSwitches();
		this.userDataPath = System.getHomeDir() + ApplicationConfig.APP_DATA_FOLDER;
		this.electronApp.setPath("userData", System.getHomeDir() + ApplicationConfig.APP_WEB_CACHE_FOLDER);

		this.registerAppEventListeners();
		this.registerIpcEventListeners();
	}

	public getMainWindow(): Nullable<Window> {
		return this.mainWindow;
	}

	public getUserDataPath(): Nullable<string> {
		return this.userDataPath;
	}

	public exit(): void {
		this.electronApp.quit();
	}

	private setAppSwitch(name: string, value: Nullable<string> = null): void {
		if (value != null) {
			this.electronApp.commandLine.appendSwitch(name, value);
		} else {
			this.electronApp.commandLine.appendSwitch(name);
		}
	}

	private setAppSwitches(): void {
		this.setAppSwitch("disable-http-cache");
		this.setAppSwitch("force-color-profile", "srgb");
	}

	private registerAppEventListener(eventName: any, listener: (...args: any[]) => void): void {
		this.electronApp.on(eventName, listener);
	}

	private onWindowAllClosedListener(): void {
		this.exit();
	}

	private onSecondInstanceListener(): void {
		const mainWindow: Nullable<Window> = this.getMainWindow();
		if (mainWindow != null) {
			mainWindow.makeVisible();
		}
	}

	private requestSingleInstanceLock(): boolean {
		return this.electronApp.requestSingleInstanceLock();
	}

	private onReadyListener(): void {

		if (!this.requestSingleInstanceLock()) {
			this.exit();
			return;
		}

		this.mainWindow = new Window(Main.MAIN_WINDOW_CONFIG);
		this.mainWindow.setIcon(Main.MAIN_WINDOW_ICON_PATH);
		this.mainWindow.loadWebContents(Main.MAIN_WINDOW_CONTENTS_PATH);
		this.mainWindow.center();
	}

	private registerAppEventListeners(): void {
		this.registerAppEventListener("window-all-closed", this.onWindowAllClosedListener.bind(this));
		this.registerAppEventListener("second-instance", this.onSecondInstanceListener.bind(this));
		this.registerAppEventListener("ready", this.onReadyListener.bind(this));
	}

	private onWindowErrorListener(errorMessage: Nullable<string>): void {
		if (this.mainWindowError == true || this.mainWindow == null || errorMessage == null) {
			return;
		}

		this.mainWindowError = true;
		this.mainWindow.closeWebContents();
		System.spawnProcess("powershell.exe", ["Add-Type -AssemblyName PresentationCore, PresentationFramework; [System.Windows.MessageBox]::Show(\"" + errorMessage + "\", \"Openpkw\", [System.Windows.MessageBoxButton]::OK, [System.Windows.MessageBoxImage]::Error);"], true);
		this.exit();
	}

	private registerIpcEventListeners(): void {
		Process.Communication.registerRequestListener(Main.IPC_ERROR_CHANNEL, this.onWindowErrorListener.bind(this));
	}

	static {
		if (Process.getType() == Process.Type.MAIN) {
			Main.main();
		}
	}

}
