// ===================== SHADERS =====================
const VSHADER_SOURCE = `
	precision mediump float;
	attribute vec4 a_Position;
	attribute vec2 a_UV;
	attribute vec3 a_Normal;

	uniform mat4 u_ModelMatrix;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ProjectionMatrix;
	uniform mat4 u_NormalMatrix;

	varying vec2 v_UV;
	varying vec3 v_Normal;
	varying vec3 v_WorldPos;

	void main() {
		gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
		v_UV = a_UV;
		v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal);
		v_WorldPos = (u_ModelMatrix * a_Position).xyz;
	}
`;

const FSHADER_SOURCE = `
	precision mediump float;
	varying vec2 v_UV;
	varying vec3 v_Normal;
	varying vec3 v_WorldPos;

	uniform int u_RenderType;
	uniform vec4 u_FragColor;
	uniform sampler2D u_Sampler0;
	uniform sampler2D u_Sampler1;

	// Lighting controls
	uniform bool u_NormalVis;
	uniform bool u_LightingOn;
	uniform vec3 u_LightPos;
	uniform vec3 u_LightColor;
	uniform vec3 u_CameraPos;

	// Spotlight
	uniform bool u_SpotlightOn;
	uniform vec3 u_SpotlightPos;
	uniform vec3 u_SpotlightDir;
	uniform float u_SpotlightCutoff;	// cosine of cutoff angle

	void main() {
		// Determine base color from render type
		vec4 baseColor;
		if      (u_RenderType == -1) baseColor = vec4(v_UV, 1.0, 1.0);            // UV debug
		else if (u_RenderType == 0)  baseColor = u_FragColor;                      // solid color
		else if (u_RenderType == 1)  baseColor = texture2D(u_Sampler0, v_UV);      // texture 0
		else if (u_RenderType == 2)  baseColor = texture2D(u_Sampler1, v_UV);      // texture 1
		else                         baseColor = vec4(1.0, 0.2, 0.2, 1.0);         // error red

		// Normal visualization mode
		if (u_NormalVis) {
			gl_FragColor = vec4(v_Normal * 0.5 + 0.5, 1.0);
			return;
		}

		// No lighting — just base color
		if (!u_LightingOn) {
			gl_FragColor = baseColor;
			return;
		}

		// ===== Phong lighting in fragment shader =====
		vec3 N = normalize(v_Normal);
		vec3 L = normalize(u_LightPos - v_WorldPos);
		vec3 V = normalize(u_CameraPos - v_WorldPos);

		// Ambient
		vec3 ambient = 0.2 * baseColor.rgb;

		// Diffuse (main light)
		float nDotL = max(dot(N, L), 0.0);
		vec3 diffuse = u_LightColor * baseColor.rgb * nDotL;

		// Specular (main light)
		vec3 R = reflect(-L, N);
		float spec = pow(max(dot(V, R), 0.0), 32.0);
		vec3 specular = u_LightColor * spec * 0.5;

		vec3 result = ambient + diffuse + specular;

		// ===== Spotlight contribution =====
		if (u_SpotlightOn) {
			vec3 spotL = normalize(u_SpotlightPos - v_WorldPos);
			vec3 spotDir = normalize(u_SpotlightDir);
			float theta = dot(spotL, -spotDir);

			if (theta > u_SpotlightCutoff) {
				float intensity = clamp((theta - u_SpotlightCutoff) / (1.0 - u_SpotlightCutoff), 0.0, 1.0);

				float spotNDotL = max(dot(N, spotL), 0.0);
				vec3 spotDiffuse = vec3(1.0, 1.0, 0.9) * baseColor.rgb * spotNDotL;

				vec3 spotR = reflect(-spotL, N);
				float spotSpec = pow(max(dot(V, spotR), 0.0), 32.0);
				vec3 spotSpecular = vec3(1.0, 1.0, 0.9) * spotSpec * 0.5;

				result += (spotDiffuse + spotSpecular) * intensity;
			}
		}

		gl_FragColor = vec4(result, baseColor.a);
	}
`;

// ===================== GLOBALS =====================
let canvas;
let gl;
let camera;

// Attribute / uniform locations
let a_Position, a_UV, a_Normal;
let u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix, u_NormalMatrix;
let u_RenderType, u_FragColor, u_Sampler0, u_Sampler1;
let u_NormalVis, u_LightingOn;
let u_LightPos, u_LightColor, u_CameraPos;
let u_SpotlightOn, u_SpotlightPos, u_SpotlightDir, u_SpotlightCutoff;

// Lighting state
let g_normalVis = false;
let g_lightingOn = true;
let g_animateLight = true;
let g_spotlightOn = false;

let g_lightPos = [3, 5, 3];
let g_lightColor = [1, 1, 1];

// Spotlight defaults: above scene, pointing down
let g_spotlightPos = [0, 8, 0];
let g_spotlightDir = [0, -1, 0];
let g_spotlightCutoff = Math.cos(25 * Math.PI / 180); // 25 degree cone

const map = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 4, 3, 0, 0, 0, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ===================== MAIN =====================
function main() {
	getGlobalVars();
	setupWebGL();
	initTextures();

	document.onmousemove = (e) => onMouseMove(e);
	document.onmousedown = (e) => onMouseDown(e);
	document.onkeydown = (e) => onKeydown(e);

	gl.clearColor(0, 0, 0, 1);

	initSky();
	initFloor();
	initWalls();
	initKing();
	initSphere();
	initLightCube();
	initOBJModel();

	requestAnimationFrame(tick);
}

function getGlobalVars() {
	canvas = document.getElementById("webgl");

	gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
	if (!gl) throw new Error("Failed to get the rendering context for WebGL.");
	gl.enable(gl.DEPTH_TEST);

	camera = new Camera();
	const translation = new Vector3([0, 1, 8]);
	camera.eye.add(translation);
	camera.at.add(translation);
}

function setupWebGL() {
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
		throw new Error("Failed to initialize shaders.");

	// Attributes
	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	a_UV = gl.getAttribLocation(gl.program, "a_UV");
	a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

	// Matrix uniforms
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
	u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	gl.uniformMatrix4fv(u_NormalMatrix, false, new Matrix4().elements);

	// Color / texture uniforms
	u_RenderType = gl.getUniformLocation(gl.program, "u_RenderType");
	u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
	u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");

	// Lighting uniforms
	u_NormalVis = gl.getUniformLocation(gl.program, "u_NormalVis");
	u_LightingOn = gl.getUniformLocation(gl.program, "u_LightingOn");
	u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
	u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
	u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");

	// Spotlight uniforms
	u_SpotlightOn = gl.getUniformLocation(gl.program, "u_SpotlightOn");
	u_SpotlightPos = gl.getUniformLocation(gl.program, "u_SpotlightPos");
	u_SpotlightDir = gl.getUniformLocation(gl.program, "u_SpotlightDir");
	u_SpotlightCutoff = gl.getUniformLocation(gl.program, "u_SpotlightCutoff");
}

// ===================== TEXTURES =====================
function initTextures() {
	const image0 = new Image();
	image0.onload = () => sendToTexture0(image0);
	image0.src = "../assets/gigaGrass.jpg";

	const image1 = new Image();
	image1.onload = () => sendToTexture1(image1);
	image1.src = "../assets/stone.jpg";
}

function sendToTexture0(image) {
	const texture = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.uniform1i(u_Sampler0, 0);
}

function sendToTexture1(image) {
	const texture = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.uniform1i(u_Sampler1, 1);
}

// ===================== INPUT =====================
let prevCursorX;
function onMouseMove(e) {
	const x = e.clientX;
	if (!prevCursorX) prevCursorX = x;
	const dx = x - prevCursorX;
	camera.pan(dx);
	prevCursorX = x;
}

function onMouseDown(e) {
	const [x, y, z] = cameraToWorldCoords(camera.at.elements);
	if (z < 0 || z > map.length - 1 || x < 0 || x > map[0].length - 1) return;
	if (e.buttons === 1 && map[z][x] > 0) map[z][x]--;
	else if (e.buttons === 2) map[z][x]++;
	walls.length = 0;
	initWalls();
	render();
}

function cameraToWorldCoords(position) {
	const [x, y, z] = position;
	return [Math.floor(x + 16), y, Math.floor(z + 16)];
}

function onKeydown(e) {
	if (e.key === 'w') camera.moveForward();
	else if (e.key === 's') camera.moveBackward();
	else if (e.key === 'a') camera.moveLeft();
	else if (e.key === 'd') camera.moveRight();
	else if (e.key === 'q') camera.panLeft();
	else if (e.key === 'e') camera.panRight();
	render();
}

// ===================== UI CALLBACKS =====================
function toggleNormalVis() {
	g_normalVis = !g_normalVis;
	document.getElementById("btnNormalVis").textContent =
		"Normal Vis: " + (g_normalVis ? "ON" : "OFF");
}

function toggleLighting() {
	g_lightingOn = !g_lightingOn;
	document.getElementById("btnLighting").textContent =
		"Lighting: " + (g_lightingOn ? "ON" : "OFF");
}

function toggleSpotlight() {
	g_spotlightOn = !g_spotlightOn;
	document.getElementById("btnSpotlight").textContent =
		"Spotlight: " + (g_spotlightOn ? "ON" : "OFF");
}

function toggleAnimLight() {
	g_animateLight = !g_animateLight;
	document.getElementById("btnAnimLight").textContent =
		"Animate Light: " + (g_animateLight ? "ON" : "OFF");
}

function onLightSlider() {
	g_lightPos[0] = parseFloat(document.getElementById("lightX").value);
	g_lightPos[1] = parseFloat(document.getElementById("lightY").value);
	g_lightPos[2] = parseFloat(document.getElementById("lightZ").value);
	document.getElementById("lightXVal").textContent = g_lightPos[0].toFixed(1);
	document.getElementById("lightYVal").textContent = g_lightPos[1].toFixed(1);
	document.getElementById("lightZVal").textContent = g_lightPos[2].toFixed(1);
}

function onLightColorSlider() {
	g_lightColor[0] = parseFloat(document.getElementById("lightR").value);
	g_lightColor[1] = parseFloat(document.getElementById("lightG").value);
	g_lightColor[2] = parseFloat(document.getElementById("lightB").value);
	document.getElementById("lightRVal").textContent = g_lightColor[0].toFixed(2);
	document.getElementById("lightGVal").textContent = g_lightColor[1].toFixed(2);
	document.getElementById("lightBVal").textContent = g_lightColor[2].toFixed(2);
}

// ===================== SCENE OBJECTS =====================
let sky;
function initSky() {
	const skyBlue = [135 / 255, 206 / 255, 235 / 255, 1];
	sky = new Cube(0, skyBlue);
	sky.modelMatrix.setIdentity();
	sky.modelMatrix.scale(64, 64, 64);
	sky.modelMatrix.translate(-0.5, -0.5, -0.5);
}

let floor;
function initFloor() {
	floor = new Cube(1);
	floor.modelMatrix.setIdentity();
	floor.modelMatrix.scale(32, 0.01, 32);
	floor.modelMatrix.translate(-0.5, -0.5, -0.5);
}

const walls = [];
function initWalls() {
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[0].length; x++) {
			const wallHeight = map[y][x];
			for (let h = 0; h < wallHeight; h++) {
				const wall = new Cube(2);
				wall.modelMatrix.setIdentity();
				wall.modelMatrix.translate(x - 16, h, y - 16);
				walls.push(wall);
			}
		}
	}
}

let king;
function initKing() {
	const modelMatrix = new Matrix4();
	modelMatrix.translate(-1, 0, 2);
	king = new King(modelMatrix);
}

let sphere;
function initSphere() {
	sphere = new Sphere(0, [0.2, 0.6, 1.0, 1.0]);
	sphere.modelMatrix.setIdentity();
	sphere.modelMatrix.translate(2, 1.5, 2);
}

let lightCube;
function initLightCube() {
	lightCube = new Cube(0, [1, 1, 0, 1]);
}

let bunny;
function initOBJModel() {
	bunny = new OBJModel(0, [0.7, 0.5, 0.3, 1]);
	bunny.load("../assets/bunny.obj").then(() => {
		if (!bunny.loaded) return;
		bunny.modelMatrix.setIdentity();
		bunny.modelMatrix.translate(4, -0.4, 4);  // shift down so feet touch floor
		bunny.modelMatrix.scale(0.6, 0.6, 0.6);
		console.log("Bunny model loaded successfully.");
	}).catch((e) => {
		console.error("Failed to load bunny:", e);
	});
}

// ===================== ANIMATION / RENDER =====================
let g_startTime = performance.now() / 1000;

function tick() {
	const now = performance.now() / 1000;
	const elapsed = now - g_startTime;

	// Animate light position in a circle
	if (g_animateLight) {
		const radius = 5;
		g_lightPos[0] = radius * Math.cos(elapsed);
		g_lightPos[2] = radius * Math.sin(elapsed);
		// Update sliders to match
		document.getElementById("lightX").value = g_lightPos[0].toFixed(1);
		document.getElementById("lightZ").value = g_lightPos[2].toFixed(1);
		document.getElementById("lightXVal").textContent = g_lightPos[0].toFixed(1);
		document.getElementById("lightZVal").textContent = g_lightPos[2].toFixed(1);
	}

	render();
	updateFPSCounter();
	requestAnimationFrame(tick);
}

function render() {
	// Camera matrices
	gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
	gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

	// Lighting uniforms
	gl.uniform1i(u_NormalVis, g_normalVis ? 1 : 0);
	gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);
	gl.uniform3f(u_LightPos, ...g_lightPos);
	gl.uniform3f(u_LightColor, ...g_lightColor);
	gl.uniform3f(u_CameraPos, ...camera.eye.elements);

	// Spotlight uniforms
	gl.uniform1i(u_SpotlightOn, g_spotlightOn ? 1 : 0);
	gl.uniform3f(u_SpotlightPos, ...g_spotlightPos);
	gl.uniform3f(u_SpotlightDir, ...g_spotlightDir);
	gl.uniform1f(u_SpotlightCutoff, g_spotlightCutoff);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw sky (no lighting effect desired — sky renders with lighting off momentarily)
	gl.uniform1i(u_LightingOn, 0);
	sky.render();
	gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);

	// Draw scene
	floor.render();
	for (const wall of walls) wall.render();
	king.render();
	sphere.render();
	if (bunny && bunny.loaded) bunny.render();

	// Draw a small yellow cube at the light position
	lightCube.modelMatrix.setIdentity();
	lightCube.modelMatrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
	lightCube.modelMatrix.scale(0.2, 0.2, 0.2);
	lightCube.modelMatrix.translate(-0.5, -0.5, -0.5);
	gl.uniform1i(u_LightingOn, 0); // light cube shouldn't be lit
	lightCube.render();
	gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);
}

let start = performance.now();
function updateFPSCounter() {
	const fpsCounter = document.getElementById("fpsCounter");
	const ms = performance.now() - start;
	const fps = Math.floor(1000 / ms);
	fpsCounter.innerHTML = `ms: ${Math.floor(ms)}, fps: ${fps}`;
	start = performance.now();
}