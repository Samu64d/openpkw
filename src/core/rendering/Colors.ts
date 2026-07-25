// 
// Colors.ts
//

import Color from "./Color.ts";

namespace Colors {

	export const TRANSPARENT: Color.Immutable = Color.immutableOf(0, 0, 0, 0);
	export const BLACK: Color.Immutable = Color.immutableOf(0, 0, 0, 255);
	export const WHITE: Color.Immutable = Color.immutableOf(255, 255, 255, 255);
	export const RED: Color.Immutable = Color.immutableOf(255, 0, 0, 255);
	export const GREEN: Color.Immutable = Color.immutableOf(0, 255, 0, 255);
	export const BLUE: Color.Immutable = Color.immutableOf(0, 0, 255, 255);

}

export default Colors;
