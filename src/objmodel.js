class OBJModel {
	modelMatrix = new Matrix4();
	renderType = 0;
	color = [0.6, 0.4, 0.2, 1]; // brown
	data = null;
	loaded = false;

	/**
	 * @param {number} renderType -1: debug, 0: color
	 * @param {number[]} [color] RGBA color array
	 */
	constructor(renderType, color) {
		this.renderType = renderType;
		if (color) this.color = color;
	}

	/**
	 * Load and parse an OBJ file.
	 * @param {string} url path to the .obj file
	 * @returns {Promise<void>}
	 */
	async load(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const text = await response.text();
			this.parse(text);
			this.loaded = true;
		} catch (e) {
			console.error('Failed to load OBJ:', url, e);
		}
	}

	/**
	 * Parse OBJ text into vertex data.
	 * Supports: v, vn, f (v//vn and v/vt/vn and v formats)
	 */
	parse(text) {
		const positions = [];
		const normals = [];
		const vertices = [];

		const lines = text.split('\n');
		for (const line of lines) {
			const parts = line.trim().split(/\s+/);
			if (parts[0] === 'v') {
				positions.push(
					parseFloat(parts[1]),
					parseFloat(parts[2]),
					parseFloat(parts[3])
				);
			} else if (parts[0] === 'vn') {
				normals.push(
					parseFloat(parts[1]),
					parseFloat(parts[2]),
					parseFloat(parts[3])
				);
			} else if (parts[0] === 'f') {
				const faceVerts = [];
				for (let i = 1; i < parts.length; i++) {
					const indices = parts[i].split('/');
					const vi = parseInt(indices[0]) - 1;
					let ni = -1;
					if (indices.length >= 3 && indices[2] !== '') {
						ni = parseInt(indices[2]) - 1;
					}
					faceVerts.push({ vi, ni });
				}

				// Fan triangulation for polygons
				for (let i = 1; i < faceVerts.length - 1; i++) {
					const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
					for (const v of tri) {
						const px = positions[v.vi * 3];
						const py = positions[v.vi * 3 + 1];
						const pz = positions[v.vi * 3 + 2];
						let nx = 0, ny = 0, nz = 0;
						if (v.ni >= 0 && v.ni * 3 + 2 < normals.length) {
							nx = normals[v.ni * 3];
							ny = normals[v.ni * 3 + 1];
							nz = normals[v.ni * 3 + 2];
						}
						// x,y,z, u,v, nx,ny,nz
						vertices.push(px, py, pz, 0, 0, nx, ny, nz);
					}
				}
			}
		}

		this.data = new Float32Array(vertices);
		console.log(`OBJ loaded: ${positions.length / 3} vertices, ${vertices.length / 8} triangulated verts`);
	}

	render() {
		if (!this.loaded || !this.data) return;

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
