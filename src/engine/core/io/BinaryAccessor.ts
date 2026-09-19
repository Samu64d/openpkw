//
// ByteBufferAccessor.ts
//

import Nullable from "../common/Nullable.ts";
import Endian from "../memory/Endian.ts";
import Buffer from "../memory/Buffer.ts";
import SeekableAccessor from "./SeekableAccessor.ts";

export default abstract class BinaryAccessor<T extends Buffer<number>> extends SeekableAccessor<T> {

	protected readonly defaultEndianness: Endian;

	public constructor(buffer: T, defaultEndianness: Endian = Endian.LITTLE) {
		super(buffer);
		this.defaultEndianness = defaultEndianness;
	}

	public getDefaultEndianness(): Endian {
		return this.defaultEndianness;
	}

	protected isLittleEndian(endianness: Nullable<Endian> = null): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
