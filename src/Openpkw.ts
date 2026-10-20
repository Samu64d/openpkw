//
// Openpkw.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import MemoryDriver from "./engine/core/interop/MemoryDriver.ts";
import FileSystemDriver from "./engine/core/interop/FileSystemDriver.ts";
import DriverRegistry from "./engine/core/interop/DriverRegistry.ts";
import LogLevel from "./engine/core/util/logger/LogLevel.ts";
import Logger from "./engine/core/util/logger/Logger.ts";
import Exception from "./engine/core/exception/Exception.ts";
import PoolMemoryDriver from "./engine/drivers/memory/PoolMemoryDriver.ts";
import NodeFileSystemDriver from "./engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import ElectronProcess from "./engine/platform/electron/ElectronProcess.ts";
import Application from "./engine/application/Application.ts";
import Renderer from "./app/Renderer.ts";

export default class Openpkw extends Application {

	public static getInstance(): Openpkw {
		if (Openpkw.instance == null) {
			throw new Exception("Trying to access an uninitialized class instance");
		}

		return Openpkw.instance;
	}

	private static instance: Nullable<Openpkw> = null;

	private static readonly LOG_ID: string = "MAIN";

	private static readonly LOG_FILE_NAME: string = "./openpkw.log";

	private readonly logger: Logger;
	private readonly keyMap: Map<string, boolean>;
	private renderer: Nullable<Renderer>;
	private time: number;
	private lastUpdateTime: number;

	protected constructor() {
		super();

		DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());
		DriverRegistry.register(MemoryDriver, new PoolMemoryDriver());
		this.logger = new Logger(Openpkw.LOG_ID, Openpkw.LOG_FILE_NAME);
		this.keyMap = new Map<string, boolean>();
		this.renderer = null;
		this.time = 0;
		this.lastUpdateTime = -1;
	}

	public override onInit(): void {
		this.logger.log(LogLevel.INFO, "Start initializing application");
		this.initRenderer();
	}

	public override onWindowResize(): void {
	}

	public override onError(error: Error): void {
	}

	public forceUpdateRenderer(): void {
		if (this.renderer == null) {
			return;
		}

		this.renderer.update(this.time);
	}

	private updateRenderer(): void {
		if (this.renderer == null) {
			return;
		}

		const now: number = performance.now();
		const elapsed: number = now - this.lastUpdateTime;

		if (this.keyMap.get("ArrowRight")) {
			this.renderer.moveCamera(0.015, 0, 0);
		}
		if (this.keyMap.get("ArrowLeft")) {
			this.renderer.moveCamera(-0.015, 0, 0);
		}
		if (this.keyMap.get("ArrowUp")) {
			this.renderer.moveCamera(0, 0, -0.015);
		}
		if (this.keyMap.get("ArrowDown")) {
			this.renderer.moveCamera(0.0, 0, 0.015);
		}
		if (this.keyMap.get("BracketRight")) {
			this.renderer.moveCamera(0, 0.015, 0);
		}
		if (this.keyMap.get("Slash")) {
			this.renderer.moveCamera(0, -0.015, 0);
		}

		if (elapsed > 10) {
			this.lastUpdateTime = now - (elapsed % 10);
			if (this.renderer != null) {
				this.renderer.update(this.time);
			}
			this.time += 1;
		}

		window.requestAnimationFrame(this.updateRenderer.bind(this));
	}

	private initRenderer(): void {

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.code == null) {
				return;
			}

			this.keyMap.set(event.code, true);
		});

		document.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.code == null) {
				return;
			}

			this.keyMap.set(event.code, false);
		});

		const canvasElement: Nullable<HTMLCanvasElement> = document.getElementById("canvas") as Nullable<HTMLCanvasElement>;

		if (canvasElement == null) {
			return;
		}

		const context: Nullable<WebGL2RenderingContext> = canvasElement.getContext("webgl2", {
			alpha: false,
			antialias: true,
			depth: true,
			premultipliedAlpha: true
		});

		if (context == null) {
			return;
		}

		this.renderer = new Renderer(context);
		this.renderer.init();
		this.lastUpdateTime = performance.now();
		window.requestAnimationFrame(this.updateRenderer.bind(this));

		this.logger.log(LogLevel.INFO, "Requesting update frame completed");
	}

	static {
		if (ElectronProcess.getType() == ElectronProcess.Type.RENDERER) {
			Openpkw.instance = new Openpkw();
		}
	}

}
