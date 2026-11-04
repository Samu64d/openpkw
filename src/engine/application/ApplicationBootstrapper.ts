//
// ApplicationBootstrapper.ts
//

import Nullable from "../core/common/Nullable.ts";
import EventRegistrationTracker from "../core/event/EventRegistrationTracker.ts";
import Disposable from "../core/reflection/decorators/Disposable.ts";
import NodeOS from "../platform/node/NodeOS.ts";
import NodeProcess from "../platform/node/NodeProcess.ts";
import ElectronApp from "../platform/electron/ElectronApp.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import ElectronDialog from "../platform/electron/ElectronDialog.ts";
import ElectronWindow from "../platform/electron/ElectronWindow.ts";
import ElectronWebContentsView from "../platform/electron/ElectronWebContentsView.ts";
import ApplicationContents from "./ApplicationContents.ts";
import IPCErrorChannelPacket from "./IPCErrorChannelPacket.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";

@Disposable()
export default abstract class ApplicationBootstrapper implements Disposable.Target {

	private readonly windowBuildConfig: Partial<ElectronWindow.BuildConfig>;
	private readonly applicationContents: ApplicationContents;
	private readonly cachePath: string;
	private readonly electronApp: ElectronApp;
	private readonly electronDialog: ElectronDialog;
	private readonly ipcErrorChannel: IPCErrorChannel;
	private readonly electronAppEvents: EventRegistrationTracker<any, Electron.Event>;
	private mainWindow: Nullable<ElectronWindow>;
	private mainWebContentsView: Nullable<ElectronWebContentsView>;
	private hasErrors: boolean;

	public constructor(windowBuildConfig: Partial<ElectronWindow.BuildConfig>, applicationContents: ApplicationContents, cachePath: string) {
		this.windowBuildConfig = windowBuildConfig;
		this.applicationContents = applicationContents;
		this.cachePath = cachePath;
		this.electronApp = ElectronApp.FROM_GLOBAL_REFERENCE();
		this.electronDialog = ElectronDialog.FROM_GLOBAL_REFERENCE();
		this.ipcErrorChannel = new IPCErrorChannel(ElectronIPC.FROM_GLOBAL_REFERENCE());
		this.electronAppEvents = new EventRegistrationTracker<any, Electron.Event>(this.electronApp);
		this.mainWindow = null;
		this.mainWebContentsView = null;
		this.hasErrors = false;
		this.setupEnvironmentConfiguration();
		this.registerAppEventListeners();
		this.registerIpcEventListeners();
	}

	public getMainWindow(): Nullable<ElectronWindow> {
		return this.mainWindow;
	}

	public getMainWebContentsView(): Nullable<ElectronWebContentsView> {
		return this.mainWebContentsView;
	}

	public abstract onReady(): void;

	public abstract onExit(): void;

	public exit(): void {
		this.onExit();
		this.electronApp.exit();
	}

	public dispose(): void {
		this.electronAppEvents.removeAll();
	}

	private setupEnvironmentConfiguration(): void {
		NodeProcess.registerEventListener("uncaughtException", (e: unknown) => {
			this.ipcErrorChannelListener(IPCErrorChannelPacket.FROM_ERROR(e));
		});

		this.electronApp.disableSecurityWarnings();
		this.electronApp.setSwitch("disable-http-cache");
		this.electronApp.setSwitch("force-color-profile", "srgb");
		this.electronApp.setUserDataPath(NodeOS.getHomeDir() + this.cachePath);
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
		if (this.electronApp.requestSingleInstanceLock() == false) {
			this.exit();
			return;
		}

		this.mainWindow = new ElectronWindow(this.windowBuildConfig);
		this.mainWindow.center();

		this.mainWebContentsView = new ElectronWebContentsView();
		this.mainWebContentsView.autoAdaptToWindowBounds(this.mainWindow);
		this.mainWindow.addWebContentView(this.mainWebContentsView);

		const contentsFile: string = this.applicationContents.getDataUrl();
		const baseUrl: string = this.applicationContents.getBaseUrl();

		this.mainWebContentsView.loadDataUrl(contentsFile, baseUrl);
		this.onReady();
	}

	private registerAppEventListeners(): void {
		this.electronAppEvents.add("window-all-closed", this.onWindowAllClosedListener.bind(this));
		this.electronAppEvents.add("second-instance", this.onSecondInstanceListener.bind(this));
		this.electronAppEvents.add("ready", this.onReadyListener.bind(this));
	}

	private ipcErrorChannelListener(packet: IPCErrorChannelPacket): void {
		if (this.hasErrors == true) {
			return;
		}

		this.hasErrors = true;

		const errorDescription: string = packet.errorName + ": " + packet.errorMessage;

		if (this.mainWindow != null) {

			if (this.mainWebContentsView != null) {
				this.mainWebContentsView.unload();
			}

			this.electronDialog.showMessageBox(this.mainWindow, ElectronDialog.Type.ERROR, errorDescription);
		} else {
			console.error("Critical startup error: ", errorDescription);
		}

		this.exit();
	}

	private registerIpcEventListeners(): void {
		this.ipcErrorChannel.registerErrorListener(this.ipcErrorChannelListener.bind(this));
	}

}
