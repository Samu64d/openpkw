//
// Spannable.ts
//

interface Spannable {

	readonly length: number;

	[index: number]: number;

}

namespace Spannable {

	export function memcopyUint8Array(source: Uint8Array, destination: Spannable, sourceStartIndex: number = 0, sourceEndIndex: number = source.length, destinationStartIndex: number = 0): void {
		const src: Uint8Array = source.subarray(sourceStartIndex, sourceEndIndex);

		if (destination instanceof Uint8Array) {
			destination.set(src, destinationStartIndex);
			return;
		}

		for (let i: number = 0; i < src.length; i++) {
			destination[destinationStartIndex + i] = src[i];
		}
	}

}

export default Spannable;
