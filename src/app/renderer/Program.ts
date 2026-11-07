//
// Program.ts
//

import Nullable from "../../engine/core/common/Nullable.ts";
import Supplier from "../../engine/core/common/Supplier.ts";
import ByteBuffer from "../../engine/core/io/buffer/ByteBuffer.ts";
import OpenMode from "../../engine/core/io/file/OpenMode.ts";
import File from "../../engine/core/io/file/File.ts";
import FileHandler from "../../engine/core/io/file/FileHandler.ts";
import StringByteDecoder from "../../engine/core/codec/StringByteDecoder.ts";
import Record from "../../engine/core/reflection/decorators/Record.ts";
import InvalidOperationException from "../../engine/core/exception/InvalidOperationException.ts";

@Record()
class Program {

	public static readonly BUILDER: Supplier<Program.Builder> = (): Program.Builder => {
		return new Program.Builder();
	};

	private readonly name: string;
	private readonly vertexShaderSource: string;
	private readonly fragmentShaderSource: string;

	public constructor(name: string, vertexShaderSource: string, fragmentShaderSource: string) {
		this.name = name;
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;
	}

	public getName(): string {
		return this.name;
	}

	public getVertexShaderSource(): string {
		return this.vertexShaderSource;
	}

	public getFragmentShaderSource(): string {
		return this.fragmentShaderSource;
	}

}

namespace Program {

	export class Builder {

		private loadShaderFile(filePath: string): string {
			const fileHandler: FileHandler = File.open(filePath, OpenMode.READ);
			const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
			const text: string = new StringByteDecoder().decode(byteBuffer);

			fileHandler.dispose();
			byteBuffer.dispose();
			return text;
		}

		private programName: Nullable<string>;
		private vertexShaderName: Nullable<string>;
		private fragmentShaderName: Nullable<string>;

		public constructor() {
			this.programName = null;
			this.vertexShaderName = null;
			this.fragmentShaderName = null;
		}

		public withName(levelName: string): this {
			this.programName = levelName;
			return this;
		}

		public withVertexShader(vertexShaderName: string): this {
			this.vertexShaderName = vertexShaderName;
			return this;
		}

		public withFragmentShader(withFragmentShader: string): this {
			this.fragmentShaderName = withFragmentShader;
			return this;
		}

		public build(): Program {
			if (this.programName == null) {
				throw new InvalidOperationException("Level name was not provided");
			}

			const vertexShaderSource: string = this.loadShaderFile(this.getVertexShaderFilePath());
			const fragmentShaderSource: string = this.loadShaderFile(this.getFragmentShaderFilePath());

			return new Program(this.programName, vertexShaderSource, fragmentShaderSource);
		}

		private getVertexShaderFilePath(): string {
			if (this.vertexShaderName == null) {
				throw new InvalidOperationException("Vertex shader name was not provided");
			}

			return "./resources/shader/" + this.vertexShaderName + ".vert";
		}

		private getFragmentShaderFilePath(): string {
			if (this.fragmentShaderName == null) {
				throw new InvalidOperationException("Fragment shader name was not provided");
			}

			return "./resources/shader/" + this.fragmentShaderName + ".frag";
		}

	}

}

export default Program;
