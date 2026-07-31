//
// FileHandler.ts
//

import Nullable from "../../common/Nullable.ts";
import Endian from "../../memory/Endian.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../memory/ByteBufferReader.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import Seekable from "../stream/Seekable.ts";
import OpenMode from "./OpenMode.ts";
import FileDescriptor from "./FileDescriptor.ts";
import FileSystemDriver from "./FileSystemDriver.ts";

@Disposable()
export default class FileHandler extends Seekable implements Disposable.Target {

	private readonly path: string;
	private descriptor: Nullable<FileDescriptor>;
	private readonly mode: OpenMode;
	private readonly localBuffer: ByteBuffer;
	private readonly localBufferReader: ByteBufferReader;

	public constructor(path: string, descriptor: FileDescriptor, size: number, mode: OpenMode = OpenMode.READ_WRITE) {
		super(size);
		this.path = path;
		this.descriptor = descriptor;
		this.mode = mode;
		this.localBuffer = ByteBuffer.ALLOCATE(4, 0);
		this.localBufferReader = new ByteBufferReader(this.localBuffer);
	}

	public getPath(): string {
		return this.path;
	}

	public getDescriptor(): Nullable<FileDescriptor> {
		return this.descriptor;
	}

	public getMode(): OpenMode {
		return this.mode;
	}

	public isValid(): boolean {
		return this.descriptor != null;
	}

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 1);
		this.readIntoBuffer(resolvedPosition, 1, this.localBuffer);
		return this.localBufferReader.readUint8(0);
	}

	public readUint16(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePosition(position, 2);
		this.readIntoBuffer(resolvedPosition, 2, this.localBuffer);
		return this.localBufferReader.readUint16(0, endianness);
	}

	public readUint24(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePosition(position, 3);
		this.readIntoBuffer(resolvedPosition, 3, this.localBuffer);
		return this.localBufferReader.readUint24(0, endianness);
	}

	public readUint32(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePosition(position, 4);
		this.readIntoBuffer(resolvedPosition, 4, this.localBuffer);
		return this.localBufferReader.readUint32(0, endianness);
	}

	public read(length: number, position: Nullable<number> = null): ByteBuffer {
		const resolvedPosition: number = this.resolvePosition(position, length);
		return this.readCreateBuffer(resolvedPosition, length);
	}

	public readInto(length: number, byteBuffer: ByteBuffer, position: Nullable<number> = null): ByteBuffer {
		const resolvedPosition: number = this.resolvePosition(position, length);
		return this.readIntoBuffer(resolvedPosition, length, byteBuffer);
	}

	public dispose(): void {
		try {
			if (this.descriptor != null) {
				const fileDescriptor: FileDescriptor = this.tryGetDescriptor();
				FileSystemDriver.getActiveDriver().closeFile(fileDescriptor);
			}
		} catch (e: unknown) {
			throw new Error("Cannot close file.");
		} finally {
			this.descriptor = null;
		}
	}

	private resolvePosition(position: Nullable<number>, length: number): number {
		if (position == null) {
			const currentCursor: number = this.cursor;
			this.advance(length);
			return currentCursor;
		} else if (!this.isInBounds(position, length)) {
			throw new Error("Out of bounds access.");
		}
		return position;
	}

	private tryGetDescriptor(): FileDescriptor {
		if (this.isValid() == false) {
			throw new Error("Trying to access an invalid descriptor.");
		}
		const fileDescriptor: FileDescriptor = this.getDescriptor() as FileDescriptor;
		return fileDescriptor;
	}

	private readIntoBuffer(position: number, length: number, byteBuffer: ByteBuffer): ByteBuffer {
		const fileDescriptor: FileDescriptor = this.tryGetDescriptor();
		FileSystemDriver.getActiveDriver().read(fileDescriptor, byteBuffer, 0, length, position);
		return byteBuffer;
	}

	private readCreateBuffer(position: number, length: number): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE_UNSAFE(length);
		return this.readIntoBuffer(position, length, byteBuffer);
	}

}
