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
import NodeProcess from "./engine/platform/node/NodeProcess.ts";
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
	private time: number;
	private lastUpdateTime: number;
	private renderer: Nullable<Renderer>;

	private constructor() {
		super();

		DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());
		DriverRegistry.register(MemoryDriver, new PoolMemoryDriver());
		this.logger = new Logger(Openpkw.LOG_ID, Openpkw.LOG_FILE_NAME);
		this.keyMap = new Map<string, boolean>();
		this.time = 0;
		this.lastUpdateTime = -1;
		this.renderer = null;
	}

	public override onInit(): void {
		this.logger.log(LogLevel.INFO, "Start initializing application");

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.code == null) {
				return;
			}

			if (event.code == "KeyP" && this.renderer != null) {
				this.renderer.setDebugLines(!this.renderer.getDebugLines());
			}

			this.keyMap.set(event.code, true);
		});

		document.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.code == null) {
				return;
			}

			this.keyMap.set(event.code, false);
		});

		this.initRenderer();
	}

	public override onClientResize(width: number, height: number): void {
		if (this.renderer == null) {
			return;
		}

		this.renderer.setViewportSize(width, height);
		this.renderer.draw(this.time);
	}

	public override onError(e: unknown): void {
	}

	private updateRenderer(): void {
		if (this.renderer == null) {
			return;
		}

		const now: number = performance.now();
		const elapsed: number = now - this.lastUpdateTime;

		if (elapsed > 10) {
			this.lastUpdateTime = now - (elapsed % 10);

			if (this.keyMap.get("ArrowRight")) {
				this.renderer.moveCamera(0.025, 0, 0);
			}
			if (this.keyMap.get("ArrowLeft")) {
				this.renderer.moveCamera(-0.025, 0, 0);
			}
			if (this.keyMap.get("ArrowUp")) {
				this.renderer.moveCamera(0, 0, -0.025);
			}
			if (this.keyMap.get("ArrowDown")) {
				this.renderer.moveCamera(0.0, 0, 0.025);
			}
			if (this.keyMap.get("BracketRight")) {
				this.renderer.moveCamera(0, 0.025, 0);
			}
			if (this.keyMap.get("Slash")) {
				this.renderer.moveCamera(0, -0.025, 0);
			}

			this.renderer.draw(this.time);
			this.time += 1;
		}

		window.requestAnimationFrame(this.updateRenderer.bind(this));
	}

	private initRenderer(): void {

		const renderingContext: Nullable<WebGL2RenderingContext> = this.getRenderingContext();

		if (renderingContext == null) {
			throw new Error("Cannot access rendering context");
		}

		this.renderer = new Renderer(renderingContext);
		this.renderer.init();
		this.lastUpdateTime = performance.now();
		window.requestAnimationFrame(this.updateRenderer.bind(this));

		this.logger.log(LogLevel.INFO, "Requesting update frame completed");
	}

	static {
		if (NodeProcess.getType() == NodeProcess.Type.RENDERER) {
			Openpkw.instance = new Openpkw();
		}
	}

}
