//
// File.ts
//

import * as FS from "fs";

import ByteBuffer from "../../memory/ByteBuffer.ts";

class File {

	private constructor() {
	}

	public static exists(path: string): boolean {
		try {
			return FS.statSync(path).isFile();
		} catch (e: unknown) {
			return false;
		}
	}

	public static read(path: string): ByteBuffer {
		this.existsOrThrow(path);
		return ByteBuffer.FROM_SOURCE(FS.readFileSync(path, {
			encoding: null
		}));
	}

	public static readText(path: string, encoding: File.TextEncoding = File.TextEncoding.UTF_8): string {
		this.existsOrThrow(path);
		return FS.readFileSync(path, {
			encoding: encoding
		});
	}

	public static write(path: string, data: ByteBuffer, create: boolean = true): void {
		if (create == false) {
			this.existsOrThrow(path);
		}
		FS.writeFileSync(path, data.unsafeGetBuffer());
	}

	public static writeText(path: string, text: string, encoding: File.TextEncoding = File.TextEncoding.UTF_8, create: boolean = true): void {
		if (create == false) {
			this.existsOrThrow(path);
		}
		FS.writeFileSync(path, text, encoding);
	}

	private static existsOrThrow(path: string): void {
		if (!this.exists(path)) {
			throw new Error("File not found.");
		}
	}

}

namespace File {

	export const enum TextEncoding {
		ASCII = "ascii",
		UTF_8 = "utf8",
		UTF_16 = "utf16le"
	}

}

export default File;
