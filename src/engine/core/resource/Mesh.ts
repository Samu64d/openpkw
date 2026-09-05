//
// Mesh.ts
//

import Record from "../reflection/decorators/Record.ts";

@Record()
export default class Mesh {

	private readonly vertexList: Float32Array;
	private readonly indicesList: Uint16Array;

	public constructor(vertexList: Float32Array, indicesList: Uint16Array) {
		this.vertexList = vertexList;
		this.indicesList = indicesList;
	}

	public getVertexList(): Float32Array {
		return this.vertexList;
	}

	public getIndiciesList(): Uint16Array {
		return this.indicesList;
	}

}
