//
// OBJDecoder.ts
//

import ByteBuffer from "../../memory/ByteBuffer.ts";
import Mesh from "../../resource/Mesh.ts";
import Decoder from "../Decoder.ts";

export default class OBJDecoder extends Decoder<Mesh> {

	public constructor(source: ByteBuffer) {
		super(source);
	}

	//TODO: Basic implementation
	public override decode(): Mesh {
		const text: string = new TextDecoder().decode(this.source.unsafeGetData());
		const lines: string[] = text.split("\n");

		const rawPositions: number[][] = [[0, 0, 0]];
		const rawUVs: number[][] = [[0, 0]];

		const webGLVertices: number[] = [];
		const webGLIndices: number[] = [];

		const uniqueVertices = new Map<string, number>();
		let nextIndex = 0;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;

			const parts = trimmed.split(/\s+/);
			const type = parts[0];

			if (type === "v") {
				rawPositions.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
			}
			else if (type === "vt") {
				rawUVs.push([Number(parts[1]), 1.0 - Number(parts[2])]);
			}
			else if (type === "f") {
				for (let i = 1; i <= parts.length - 3; i++) {
					const triangle = [parts[1], parts[i + 1], parts[i + 2]];

					for (const vertexHash of triangle) {
						if (uniqueVertices.has(vertexHash)) {
							webGLIndices.push(uniqueVertices.get(vertexHash)!);
						} else {
							const indices = vertexHash.split("/");
							const posIdx = parseInt(indices[0], 10);
							const uvIdx = indices.length > 1 && indices[1] ? parseInt(indices[1], 10) : 0;

							const pos = rawPositions[posIdx] || [0, 0, 0];
							const uv = rawUVs[uvIdx] || [0, 0];

							webGLVertices.push(pos[0], pos[1], pos[2], uv[0], uv[1]);

							webGLIndices.push(nextIndex);
							uniqueVertices.set(vertexHash, nextIndex);
							nextIndex++;
						}
					}
				}
			}
		}

		return new Mesh(new Float32Array(webGLVertices), new Uint16Array(webGLIndices));
	}
}
