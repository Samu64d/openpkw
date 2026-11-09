//
// Tiles.ts
//

import Exception from "../../engine/core/exception/Exception.ts";
import Tile from "./Tile.ts";

export default class Tiles {

	public static registryAll(): void {
		Tiles.registry(Tiles.GRASS);
		Tiles.registry(Tiles.GRASS_SPIKE);
		Tiles.registry(Tiles.WHITE_FLOWERS);
		Tiles.registry(Tiles.CLIFF_STRAIGHT);
		Tiles.registry(Tiles.CLIFF_CORNER_INNER);
		Tiles.registry(Tiles.CLIFF_CORNER_OUTER);
		Tiles.registry(Tiles.WALL_CLIFF_BASE_STRAIGHT);
		Tiles.registry(Tiles.WALL_CLIFF_BASE_CORNER_INNER);
		Tiles.registry(Tiles.WALL_CLIFF_BASE_CORNER_OUTER);
		Tiles.registry(Tiles.WALL_CLIFF_TOP_STRAIGHT);
		Tiles.registry(Tiles.WALL_CLIFF_TOP_CORNER_INNER);
		Tiles.registry(Tiles.WALL_CLIFF_TOP_CORNER_OUTER);
		Tiles.registry(Tiles.ROAD);
		Tiles.registry(Tiles.ROAD_BORDER_STRAIGHT);
		Tiles.registry(Tiles.ROAD_BORDER_CORNER_INNER);
		Tiles.registry(Tiles.ROAD_BORDER_CORNER_OUTER);
	}

	public static get(tileName: string): Tile {
		if (Tiles.TILE_MAP.has(tileName) == false) {
			throw new Exception("Unknown tile name");
		}

		return Tiles.TILE_MAP.get(tileName) as Tile;
	}

	public static getAll(): Map<string, Tile> {
		return Tiles.TILE_MAP;
	}

	private static readonly GRASS: Tile.Builder = Tile.BUILDER()
		.withName("grass")
		.withModel("plain")
		.withTexture("grass")
		.withTextureAtlasing(16);

	private static readonly GRASS_SPIKE: Tile.Builder = Tile.BUILDER()
		.withName("grass_spike")
		.withModel("plain_overlay")
		.withTexture("grass_spike")
		.withProgram("tree");

	private static readonly WHITE_FLOWERS: Tile.Builder = Tile.BUILDER()
		.withName("white_flowers")
		.withModel("plain_overlay")
		.withTexture("white_flowers")
		.withProgram("tree");

	private static readonly CLIFF_STRAIGHT: Tile.Builder = Tile.BUILDER()
		.withName("cliff_straight")
		.withModel("cliff_straight")
		.withTexture("cliff");

	private static readonly CLIFF_CORNER_INNER: Tile.Builder = Tile.BUILDER()
		.withName("cliff_corner_inner")
		.withModel("cliff_corner_inner")
		.withTexture("cliff");

	private static readonly CLIFF_CORNER_OUTER: Tile.Builder = Tile.BUILDER()
		.withName("cliff_corner_outer")
		.withModel("cliff_corner_outer")
		.withTexture("cliff");

	private static readonly WALL_CLIFF_BASE_STRAIGHT: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_base_straight")
		.withModel("wall_cliff_base_straight")
		.withTexture("wall_cliff_base");

	private static readonly WALL_CLIFF_BASE_CORNER_INNER: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_base_corner_inner")
		.withModel("wall_cliff_base_corner_inner")
		.withTexture("wall_cliff_base");

	private static readonly WALL_CLIFF_BASE_CORNER_OUTER: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_base_corner_outer")
		.withModel("wall_cliff_base_corner_outer")
		.withTexture("wall_cliff_base");

	private static readonly WALL_CLIFF_TOP_STRAIGHT: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_top_straight")
		.withModel("wall_cliff_top_straight")
		.withTexture("wall_cliff_top");

	private static readonly WALL_CLIFF_TOP_CORNER_INNER: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_top_corner_inner")
		.withModel("wall_cliff_top_corner_inner")
		.withTexture("wall_cliff_top");

	private static readonly WALL_CLIFF_TOP_CORNER_OUTER: Tile.Builder = Tile.BUILDER()
		.withName("wall_cliff_top_corner_outer")
		.withModel("wall_cliff_top_corner_outer")
		.withTexture("wall_cliff_top");

	private static readonly ROAD: Tile.Builder = Tile.BUILDER()
		.withName("road")
		.withModel("plain")
		.withTexture("road");

	private static readonly ROAD_BORDER_STRAIGHT: Tile.Builder = Tile.BUILDER()
		.withName("road_border_straight")
		.withModel("plain")
		.withTexture("road_border_straight")
		.withTextureAtlasing(16);

	private static readonly ROAD_BORDER_CORNER_INNER: Tile.Builder = Tile.BUILDER()
		.withName("road_border_corner_inner")
		.withModel("plain")
		.withTexture("road_border_corner_inner");

	private static readonly ROAD_BORDER_CORNER_OUTER: Tile.Builder = Tile.BUILDER()
		.withName("road_border_corner_outer")
		.withModel("plain")
		.withTexture("road_border_corner_outer");

	private static readonly TILE_MAP: Map<string, Tile> = new Map<string, Tile>();

	private static registry(builder: Tile.Builder): void {
		const tile: Tile = builder.build();
		const tileName: string = tile.getName();

		if (Tiles.TILE_MAP.has(tileName) == true) {
			throw new Exception("Another tile was already registered with the same name");
		}

		Tiles.TILE_MAP.set(tileName, tile);
	}

	private constructor() {
	}

}
