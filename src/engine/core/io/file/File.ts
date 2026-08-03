//
// File.ts
//

import TextEncoding from "../../memory/TextEncoding.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ResourceHandle from "../../interop/ResourceHandle.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import AccessRight from "./AccessRight.ts";
import OpenMode from "./OpenMode.ts";
import FileHandler from "./FileHandler.ts";
import FileSystemDriver from "./FileSystemDriver.ts";

export default class File {

	public static getAccessRight(path: string): AccessRight {
		return DriverRegistry.get(FileSystemDriver).getAccessRight(path);
	}

	public static exists(path: string): boolean {
		return DriverRegistry.get(FileSystemDriver).existsFile(path);
	}

	public static getSize(path: string): number {
		return DriverRegistry.get(FileSystemDriver).getFileSize(path);
	}

	public static read(path: string): ByteBuffer {
		return DriverRegistry.get(FileSystemDriver).readFile(path);
	}

	public static readText(path: string, textEncoding: TextEncoding): string {
		return DriverRegistry.get(FileSystemDriver).readTextFile(path, textEncoding);
	}

	public static write(path: string, byteBuffer: ByteBuffer, create: boolean): void {
		DriverRegistry.get(FileSystemDriver).writeFile(path, byteBuffer, create);
	}

	public static writeText(path: string, text: string, create: boolean, textEncoding: TextEncoding): void {
		DriverRegistry.get(FileSystemDriver).writeTextFile(path, text, create, textEncoding);
	}

	public static open(path: string, openMode: OpenMode): FileHandler {
		try {
			const fileHandle: ResourceHandle = DriverRegistry.get(FileSystemDriver).openFD(path, openMode);
			const size: number = DriverRegistry.get(FileSystemDriver).getFileSize(path);
			return new FileHandler(fileHandle, size, openMode);
		} catch (e: unknown) {
			throw new Error("Cannot open file: " + (e instanceof Error ? e.message : ""));
		}
	}

	public static move(sourcePath: string, destinationPath: string): void {
		DriverRegistry.get(FileSystemDriver).moveFile(sourcePath, destinationPath);
	}

}
