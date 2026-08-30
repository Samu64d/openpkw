//
// Openpkw.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import ByteBuffer from "../engine/core/memory/ByteBuffer.ts";
import OpenMode from "../engine/core/io/file/OpenMode.ts";
import File from "../engine/core/io/file/File.ts";
import FileHandler from "../engine/core/io/file/FileHandler.ts";
import FileSystemDriver from "../engine/core/io/file/FileSystemDriver.ts";
import DriverRegistry from "../engine/core/interop/DriverRegistry.ts";
import PNGDecoder from "../engine/core/media/codecs/png/PNGDecoder.ts";
import LogLevel from "../engine/core/util/logger/LogLevel.ts";
import Logger from "../engine/core/util/logger/Logger.ts";
import NodeFileSystemDriver from "../engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import GLRenderer from "./GLRenderer.ts";

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
	private renderer: Nullable<GLRenderer>;

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

		const context: Nullable<WebGL2RenderingContext> = canvasElement.getContext("webgl2");
		if (context == null) {
			return;
		}

		this.renderer = new GLRenderer(context);
		this.renderer.init();
		this.lastUpdateTime = performance.now();
		window.requestAnimationFrame(this.updateRenderer.bind(this));
	}

	private initTest(): void {
		this.logger.log(LogLevel.INFO, "Run init test");

		const fileHandler: FileHandler = File.open("./resources/model/sign_0/sign_0.png", OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		pngDecoder.decode();

	}

}
