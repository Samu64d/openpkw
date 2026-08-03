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

	export function immutableOf(r: number, g: number, b: number, a: number = 255): Color.Immutable {
		return ImmutableArray.OF([r, g, b, a]) as Color.Immutable;
	}

	export function immutable(color: Color): Color.Immutable {
		return ImmutableArray.OF(color) as Color.Immutable;
	}

	export function set(color: Color, r: number, g: number, b: number, a: number = color[3]): Color {
		color[0] = r;
		color[1] = g;
		color[2] = b;
		color[3] = a;
		return color;
	}

	export function lerp(color1: Color.Immutable, color2: Color.Immutable, t: number, out: Color): Color {
		out[0] = Math.round(MathHelper.lerp(color1[0], color2[0], t));
		out[1] = Math.round(MathHelper.lerp(color1[1], color2[1], t));
		out[2] = Math.round(MathHelper.lerp(color1[2], color2[2], t));
		out[3] = Math.round(MathHelper.lerp(color1[3], color2[3], t));
		return out;
	}

	export function copy(source: Color.Immutable, destination: Color): Color {
		destination[0] = source[0];
		destination[1] = source[1];
		destination[2] = source[2];
		destination[3] = source[3];
		return destination;
	}

	export function clone(color: Color.Immutable): Color {
		return [color[0], color[1], color[2], color[3]];
	}

	export function equals(color1: Color.Immutable, color2: Color.Immutable): boolean {
		return color1[0] == color2[0] && color1[1] == color2[1] && color1[2] == color2[2] && color1[3] == color2[3];
	}

	export function toRGBString(color: Color.Immutable): string {
		return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
	}

	export function toRGBAString(color: Color.Immutable): string {
		return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (color[3] / 255) + ")";
	}

}

export default Color;
