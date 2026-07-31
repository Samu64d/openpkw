//
// GLRenderer.ts
//

import Nullable from "../engine/core/common/Nullable.ts";
import { multiply, rot, translate } from "../engine/core/math/Matrix4d.ts";
import Resource from "../engine/core/resource/resource/Resource.ts";
import Text from "../engine/core/resource/resource/Text.ts";
import TextFileLoader from "../engine/core/resource/loader/TextFileLoader.ts";
import GLVertexBuffer from "../engine/drivers/graphics/gl/GLVertexBuffer.ts";
import GLVertexArray from "../engine/drivers/graphics/gl/GLVertexArray.ts";
import GLTexture from "../engine/drivers/graphics/gl/GLTexture.ts";
import GLShader from "../engine/drivers/graphics/gl/GLShader.ts";
import GLVertexShader from "../engine/drivers/graphics/gl/GLVertexShader.ts";
import GLFragmentShader from "../engine/drivers/graphics/gl/GLFragmentShader.ts";
import GLProgram from "../engine/drivers/graphics/gl/GLProgram.ts";
import GLContextManager from "../engine/drivers/graphics/gl/GLContextManager.ts";
import Projection from "../engine/core/rendering/Projection.ts";

/** @tutorial */
export default class GLRenderer {

	private static readonly VERTEX_DATA: Float32Array = new Float32Array([
		-0.5, -0.5, -0.5, 0.0, 0.0,
		0.5, -0.5, -0.5, 1.0, 0.0,
		0.5, 0.5, -0.5, 1.0, 1.0,
		0.5, 0.5, -0.5, 1.0, 1.0,
		-0.5, 0.5, -0.5, 0.0, 1.0,
		-0.5, -0.5, -0.5, 0.0, 0.0,
		-0.5, -0.5, 0.5, 0.0, 0.0,
		0.5, -0.5, 0.5, 1.0, 0.0,
		0.5, 0.5, 0.5, 1.0, 1.0,
		0.5, 0.5, 0.5, 1.0, 1.0,
		-0.5, 0.5, 0.5, 0.0, 1.0,
		-0.5, -0.5, 0.5, 0.0, 0.0,
		-0.5, 0.5, 0.5, 1.0, 0.0,
		-0.5, 0.5, -0.5, 1.0, 1.0,
		-0.5, -0.5, -0.5, 0.0, 1.0,
		-0.5, -0.5, -0.5, 0.0, 1.0,
		-0.5, -0.5, 0.5, 0.0, 0.0,
		-0.5, 0.5, 0.5, 1.0, 0.0,
		0.5, 0.5, 0.5, 1.0, 0.0,
		0.5, 0.5, -0.5, 1.0, 1.0,
		0.5, -0.5, -0.5, 0.0, 1.0,
		0.5, -0.5, -0.5, 0.0, 1.0,
		0.5, -0.5, 0.5, 0.0, 0.0,
		0.5, 0.5, 0.5, 1.0, 0.0,
		-0.5, -0.5, -0.5, 0.0, 1.0,
		0.5, -0.5, -0.5, 1.0, 1.0,
		0.5, -0.5, 0.5, 1.0, 0.0,
		0.5, -0.5, 0.5, 1.0, 0.0,
		-0.5, -0.5, 0.5, 0.0, 0.0,
		-0.5, -0.5, -0.5, 0.0, 1.0,
		-0.5, 0.5, -0.5, 0.0, 1.0,
		0.5, 0.5, -0.5, 1.0, 1.0,
		0.5, 0.5, 0.5, 1.0, 0.0,
		0.5, 0.5, 0.5, 1.0, 0.0,
		-0.5, 0.5, 0.5, 0.0, 0.0,
		-0.5, 0.5, -0.5, 0.0, 1.0
	]);

	private readonly context: WebGL2RenderingContext;
	private readonly contextManager: GLContextManager;

	private program: Nullable<GLProgram>;
	private vao: Nullable<GLVertexArray>;
	private texture: Nullable<GLTexture>;
	private texture2: Nullable<GLTexture>;

	public constructor(context: WebGL2RenderingContext) {
		this.context = context;
		this.contextManager = new GLContextManager(context);
		this.program = null;
		this.vao = null;
		this.texture = null;
		this.texture2 = null;
	}

	public init(): void {
		const vertexShader: GLShader = this.createShader("./resources/shader/dummy.vert", 0);
		const fragmentShader: GLShader = this.createShader("./resources/shader/dummy.frag", 1);
		const program: GLProgram = this.createProgram([vertexShader, fragmentShader]);
		vertexShader.dispose();
		fragmentShader.dispose();

		const vao = new GLVertexArray(this.contextManager);
		vao.bind();

		const vbo = new GLVertexBuffer(this.contextManager);
		vbo.bind();
		vbo.loadData(GLRenderer.VERTEX_DATA);
		this.context.vertexAttribPointer(0, 3, this.context.FLOAT, false, 5 * 4, 0);
		this.context.enableVertexAttribArray(0);
		this.context.vertexAttribPointer(1, 2, this.context.FLOAT, false, 5 * 4, 3 * 4);
		this.context.enableVertexAttribArray(1);

		vao.unbind();
		vbo.unbind();

		const texture = new GLTexture(this.contextManager, this.context.TEXTURE_2D);
		texture.bind();

		const data = new Uint8Array([
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 0, 0, 0, 203, 203, 203, 203, 203, 203,
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			0, 0, 0, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203,
			255, 0, 0, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203, 203
		]);

		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR_MIPMAP_LINEAR);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
		texture.loadImageData(8, 8, data);
		texture.generateMipmap();

		texture.unbind();

		const texture2 = new GLTexture(this.contextManager, this.context.TEXTURE_2D);
		texture2.bind();
		const data2 = new Uint8Array([250, 250, 250]);
		texture2.loadImageData(1, 1, data2);
		texture2.unbind();

		this.vao = vao;
		this.program = program;
		this.texture = texture;
		this.texture2 = texture2;
	}

	public update(time: number): void {

		if (this.program == null || this.vao == null || this.texture == null || this.texture2 == null) {
			return;
		}

		this.contextManager.setViewport(this.context.canvas.width, this.context.canvas.height);
		this.contextManager.enableDepthTest();
		this.contextManager.clear();

		this.program.use();

		// Model view
		const modelViewLocation = this.context.getUniformLocation(this.program.getProgramObject(), "modelView");
		const data = multiply(translate(0.0, Math.sin(time / 40) * 0.1, -6.0), rot(0.3, time / 100, 0.0));
		this.context.uniformMatrix4fv(modelViewLocation, false, data);

		// Projection
		const projectionLocation = this.context.getUniformLocation(this.program.getProgramObject(), "projection");
		const project = new Projection(this.context.canvas.width / this.context.canvas.height, 0.6, 0.1, 100);
		this.context.uniformMatrix4fv(projectionLocation, false, project.getMatrix());

		// Time
		const timeLocation = this.context.getUniformLocation(this.program.getProgramObject(), "time");
		this.context.uniform1f(timeLocation, time / 100);

		this.vao.bind();
		this.texture.bind();
		this.context.drawArrays(this.context.TRIANGLES, 0, GLRenderer.VERTEX_DATA.length / 5);
		this.texture2.bind();
		this.context.drawArrays(this.context.LINE_STRIP, 0, GLRenderer.VERTEX_DATA.length / 5);
		this.vao.unbind();
	}

	private createShader(path: string, type: number): GLShader {
		const textResource: Resource<string, Text> = new Resource<string, Text>(path, new TextFileLoader());
		textResource.load();
		const text: Text = textResource.get();
		const shader: GLFragmentShader = type ? new GLFragmentShader(this.contextManager, text.getText()) : new GLVertexShader(this.contextManager, text.getText());
		shader.compile();
		const compilationStatus: GLShader.CompilationStatus = shader.getCompilationStatus();
		if (compilationStatus == GLShader.CompilationStatus.FAILED) {
			const error = shader.getCompilationError();
			throw new Error(error ?? "Shader compilation failed");
		}
		return shader;
	}

	private createProgram(shaderList: GLShader[]): GLProgram {
		const program: GLProgram = new GLProgram(this.contextManager);
		program.attachShaders(shaderList);
		program.link();
		const linkingStatus: GLProgram.LinkingStatus = program.getLinkingStatus();
		if (linkingStatus == GLProgram.LinkingStatus.FAILED) {
			const error = program.getLinkingError();
			throw new Error(error ?? "Program linking failed");
		}
		return program;
	}

}
