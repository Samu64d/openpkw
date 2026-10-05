//
// File.ts
//

import TextEncoding from "../../codec/TextEncoding.ts";
import ResourceHandle from "../../interop/ResourceHandle.ts";
import FileSystemDriver from "../../interop/FileSystemDriver.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import ByteBuffer from "../buffer/ByteBuffer.ts";
import AccessRight from "./AccessRight.ts";
import OpenMode from "./OpenMode.ts";
import FileHandler from "./FileHandler.ts";

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

	public static readText(path: string, textEncoding: TextEncoding = TextEncoding.UTF_8): string {
		return DriverRegistry.get(FileSystemDriver).readTextFile(path, textEncoding);
	}

	public static write(path: string, byteBuffer: ByteBuffer, create: boolean = false): void {
		DriverRegistry.get(FileSystemDriver).writeFile(path, byteBuffer, create);
	}

	public static writeText(path: string, text: string, create: boolean = false, textEncoding: TextEncoding = TextEncoding.UTF_8): void {
		DriverRegistry.get(FileSystemDriver).writeTextFile(path, text, create, textEncoding);
	}

	public static open(path: string, openMode: OpenMode): FileHandler {
		try {
			const driver: FileSystemDriver = DriverRegistry.get(FileSystemDriver);
			const fileHandle: ResourceHandle = driver.openFD(path, openMode);
			const size: number = driver.getFileSize(path);

			return new FileHandler(fileHandle, size, openMode);
		} catch (e: unknown) {
			throw new Error("Cannot open file: " + (e instanceof Error ? e.message : ""));
		}
	}

	public static move(sourcePath: string, destinationPath: string): void {
		DriverRegistry.get(FileSystemDriver).moveFile(sourcePath, destinationPath);
	}

}
