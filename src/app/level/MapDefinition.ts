//
// MapDefinition.ts
//

interface MapDefinition {

	palette: MapDefinition.Palette;

	terrain: MapDefinition.Terrain;

	props: MapDefinition.Prop[];

};

namespace MapDefinition {

	export type Palette = Record<string, string>;

	export type Terrain = string[][][];

	export interface Prop {

		name: string;

		pos: [number, number, number];

		rot?: number;

	}

}

export default MapDefinition;
