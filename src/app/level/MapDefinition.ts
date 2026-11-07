//
// MapDefinition.ts
//

interface MapDefinition {

	terrain: MapDefinition.Terrain;

	props: MapDefinition.Prop[];

};

namespace MapDefinition {

	export type Terrain = string[][][];

	export interface Prop {

		name: string;

		pos: [number, number, number];

		rot?: number;

	}

}

export default MapDefinition;
