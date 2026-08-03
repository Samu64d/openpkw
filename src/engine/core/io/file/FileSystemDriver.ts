//
// FileSystemDriver.ts
//

import TextEncoding from "../../memory/TextEncoding.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ResourceHandle from "../../interop/ResourceHandle.ts";
import Driver from "../../interop/Driver.ts";
import AccessRight from "./AccessRight.ts";
import OpenMode from "./OpenMode.ts";

export default abstract class FileSystemDriver implements Driver {

	public abstract init(): void;

	public abstract getAccessRight(path: string): AccessRight;

	public abstract existsDirectory(path: string): boolean;

	public abstract existsFile(path: string): boolean;

	public abstract getFileSize(path: string): number;

	public abstract readFile(path: string): ByteBuffer;

	public abstract readTextFile(path: string, textEncoding: TextEncoding): string;

	public abstract writeFile(path: string, byteBuffer: ByteBuffer, create: boolean): void;

	public abstract writeTextFile(path: string, text: string, create: boolean, textEncoding: TextEncoding): void;

	public abstract isValidFD(fileHandle: ResourceHandle): boolean;

	public abstract openFD(path: string, mode: OpenMode): ResourceHandle;

	public abstract readFD(fileHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void;

	public abstract writeFD(ResourceHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void;

	public abstract closeFD(ResourceHandle: ResourceHandle): void;

	public abstract moveFile(sourcePath: string, destinationPath: string): void;

	public abstract dispose(): void;

}
