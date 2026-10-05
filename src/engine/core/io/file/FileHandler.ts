//
// FileHandler.ts
//

import ResourceHandle from "../../interop/ResourceHandle.ts";
import FileSystemDriver from "../../interop/FileSystemDriver.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import ErrorInspect from "../../error/ErrorInspect.ts";
import ByteBuffer from "../buffer/ByteBuffer.ts";
import MappedByteBuffer from "../buffer/MappedByteBuffer.ts";
import OpenMode from "./OpenMode.ts";

@Disposable()
export default class FileHandler implements Disposable.Target {

	private handle: ResourceHandle;
	private size: number;
	private readonly mode: OpenMode;
	private readonly driver: FileSystemDriver;
	private readonly chunkBuffer: ByteBuffer;

	public constructor(handle: ResourceHandle, size: number, openMode: OpenMode = OpenMode.READ_WRITE) {
		this.handle = handle;
		this.size = size;
		this.mode = openMode;
		this.driver = DriverRegistry.get(FileSystemDriver);
		this.chunkBuffer = ByteBuffer.ALLOCATE(4);
	}

	public getMode(): OpenMode {
		return this.mode;
	}

	public isReadonly(): boolean {
		return this.mode == OpenMode.READ;
	}

	public isValid(): boolean {
		return this.driver.isValidFD(this.handle);
	}

	public getSize(): number {
		return this.size;
	}

	public read(length: number, position: number = 0): ByteBuffer {
		return this.readCreateBuffer(position, length);
	}

	public readInto(length: number, byteBuffer: ByteBuffer, position: number = 0): ByteBuffer {
		this.readIntoBuffer(position, length, byteBuffer);
		return byteBuffer;
	}

	public write(length: number, byteBuffer: ByteBuffer, position: number = 0): void {
		const delta: number = position + length - this.size;

		if (delta > 0) {
			this.size += delta;
		}

		this.writeFromBuffer(position, length, byteBuffer);
	}

	public map(position: number, length: number): MappedByteBuffer {
		return new MappedByteBuffer(this);
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
			throw new Error("Cannot read into buffer: length must be at most equal to buffer capacity.");
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
			throw new Error("Cannot write from buffer: length must be at most equal to buffer capacity.");
		}

		this.driver.writeFD(this.handle, position, length, byteBuffer, 0);
	}

}
