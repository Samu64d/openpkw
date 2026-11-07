//
// Prop.ts
//

import Supplier from "../../engine/core/common/Supplier.ts";
import Image from "../../engine/core/resource/Image.ts";
import Mesh from "../../engine/core/resource/Mesh.ts";
import Record from "../../engine/core/reflection/decorators/Record.ts";
import InvalidOperationException from "../../engine/core/exception/InvalidOperationException.ts";
import Renderable from "./Renderable.ts";

@Record()
class Prop extends Renderable {

	public static readonly BUILDER: Supplier<Prop.Builder> = (): Prop.Builder => {
		return new Prop.Builder();
	};

	public constructor(name: string, model: Mesh, textureList: Image[], programName: string) {
		super(name, model, textureList, programName);
	}

}

namespace Prop {

	export class Builder extends Renderable.Builder {

		private static readonly DEFAULT_PROGRAM_NAME: string = "terrain";

		public constructor() {
			super();
		}

		public override build(): Prop {
			if (this.name == null) {
				throw new InvalidOperationException("Prop name was not provided");
			}

			const model: Mesh = Builder.loadModelFile(this.getModelFilePath());
			const texture: Image = Builder.loadTextureFile(this.getTextureFilePath());
			const textureList: Image[] = [texture];
			const programName: string = this.programName ?? Builder.DEFAULT_PROGRAM_NAME;

			return new Prop(this.name, model, textureList, programName);
		}

		private getModelFilePath(): string {
			if (this.modelName == null) {
				throw new InvalidOperationException("Model name was not provided");
			}

			return "./resources/model/prop/" + this.modelName + ".obj";
		}

		private getTextureFilePath(): string {
			if (this.textureName == null) {
				throw new InvalidOperationException("Texture name was not provided");
			}

			return "./resources/texture/prop/" + this.textureName + ".png";
		}

	}

}

export default Prop;
