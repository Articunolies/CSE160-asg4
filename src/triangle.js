const FSIZE = Float32Array.BYTES_PER_ELEMENT;
const STRIDE = 8; // x, y, z, u, v, nx, ny, nz

/** Contains vertex, uv, and normal data for 1+ triangles. */
let arrayBuffer = null;

function initArrayBuffer() {
	arrayBuffer = gl.createBuffer();
	if (!arrayBuffer) throw new Error("Failed to create arrayBuffer.");

	gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

	// Position: 3 floats
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * STRIDE, 0);
	gl.enableVertexAttribArray(a_Position);

	// UV: 2 floats
	gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * STRIDE, FSIZE * 3);
	gl.enableVertexAttribArray(a_UV);

	// Normal: 3 floats
	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * STRIDE, FSIZE * 5);
	gl.enableVertexAttribArray(a_Normal);
}

/** @param {Float32Array} data vertex, uv, and normal data for the triangle(s) */
function drawTriangles(data) {
	if (!arrayBuffer) initArrayBuffer();

	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

	const numVertices = data.length / STRIDE;
	gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}