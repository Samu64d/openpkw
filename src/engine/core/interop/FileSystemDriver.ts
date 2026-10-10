//
// FileSystemDriver.ts
//

import ByteBuffer from "../io/buffer/ByteBuffer.ts";
import AccessRight from "../io/file/AccessRight.ts";
import OpenMode from "../io/file/OpenMode.ts";
import TextEncoding from "../codec/TextEncoding.ts";
import ResourceHandle from "./ResourceHandle.ts";
import Driver from "./Driver.ts";

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

	public abstract openFD(path: string, openMode: OpenMode): ResourceHandle;

	public abstract readFD(fileHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void;

	public abstract writeFD(fileHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void;

	public abstract closeFD(fileHandle: ResourceHandle): void;

	public abstract moveFile(sourcePath: string, destinationPath: string): void;

	public abstract dispose(): void;

}
