//
// Sprite.ts
//

import Image from "../../engine/core/resource/Image.ts";
import Mesh from "../../engine/core/resource/Mesh.ts";
import Renderable from "../renderer/Renderable.ts";

/**
 * @todo Base implementation
 **/
export default class Sprite extends Renderable {

	public constructor(name: string, model: Mesh, textureList: Image[], programName: string) {
		super(name, model, textureList, programName);
	}

}
