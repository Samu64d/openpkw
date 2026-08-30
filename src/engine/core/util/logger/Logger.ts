//
// Logger.ts
//

import ByteBuffer from "../../memory/ByteBuffer.ts";
import StringByteEncoder from "../../memory/StringByteEncoder.ts";
import OpenMode from "../../io/file/OpenMode.ts";
import File from "../../io/file/File.ts";
import FileHandler from "../../io/file/FileHandler.ts";
import LogLevel from "./LogLevel.ts";

export default class Logger {

	private readonly id: string;
	private readonly filePath: string;
	private readonly handler: FileHandler;

	public constructor(id: string, filePath: string) {
		this.id = id;
		this.filePath = filePath;
		this.handler = File.open(filePath, OpenMode.WRITE_CREATE);
		this.log(LogLevel.INFO, "Start logging at " + new Date().toISOString());
	}

	public getId(): string {
		return this.id;
	}

	public getFilePath(): string {
		return this.filePath;
	}

	public log(logLevel: LogLevel, text: string): void {
		if (this.handler.isValid() == true) {
			const logText: string = "[" + this.getId() + "] [" + logLevel.toString() + "] " + text + "\n";
			const encoder: StringByteEncoder = new StringByteEncoder(logText);
			const byteBuffer: ByteBuffer = encoder.encode();
			this.handler.write(byteBuffer.getSize(), byteBuffer);
		}
	}

}
