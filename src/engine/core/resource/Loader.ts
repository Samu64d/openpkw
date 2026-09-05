//
// Loader.ts
//

export default interface Loader<L, T> {

	load(locator: L): T;

}
