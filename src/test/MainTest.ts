//
// MainTest.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import ByteBuffer from "../engine/core/memory/ByteBuffer.ts";
import OpenMode from "../engine/core/io/file/OpenMode.ts";
import File from "../engine/core/io/file/File.ts";
import FileHandler from "../engine/core/io/file/FileHandler.ts";
import FileSystemDriver from "../engine/core/io/file/FileSystemDriver.ts";
import PNGDecoder from "../engine/core/media/codecs/png/PNGDecoder.ts";
import DriverRegistry from "../engine/core/interop/DriverRegistry.ts";
import LogLevel from "../engine/core/util/logger/LogLevel.ts";
import Logger from "../engine/core/util/logger/Logger.ts";
import NodeFileSystemDriver from "../engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import GLRenderer from "./GLRenderer.ts";
import ByteBufferReader from "../engine/core/memory/ByteBufferReader.ts";

DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());

/** @test */
export default class MainTest {

	public static readonly instance: MainTest = new MainTest();

	private time: number;
	private lastUpdateTime: number;
	private renderer: Nullable<GLRenderer>;
	private logger: Logger;

	public constructor() {
		this.lastUpdateTime = -1;
		this.time = 0;
		this.renderer = null;
		this.logger = new Logger("./openpkw.log");
	}

	public updateRenderer(): void {
		const now: number = performance.now()
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

	public forceUpdateRenderer(): void {
		if (this.renderer != null) {
			this.renderer.update(this.time);
		}
	}

	public initRenderer(): void {
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

	public initOther(): void {
		this.logger.log(LogLevel.INFO, "Run init other");

		// Crappy test
		const byteBuffer2 = ByteBuffer.ALLOCATE(1000010, 12);
		const reader = new ByteBufferReader(byteBuffer2);
		const view = new DataView(byteBuffer2.unsafeGetData().buffer);


		const t2 = performance.now();
		for (let i = 0; i < 500000; i++) {
			view.getUint8(i * 2);
		}
		const t3 = performance.now();

				const t0 = performance.now();
	for (let i = 0; i < 500000; i++) {
			reader.readUint8(i * 2);
		}
		const t1 = performance.now();

		alert((t1 - t0) + " , " + (t3 - t2));

		const fileHandler: FileHandler = File.open("./resources/model/sign_0/sign_0.png", OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		pngDecoder.decode();

	}

}
