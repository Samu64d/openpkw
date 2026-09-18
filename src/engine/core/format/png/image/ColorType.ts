//
// ColorType.ts
//

enum ColorType {
	GREYSCALE = 0,
	TRUECOLOR = 2,
	INDEXED = 3,
	ALPHA_GREYSCALE = 4,
	ALPHA_TRUECOLOR = 6
}

namespace ColorType {

	const COLOR_TYPE_TO_CHANNEL_COUNT_MAP: Readonly<Record<ColorType, number>> = {
		[ColorType.GREYSCALE]: 1,
		[ColorType.TRUECOLOR]: 3,
		[ColorType.INDEXED]: 1,
		[ColorType.ALPHA_GREYSCALE]: 2,
		[ColorType.ALPHA_TRUECOLOR]: 4
	};

	const COLOR_TYPE_TO_DEPTH_VALUE_LIST_MAP: Readonly<Record<ColorType, readonly number[]>> = {
		[ColorType.GREYSCALE]: [1, 2, 4, 8, 16],
		[ColorType.TRUECOLOR]: [8, 16],
		[ColorType.INDEXED]: [1, 2, 4, 8],
		[ColorType.ALPHA_GREYSCALE]: [8, 16],
		[ColorType.ALPHA_TRUECOLOR]: [8, 16]
	};

	export function is(value: number): value is ColorType {
		return value == ColorType.GREYSCALE
			|| value == ColorType.TRUECOLOR
			|| value == ColorType.INDEXED
			|| value == ColorType.ALPHA_GREYSCALE
			|| value == ColorType.ALPHA_TRUECOLOR;
	}

	export function getChannelCount(colorType: ColorType): number {
		return COLOR_TYPE_TO_CHANNEL_COUNT_MAP[colorType];
	}

	export function allowDepth(colorType: ColorType, depth: number): boolean {
		return COLOR_TYPE_TO_DEPTH_VALUE_LIST_MAP[colorType].includes(depth);
	}

}

export default ColorType;
