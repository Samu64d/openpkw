//
// MainTest.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import ByteBuffer from "../engine/core/memory/ByteBuffer.ts";
import ByteBufferReader from "../engine/core/memory/ByteBufferReader.ts";
import FileSystemDriver from "../engine/core/io/file/FileSystemDriver.ts";
import LogLevel from "../engine/core/io/log/LogLevel.ts";
import Logger from "../engine/core/io/log/Logger.ts";
import DriverRegistry from "../engine/core/interop/DriverRegistry.ts";
import NodeFileSystemDriver from "../engine/drivers/filesystem/node/NodeFileSystemDriver.ts";
import GLRenderer from "./GLRenderer.ts";

// Temp
DriverRegistry.register(FileSystemDriver, new NodeFileSystemDriver());

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
		//this.logger.log(LogLevel.INFO, "Run init renderer");

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

		const t0 = performance.now();
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(10000000, 22);
		const byteBufferReader: ByteBufferReader = new ByteBufferReader(byteBuffer);
		for (let i = 0; i < byteBuffer.getSize(); i++) {
			byteBufferReader.readUint8();
		}
		const t1 = performance.now();

		const t2 = performance.now();
		const buffer: Buffer = Buffer.alloc(10000000, 22);
		for (let i = 0; i < byteBuffer.getSize(); i++) {
			buffer.readInt8(i);
		}
		const t3 = performance.now();

		alert((t1 - t0) + " " + (t3 - t2));
	}

}

