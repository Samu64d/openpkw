//
// ImmutableArray.ts
//

type ImmutableArray<T> = readonly T[];

namespace ImmutableArray {

	export const OF: <T>(array: T[]) => ImmutableArray<T> = <T>(array: T[]): ImmutableArray<T> => {
		return Object.freeze(Array.from(array));
	}

}

export default ImmutableArray;
