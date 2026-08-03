//
// Logger.ts
//

import TextEncoding from "../../memory/TextEncoding.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import OpenMode from "../file/OpenMode.ts";
import File from "../file/File.ts";
import FileHandler from "../file/FileHandler.ts";
import LogLevel from "./LogLevel.ts";
import StringByteEncoder from "../../memory/StringByteEncoder.ts";

export default class Logger {

	private readonly filePath: string;
	private readonly handler: FileHandler;

	public constructor(filePath: string) {
		this.filePath = filePath;
		this.handler = File.open(filePath, OpenMode.WRITE);
		this.log(LogLevel.INFO, "Starting logger at " + new Date().toISOString());
	}

	public getFilePath(): string {
		return this.filePath;
	}

	public log(logLevel: LogLevel, text: string): void {
		if (this.handler.isValid() == true) {
			const logText: string = "[" + logLevel.toString() + "] " + text + "\n";
			const encoder: StringByteEncoder = new StringByteEncoder(logText);
			const byteBuffer: ByteBuffer = encoder.encode();
			this.handler.write(byteBuffer.getSize(), byteBuffer);
		}
	}

}
