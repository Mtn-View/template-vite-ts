import { GameObjects, Scene, Types } from 'phaser'

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera
	background: Phaser.GameObjects.Image
	msg_text: Phaser.GameObjects.Text

	constructor() {
		super('Game')
	}

	preload() {
		this.load.image('backdrop', 'https://labs.phaser.io/assets/pics/platformer-backdrop.png')
		this.load.image('cannon_head', 'https://labs.phaser.io/assets/tests/timer/cannon_head.png')
		this.load.image('cannon_body', 'https://labs.phaser.io/assets/tests/timer/cannon_body.png')
		this.load.spritesheet('chick', 'https://labs.phaser.io/assets/sprites/chick.png', { frameWidth: 16, frameHeight: 18 })
	}

	create() {
		this.camera = this.cameras.main
		this.camera.setBackgroundColor(0x00ff00)

		this.background = this.add.image(512, 384, 'background')
		this.background.setAlpha(0.5)

		// left wall
		const left = this.physics.add.staticBody(this.cameras.main.centerX - 255, 0, 5, this.cameras.main.height)

		// right wall
		const right = this.physics.add.staticBody(this.cameras.main.centerX + 250, 0, 5, this.cameras.main.height)

		// top
		const top = this.physics.add.staticBody(this.cameras.main.centerX - 250, 0, 500, 5)

		this.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('chick', { start: 0, end: 3 }), frameRate: 5, repeat: -1 })

		const cannonHead = this.add.image(this.camera.centerX, this.camera.height - 48, 'cannon_head').setDepth(1)
		const cannon = this.add.image(this.camera.centerX, this.camera.height, 'cannon_body').setDepth(1)
		const graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xffdd00, alpha: 0.5 } })
		const line = new Phaser.Geom.Line()

		const chickGroup = this.physics.add.group({
			bounceX: 1,
			bounceY: 1,
			key: 'chick',
			setScale: {
				x: 2,
				y: 2,
			},
		})

		this.physics.add.collider(chickGroup, [left, right])
		this.physics.add.collider(chickGroup, [top, chickGroup], (object1, object2) => {
			console.log('hit top/group', object1, object2)
			object2.setVelocity(0, 0)
		})

		let angle = 0

		this.input.on('pointermove', (pointer) => {
			angle = Phaser.Math.Angle.BetweenPoints(cannon, pointer)
			cannonHead.rotation = angle
			Phaser.Geom.Line.SetToAngle(line, cannon.x, cannon.y - 50, angle, 128)
			graphics.clear().strokeLineShape(line)
		})

		this.input.on('pointerup', () => {
			const newChick = chickGroup.create(cannon.x, cannon.y - 50, 'chick').setScale(2)
			newChick.play('fly')
			this.physics.velocityFromRotation(angle, 600, newChick.body.velocity)
			// chick.enableBody(true, cannon.x, cannon.y - 50, true, true)
			// chick.play('fly')
			// this.physics.velocityFromRotation(angle, 600, chick.body.velocity)
		})
	}
}
