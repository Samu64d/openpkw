//
// FileSystemDriver.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import TextEncoding from "./TextEncoding.ts";
import OpenMode from "./OpenMode.ts";
import AccessRight from "./AccessRight.ts";
import FileDescriptor from "./FileDescriptor.ts";

export default abstract class FileSystemDriver {

	public static registerDriver(driver: FileSystemDriver): void {
		this.activeDriver = driver;
	}

	public static getActiveDriver(): FileSystemDriver {
		if (!this.activeDriver) {
			throw new Error("No driver registered.");
		}
		return this.activeDriver;
	}

	private static activeDriver: Nullable<FileSystemDriver> = null;

	public constructor() { }

	public abstract getAccessRight(path: string): AccessRight;

	public abstract existsDirectory(path: string): boolean;

	public abstract existsFile(path: string): boolean;

	public abstract getFileSize(path: string): number;

	public abstract readFile(path: string): ByteBuffer;

	public abstract readTextFile(path: string, textEncoding: TextEncoding): string;

	public abstract writeFile(path: string, byteBuffer: ByteBuffer, create: boolean): void;

	public abstract writeTextFile(path: string, text: string, create: boolean, textEncoding: TextEncoding): void;

	public abstract openFile(path: string, mode: OpenMode, textEncoding: TextEncoding): FileDescriptor;

	public abstract read(fileDescriptor: FileDescriptor, byteBuffer: ByteBuffer, offset: number, length: number, position: number): void;

	public abstract closeFile(fileDescriptor: FileDescriptor): void;

	public abstract moveFile(sourcePath: string, destinationPath: string): void;

}
