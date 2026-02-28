class King {
	constructor(modelMatrix) {
		const skinColor = [255/255, 192/255, 203/255, 1];	// pink
		const torsoColor = [230/255, 160/255, 175/255, 1];	// darker pink
		const black = [0,0,0,1];
		const gold = [246/255, 195/255, 66/255, 1];

		this.torso = new Cube(0, torsoColor);
		this.torso.modelMatrix.set(modelMatrix);
		this.torso.modelMatrix.translate(0, .7, 0);
		this.torso.modelMatrix.scale(0.75, 0.75, 1.5);
		this.torso.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.leg_l = new Cube(0, skinColor);
		this.leg_l.modelMatrix.set(modelMatrix);
		this.leg_l.modelMatrix.translate(0.375, 0.35, -.3);
		this.leg_l.modelMatrix.scale(0.251, 0.7, 0.251);
		this.leg_l.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.leg_r = new Cube(0, skinColor);
		this.leg_r.modelMatrix.set(modelMatrix);
		this.leg_r.modelMatrix.translate(-0.375, 0.35, -.3);
		this.leg_r.modelMatrix.scale(0.251, 0.7, 0.251);
		this.leg_r.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.arm_l = new Cube(0, skinColor);
		this.arm_l.modelMatrix.set(modelMatrix);
		this.arm_l.modelMatrix.translate(0.375, 0.35, .3);
		this.arm_l.modelMatrix.scale(0.25, 0.7, 0.25);
		this.arm_l.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.arm_r = new Cube(0, skinColor);
		this.arm_r.modelMatrix.set(modelMatrix);
		this.arm_r.modelMatrix.translate(-0.375, 0.35, .3);
		this.arm_r.modelMatrix.scale(0.25, 0.7, 0.25);
		this.arm_r.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.head = new Cube(0, skinColor);
		this.head.modelMatrix.set(modelMatrix);
		this.head.modelMatrix.translate(0, 0.7, 1);
		this.head.modelMatrix.scale(0.5, 0.5, 0.5);
		this.head.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.eye_l = new Cube(0, black);
		this.eye_l.modelMatrix.set(modelMatrix);
		this.eye_l.modelMatrix.translate(0.15, 0.75, 1.25);
		this.eye_l.modelMatrix.scale(0.1, 0.1, 0.05);
		this.eye_l.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.eye_r = new Cube(0, black);
		this.eye_r.modelMatrix.set(modelMatrix);
		this.eye_r.modelMatrix.translate(-0.15, 0.75, 1.25);
		this.eye_r.modelMatrix.scale(0.1, 0.1, 0.05);
		this.eye_r.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.mouth_bottom = new Cube(0, black);
		this.mouth_bottom.modelMatrix.set(modelMatrix);
		this.mouth_bottom.modelMatrix.translate(0, 0.5, 1.25);
		this.mouth_bottom.modelMatrix.scale(0.2, 0.05, 0.05);
		this.mouth_bottom.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.mouth_l = new Cube(0, black);
		this.mouth_l.modelMatrix.set(modelMatrix);
		this.mouth_l.modelMatrix.translate(-0.1, 0.55, 1.25);
		this.mouth_l.modelMatrix.scale(0.05, 0.05, 0.05);
		this.mouth_l.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.mouth_r = new Cube(0, black);
		this.mouth_r.modelMatrix.set(modelMatrix);
		this.mouth_r.modelMatrix.translate(0.1, 0.55, 1.25);
		this.mouth_r.modelMatrix.scale(0.05, 0.05, 0.05);
		this.mouth_r.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_bottom = new Cube(0, gold);
		this.crown_bottom.modelMatrix.set(modelMatrix);
		this.crown_bottom.modelMatrix.translate(0, 0.95, 1);
		this.crown_bottom.modelMatrix.scale(0.55, 0.1, 0.55);
		this.crown_bottom.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_front_l_corner = new Cube(0, gold);
		this.crown_front_l_corner.modelMatrix.set(modelMatrix);
		this.crown_front_l_corner.modelMatrix.translate(0.225, 1.05, 1.225);
		this.crown_front_l_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_front_l_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_front_m_corner = new Cube(0, gold);
		this.crown_front_m_corner.modelMatrix.set(modelMatrix);
		this.crown_front_m_corner.modelMatrix.translate(0, 1.05, 1.225);
		this.crown_front_m_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_front_m_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_front_r_corner = new Cube(0, gold);
		this.crown_front_r_corner.modelMatrix.set(modelMatrix);
		this.crown_front_r_corner.modelMatrix.translate(-0.225, 1.05, 1.225);
		this.crown_front_r_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_front_r_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_m_l_corner = new Cube(0, gold);
		this.crown_m_l_corner.modelMatrix.set(modelMatrix);
		this.crown_m_l_corner.modelMatrix.translate(0.225, 1.05, 1);
		this.crown_m_l_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_m_l_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_back_l_corner = new Cube(0, gold);
		this.crown_back_l_corner.modelMatrix.set(modelMatrix);
		this.crown_back_l_corner.modelMatrix.translate(0.225, 1.05, 0.775);
		this.crown_back_l_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_back_l_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_back_m_corner = new Cube(0, gold);
		this.crown_back_m_corner.modelMatrix.set(modelMatrix);
		this.crown_back_m_corner.modelMatrix.translate(0, 1.05, 0.775);
		this.crown_back_m_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_back_m_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_back_r_corner = new Cube(0, gold);
		this.crown_back_r_corner.modelMatrix.set(modelMatrix);
		this.crown_back_r_corner.modelMatrix.translate(-0.225, 1.05, 0.775);
		this.crown_back_r_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_back_r_corner.modelMatrix.translate(-0.5, -0.5, -0.5);

		this.crown_m_r_corner = new Cube(0, gold);
		this.crown_m_r_corner.modelMatrix.set(modelMatrix);
		this.crown_m_r_corner.modelMatrix.translate(-0.225, 1.05, 1);
		this.crown_m_r_corner.modelMatrix.scale(0.1, 0.15, 0.1);
		this.crown_m_r_corner.modelMatrix.translate(-0.5, -0.5, -0.5);
	}
	
	render() {
		this.torso.render();
		this.leg_l.render();
		this.leg_r.render();
		this.arm_l.render();
		this.arm_r.render();
		this.head.render();
		this.eye_l.render();
		this.eye_r.render();
		this.mouth_bottom.render();
		this.mouth_l.render();
		this.mouth_r.render();
		this.crown_bottom.render();
		this.crown_front_l_corner.render();
		this.crown_front_r_corner.render();
		this.crown_front_m_corner.render();
		this.crown_m_l_corner.render();
		this.crown_back_l_corner.render();
		this.crown_back_m_corner.render();
		this.crown_back_r_corner.render();
		this.crown_m_r_corner.render();
	}
}