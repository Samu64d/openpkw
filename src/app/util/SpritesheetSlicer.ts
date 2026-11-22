//
// SpritesheetSlicer.ts
//

import Image from "../../engine/core/resource/Image.ts";
import ArgumentException from "../../engine/core/exception/ArgumentException.ts";

class SpritesheetSlicer {

	private readonly tileSize: number;
	private readonly layoutOrder: SpritesheetSlicer.LayoutOrder;

	public constructor(tileSize: number, layoutOrder: SpritesheetSlicer.LayoutOrder = SpritesheetSlicer.LayoutOrder.ROW_MAJOR) {
		this.tileSize = tileSize;
		this.layoutOrder = layoutOrder;
	}

	public getTileSize(): number {
		return this.tileSize;
	}

	public getLayoutOrder(): SpritesheetSlicer.LayoutOrder {
		return this.layoutOrder;
	}

	public slice(image: Image): Image[] {
		if (image.getWidth() % this.tileSize != 0) {
			throw new ArgumentException("Image width value must be divisible by element size", "image");
		}
		if (image.getHeight() % this.tileSize != 0) {
			throw new ArgumentException("Image height value must be divisible by element size", "image");
		}

		const atlasWidth: number = image.getWidth() / this.tileSize;
		const atlasHeight: number = image.getHeight() / this.tileSize;
		const atlasSize: number = atlasWidth * atlasHeight;
		const atlas: Image[] = new Array<Image>(atlasSize);
		const resolver: SpritesheetSlicer.SliceCoordResolver = new SpritesheetSlicer.SliceCoordResolver(this.layoutOrder, atlasWidth, atlasHeight, this.tileSize);

		for (let i: number = 0; i < atlasSize; i++) {
			const coords: [x: number, y: number] = resolver.resolve(i);

			atlas[i] = image.slice(coords[0], coords[1], this.tileSize, this.tileSize);
		}

		return atlas;
	}

}

namespace SpritesheetSlicer {

	export enum LayoutOrder {
		ROW_MAJOR,
		COLUMN_MAJOR
	}

	export class SliceCoordResolver {

		private readonly layoutOrder: LayoutOrder;
		private readonly sideSize: number;
		private readonly elementSize: number;

		public constructor(layoutOrder: LayoutOrder, width: number, height: number, tileSize: number) {
			this.layoutOrder = layoutOrder;
			this.sideSize = layoutOrder == LayoutOrder.ROW_MAJOR ? width : height;
			this.elementSize = tileSize;
		}

		public resolve(index: number,): [x: number, y: number] {
			const x: number = (index % this.sideSize) * this.elementSize;
			const y: number = Math.floor(index / this.sideSize) * this.elementSize;

			return this.layoutOrder == LayoutOrder.ROW_MAJOR ? [x, y] : [y, x];
		}

	}

}

export default SpritesheetSlicer;
