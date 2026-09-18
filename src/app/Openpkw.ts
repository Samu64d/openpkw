//
// Openpkw.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import FileSystemDriver from "../engine/core/io/file/FileSystemDriver.ts";
import DriverRegistry from "../engine/core/interop/DriverRegistry.ts";
import LogLevel from "../engine/core/util/logger/LogLevel.ts";
import Logger from "../engine/core/util/logger/Logger.ts";
import NodeFileSystemDriver from "../engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import Renderer from "./Renderer.ts";

export default class Openpkw {

	public static getInstance(): Openpkw {
		if (Openpkw.instance == null) {
			Openpkw.instance = new Openpkw();
		}

		return Openpkw.instance;
	}

	private static instance: Nullable<Openpkw> = null;

	private static readonly LOG_ID: string = "MAIN";

	private static readonly LOG_FILE_NAME: string = "./openpkw.log";

	private time: number;
	private lastUpdateTime: number;
	private readonly logger: Logger;
	private renderer: Nullable<Renderer>;

	private constructor() {
		DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());
		this.time = 0;
		this.lastUpdateTime = -1;
		this.logger = new Logger(Openpkw.LOG_ID, Openpkw.LOG_FILE_NAME);
		this.renderer = null;
	}

	public init(): void {
		this.logger.log(LogLevel.INFO, "Run init");

		this.initRenderer();
		this.initTest();
	}

	public forceUpdateRenderer(): void {
		if (this.renderer != null) {
			this.renderer.update(this.time);
		}
	}

	private updateRenderer(): void {
		const now: number = performance.now();
		const elapsed: number = now - this.lastUpdateTime;

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
		this.logger.log(LogLevel.INFO, "Run init renderer");

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

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.code == "ArrowRight") {
				this.renderer?.moveCamera(0.08, 0, 0);
			}
			if (event.code == "ArrowLeft") {
				this.renderer?.moveCamera(-0.08, 0, 0);
			}
			if (event.code == "ArrowUp") {
				this.renderer?.moveCamera(0, 0, -0.08);
			}
			if (event.code == "ArrowDown") {
				this.renderer?.moveCamera(0.0, 0, 0.08);
			}
			if (event.code == "BracketRight") {
				this.renderer?.moveCamera(0, 0.08, 0);
			}
			if (event.code == "Slash") {
				this.renderer?.moveCamera(0, -0.08, 0);
			}
		});
	}

	private initTest(): void {
		this.logger.log(LogLevel.INFO, "Run init test");
	}

}
