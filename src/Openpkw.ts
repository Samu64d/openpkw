//
// Openpkw.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import MemoryDriver from "./engine/core/interop/MemoryDriver.ts";
import FileSystemDriver from "./engine/core/interop/FileSystemDriver.ts";
import KeyboardDriver from "./engine/core/interop/KeyboardDriver.ts";
import DriverRegistry from "./engine/core/interop/DriverRegistry.ts";
import Logger from "./engine/core/util/logger/Logger.ts";
import Exception from "./engine/core/exception/Exception.ts";
import BrowserMemoryDriver from "./engine/drivers/memory/browser/BrowserMemoryDriver.ts";
import NodeFileSystemDriver from "./engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import BrowserKeyboardDriver from "./engine/drivers/keyboard/browser/BrowserKeyboardDriver.ts";
import NodeProcess from "./engine/platform/node/NodeProcess.ts";
import CanvasApplication from "./engine/application/CanvasApplication.ts";
import Tiles from "./app/level/Tiles.ts";
import Props from "./app/level/Props.ts";
import Programs from "./app/renderer/Programs.ts";
import Levels from "./app/level/Levels.ts";
import LevelRenderer from "./app/renderer/LevelRenderer.ts";

export default class Openpkw extends CanvasApplication {

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
	private readonly keyboard: KeyboardDriver;
	private renderer: Nullable<LevelRenderer>;
	private time: number;
	private lastUpdateTime: number;
	private lastKeyPressTime: number;

	private constructor() {
		super(CanvasApplication.ADAPTIVE_RESOLUTION(0.6), true);

		this.logger = new Logger(Openpkw.LOG_ID, Openpkw.LOG_FILE_NAME);
		this.keyboard = DriverRegistry.get(KeyboardDriver);
		this.renderer = null;
		this.time = 0;
		this.lastUpdateTime = -1;
		this.lastKeyPressTime = -1;
	}

	public override onReady(): void {
		this.logger.info("Start initializing application");

		Tiles.registryAll();
		Props.registryAll();
		Programs.registryAll();
		Levels.registryAll();
		this.initRenderer();
		this.initAudio();
	}

	public override onClientResize(width: number, height: number): void {
	}

	public override onCanvasResize(width: number, height: number): void {
		if (this.renderer == null) {
			return;
		}

		this.renderer.setViewportSize(width, height);
		this.renderer.draw(this.time);
	}

	public override onRenderingContextLost(): void {
	}

	public override onRenderingContextRestored(): void {
	}

	public override onError(e: unknown): void {
	}

	public override dispose(): void {
		super.dispose();

		this.logger.dispose();
	}

	public getRenderer(): Nullable<LevelRenderer> {
		return this.renderer;
	}

	public getTime(): number {
		return this.time;
	}

	private updateRenderer(): void {
		if (this.renderer == null) {
			return;
		}

		const now: number = performance.now();
		const elapsed: number = now - this.lastUpdateTime;

		if (elapsed > 10) {
			this.lastUpdateTime = now - (elapsed % 10);

			if (this.keyboard.isKeyPressed("ArrowRight")) {
				this.renderer.offsetCamera(0.025, 0, 0);
			}
			if (this.keyboard.isKeyPressed("ArrowLeft")) {
				this.renderer.offsetCamera(-0.025, 0, 0);
			}
			if (this.keyboard.isKeyPressed("ArrowUp")) {
				this.renderer.offsetCamera(0, 0, -0.025);
			}
			if (this.keyboard.isKeyPressed("ArrowDown")) {
				this.renderer.offsetCamera(0.0, 0, 0.025);
			}
			if (this.keyboard.isKeyPressed("BracketRight")) {
				this.renderer.offsetCamera(0, 0.025, 0);
			}
			if (this.keyboard.isKeyPressed("Slash")) {
				this.renderer.offsetCamera(0, -0.025, 0);
			}
			if (this.keyboard.isKeyPressed("KeyP")) {
				if (now - this.lastKeyPressTime > 100) {
					this.lastKeyPressTime = now;
					this.renderer.setDebugLines(!this.renderer.getDebugLines());
				}
			}

			this.time += 1;
		}

		this.renderer.draw(this.time);
		this.browserWindow.requestAnimationFrame(this.updateRenderer.bind(this));
	}

	private initRenderer(): void {
		const renderingContext: Nullable<WebGL2RenderingContext> = this.getRenderingContext();

		if (renderingContext == null) {
			throw new Error("Cannot access rendering context");
		}

		this.renderer = new LevelRenderer(Levels.get("level_0"), renderingContext);
		this.renderer.init();
		this.lastUpdateTime = performance.now();
		this.browserWindow.requestAnimationFrame(this.updateRenderer.bind(this));

		this.logger.info("Requesting update frame completed");
	}

	private initAudio(): void {
		// Test
		const audio: HTMLAudioElement = document.createElement("audio");
		document.body.appendChild(audio);
		audio.src = "./resources/music/track/track_1.mp3";
		audio.loop = true;
		audio.style.display = "none";
		void audio.play();
	}

	static {
		if (NodeProcess.getType() == NodeProcess.Type.RENDERER) {
			DriverRegistry.register(MemoryDriver, new BrowserMemoryDriver());
			DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());
			DriverRegistry.register(KeyboardDriver, new BrowserKeyboardDriver());

			Openpkw.instance = new Openpkw();
		}
	}

}
