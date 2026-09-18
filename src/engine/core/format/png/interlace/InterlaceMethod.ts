//
// InterlaceMethod.ts
//

enum InterlaceMethod {
	NONE = 0,
	ADAM_7 = 1
}

namespace InterlaceMethod {

	export function is(value: number): value is InterlaceMethod {
		return value == InterlaceMethod.NONE || value == InterlaceMethod.ADAM_7;
	}

}

export default InterlaceMethod;
