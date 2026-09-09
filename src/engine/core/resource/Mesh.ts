//
// Mesh.ts
//

import Record from "../reflection/decorators/Record.ts";

@Record()
export default class Mesh {

	private readonly vertexList: Float32Array;
	private readonly indicesList: Uint32Array;

	public constructor(vertexList: Float32Array, indicesList: Uint32Array) {
		this.vertexList = vertexList;
		this.indicesList = indicesList;
	}

	public getVertexList(): Float32Array {
		return this.vertexList;
	}

	public getIndiciesList(): Uint32Array {
		return this.indicesList;
	}

}
