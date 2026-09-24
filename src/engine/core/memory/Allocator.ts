//
// Allocator.ts
//

import Nullable from "../common/Nullable.ts";

export default interface Allocator<T extends object> {

	malloc(minSize: number): Nullable<T>;

	free(item: T): void;

}
