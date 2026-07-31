//
// NodeFileSystemDriver.ts
//

import * as FS from "node:fs";

import ByteBuffer from "../../../core/memory/ByteBuffer.ts";
import ErrorInspect from "../../../core/reflection/error/ErrorInspect.ts";
import TextEncoding from "../../../core/io/file/TextEncoding.ts";
import OpenMode from "../../../core/io/file/OpenMode.ts";
import AccessRight from "../../../core/io/file/AccessRight.ts";
import FileDescriptor from "../../../core/io/file/FileDescriptor.ts";
import FileSystemDriver from "../../../core/io/file/FileSystemDriver.ts";

export default class NodeFileSystemDriver extends FileSystemDriver {

	private static readonly TEXT_ENCODING_MAP: Record<TextEncoding, BufferEncoding> = {
		[TextEncoding.ASCII]: "ascii",
		[TextEncoding.UTF_8]: "utf8",
		[TextEncoding.UTF_16]: "utf16le"
	};

	private static readonly OPEN_MODE_MAP: Record<OpenMode, string> = {
		[OpenMode.READ]: "r",
		[OpenMode.WRITE]: "w",
		[OpenMode.READ_WRITE]: "r+"
	};

	public constructor() {
		super();
	}

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
		if (stats.isFIFO()) {
			throw new Error("Element is not a file.");
		}
		return stats.size;
	}

	public override readFile(path: string): ByteBuffer {
		return ByteBuffer.FROM_SOURCE(this.readBinaryFile(path));
	}

	public override readTextFile(path: string, textEncoding: TextEncoding = TextEncoding.UTF_8): string {
		return this.readBinaryFile(path).toString(this.mapTextEncoding(textEncoding));
	}

	public override writeFile(path: string, byteBuffer: ByteBuffer, create: boolean = true): void {
		this.writeBinaryFile(path, byteBuffer.unsafeGetBuffer(), create);
	}

	public override writeTextFile(path: string, text: string, create: boolean = true, encoding: TextEncoding = TextEncoding.UTF_8): void {
		this.writeBinaryFile(path, Buffer.from(text, this.mapTextEncoding(encoding)), create);
	}

	public override openFile(path: string, mode: OpenMode, textEncoding: TextEncoding): FileDescriptor {
		try {
			const fd: number = FS.openSync(path, this.mapOpenMode(mode), this.mapTextEncoding(textEncoding));
			return new FileDescriptor(fd);
		} catch (e: unknown) {
			throw new Error("Cannot open file");
		}
	}

	public override read(fileDescriptor: FileDescriptor, byteBuffer: ByteBuffer, offset: number, length: number, position: number): void {
		try {
			const fd: number = fileDescriptor.getId();
			FS.readSync(fd, byteBuffer.unsafeGetBuffer(), offset, length, position);
		} catch (e: unknown) {
			throw new Error("Cannot read file.");
		}
	}

	public override closeFile(fileDescriptor: FileDescriptor): void {
		try {
			const fd: number = fileDescriptor.getId();
			FS.closeSync(fd);
		} catch (e: unknown) {
			throw new Error("Cannot open file");
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

	private mapTextEncoding(textEncoding: TextEncoding): BufferEncoding {
		return NodeFileSystemDriver.TEXT_ENCODING_MAP[textEncoding];
	}

	private mapOpenMode(openMode: OpenMode): FS.Mode {
		return NodeFileSystemDriver.OPEN_MODE_MAP[openMode];
	}

	private getStat(path: string): FS.Stats {
		try {
			const stats: FS.Stats = FS.statSync(path);
			return stats;
		} catch (e: unknown) {
			throw new Error("Cannot access element stats.");
		}
	}

	private readBinaryFile(path: string): Buffer {
		try {
			return FS.readFileSync(path, {
				encoding: null
			});
		} catch (e: unknown) {
			throw new Error("Cannot read from file.");
		}
	}

	private writeBinaryFile(path: string, data: Buffer, create: boolean): void {
		try {
			if (create) {
				FS.writeFileSync(path, data, {
					flag: "w",
					encoding: null
				});
			} else {
				const fileDescriptor: number = FS.openSync(path, "r+");
				try {
					FS.ftruncateSync(fileDescriptor, 0);
					FS.writeFileSync(fileDescriptor, data, {
						encoding: null
					});
				} finally {
					FS.closeSync(fileDescriptor);
				}
			}
		} catch (e: unknown) {
			throw new Error("Cannot write to file.");
		}
	}

}
