//
// Tile.ts
//

import Nullable from "../../engine/core/common/Nullable.ts";
import Supplier from "../../engine/core/common/Supplier.ts";
import Image from "../../engine/core/resource/Image.ts";
import Mesh from "../../engine/core/resource/Mesh.ts";
import Record from "../../engine/core/reflection/decorators/Record.ts";
import ArgumentException from "../../engine/core/exception/ArgumentException.ts";
import InvalidOperationException from "../../engine/core/exception/InvalidOperationException.ts";
import Renderable from "./Renderable.ts";

@Record()
class Tile extends Renderable {

	public static readonly BUILDER: Supplier<Tile.Builder> = (): Tile.Builder => {
		return new Tile.Builder();
	};

	public constructor(name: string, model: Mesh, textureList: Image[], programName: string) {
		super(name, model, textureList, programName);
	}

}

namespace Tile {

	export class Builder extends Renderable.Builder {

		private static readonly DEFAULT_PROGRAM_NAME: string = "terrain";

		private static createAtlas(image: Image, atlasElementSize: number): Image[] {
			if (image.getWidth() % atlasElementSize != 0) {
				throw new ArgumentException("atlasElementSize value must be divisible by image width value", "atlasElementSize");
			}
			if (image.getHeight() % atlasElementSize != 0) {
				throw new ArgumentException("atlasElementSize value must be divisible by image height value", "atlasElementSize");
			}

			const atlasWidth: number = image.getWidth() / atlasElementSize;
			const atlasHeight: number = image.getHeight() / atlasElementSize;
			const atlasSize: number = atlasWidth * atlasHeight;
			const atlas: Image[] = new Array<Image>(atlasSize);

			for (let i: number = 0; i < atlasSize; i++) {
				const x: number = (i % atlasWidth) * atlasElementSize;
				const y: number = Math.floor(i / atlasWidth) * atlasElementSize;

				atlas[i] = image.slice(x, y, atlasElementSize, atlasElementSize);
			}

			return atlas;
		}

		protected atlasElementSize: Nullable<number>;

		public constructor() {
			super();

			this.atlasElementSize = null;
		}

		public override build(): Tile {
			if (this.name == null) {
				throw new InvalidOperationException("Tile name was not provided");
			}

			const model: Mesh = Builder.loadModelFile(this.getModelFilePath());
			const texture: Image = Builder.loadTextureFile(this.getTextureFilePath());
			let textureList: Image[];

			if (this.atlasElementSize != null) {
				textureList = Builder.createAtlas(texture, this.atlasElementSize);
			} else {
				textureList = [texture];
			}

			const programName: string = this.programName ?? Builder.DEFAULT_PROGRAM_NAME;

			return new Tile(this.name, model, textureList, programName);
		}

		public withTextureAtlasing(atlasElementSize: number): this {
			this.atlasElementSize = atlasElementSize;
			return this;
		}

		private getModelFilePath(): string {
			if (this.modelName == null) {
				throw new InvalidOperationException("Model name was not provided");
			}

			return "./resources/model/tile/" + this.modelName + ".obj";
		}

		private getTextureFilePath(): string {
			if (this.textureName == null) {
				throw new InvalidOperationException("Texture name was not provided");
			}

			return "./resources/texture/tile/" + this.textureName + ".png";
		}

	}

}

export default Tile;
