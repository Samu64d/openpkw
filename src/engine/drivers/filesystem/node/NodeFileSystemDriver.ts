//
// NodeFileSystemDriver.ts
//

import * as Fs from "node:fs";

import ReadonlyRecord from "../../../core/common/ReadonlyRecord.ts";
import ByteBuffer from "../../../core/io/buffer/ByteBuffer.ts";
import AccessRight from "../../../core/io/file/AccessRight.ts";
import OpenMode from "../../../core/io/file/OpenMode.ts";
import TextEncoding from "../../../core/codec/TextEncoding.ts";
import FileSystemDriver from "../../../core/interop/FileSystemDriver.ts";
import ResourceHandle from "../../../core/interop/ResourceHandle.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import IOException from "../../../core/exception/IOException.ts";

@Disposable()
export default class NodeFileSystemDriver extends FileSystemDriver implements Disposable.Target {

	private static readonly TEXT_ENCODING_MAP: ReadonlyRecord<TextEncoding, BufferEncoding> = {
		[TextEncoding.ASCII]: "ascii",
		[TextEncoding.UTF_8]: "utf8",
		[TextEncoding.UTF_16LE]: "utf16le"
	};

	private static readonly OPEN_MODE_MAP: ReadonlyRecord<OpenMode, string> = {
		[OpenMode.READ]: "r",
		[OpenMode.WRITE_CREATE]: "w",
		[OpenMode.READ_WRITE]: "r+",
		[OpenMode.READ_WRITE_CREATE]: "w+"
	};

	private fileHandleNextId: number;
	private fileHandleMap: Map<ResourceHandle, number>;

	public constructor() {
		super();

		this.fileHandleNextId = 0;
		this.fileHandleMap = new Map<ResourceHandle, number>();
	}

	public override init(): void {
	}

	public override getAccessRight(path: string): AccessRight {
		let accessRight: AccessRight = AccessRight.NONE;

		try {
			Fs.accessSync(path, Fs.constants.R_OK);
			accessRight = AccessRight.READ;
		} catch (e: unknown) {
		}

		try {
			Fs.accessSync(path, Fs.constants.W_OK);
			accessRight = accessRight == AccessRight.NONE ? AccessRight.WRITE : AccessRight.READ_WRITE;
		} catch (e: unknown) {
		}

		return accessRight;
	}

	public override existsDirectory(path: string): boolean {
		return this.getStats(path).isDirectory();
	}

	public override existsFile(path: string): boolean {
		return this.getStats(path).isFile();
	}

	public override getFileSize(path: string): number {
		const stats: Fs.Stats = this.getStats(path);

		if (stats.isFile() == false) {
			throw new IOException("Element at path exists but is not a file");
		}

		return stats.size;
	}

	public override readFile(path: string): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.readBinaryFile(path));
	}

	public override readTextFile(path: string, textEncoding: TextEncoding = TextEncoding.UTF_8): string {
		return this.readDecodeTextFile(path, this.mapTextEncoding(textEncoding));
	}

	public override writeFile(path: string, byteBuffer: ByteBuffer, create: boolean = true): void {
		this.writeBinaryFile(path, byteBuffer.unsafeGetSourceView(), create);
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
			Fs.fstatSync(fd);
			return true;
		} catch (e: unknown) {
			return false;
		}
	}

	public override openFD(path: string, openMode: OpenMode): ResourceHandle {
		try {
			const fd: number = Fs.openSync(path, this.mapOpenMode(openMode));

			return this.registerFileHandle(fd);
		} catch (e: unknown) {
			throw new IOException("Cannot open file", e);
		}
	}

	public override readFD(fileHandle: ResourceHandle, position: number, length: number, buffer: ByteBuffer, bufferPosition: number): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);

			Fs.readSync(fd, buffer.unsafeGetSourceView(), bufferPosition, length, position);
		} catch (e: unknown) {
			throw new IOException("Cannot read from file", e);
		}
	}

	public override writeFD(fileHandle: ResourceHandle, position: number, length: number, byteBuffer: ByteBuffer, bufferPosition: number): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);

			Fs.writeSync(fd, byteBuffer.unsafeGetSourceView(), bufferPosition, length, position);
		} catch (e: unknown) {
			throw new IOException("Cannot write to file", e);
		}
	}

	public override closeFD(fileHandle: ResourceHandle): void {
		try {
			const fd: number = this.accessFileHandle(fileHandle);

			Fs.closeSync(fd);
		} catch (e: unknown) {
			throw new IOException("Cannot close file", e);
		} finally {
			this.unregisterFileHandle(fileHandle);
		}
	}

	public override moveFile(sourcePath: string, destinationPath: string): void {
		try {
			Fs.renameSync(sourcePath, destinationPath);
		} catch (e: unknown) {
			if (e instanceof Error && e.code == "EXDEV") {
				Fs.copyFileSync(sourcePath, destinationPath);
				Fs.unlinkSync(sourcePath);
				return;
			}

			throw new IOException("Cannot move file", e);
		}
	}

	public override dispose(): void {
	}

	private mapTextEncoding(textEncoding: TextEncoding): BufferEncoding {
		return NodeFileSystemDriver.TEXT_ENCODING_MAP[textEncoding];
	}

	private mapOpenMode(openMode: OpenMode): Fs.Mode {
		return NodeFileSystemDriver.OPEN_MODE_MAP[openMode];
	}

	private getStats(path: string): Fs.Stats {
		try {
			return Fs.statSync(path);
		} catch (e: unknown) {
			throw new IOException("Cannot access stats", e);
		}
	}

	private readBinaryFile(path: string): Uint8Array {
		try {
			return Fs.readFileSync(path, {
				encoding: null
			});
		} catch (e: unknown) {
			throw new IOException("Cannot read from file", e);
		}
	}

	private readDecodeTextFile(path: string, encoding: BufferEncoding): string {
		try {
			return Fs.readFileSync(path, {
				encoding: encoding
			});
		} catch (e: unknown) {
			throw new IOException("Cannot read from file", e);
		}
	}

	private writeBinaryFile(path: string, target: Uint8Array, create: boolean): void {
		try {
			if (create) {
				Fs.writeFileSync(path, target, {
					flag: "w",
					encoding: null
				});
			} else {
				const fd: number = Fs.openSync(path, "r+");

				try {
					Fs.ftruncateSync(fd, 0);
					Fs.writeFileSync(fd, target, {
						encoding: null
					});
				} finally {
					Fs.closeSync(fd);
				}
			}
		} catch (e: unknown) {
			throw new IOException("Cannot write to file", e);
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
