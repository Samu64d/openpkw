//
// File.ts
//

import ByteBuffer from "../../memory/ByteBuffer.ts";
import TextEncoding from "./TextEncoding.ts";
import OpenMode from "./OpenMode.ts";
import AccessRight from "./AccessRight.ts";
import FileDescriptor from "./FileDescriptor.ts";
import FileHandler from "./FileHandler.ts";
import FileSystemDriver from "./FileSystemDriver.ts";

export default class File {

	public static exists(path: string): boolean {
		return FileSystemDriver.getActiveDriver().existsFile(path);
	}

	public static getAccessRight(path: string): AccessRight {
		return FileSystemDriver.getActiveDriver().getAccessRight(path);
	}

	public static getSize(path: string): number {
		return FileSystemDriver.getActiveDriver().getFileSize(path);
	}

	public static read(path: string): ByteBuffer {
		return FileSystemDriver.getActiveDriver().readFile(path);
	}

	public static readText(path: string, textEncoding: TextEncoding): string {
		return FileSystemDriver.getActiveDriver().readTextFile(path, textEncoding);
	}

	public static write(path: string, byteBuffer: ByteBuffer, create: boolean): void {
		FileSystemDriver.getActiveDriver().writeFile(path, byteBuffer, create);
	}

	public static writeText(path: string, text: string, create: boolean, textEncoding: TextEncoding): void {
		FileSystemDriver.getActiveDriver().writeTextFile(path, text, create, textEncoding);
	}

	public static open(path: string, mode: OpenMode, textEncoding: TextEncoding): FileHandler {
		try {
			const fileDescriptor: FileDescriptor = FileSystemDriver.getActiveDriver().openFile(path, mode, textEncoding);
			const size: number = FileSystemDriver.getActiveDriver().getFileSize(path);
			return new FileHandler(path, fileDescriptor, size, mode);
		} catch (e: unknown) {
			throw new Error("Cannot open file.");
		}
	}

	public static move(sourcePath: string, destinationPath: string): void {
		FileSystemDriver.getActiveDriver().moveFile(sourcePath, destinationPath);
	}

}
