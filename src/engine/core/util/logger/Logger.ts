//
// Logger.ts
//

import ByteBuffer from "../../io/buffer/ByteBuffer.ts";
import OpenMode from "../../io/file/OpenMode.ts";
import File from "../../io/file/File.ts";
import FileHandler from "../../io/file/FileHandler.ts";
import StringByteEncoder from "../../codec/StringByteEncoder.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import LogLevel from "./LogLevel.ts";

@Disposable()
export default class Logger implements Disposable.Target {

	private readonly id: string;
	private readonly filePath: string;
	private readonly handler: FileHandler;
	private readonly encoder: StringByteEncoder;

	public constructor(id: string, filePath: string) {
		this.id = id;
		this.filePath = filePath;
		this.handler = File.open(filePath, OpenMode.WRITE_CREATE);
		this.encoder = new StringByteEncoder();
		this.log(LogLevel.INFO, "Start logging session");
	}

	public getId(): string {
		return this.id;
	}

	public getFilePath(): string {
		return this.filePath;
	}

	public log(logLevel: LogLevel, text: string): void {
		if (this.handler.isValid() == false) {
			return;
		}

		const logLine: string = this.buildLogLine(logLevel, text);
		const byteBuffer: ByteBuffer = this.encoder.encode(logLine);

		this.handler.write(byteBuffer.getCapacity(), byteBuffer, this.handler.getSize());
	}

	public dispose(): void {
		this.log(LogLevel.INFO, "End logging session");
		this.handler.dispose();
	}

	private buildLogLine(logLevel: LogLevel, text: string): string {
		const id: string = this.getId();
		const level: string = logLevel.toString();
		const time: string = new Date().toISOString();

		return "[" + id + "] [" + level + "] " + time + " " + text + "\n";
	}

}
