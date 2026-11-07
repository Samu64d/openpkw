//
// Renderable.ts
//

import Nullable from "../../engine/core/common/Nullable.ts";
import ByteBuffer from "../../engine/core/io/buffer/ByteBuffer.ts";
import OpenMode from "../../engine/core/io/file/OpenMode.ts";
import File from "../../engine/core/io/file/File.ts";
import FileHandler from "../../engine/core/io/file/FileHandler.ts";
import PNGDecoder from "../../engine/core/format/png/PNGDecoder.ts";
import OBJDecoder from "../../engine/core/format/obj/OBJDecoder.ts";
import Image from "../../engine/core/resource/Image.ts";
import Mesh from "../../engine/core/resource/Mesh.ts";
import Record from "../../engine/core/reflection/decorators/Record.ts";

@Record()
abstract class Renderable {

	protected readonly name: string;
	protected readonly model: Mesh;
	protected readonly textureList: Image[];
	protected readonly programName: string;

	public constructor(name: string, model: Mesh, textureList: Image[], programName: string) {
		this.name = name;
		this.model = model;
		this.textureList = textureList;
		this.programName = programName;
	}

	public getName(): string {
		return this.name;
	}

	public getModel(): Mesh {
		return this.model;
	}

	public getTextureList(): Image[] {
		return this.textureList;
	}

	public getTexture(index: number): Image {
		return this.textureList[index];
	}

	public getProgramName(): string {
		return this.programName;
	}

}

namespace Renderable {

	export abstract class Builder {

		protected static loadModelFile(filePath: string): Mesh {
			const fileHandler: FileHandler = File.open(filePath, OpenMode.READ);
			const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
			const mesh: Mesh = new OBJDecoder(byteBuffer).decode();

			fileHandler.dispose();
			byteBuffer.dispose();
			return mesh;
		}

		protected static loadTextureFile(filePath: string): Image {
			const fileHandler: FileHandler = File.open(filePath, OpenMode.READ);
			const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
			const image: Image = new PNGDecoder(byteBuffer).decode();

			fileHandler.dispose();
			byteBuffer.dispose();
			return image;
		}

		protected name: Nullable<string>;
		protected modelName: Nullable<string>;
		protected textureName: Nullable<string>;
		protected programName: Nullable<string>;

		public constructor() {
			this.name = null;
			this.modelName = null;
			this.textureName = null;
			this.programName = null;
		}

		public withName(name: string): this {
			this.name = name;
			return this;
		}

		public withModel(modelName: string): this {
			this.modelName = modelName;
			return this;
		}

		public withTexture(textureName: string): this {
			this.textureName = textureName;
			return this;
		}

		public withProgram(programName: string): this {
			this.programName = programName;
			return this;
		}

		public abstract build(): Renderable;

	}

}

export default Renderable;
