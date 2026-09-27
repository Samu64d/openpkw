//
// FileHandler.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import ResourceHandle from "../../interop/ResourceHandle.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import FileSystemDriver from "../../interop/FileSystemDriver.ts";
import ErrorInspect from "../../reflection/error/ErrorInspect.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import ByteBuffer from "../buffer/ByteBuffer.ts";
import MappedBuffer from "../buffer/MappedBuffer.ts";
import BufferAccessor from "../buffer/BufferAccessor.ts";
import ByteBufferReader from "../buffer/ByteBufferReader.ts";
import OpenMode from "./OpenMode.ts";

@Disposable()
export default class FileHandler extends BufferAccessor<MappedBuffer> implements Disposable.Target {

	private handle: ResourceHandle;
	private readonly mode: OpenMode;
	private readonly chunkBuffer: ByteBuffer;
	private readonly chunkBufferReader: ByteBufferReader;
	private readonly driver: FileSystemDriver;

	public constructor(handle: ResourceHandle, size: number, openMode: OpenMode = OpenMode.READ_WRITE) {
		const fileBuffer: MappedBuffer = new MappedBuffer(size);
		super(fileBuffer);
		this.handle = handle;
		this.mode = openMode;
		this.chunkBuffer = ByteBuffer.ALLOCATE(4, 0);
		this.chunkBufferReader = new ByteBufferReader(this.chunkBuffer);
		this.driver = DriverRegistry.get(FileSystemDriver);
	}

	public getMode(): OpenMode {
		return this.mode;
	}

	public isValid(): boolean {
		return this.driver.isValidFD(this.handle);
	}

	public getSize(): number {
		return this.buffer.getCapacity();
	}

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 1);

		this.readIntoBuffer(resolvedPosition, 1, this.chunkBuffer);
		const value: number = this.chunkBufferReader.readUint8(0);

		this.advanceIfUnspecified(1, position);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<ByteOrder> = ByteOrder.LITTLE_ENDIAN): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 2);

		this.readIntoBuffer(resolvedPosition, 2, this.chunkBuffer);
		const value: number = this.chunkBufferReader.readUint16(0, endianness);

		this.advanceIfUnspecified(2, position);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: ByteOrder = ByteOrder.LITTLE_ENDIAN): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 3);

		this.readIntoBuffer(resolvedPosition, 3, this.chunkBuffer);
		const value: number = this.chunkBufferReader.readUint24(0, endianness);

		this.advanceIfUnspecified(3, position);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: ByteOrder = ByteOrder.LITTLE_ENDIAN): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 4);

		this.readIntoBuffer(resolvedPosition, 4, this.chunkBuffer);
		const value: number = this.chunkBufferReader.readUint32(0, endianness);

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
		const delta: number = resolvedPosition + length - this.buffer.getCapacity();

		if (delta > 0) {
			this.buffer.grow(delta);
		}

		this.writeFromBuffer(resolvedPosition, length, byteBuffer);

		this.advanceIfUnspecified(length, position);
	}

	public dispose(): void {
		try {
			this.driver.closeFD(this.handle);
		} catch (e: unknown) {
			throw new Error("Cannot close file: " + (ErrorInspect.castToErrnoException(e) ? e.message : "Unknown error."));
		} finally {
			this.chunkBuffer.dispose();
		}
	}

	private readIntoBuffer(position: number, length: number, byteBuffer: ByteBuffer): void {
		if (length > byteBuffer.getCapacity()) {
			throw new Error("Cannot read into buffer: length must be at most equal to size value.");
		}

		this.driver.readFD(this.handle, position, length, byteBuffer, 0);
	}

	private readCreateBuffer(position: number, length: number): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(length);
		this.readIntoBuffer(position, length, byteBuffer);
		return byteBuffer;
	}

	private writeFromBuffer(position: number, length: number, byteBuffer: ByteBuffer): void {
		if (length > byteBuffer.getCapacity()) {
			throw new Error("Cannot write from buffer: length must be at most equal to size value.");
		}

		this.driver.writeFD(this.handle, position, length, byteBuffer, 0);
	}

}
