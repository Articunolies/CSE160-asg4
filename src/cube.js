class Cube {
	// Vertex data: x,y,z, u,v, nx,ny,nz  (stride = 8)
	data = new Float32Array([
		// front face (z=0, normal 0,0,-1)
		0,0,0, 0,0, 0,0,-1,   1,1,0, 1,1, 0,0,-1,   1,0,0, 1,0, 0,0,-1,
		0,0,0, 0,0, 0,0,-1,   0,1,0, 0,1, 0,0,-1,   1,1,0, 1,1, 0,0,-1,
		// back face (z=1, normal 0,0,1)
		0,0,1, 0,0, 0,0,1,    1,0,1, 1,0, 0,0,1,    1,1,1, 1,1, 0,0,1,
		0,0,1, 0,0, 0,0,1,    1,1,1, 1,1, 0,0,1,    0,1,1, 0,1, 0,0,1,
		// top face (y=1, normal 0,1,0)
		0,1,0, 0,0, 0,1,0,    1,1,1, 1,1, 0,1,0,    1,1,0, 1,0, 0,1,0,
		0,1,0, 0,0, 0,1,0,    0,1,1, 0,1, 0,1,0,    1,1,1, 1,1, 0,1,0,
		// bottom face (y=0, normal 0,-1,0)
		0,0,0, 0,0, 0,-1,0,   1,0,0, 1,0, 0,-1,0,   1,0,1, 1,1, 0,-1,0,
		0,0,0, 0,0, 0,-1,0,   1,0,1, 1,1, 0,-1,0,   0,0,1, 0,1, 0,-1,0,
		// left face (x=0, normal -1,0,0)
		0,0,0, 0,0, -1,0,0,   0,0,1, 1,0, -1,0,0,   0,1,1, 1,1, -1,0,0,
		0,0,0, 0,0, -1,0,0,   0,1,1, 1,1, -1,0,0,   0,1,0, 0,1, -1,0,0,
		// right face (x=1, normal 1,0,0)
		1,0,0, 0,0, 1,0,0,    1,1,0, 0,1, 1,0,0,    1,1,1, 1,1, 1,0,0,
		1,0,0, 0,0, 1,0,0,    1,1,1, 1,1, 1,0,0,    1,0,1, 1,0, 1,0,0,
	]);

	modelMatrix = new Matrix4();
	renderType;
	color = [1,1,1,1];	// white

	/**
	 * Required to specify renderType.
	 * @param {number} renderType -1: debug, 0: color, 1: texture0, 2: texture1
	 */
	constructor(renderType, color) {
		this.renderType = renderType;
		if (color) this.color = color;
	}

	render() {
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);
		gl.uniform1i(u_RenderType, this.renderType);
		gl.uniform4f(u_FragColor, ...this.color);

		// Calculate and pass normal matrix
		let normalMatrix = new Matrix4();
		normalMatrix.setInverseOf(this.modelMatrix);
		normalMatrix.transpose();
		gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

		drawTriangles(this.data);
	}
}