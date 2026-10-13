//
// Renderer.ts
//

import Vector3d from "../engine/core/math/Vector3d.ts";
import { multiplyAll, rot, translate } from "../engine/core/math/Matrix4d.ts";
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
import MapData from "./MapData.ts";

/** Playground renderer */
export default class Renderer {

	private static readonly CLEAR_COLOR: Color = [255, 255, 255, 255];

	private readonly context: WebGL2RenderingContext;
	private readonly contextManager: GLContextManager;
	private readonly programMap: Map<string, GLProgram>;
	private readonly modelMap: Map<string, GLVertexArray>;
	private readonly textureMap: Map<string, GLTexture>;
	private readonly modelProgramMap: Map<string, string>;
	private readonly camera: Camera;
	private time: number;

	public constructor(context: WebGL2RenderingContext) {
		this.context = context;
		this.contextManager = new GLContextManager(context);
		this.programMap = new Map<string, GLProgram>();
		this.modelMap = new Map<string, GLVertexArray>();
		this.textureMap = new Map<string, GLTexture>();
		this.modelProgramMap = new Map<string, string>();
		this.camera = new Camera();
		this.time = 0;
	}

	public init(): void {
		this.contextManager.enableDepthTest();
		this.contextManager.enableBlend();
		this.contextManager.setAlphaBlend();

		this.loadProgram("terrain");
		this.loadProgram("tree");

		this.loadModel("grass_0");
		this.loadModel("grass_1");
		this.loadModel("grass_2");
		this.loadModel("grass_3");
		this.loadModel("cliff_straight");
		this.loadModel("cliff_corner_inner");
		this.loadModel("cliff_corner_outer");
		this.loadModel("wall_cliff_base_straight");
		this.loadModel("wall_cliff_base_corner_inner");
		this.loadModel("wall_cliff_base_corner_outer");
		this.loadModel("wall_cliff_top_straight");
		this.loadModel("wall_cliff_top_corner_inner");
		this.loadModel("wall_cliff_top_corner_outer");
		this.loadModel("tree_0", "tree");
		this.loadModel("tree_1", "tree");
		this.loadModel("tree_2", "tree");
		this.loadModel("sign_0");
		this.loadModel("house_0");

		this.camera.lookAt(new Vector3d(3, 2.85, 3), new Vector3d(3, 0, 0));
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

	private loadProgram(programName: string): void {
		this.programMap.set(programName, this.createProgram("./resources/shader/" + programName));
	}

	private createModel(path: string): GLVertexArray {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const mesh: Mesh = new OBJDecoder(byteBuffer).decode();
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

	private createTexture(path: string): GLTexture {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		const image: Image = pngDecoder.decode();
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

	private loadModel(modelName: string, programName: string = "terrain"): void {
		this.modelMap.set(modelName, this.createModel("./resources/model/" + modelName + "/" + modelName + ".obj"));
		this.textureMap.set(modelName, this.createTexture("./resources/model/" + modelName + "/" + modelName + ".png"));
		this.modelProgramMap.set(modelName, programName);
	}

	private drawModel(modelName: string, modelView: number[]): void {
		const programName: string = this.modelProgramMap.get(modelName) as string;
		const program: GLProgram = this.programMap.get(programName) as GLProgram;

		program.use();

		// Viewport size
		const viewportSizeLocation = this.context.getUniformLocation(program.getProgramObject(), "viewportSize");
		const viewportSize: number[] = [this.context.canvas.width, this.context.canvas.height];

		this.context.uniform2iv(viewportSizeLocation, viewportSize);

		// Projection
		const projectionLocation = this.context.getUniformLocation(program.getProgramObject(), "projection");
		const project: Projection = new Projection(this.context.canvas.width / this.context.canvas.height, 0.5, 0.1, 1000.0);

		this.context.uniformMatrix4fv(projectionLocation, false, project.getMatrix());

		// Time
		const timeLocation = this.context.getUniformLocation(program.getProgramObject(), "time");

		this.context.uniform1f(timeLocation, this.time / 100);

		const vao: GLVertexArray = this.modelMap.get(modelName) as GLVertexArray;
		const texture: GLTexture = this.textureMap.get(modelName) as GLTexture;
		const modelViewLocation = this.context.getUniformLocation(program.getProgramObject(), "modelView");

		this.context.uniformMatrix4fv(modelViewLocation, false, multiplyAll(this.camera.getMatrix(), modelView));

		vao.bind();
		texture.bind();
		this.context.drawElements(this.context.TRIANGLES, vao.ebo, this.context.UNSIGNED_INT, 0);
		vao.unbind();
	}

	private drawMap(): void {
		const step: number = 0.25;
		const data: string[][][] = MapData;

		for (let y: number = 0; y < data.length; y++) {
			const layer: string[][] = data[y];

			for (let z: number = 0; z < layer.length; z++) {
				const row: string[] = layer[z];

				for (let x: number = 0; x < row.length; x++) {
					const tileConfig: string = row[x];
					const elementConfigList: string[] = tileConfig.split(";");
					const xPos: number = x * step;
					const yPos: number = y * step;
					const zPos: number = z * step;
					let modelView: number[] = translate(xPos, yPos, zPos);

					for (const elementConfig of elementConfigList) {
						const modelName: string = elementConfig.split(":").at(0) ?? "air";

						if (modelName == "air") {
							continue;
						}

						const modelRotationX: number = Number(elementConfig.split(":").at(1) ?? 0);

						if (modelRotationX != 0) {
							const rxs: number = modelRotationX / 180 * Math.PI;

							modelView = multiplyAll(modelView, rot(rxs, 0.0, 0.0));
						}

						this.drawModel(modelName, modelView);
					}

				}
			}
		}

	}

	private drawObject(modelName: string, x: number, y: number, z: number): void {
		const step: number = 0.25;
		const xPos: number = (x - 0.5) * step;
		const yPos: number = y * step;
		const zPos: number = (z - 0.5) * step;
		const modelView: number[] = translate(xPos, yPos, zPos);

		this.drawModel(modelName, modelView);
	}

	private drawObjects(): void {
		this.drawObject("tree_0", 1.0, 0.0, 9.0);
		this.drawObject("tree_0", 1.0, 0.0, 11.0);
		this.drawObject("tree_0", 1.0, 0.0, 13.0);
		this.drawObject("tree_0", 1.0, 0.0, 15.0);
		this.drawObject("tree_0", 4.0, 0.0, 9.0);
		this.drawObject("tree_0", 4.0, 0.0, 11.0);
		this.drawObject("tree_0", 4.0, 0.0, 13.0);
		this.drawObject("tree_0", 4.0, 0.0, 15.0);
		this.drawObject("tree_0", 6.0, 0.0, 9.0);
		this.drawObject("tree_0", 6.0, 0.0, 11.0);
		this.drawObject("tree_0", 6.0, 0.0, 13.0);
		this.drawObject("tree_0", 6.0, 0.0, 15.0);
		this.drawObject("tree_0", 8.0, 0.0, 9.0);
		this.drawObject("tree_0", 8.0, 0.0, 11.0);
		this.drawObject("tree_0", 8.0, 0.0, 13.0);
		this.drawObject("tree_0", 8.0, 0.0, 15.0);

		this.drawObject("tree_0", 4.0, 0.85, 19.0);
		this.drawObject("tree_2", 6.5, 0.85, 18.5);

		this.drawObject("tree_2", 7.5, 0.0, 22.5);

		this.drawObject("sign_0", 10.0, 0.0, 9.0);

		this.drawObject("house_0", 15.0, 0.0, 9.0);
	}

}
