//
// GLRenderer.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import { multiplyAll, rot, translate } from "../engine/core/math/Matrix4d.ts";
import ByteBuffer from "../engine/core/memory/ByteBuffer.ts";
import OpenMode from "../engine/core/io/file/OpenMode.ts";
import File from "../engine/core/io/file/File.ts";
import FileHandler from "../engine/core/io/file/FileHandler.ts";
import PNGDecoder from "../engine/core/format/png/PNGDecoder.ts";
import OBJDecoder from "../engine/core/format/obj/OBJDecoder.ts";
import TextFileLoader from "../engine/core/resource/TextFileLoader.ts";
import Resource from "../engine/core/resource/Resource.ts";
import Text from "../engine/core/resource/Text.ts";
import Image from "../engine/core/resource/Image.ts";
import Mesh from "../engine/core/resource/Mesh.ts";
import Projection from "../engine/core/rendering/Projection.ts";
import GLVertexBuffer from "../engine/drivers/graphic/gl/GLVertexBuffer.ts";
import GLElementBuffer from "../engine/drivers/graphic/gl/GLElementBuffer.ts";
import GLVertexArray from "../engine/drivers/graphic/gl/GLVertexArray.ts";
import GLTexture from "../engine/drivers/graphic/gl/GLTexture.ts";
import GLShader from "../engine/drivers/graphic/gl/GLShader.ts";
import GLVertexShader from "../engine/drivers/graphic/gl/GLVertexShader.ts";
import GLFragmentShader from "../engine/drivers/graphic/gl/GLFragmentShader.ts";
import GLProgram from "../engine/drivers/graphic/gl/GLProgram.ts";
import GLContextManager from "../engine/drivers/graphic/gl/GLContextManager.ts";

export default class GLRenderer {

	private readonly context: WebGL2RenderingContext;
	private readonly contextManager: GLContextManager;

	private program: Nullable<GLProgram>;
	private vao: Nullable<GLVertexArray>;
	private texture: Nullable<GLTexture>;
	private mesh: Nullable<Mesh>;

	public constructor(context: WebGL2RenderingContext) {
		this.context = context;
		this.contextManager = new GLContextManager(context);
		this.program = null;
		this.vao = null;
		this.texture = null;
		this.mesh = null;
	}

	public init(): void {
		const image: Image = this.createTexture("./resources/model/tree/tree.png")
		const mesh: Mesh = this.createMesh("./resources/model/tree/tree.obj");
		const vertexShader: GLShader = this.createShader("./resources/shader/dummy.vert", 0);
		const fragmentShader: GLShader = this.createShader("./resources/shader/dummy.frag", 1);
		const program: GLProgram = this.createProgram([vertexShader, fragmentShader]);

		vertexShader.dispose();
		fragmentShader.dispose();

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
		ebo.loadData(mesh.getIndiciesList())

		vao.unbind();
		vbo.unbind();
		ebo.unbind();

		const texture = new GLTexture(this.contextManager, this.context.TEXTURE_2D);
		texture.bind();
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
		texture.loadImageData(image.getWidth(), image.getHeight(), image.getData().unsafeGetData());
		//texture.generateMipmap();
		texture.unbind();

		this.vao = vao;
		this.program = program;
		this.texture = texture;
		this.mesh = mesh;
	}

	public update(time: number): void {
		if (this.program == null || this.vao == null || this.texture == null || this.mesh == null) {
			return;
		}

		this.contextManager.setViewport(this.context.canvas.width, this.context.canvas.height);
		this.contextManager.enableDepthTest();
		this.contextManager.enableBlend();
		this.contextManager.setAlphaBlend();
		this.contextManager.clear();

		this.program.use();

		// Viewport size
		const viewportSizeLocation = this.context.getUniformLocation(this.program.getProgramObject(), "viewportSize");
		const viewportSize: number[] = [this.context.canvas.width, this.context.canvas.height];
		this.context.uniform2iv(viewportSizeLocation, viewportSize);

		// Model view
		const modelViewLocation = this.context.getUniformLocation(this.program.getProgramObject(), "modelView");
		const data: number[] = multiplyAll(translate(0.0, 0, -4.0), rot(0.6, time / 100, 0.0));
		this.context.uniformMatrix4fv(modelViewLocation, false, data);

		// Projection
		const projectionLocation = this.context.getUniformLocation(this.program.getProgramObject(), "projection");
		const project: Projection = new Projection(this.context.canvas.width / this.context.canvas.height, 0.6, 0.1, 1000.0);
		this.context.uniformMatrix4fv(projectionLocation, false, project.getMatrix());

		// Time
		const timeLocation = this.context.getUniformLocation(this.program.getProgramObject(), "time");
		this.context.uniform1f(timeLocation, time / 100);

		this.vao.bind();
		this.texture.bind();

		this.context.drawElements(this.context.TRIANGLES, this.mesh.getIndiciesList().length, this.context.UNSIGNED_INT, 0);

		const data2 = multiplyAll(translate(-0.5, 0, -4.0), rot(0.6, time / 200, 0.0));
		this.context.uniformMatrix4fv(modelViewLocation, false, data2);
		this.context.drawElements(this.context.TRIANGLES, this.mesh.getIndiciesList().length, this.context.UNSIGNED_INT, 0);

		const data3 = multiplyAll(translate(-0.5, 0.3, -4.3), rot(0.6, time / 200, 0.0));
		this.context.uniformMatrix4fv(modelViewLocation, false, data3);
		this.context.drawElements(this.context.TRIANGLES, this.mesh.getIndiciesList().length, this.context.UNSIGNED_INT, 0);

		this.vao.unbind();
	}

	private createMesh(path: string): Mesh {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const decoder: OBJDecoder = new OBJDecoder(byteBuffer);
		return decoder.decode();
	}

	private createTexture(path: string): Image {
		const fileHandler: FileHandler = File.open(path, OpenMode.READ);
		const byteBuffer: ByteBuffer = fileHandler.read(fileHandler.getSize());
		const pngDecoder: PNGDecoder = new PNGDecoder(byteBuffer);
		return pngDecoder.decode();
	}

	private createShader(path: string, type: number): GLShader {
		const textResource: Resource<string, Text> = new Resource<string, Text>(path, new TextFileLoader());
		textResource.load();

		const text: string = textResource.get().getText();
		const shader: GLFragmentShader = type ? new GLFragmentShader(this.contextManager, text) : new GLVertexShader(this.contextManager, text);
		shader.compile();

		if (shader.getCompilationStatus() == GLShader.CompilationStatus.FAILED) {
			const error: Nullable<string> = shader.getCompilationError();
			throw new Error(error ?? "Failed to compile shader.");
		}

		return shader;
	}

	private createProgram(shaderList: GLShader[]): GLProgram {
		const program: GLProgram = new GLProgram(this.contextManager);
		program.attachShaders(shaderList);
		program.link();

		if (program.getLinkingStatus() == GLProgram.LinkingStatus.FAILED) {
			const error: Nullable<string> = program.getLinkingError();
			throw new Error(error ?? "Failed to compile program.");
		}

		return program;
	}

}
