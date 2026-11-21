//
// OBJDecoder.ts
//

import ByteBuffer from "../../io/buffer/ByteBuffer.ts";
import SingleValueDecoder from "../../codec/SingleValueDecoder.ts";
import StringByteDecoder from "../../codec/StringByteDecoder.ts";
import Mesh from "../../resource/Mesh.ts";

/**
 * @todo Full implementation
 **/
export default class OBJDecoder extends SingleValueDecoder<ByteBuffer, Mesh> {

	private static readonly COMMENT_LINE_IDENTIFIER: string = "#";

	public constructor(source: ByteBuffer) {
		super(source);
	}

	public override decode(): Mesh {
		const text: string = new StringByteDecoder().decode(this.source);

		const lines: string[] = text.split("\n");
		const rawPositions: number[][] = [[0, 0, 0]];
		const rawUVs: number[][] = [[0, 0]];
		const webGLVertices: number[] = [];
		const webGLIndices: number[] = [];
		const uniqueVertices: Map<string, number> = new Map<string, number>();
		let nextIndex: number = 0;

		for (const line of lines) {
			const trimmed: string = line.trim();
			if (!trimmed || trimmed.startsWith(OBJDecoder.COMMENT_LINE_IDENTIFIER)) continue;

			const parts: string[] = trimmed.split(/\s+/);
			const type: string = parts[0];

			if (type == "v") {
				rawPositions.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
			}
			else if (type == "vt") {
				rawUVs.push([Number(parts[1]), 1.0 - Number(parts[2])]);
			}
			else if (type == "f") {
				for (let i: number = 1; i <= parts.length - 3; i++) {
					const triangle: string[] = [parts[1], parts[i + 1], parts[i + 2]];

					for (const vertexHash of triangle) {
						if (uniqueVertices.has(vertexHash)) {
							webGLIndices.push(uniqueVertices.get(vertexHash)!);
						} else {
							const indices: string[] = vertexHash.split("/");
							const posIdx: number = parseInt(indices[0], 10);
							const uvIdx: number = indices.length > 1 && indices[1] ? parseInt(indices[1], 10) : 0;

							const pos: number[] = rawPositions[posIdx] || [0, 0, 0];
							const uv: number[] = rawUVs[uvIdx] || [0, 0];

							webGLVertices.push(pos[0], pos[1], pos[2], uv[0], uv[1]);

							webGLIndices.push(nextIndex);
							uniqueVertices.set(vertexHash, nextIndex);
							nextIndex++;
						}
					}
				}
			}
		}

		return new Mesh(new Float32Array(webGLVertices), new Uint32Array(webGLIndices));
	}

}
