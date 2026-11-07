//
// LevelRenderer.ts
//

import MathHelper from "../../engine/core/math/MathHelper.ts";
import Vector3d from "../../engine/core/math/Vector3d.ts";
import { multiplyAll, rot, translate } from "../../engine/core/math/Matrix4d.ts";
import Image from "../../engine/core/resource/Image.ts";
import Mesh from "../../engine/core/resource/Mesh.ts";
import Color from "../../engine/core/rendering/Color.ts";
import Viewport from "../../engine/core/rendering/Viewport.ts";
import Projection from "../../engine/core/rendering/Projection.ts";
import Camera from "../../engine/core/rendering/Camera.ts";
import Exception from "../../engine/core/exception/Exception.ts";
import GLVertexBuffer from "../../engine/drivers/graphic/gl/GLVertexBuffer.ts";
import GLElementBuffer from "../../engine/drivers/graphic/gl/GLElementBuffer.ts";
import GLVertexArray from "../../engine/drivers/graphic/gl/GLVertexArray.ts";
import GLTexture from "../../engine/drivers/graphic/gl/GLTexture.ts";
import GLShader from "../../engine/drivers/graphic/gl/GLShader.ts";
import GLVertexShader from "../../engine/drivers/graphic/gl/GLVertexShader.ts";
import GLFragmentShader from "../../engine/drivers/graphic/gl/GLFragmentShader.ts";
import GLProgram from "../../engine/drivers/graphic/gl/GLProgram.ts";
import GLContextManager from "../../engine/drivers/graphic/gl/GLContextManager.ts";
import Renderable from "../level/Renderable.ts";
import Tile from "../level/Tile.ts";
import Tiles from "../level/Tiles.ts";
import Props from "../level/Props.ts";
import Prop from "../level/Prop.ts";
import Program from "./Program.ts";
import Programs from "./Programs.ts";
import MapDefinition from "../level/MapDefinition.ts";
import Level from "../level/Level.ts";

export default class LevelRenderer {

	private static readonly CLEAR_COLOR: Color = [255, 255, 255, 255];

	private static readonly NEAR_DISTANCE: number = 0.1;

	private static readonly FAR_DISTANCE: number = 10000.0;

	private static readonly FOV: number = 0.785;

	private readonly level: Level;
	private readonly context: WebGL2RenderingContext;
	private readonly tiles: Map<string, Tile>;
	private readonly props: Map<string, Prop>;
	private readonly programs: Map<string, Program>;

	private readonly modelMap: Map<string, GLVertexArray>;
	private readonly modelTextureListMap: Map<string, GLTexture[]>;
	private readonly modelProgramMap: Map<string, GLProgram>;
	private readonly programMap: Map<string, GLProgram>;

	private readonly contextManager: GLContextManager;
	private readonly viewport: Viewport;
	private readonly projection: Projection;
	private readonly camera: Camera;
	private time: number;
	private debugLines: boolean;

	public constructor(level: Level, context: WebGL2RenderingContext) {
		this.level = level;
		this.context = context;
		this.tiles = Tiles.getAll();
		this.props = Props.getAll();
		this.programs = Programs.getAll();

		this.programMap = new Map<string, GLProgram>();
		this.modelMap = new Map<string, GLVertexArray>();
		this.modelTextureListMap = new Map<string, GLTexture[]>();
		this.modelProgramMap = new Map<string, GLProgram>();

		this.contextManager = new GLContextManager(context);
		this.viewport = new Viewport(this.context.canvas.width, this.context.canvas.height);
		this.projection = new Projection(this.viewport.getAspectRatio(), LevelRenderer.FOV, LevelRenderer.NEAR_DISTANCE, LevelRenderer.FAR_DISTANCE);
		this.camera = new Camera();
		this.time = 0;
		this.debugLines = false;
	}

	public init(): void {
		this.uploadPrograms();
		this.uploadRenderables();
		this.contextManager.enableDepthTest();
		this.contextManager.enableBlend();
		this.contextManager.setAlphaBlend();
		this.camera.lookAt(new Vector3d(3.0, 2.5, 2.5), new Vector3d(3.0, 0.0, 0.0));
	}

	public setViewportSize(width: number, height: number): void {
		this.viewport.setSize(width, height);
		this.projection.setAspectRatio(this.viewport.getAspectRatio());
	}

	public offsetCamera(x: number, y: number, z: number): void {
		const position: Vector3d = this.camera.getPosition().add(x, y, z);
		const target: Vector3d = this.camera.getTarget().add(x, y, z);

		this.camera.lookAt(position, target);
	}

	public getDebugLines(): boolean {
		return this.debugLines;
	}

	public setDebugLines(debugLines: boolean): void {
		this.debugLines = debugLines;
	}

	public draw(time: number): void {
		this.time = time;
		this.contextManager.setViewport(this.viewport.getWidth(), this.viewport.getHeight());
		this.contextManager.clear(LevelRenderer.CLEAR_COLOR);
		this.updatePrograms();
		this.drawLevel();
	}

	private uploadModel(mesh: Mesh): GLVertexArray {
		const vao: GLVertexArray = new GLVertexArray(this.contextManager);
		const vbo: GLVertexBuffer = new GLVertexBuffer(this.contextManager);
		const ebo: GLElementBuffer = new GLElementBuffer(this.contextManager);

		vao.bind();
		vbo.bind();
		vbo.loadData(mesh.getVertexList());
		this.context.vertexAttribPointer(0, 3, this.context.FLOAT, false, 5 * 4, 0);
		this.context.enableVertexAttribArray(0);
		this.context.vertexAttribPointer(1, 2, this.context.FLOAT, false, 5 * 4, 3 * 4);
		this.context.enableVertexAttribArray(1);
		ebo.bind();
		ebo.loadData(mesh.getIndiciesList());
		vao.ebo = mesh.getIndiciesList().length;
		vao.unbind();
		vbo.unbind();
		ebo.unbind();

		return vao;
	}

	private uploadTexture(image: Image): GLTexture {
		const texture: GLTexture = new GLTexture(this.contextManager, this.context.TEXTURE_2D);

		texture.bind();
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
		texture.loadImageData(image.getWidth(), image.getHeight(), image.getData().unsafeGetSourceView());
		texture.unbind();

		return texture;
	}

	private uploadRenderables(): void {
		const renderableList: Renderable[] = [...Array.from(this.tiles.values()), ...Array.from(this.props.values())];

		for (const renderable of renderableList) {
			const name: string = renderable.getName();
			const model: Mesh = renderable.getModel();
			const textureList: Image[] = renderable.getTextureList();
			const programName: string = renderable.getProgramName();
			const uploadedModel: GLVertexArray = this.uploadModel(model);
			const uploadedTextureList: GLTexture[] = new Array<GLTexture>(textureList.length);
			const uploadedProgram: GLProgram = this.programMap.get(programName) as GLProgram;

			for (let i: number = 0; i < textureList.length; i++) {
				uploadedTextureList[i] = this.uploadTexture(textureList[i]);
			}

			this.modelMap.set(name, uploadedModel);
			this.modelTextureListMap.set(name, uploadedTextureList);
			this.modelProgramMap.set(name, uploadedProgram);
		}
	}

	private uploadShader(source: string, type: number): GLShader {
		const shader: GLFragmentShader = type ? new GLFragmentShader(this.contextManager, source) : new GLVertexShader(this.contextManager, source);

		shader.compile();

		if (shader.getCompilationStatus() == GLShader.CompilationStatus.FAILED) {
			throw new Exception(shader.getCompilationError() ?? "Failed to compile shader: unknow error");
		}

		return shader;
	}

	private uploadProgram(vertexShaderSource: string, fragmentShaderSource: string): GLProgram {
		const program: GLProgram = new GLProgram(this.contextManager);
		const uploadedVertexShader: GLShader = this.uploadShader(vertexShaderSource, 0);
		const uploadedFragmentShader: GLShader = this.uploadShader(fragmentShaderSource, 1);

		program.attachShader(uploadedVertexShader);
		program.attachShader(uploadedFragmentShader);
		program.link();

		if (program.getLinkingStatus() == GLProgram.LinkingStatus.FAILED) {
			throw new Exception(program.getLinkingError() ?? "Failed to compile program: unknow error");
		}

		uploadedVertexShader.dispose();
		uploadedFragmentShader.dispose();
		return program;
	}

	private uploadPrograms(): void {
		for (const program of this.programs.values()) {
			const name: string = program.getName();
			const vertexShaderSource: string = program.getVertexShaderSource();
			const fragmentShaderSource: string = program.getFragmentShaderSource();
			const uploadedProgram: GLProgram = this.uploadProgram(vertexShaderSource, fragmentShaderSource);

			this.programMap.set(name, uploadedProgram);
		}
	}

	private updatePrograms(): void {
		for (const program of this.programMap.values()) {
			const viewportSizeLocation = this.context.getUniformLocation(program.getProgramObject(), "viewportSize");
			const projectionLocation = this.context.getUniformLocation(program.getProgramObject(), "projection");
			const timeLocation = this.context.getUniformLocation(program.getProgramObject(), "time");

			program.use();
			this.context.uniform2iv(viewportSizeLocation, this.viewport.getSize());
			this.context.uniformMatrix4fv(projectionLocation, false, this.projection.getMatrix());
			this.context.uniform1f(timeLocation, this.time / 100.0);
			program.unuse();
		}
	}

	private drawModel(modelName: string, modelView: number[], textureIndex: number = 0): void {
		const program: GLProgram = this.modelProgramMap.get(modelName) as GLProgram;
		const modelViewLocation = this.context.getUniformLocation(program.getProgramObject(), "modelView");
		const vao: GLVertexArray = this.modelMap.get(modelName) as GLVertexArray;
		const texture: GLTexture = (this.modelTextureListMap.get(modelName) as GLTexture[])[textureIndex];
		const elementType: GLenum = this.debugLines ? this.context.LINE_STRIP : this.context.TRIANGLES;

		program.use();
		this.context.uniformMatrix4fv(modelViewLocation, false, multiplyAll(this.camera.getMatrix(), modelView));
		vao.bind();
		texture.bind();
		this.context.drawElements(elementType, vao.ebo, this.context.UNSIGNED_INT, 0);
		vao.unbind();
		program.unuse();
	}

	private drawTile(tileName: string, tileXPos: number, tileYPos: number, tileZPos: number, rotation: number = 0): void {
		const step: number = 0.25;
		const modelXPos: number = tileXPos * step;
		const modelYPos: number = tileYPos * step;
		const modelZPos: number = tileZPos * step;
		let modelView: number[] = translate(modelXPos, modelYPos, modelZPos);

		const textureIndex: number = tileName == "grass" ? (MathHelper.mod(tileZPos, 4) * 4) + MathHelper.mod(tileXPos, 4) : 0;

		if (rotation != 0) {
			modelView = multiplyAll(modelView, rot(rotation / 180 * Math.PI, 0, 0));
		}

		this.drawModel(tileName, modelView, textureIndex);
	}

	private drawProp(propName: string, xPos: number, yPos: number, zPos: number, rotX: number = 0): void {
		const step: number = 0.25;
		const modelXPos: number = (xPos - 0.5) * step;
		const modelYPos: number = yPos * step;
		const modelZPos: number = (zPos - 0.5) * step;
		let modelView: number[] = translate(modelXPos, modelYPos, modelZPos);

		if (rotX != 0) {
			modelView = multiplyAll(modelView, rot(rotX / 180 * Math.PI, 0, 0));
		}

		this.drawModel(propName, modelView);
	}

	private drawLevel(): void {
		const map: MapDefinition = this.level.getMap();
		const terrain: MapDefinition.Terrain = map.terrain;
		const propList: MapDefinition.Prop[] = map.props;

		for (let y: number = 0; y < terrain.length; y++) {
			const layer: string[][] = terrain[y];

			for (let z: number = 0; z < layer.length; z++) {
				const row: string[] = layer[z];

				for (let x: number = 0; x < row.length; x++) {
					const tileConfig: string = row[x];
					const elementConfigList: string[] = tileConfig.split(";");

					for (const elementConfig of elementConfigList) {
						const modelName: string = elementConfig.split(":").at(0) ?? "air";

						if (modelName == "air") {
							continue;
						}

						const rotation: number = Number(elementConfig.split(":").at(1) ?? 0);

						this.drawTile(modelName, x, y, z, rotation);
					}
				}
			}
		}

		for (const prop of propList) {
			const propName: string = prop.name;
			const xPos: number = prop.pos[0];
			const yPos: number = prop.pos[1];
			const zPos: number = prop.pos[2];
			const rot: number = prop.rot ?? 0;

			this.drawProp(propName, xPos, yPos, zPos, rot);
		}
	}

}
