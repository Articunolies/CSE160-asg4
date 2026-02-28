class Camera {
	moveSpeed = 1;
	
	/** (In degrees.) */
	panAmount = 15;

	mouseSensitivity = 0.25;

	constructor() {
		this.fov = 60;
		this.eye = new Vector3([0,0.5,0]);
		this.at = new Vector3([0,0.5,-1]);
		this.up = new Vector3([0,1,0]);
		this.viewMatrix = new Matrix4();
		this.projectionMatrix = new Matrix4();
		this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
	}
	
	moveForward() {
		const fwd = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		fwd.normalize();
		fwd.mul(this.moveSpeed);

		this.eye.add(fwd);
		this.at.add(fwd);
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
	moveBackward() {
		const fwd = new Vector3().set(this.eye).sub(this.at);	// fwd = eye - at
		fwd.normalize();
		fwd.mul(this.moveSpeed);

		this.eye.add(fwd);
		this.at.add(fwd);
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
	moveLeft() {
		const fwd = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		const side = Vector3.cross(this.up, fwd);
		side.normalize();
		side.mul(this.moveSpeed);

		this.eye.add(side);
		this.at.add(side);
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
	moveRight() {
		const fwd = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		const side = Vector3.cross(fwd, this.up);
		side.normalize();
		side.mul(this.moveSpeed);

		this.eye.add(side);
		this.at.add(side);
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}

	// Only difference between panLeft() and panRight() is the sign of this.panAmount
	panLeft() {
		const fwd_current = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		const rotationMatrix = new Matrix4().setRotate(this.panAmount, ...this.up.elements);
		const fwd_new = rotationMatrix.multiplyVector3(fwd_current);

		this.at.set(this.eye).add(fwd_new);	// at = eye + fwd_new
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
	panRight() {
		const fwd_current = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		const rotationMatrix = new Matrix4();
		rotationMatrix.setRotate(-this.panAmount, ...this.up.elements);
		const fwd_new = rotationMatrix.multiplyVector3(fwd_current);

		this.at.set(this.eye).add(fwd_new);	// at = eye + fwd_new
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
	pan(dx) {
		const angle = dx * this.mouseSensitivity;

		const fwd_current = new Vector3().set(this.at).sub(this.eye);	// fwd = at - eye
		const rotationMatrix = new Matrix4().setRotate(-angle, ...this.up.elements);
		const fwd_new = rotationMatrix.multiplyVector3(fwd_current);

		this.at.set(this.eye).add(fwd_new);	// at = eye + fwd_new
		this.viewMatrix.setLookAt(...this.eye.elements, ... this.at.elements, ...this.up.elements);
	}
}