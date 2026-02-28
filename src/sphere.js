class Sphere {
	modelMatrix = new Matrix4();
	renderType = 0;
	color = [1, 1, 1, 1];

	/**
	 * @param {number} renderType -1: debug, 0: color, 1: texture0, 2: texture1
	 * @param {number[]} [color] RGBA color array
	 * @param {number} [latBands] number of latitude bands (default 20)
	 * @param {number} [lonBands] number of longitude bands (default 20)
	 */
	constructor(renderType, color, latBands = 20, lonBands = 20) {
		this.renderType = renderType;
		if (color) this.color = color;
		this.data = Sphere.generateData(latBands, lonBands);
	}

	static generateData(latBands, lonBands) {
		const verts = [];

		for (let lat = 0; lat < latBands; lat++) {
			const theta1 = (lat / latBands) * Math.PI;
			const theta2 = ((lat + 1) / latBands) * Math.PI;

			for (let lon = 0; lon < lonBands; lon++) {
				const phi1 = (lon / lonBands) * 2 * Math.PI;
				const phi2 = ((lon + 1) / lonBands) * 2 * Math.PI;

				// Four corners of this quad on the sphere
				const x1 = Math.sin(theta1) * Math.cos(phi1);
				const y1 = Math.cos(theta1);
				const z1 = Math.sin(theta1) * Math.sin(phi1);

				const x2 = Math.sin(theta1) * Math.cos(phi2);
				const y2 = Math.cos(theta1);
				const z2 = Math.sin(theta1) * Math.sin(phi2);

				const x3 = Math.sin(theta2) * Math.cos(phi2);
				const y3 = Math.cos(theta2);
				const z3 = Math.sin(theta2) * Math.sin(phi2);

				const x4 = Math.sin(theta2) * Math.cos(phi1);
				const y4 = Math.cos(theta2);
				const z4 = Math.sin(theta2) * Math.sin(phi1);

				// UV coordinates
				const u1 = lon / lonBands;
				const u2 = (lon + 1) / lonBands;
				const v1 = lat / latBands;
				const v2 = (lat + 1) / latBands;

				// For a unit sphere at origin, normal = position
				// Triangle 1: top-left, top-right, bottom-right
				// x,y,z, u,v, nx,ny,nz
				verts.push(x1, y1, z1, u1, v1, x1, y1, z1);
				verts.push(x2, y2, z2, u2, v1, x2, y2, z2);
				verts.push(x3, y3, z3, u2, v2, x3, y3, z3);

				// Triangle 2: top-left, bottom-right, bottom-left
				verts.push(x1, y1, z1, u1, v1, x1, y1, z1);
				verts.push(x3, y3, z3, u2, v2, x3, y3, z3);
				verts.push(x4, y4, z4, u1, v2, x4, y4, z4);
			}
		}

		return new Float32Array(verts);
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
