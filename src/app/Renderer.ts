//
// Renderer.ts
//

import { multiplyAll, rot, translate } from "../engine/core/math/Matrix4d.ts";
import Vector3d from "../engine/core/math/Vector3d.ts";
import ByteBuffer from "../engine/core/io/buffer/ByteBuffer.ts";
import OpenMode from "../engine/core/io/file/OpenMode.ts";
import File from "../engine/core/io/file/File.ts";
import FileHandler from "../engine/core/io/file/FileHandler.ts";
import StringByteDecoder from "../engine/core/codec/StringByteDecoder.ts";
import PNGDecoder from "../engine/core/format/png/PNGDecoder.ts";
import OBJDecoder from "../engine/core/format/obj/OBJDecoder.ts";
import Image from "../engine/core/resource/Image.ts";
import Mesh from "../engine/core/resource/Mesh.ts";
import Color from "../engine/core/rendering/Color.ts";
import Projection from "../engine/core/rendering/Projection.ts";
import Camera from "../engine/core/rendering/Camera.ts";
import GLVertexBuffer from "../engine/drivers/graphic/gl/GLVertexBuffer.ts";
import GLElementBuffer from "../engine/drivers/graphic/gl/GLElementBuffer.ts";
import GLVertexArray from "../engine/drivers/graphic/gl/GLVertexArray.ts";
import GLTexture from "../engine/drivers/graphic/gl/GLTexture.ts";
import GLShader from "../engine/drivers/graphic/gl/GLShader.ts";
import GLVertexShader from "../engine/drivers/graphic/gl/GLVertexShader.ts";
import GLFragmentShader from "../engine/drivers/graphic/gl/GLFragmentShader.ts";
import GLProgram from "../engine/drivers/graphic/gl/GLProgram.ts";
import GLContextManager from "../engine/drivers/graphic/gl/GLContextManager.ts";

const test: string[][][] = [
	[
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1;cliff_straight:270", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3;cliff_straight:270", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1;cliff_straight:270", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3;cliff_straight:270", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_corner_outer", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"],
		["grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1", "grass_0", "grass_1"],
		["grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3", "grass_2", "grass_3"]
	],
	[
		["air", "air", "air", "air", "air", "air", "air", "air", "grass_3;cliff_straight:270", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "grass_1;cliff_straight:270", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "grass_3;cliff_straight:270", "air", "air", "air", "air", "air", "air", "air"],
		["grass_1;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_1;cliff_corner_outer", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"]
	],
	[
		["air", "air", "air", "air", "air", "air", "air", "grass_3;cliff_straight:270", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "grass_1;cliff_straight:270", "air", "air", "air", "air", "air", "air", "air", "air"],
		["grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_0;cliff_straight", "grass_1;cliff_straight", "grass_1;cliff_corner_outer", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"],
		["air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air", "air"]
	]
]

/**
 * Playground renderer
 */
export default class Renderer {

	private static readonly CLEAR_COLOR: Color = [0, 0, 0, 0];

	private readonly context: WebGL2RenderingContext;
	private readonly contextManager: GLContextManager;
	private readonly vaoMap: Map<string, GLVertexArray>;
	private readonly textureMap: Map<string, GLTexture>;
	private readonly programMap: Map<string, GLProgram>;
	private readonly camera: Camera;
	private time: number;

	public constructor(context: WebGL2RenderingContext) {
		this.context = context;
		this.contextManager = new GLContextManager(context);
		this.vaoMap = new Map<string, GLVertexArray>();
		this.textureMap = new Map<string, GLTexture>();
		this.programMap = new Map<string, GLProgram>();
		this.camera = new Camera();
		this.time = 0;
	}

	public init(): void {
		this.contextManager.enableDepthTest();
		this.contextManager.enableBlend();
		this.contextManager.setAlphaBlend();
		this.loadModel("grass_0");
		this.loadModel("grass_1");
		this.loadModel("grass_2");
		this.loadModel("grass_3");
		this.loadModel("cliff_straight");
		this.loadModel("cliff_corner_outer");
		this.loadModel("tree");
		this.camera.lookAt(new Vector3d(3, 2.85, 3), new Vector3d(3, 0, 0));
	}

	private drawMap(): void {
		const step: number = 0.25;
		const data: string[][][] = test;

		for (let y: number = 0; y < data.length; y++) {
			const layer: string[][] = data[y];
			for (let z: number = 0; z < layer.length; z++) {
				const row: string[] = layer[z];
				for (let x: number = 0; x < row.length; x++) {
					const tileConfig: string = row[x];
					const xPos: number = x * step;
					const yPos: number = y * step;
					const zPos: number = z * step;
					let model: number[] = translate(xPos, yPos, zPos);

					const elementConfigList: string[] = tileConfig.split(";");
					for (const elementConfig of elementConfigList) {
						const name: string = elementConfig.split(":").at(0) ?? "air";
						if (name == "air") {
							continue;
						}

						const rx: number = Number(elementConfig.split(":").at(1) ?? 0);
						if (rx != 0) {
							const rxs: number = rx / 180 * Math.PI;
							model = multiplyAll(model, rot(rxs, 0.0, 0.0));
						}

						this.drawModel(name, model);
					}

				}
			}
		}

	}

	private drawObject(name: string, x: number, y: number, z: number): void {
		const step: number = 0.25;
		const xPos: number = (x - 0.5) * step;
		const yPos: number = y * step + 0.1;
		const zPos: number = (z - 0.5) * step;
		let model: number[] = translate(xPos, yPos, zPos);
		this.drawModel(name, model);
	}

	private drawObjects(): void {
		this.drawObject("tree", 2, 0, 9);
		this.drawObject("tree", 2, 0, 11);
		this.drawObject("tree", 2, 0, 13);
		this.drawObject("tree", 2, 0, 15);

		this.drawObject("tree", 8, 0, 9);
		this.drawObject("tree", 8, 0, 11);
		this.drawObject("tree", 8, 0, 13);
		this.drawObject("tree", 8, 0, 15);
	}

	public update(time: number): void {
		this.time = time;
		this.contextManager.setViewport(this.context.canvas.width, this.context.canvas.height);
		this.contextManager.clear(Renderer.CLEAR_COLOR);
		this.drawMap();
		this.drawObjects();
	}

	public moveCamera(x: number, y: number, z: number): void {
		this.camera.lookAt(this.camera.getPosition().add(x, y, z), this.camera.getTarget().add(x, y, z));
	}

	private createMesh(path: string): Mesh {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		return new OBJDecoder(byteBuffer).decode();
	}

	private createVao(path: string): GLVertexArray {
		const mesh: Mesh = this.createMesh(path);
		const vao = new GLVertexArray(this.contextManager);
		vao.bind();

		const vbo = new GLVertexBuffer(this.contextManager);
		vbo.bind();
		vbo.loadData(mesh.getVertexList());
		this.context.vertexAttribPointer(0, 3, this.context.FLOAT, false, 5 * 4, 0);
		this.context.enableVertexAttribArray(0);
		this.context.vertexAttribPointer(1, 2, this.context.FLOAT, false, 5 * 4, 3 * 4);
		this.context.enableVertexAttribArray(1);

		const ebo = new GLElementBuffer(this.contextManager);
		ebo.bind();
		ebo.loadData(mesh.getIndiciesList());
		vao.ebo = mesh.getIndiciesList().length;

		vao.unbind();
		vbo.unbind();
		ebo.unbind();
		return vao;
	}

	private createTexture(path: string): GLTexture {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		const image: Image = pngDecoder.decode();
		const texture = new GLTexture(this.contextManager, this.context.TEXTURE_2D);

		texture.bind();
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
		texture.loadImageData(image.getWidth(), image.getHeight(), image.getData().unsafeGetData());
		texture.unbind();

		return texture;
	}

	private createShader(path: string, type: number): GLShader {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const text: string = new StringByteDecoder().decode(byteBuffer);
		const shader: GLFragmentShader = type ? new GLFragmentShader(this.contextManager, text) : new GLVertexShader(this.contextManager, text);

		shader.compile();

		if (shader.getCompilationStatus() == GLShader.CompilationStatus.FAILED) {
			throw new Error(shader.getCompilationError() ?? "Failed to compile shader.");
		}

		return shader;
	}

	private createProgram(path: string): GLProgram {
		const vertexShader: GLShader = this.createShader(path + ".vert", 0);
		const fragmentShader: GLShader = this.createShader(path + ".frag", 1);
		const program: GLProgram = new GLProgram(this.contextManager);

		program.attachShaders([vertexShader, fragmentShader]);
		program.link();

		if (program.getLinkingStatus() == GLProgram.LinkingStatus.FAILED) {
			throw new Error(program.getLinkingError() ?? "Failed to compile program.");
		}

		vertexShader.dispose();
		fragmentShader.dispose();

		return program;
	}

	private loadModel(name: string): void {
		this.vaoMap.set(name, this.createVao("./resources/model/" + name + "/" + name + ".obj"));
		this.textureMap.set(name, this.createTexture("./resources/model/" + name + "/" + name + ".png"));
		this.programMap.set(name, this.createProgram("./resources/shader/dummy"));
	}

	private drawModel(name: string, modelView: number[]): void {
		const program: GLProgram = this.programMap.get(name) as GLProgram;
		program.use();

		// Viewport size
		const viewportSizeLocation = this.context.getUniformLocation(program.getProgramObject(), "viewportSize");
		const viewportSize: number[] = [this.context.canvas.width, this.context.canvas.height];
		this.context.uniform2iv(viewportSizeLocation, viewportSize);

		// Projection
		const projectionLocation = this.context.getUniformLocation(program.getProgramObject(), "projection");
		const project: Projection = new Projection(this.context.canvas.width / this.context.canvas.height, 0.6, 0.1, 1000.0);
		this.context.uniformMatrix4fv(projectionLocation, false, project.getMatrix());

		// Time
		const timeLocation = this.context.getUniformLocation(program.getProgramObject(), "time");
		this.context.uniform1f(timeLocation, this.time / 100);

		const vao: GLVertexArray = this.vaoMap.get(name) as GLVertexArray;
		const texture: GLTexture = this.textureMap.get(name) as GLTexture;
		const modelViewLocation = this.context.getUniformLocation(program.getProgramObject(), "modelView");
		this.context.uniformMatrix4fv(modelViewLocation, false, multiplyAll(this.camera.getMatrix(), modelView));

		vao.bind();
		texture.bind();
		this.context.drawElements(this.context.TRIANGLES, vao.ebo, this.context.UNSIGNED_INT, 0);
		vao.unbind();
	}

}
