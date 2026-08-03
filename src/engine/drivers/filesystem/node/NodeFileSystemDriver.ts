//
// NodeFileSystemDriver.ts
//

import * as FS from "node:fs";

import TextEncoding from "../../../core/memory/TextEncoding.ts";
import ByteBuffer from "../../../core/memory/ByteBuffer.ts";
import AccessRight from "../../../core/io/file/AccessRight.ts";
import OpenMode from "../../../core/io/file/OpenMode.ts";
import FileSystemDriver from "../../../core/io/file/FileSystemDriver.ts";
import ResourceHandle from "../../../core/interop/ResourceHandle.ts";
import ErrorInspect from "../../../core/reflection/error/ErrorInspect.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";

@Disposable()
export default class NodeFileSystemDriver extends FileSystemDriver {

	private static readonly TEXT_ENCODING_MAP: Readonly<Record<TextEncoding, BufferEncoding>> = {
		[TextEncoding.ASCII]: "ascii",
		[TextEncoding.UTF_8]: "utf8",
		[TextEncoding.UTF_16]: "utf16le"
	};

	private static readonly OPEN_MODE_MAP: Readonly<Record<OpenMode, string>> = {
		[OpenMode.READ]: "r",
		[OpenMode.WRITE]: "w",
		[OpenMode.READ_WRITE]: "r+"
	};

	private fileHandleNextId: number;
	private fileHandleMap: Map<ResourceHandle, number>;

	public constructor() {
		super();
		this.fileHandleNextId = 0;
		this.fileHandleMap = new Map<ResourceHandle, number>();
	}

	public override init(): void { }

	public override getAccessRight(path: string): AccessRight {
		let accessRight: AccessRight = AccessRight.NONE;

		try {
			FS.accessSync(path, FS.constants.R_OK);
			accessRight = AccessRight.READ;
		} catch (e: unknown) { }

		try {
			FS.accessSync(path, FS.constants.W_OK);
			accessRight = accessRight == AccessRight.NONE ? AccessRight.WRITE : AccessRight.READ_WRITE;
		} catch (e: unknown) { }

		return accessRight;
	}

	public override existsDirectory(path: string): boolean {
		return this.getStat(path).isDirectory();
	}

	public override existsFile(path: string): boolean {
		return this.getStat(path).isFile();
	}

	public override getFileSize(path: string): number {
		const stats: FS.Stats = this.getStat(path);
		if (stats.isFile() == false) {
			throw new Error("Element at path is not a file.");
		}
		return stats.size;
	}

	public override readFile(path: string): ByteBuffer {
		return new ByteBuffer(this.readBinaryFile(path));
	}

	public override readTextFile(path: string, textEncoding: TextEncoding = TextEncoding.UTF_8): string {
		return this.readDecodeTextFile(path, this.mapTextEncoding(textEncoding));
	}

	public override writeFile(path: string, byteBuffer: ByteBuffer, create: boolean = true): void {
		this.writeBinaryFile(path, byteBuffer.unsafeGetData(), create);
	}

	public override writeTextFile(path: string, text: string, create: boolean = true, encoding: TextEncoding = TextEncoding.UTF_8): void {
		this.writeBinaryFile(path, Buffer.from(text, this.mapTextEncoding(encoding)), create);
	}

	public override isValidFD(fileHandle: ResourceHandle): boolean {
		const fd: number = this.accessFileHandle(fileHandle);
		if (fd == -1) {
			return false;
		}

		try {
			FS.fstatSync(fd);
			return true;
		} catch (e: unknown) {
			return false;
		}
	}

	public override openFD(path: string, mode: OpenMode): ResourceHandle {
		try {
			const fd: number = FS.openSync(path, this.mapOpenMode(mode));
			return this.registerFileHandle(fd);
		} catch (e: unknown) {
			throw new Error("Cannot open file: " + (e instanceof Error ? e.message : ""));
		}
	}

	public override readFD(fileHandle: ResourceHandle, position: number, length: number, buffer: ByteBuffer, bufferPosition: number): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);
			FS.readSync(fd, buffer.unsafeGetData(), bufferPosition, length, position);
		} catch (e: unknown) {
			throw new Error("Cannot read from file.");
		}
	}

	public override writeFD(fileHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);
			FS.writeSync(fd, byteBuffer.unsafeGetData(), bufferPosition, length, position);
		} catch (e: unknown) {
			throw new Error("Cannot write to file.");
		}
	}

	public override closeFD(fileHandle: ResourceHandle): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);
			FS.closeSync(fd);
		} catch (e: unknown) {
			throw new Error("Cannot close file.");
		} finally {
			this.unregisterFileHandle(fileHandle);
		}
	}

	public override moveFile(sourcePath: string, destinationPath: string): void {
		try {
			FS.renameSync(sourcePath, destinationPath);
		} catch (e: unknown) {
			if (ErrorInspect.castToErrnoException(e) && e.code == "EXDEV") {
				FS.copyFileSync(sourcePath, destinationPath);
				FS.unlinkSync(sourcePath);
				return;
			}
			throw new Error("Cannot move file.");
		}
	}

	public override dispose(): void { }

	private mapTextEncoding(textEncoding: TextEncoding): BufferEncoding {
		return NodeFileSystemDriver.TEXT_ENCODING_MAP[textEncoding];
	}

	private mapOpenMode(openMode: OpenMode): FS.Mode {
		return NodeFileSystemDriver.OPEN_MODE_MAP[openMode];
	}

	private getStat(path: string): FS.Stats {
		try {
			return FS.statSync(path);
		} catch (e: unknown) {
			throw new Error("Cannot access stats.");
		}
	}

	private readBinaryFile(path: string): Uint8Array {
		try {
			return FS.readFileSync(path, {
				encoding: null
			});
		} catch (e: unknown) {
			throw new Error("Cannot read from file.");
		}
	}

	private readDecodeTextFile(path: string, encoding: BufferEncoding): string {
		try {
			return FS.readFileSync(path, {
				encoding: encoding
			});
		} catch (e: unknown) {
			throw new Error("Cannot read from file.");
		}
	}

	private writeBinaryFile(path: string, target: Uint8Array, create: boolean): void {
		try {
			if (create) {
				FS.writeFileSync(path, target, {
					flag: "w",
					encoding: null
				});
			} else {
				const fd: number = FS.openSync(path, "r+");
				try {
					FS.ftruncateSync(fd, 0);
					FS.writeFileSync(fd, target, {
						encoding: null
					});
				} finally {
					FS.closeSync(fd);
				}
			}
		} catch (e: unknown) {
			throw new Error("Cannot write to file.");
		}
	}

	private registerFileHandle(fd: number): ResourceHandle {
		const fileHandle: number = this.fileHandleNextId++;
		this.fileHandleMap.set(fileHandle, fd);
		return fileHandle;
	}

	private accessFileHandle(fileHandle: ResourceHandle): number {
		return this.fileHandleMap.get(fileHandle) ?? -1;
	}

	private unregisterFileHandle(fileHandle: ResourceHandle): void {
		this.fileHandleMap.delete(fileHandle);
	}

}
