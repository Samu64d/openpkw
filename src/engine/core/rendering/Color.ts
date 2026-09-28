// 
// Color.ts
//

import ImmutableArray from "../common/ImmutableArray.ts";
import MathHelper from "../math/MathHelper.ts";

type Color = [number, number, number, number];

namespace Color {

	export type Immutable = readonly [number, number, number, number];

	export function of(r: number, g: number, b: number, a: number = 255): Color {
		return [r, g, b, a];
	}

	export function immutable(color: Color): Immutable {
		return ImmutableArray.OF(color) as Immutable;
	}

	export function immutableOf(r: number, g: number, b: number, a: number = 255): Immutable {
		return ImmutableArray.OF(of(r, g, b, a)) as Immutable;
	}

	export function set(color: Color, r: number, g: number, b: number, a: number = color[3]): Color {
		color[0] = r;
		color[1] = g;
		color[2] = b;
		color[3] = a;
		return color;
	}

	export function toRGBString(color: Color): string {
		return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
	}

	export function toRGBAString(color: Color): string {
		return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (color[3] / 255) + ")";
	}

	export function copy(sourceColor: Color, destinationColor: Color): Color {
		destinationColor[0] = sourceColor[0];
		destinationColor[1] = sourceColor[1];
		destinationColor[2] = sourceColor[2];
		destinationColor[3] = sourceColor[3];
		return destinationColor;
	}

	export function lerp(sourceColor1: Color, sourceColor2: Color, t: number, destinationColor: Color): Color {
		destinationColor[0] = Math.round(MathHelper.lerp(sourceColor1[0], sourceColor2[0], t));
		destinationColor[1] = Math.round(MathHelper.lerp(sourceColor1[1], sourceColor2[1], t));
		destinationColor[2] = Math.round(MathHelper.lerp(sourceColor1[2], sourceColor2[2], t));
		destinationColor[3] = Math.round(MathHelper.lerp(sourceColor1[3], sourceColor2[3], t));
		return destinationColor;
	}

	export function clone(color: Color): Color {
		return of(color[0], color[1], color[2], color[3]);
	}

	export function equals(color1: Color, color2: Color): boolean {
		return color1 === color2 || (color1[0] == color2[0] && color1[1] == color2[1] && color1[2] == color2[2] && color1[3] == color2[3]);
	}

}

export default Color;
