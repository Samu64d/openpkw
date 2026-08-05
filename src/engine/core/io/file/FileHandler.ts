//
// FileHandler.ts
//

import Nullable from "../../common/Nullable.ts";
import Endian from "../../memory/Endian.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../memory/ByteBufferReader.ts";
import ResourceHandle from "../../interop/ResourceHandle.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import SeekableRandomAccess from "../SeekableRandomAccess.ts";
import OpenMode from "./OpenMode.ts";
import FileSystemDriver from "./FileSystemDriver.ts";

@Disposable()
export default class FileHandler extends SeekableRandomAccess implements Disposable.Target {

	private handle: ResourceHandle;
	private readonly mode: OpenMode;
	private readonly localBuffer: ByteBuffer;
	private readonly localBufferReader: ByteBufferReader;
	private readonly driver: FileSystemDriver;

	public constructor(handle: ResourceHandle, size: number, openMode: OpenMode = OpenMode.READ_WRITE) {
		super(size, true);
		this.handle = handle;
		this.mode = openMode;
		this.localBuffer = ByteBuffer.ALLOCATE(4, 0);
		this.localBufferReader = new ByteBufferReader(this.localBuffer);
		this.driver = DriverRegistry.get(FileSystemDriver);
	}

	public getMode(): OpenMode {
		return this.mode;
	}

	public isValid(): boolean {
		return this.driver.isValidFD(this.handle);
	}

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 1);
		this.readIntoBuffer(resolvedPosition, 1, this.localBuffer);
		const value: number = this.localBufferReader.readUint8(0);
		this.advanceIfUnspecified(1, position);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 2);
		this.readIntoBuffer(resolvedPosition, 2, this.localBuffer);
		const value: number = this.localBufferReader.readUint16(0, endianness);
		this.advanceIfUnspecified(2, position);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 3);
		this.readIntoBuffer(resolvedPosition, 3, this.localBuffer);
		const value: number = this.localBufferReader.readUint24(0, endianness);
		this.advanceIfUnspecified(3, position);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Endian = Endian.LITTLE): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 4);
		this.readIntoBuffer(resolvedPosition, 4, this.localBuffer);
		const value: number = this.localBufferReader.readUint32(0, endianness);
		this.advanceIfUnspecified(4, position);
		return value;
	}

	public read(length: number, position: Nullable<number> = null): ByteBuffer {
		const resolvedPosition: number = this.resolvePositionForAccess(position, length);
		const byteBuffer: ByteBuffer = this.readCreateBuffer(resolvedPosition, length);
		this.advanceIfUnspecified(length, position);
		return byteBuffer;
	}

	public readInto(length: number, byteBuffer: ByteBuffer, position: Nullable<number> = null): ByteBuffer {
		const resolvedPosition: number = this.resolvePositionForAccess(position, length);
		this.readIntoBuffer(resolvedPosition, length, byteBuffer);
		this.advanceIfUnspecified(length, position);
		return byteBuffer;
	}

	public write(length: number, byteBuffer: ByteBuffer, position: Nullable<number> = null): void {
		const resolvedPosition: number = this.resolvePositionForCapacity(position, length);
		this.writeFromBuffer(resolvedPosition, length, byteBuffer);
		const delta: number = resolvedPosition + length - this.getSize();
		if (delta > 0) {
			this.grow(delta);
		}
		this.advanceIfUnspecified(length, position);
	}

	public dispose(): void {
		try {
			this.driver.closeFD(this.handle);
		} catch (e: unknown) {
			throw new Error("Cannot close file.");
		} finally {
			this.localBuffer.dispose();
		}
	}

	private readIntoBuffer(position: number, length: number, byteBuffer: ByteBuffer): void {
		if (length > byteBuffer.getSize()) {
			throw new Error("Cannot read into buffer: length must be at most size value.");
		}
		this.driver.readFD(this.handle, position, length, byteBuffer, 0);
	}

	private readCreateBuffer(position: number, length: number): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(length);
		this.readIntoBuffer(position, length, byteBuffer);
		return byteBuffer;
	}

	private writeFromBuffer(position: number, length: number, byteBuffer: ByteBuffer): void {
		if (length > byteBuffer.getSize()) {
			throw new Error("Cannot write from buffer: length must be at most size value.");
		}
		this.driver.writeFD(this.handle, position, length, byteBuffer, 0);
	}

}
