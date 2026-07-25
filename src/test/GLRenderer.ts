//
// GLRenderer.ts
//

import Nullable from "../core/foundation/Nullable.ts";
import { multiply, rot, translate } from "../core/math/Matrix4d.ts";
import Projection from "../core/rendering/Projection.ts";
import TextFileResource from "../core/resource/TextFileResource.ts";
import GLVertexBuffer from "../core/gl/GLVertexBuffer.ts";
import GLVertexArray from "../core/gl/GLVertexArray.ts";
import GLTexture from "../core/gl/GLTexture.ts";
import GLShader from "../core/gl/GLShader.ts";
import GLVertexShader from "../core/gl/GLVertexShader.ts";
import GLFragmentShader from "../core/gl/GLFragmentShader.ts";
import GLProgram from "../core/gl/GLProgram.ts";
import GLContextManager from "../core/gl/GLContextManager.ts";

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

		const vertexShaderResource: TextFileResource = new TextFileResource("./resources/shader/dummy.vert");
		vertexShaderResource.load();
		const vertexShader: GLVertexShader = new GLVertexShader(this.contextManager, vertexShaderResource.getContent());
		vertexShader.compile();
		const vertexShaderCompilationStatus: GLShader.CompilationStatus = vertexShader.getCompilationStatus();
		if (vertexShaderCompilationStatus == GLShader.CompilationStatus.FAILED) {
			const error = vertexShader.getCompilationError();
			throw new Error(error ?? "Shader compilation failed");
		}

		const fragmentShaderResource: TextFileResource = new TextFileResource("./resources/shader/dummy.frag");
		fragmentShaderResource.load();
		const fragmentShader: GLFragmentShader = new GLFragmentShader(this.contextManager, fragmentShaderResource.getContent());
		fragmentShader.compile();
		const fragmentShaderCompilationStatus: GLShader.CompilationStatus = fragmentShader.getCompilationStatus();
		if (fragmentShaderCompilationStatus == GLShader.CompilationStatus.FAILED) {
			const error = fragmentShader.getCompilationError();
			throw new Error(error ?? "Shader compilation failed");
		}

		const program: GLProgram = new GLProgram(this.contextManager);
		program.attachShaders([vertexShader, fragmentShader]);
		program.link();
		vertexShader.dispose();
		fragmentShader.dispose();

		const vbo = new GLVertexBuffer(this.contextManager);

		const vao = new GLVertexArray(this.contextManager);
		vao.bind();

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

}
