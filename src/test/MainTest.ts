//
// MainTest.ts
//

import Nullable from "../core/foundation/Nullable.ts";
import Logger from "../core/foundation/Logger.ts";
import FileSystem from "../core/platform/FileSystem.ts";
import ByteBuffer from "../core/memory/ByteBuffer.ts";
import PNGDecoder from "../core/media/codecs/png/PNGDecoder.ts";
import GLRenderer from "./GLRenderer.ts";

/** @tutorial test class */
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
		this.logger.log("Run init renderer");

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
		this.logger.log("Run init other");

		const buffer: Buffer = FileSystem.readFile("./resources/model/cliff_straight/cliff_straight.png");
		const byteBuffer: ByteBuffer = ByteBuffer.FROM_SOURCE(buffer);
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		//pngDecoder.decode();
	}

}
