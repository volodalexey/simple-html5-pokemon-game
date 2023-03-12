import { AnimatedSprite, Container, type Texture } from 'pixi.js'
import { type DeepPartial, type IPosition } from './classes'
import { logPlayerImpulse } from './logger'

export interface IPlayerOptions {
  position: IPosition
  sprites: {
    up: Texture[]
    left: Texture[]
    right: Texture[]
    down: Texture[]
  }
}

enum PlayerDirection {
  up,
  down,
  left,
  right
}

interface IImpulse {
  up: boolean
  left: boolean
  right: boolean
  down: boolean
}

export class Player extends Container {
  public DIRECTIONS = PlayerDirection
  private _direction!: PlayerDirection
  public animationSpeed = 0.1
  public up!: AnimatedSprite
  public left!: AnimatedSprite
  public right!: AnimatedSprite
  public down!: AnimatedSprite
  public velocity = 3
  public isMoving = false

  private readonly impulse: IImpulse = {
    up: false,
    left: false,
    right: false,
    down: false
  }

  constructor (options: IPlayerOptions) {
    super()
    this.setup(options)
    this.setDirection(PlayerDirection.down)
    this.x = options.position.x
    this.y = options.position.y
  }

  hideAllDirections (): void {
    [this.up, this.left, this.right, this.down].forEach(spr => {
      spr.visible = false
    })
  }

  setDirection (dir: PlayerDirection): void {
    this.hideAllDirections()
    switch (dir) {
      case PlayerDirection.down:
        this.down.visible = true
        break
      case PlayerDirection.left:
        this.left.visible = true
        break
      case PlayerDirection.right:
        this.right.visible = true
        break
      case PlayerDirection.up:
        this.up.visible = true
        break
    }
    this._direction = dir
  }

  stopAllAnimations (): void {
    [this.up, this.left, this.right, this.down].forEach(spr => {
      spr.stop()
    })
  }

  playAnimation (): void {
    this.stopAllAnimations()
    switch (this._direction) {
      case PlayerDirection.down:
        this.down.play()
        break
      case PlayerDirection.left:
        this.left.play()
        break
      case PlayerDirection.right:
        this.right.play()
        break
      case PlayerDirection.up:
        this.up.play()
        break
    }
  }

  setup ({ sprites: { up, left, right, down } }: IPlayerOptions): void {
    const upSpr = new AnimatedSprite(up)
    upSpr.animationSpeed = this.animationSpeed
    this.addChild(upSpr)
    this.up = upSpr

    const leftSpr = new AnimatedSprite(left)
    leftSpr.animationSpeed = this.animationSpeed
    this.addChild(leftSpr)
    this.left = leftSpr

    const righSpr = new AnimatedSprite(right)
    righSpr.animationSpeed = this.animationSpeed
    this.addChild(righSpr)
    this.right = righSpr

    const downSpr = new AnimatedSprite(down)
    downSpr.animationSpeed = this.animationSpeed
    this.addChild(downSpr)
    this.down = downSpr
  }

  setImpulse (impulse: DeepPartial<IImpulse>): void {
    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    logPlayerImpulse(`Got impulse up=${impulse.up} left=${impulse.left} right=${impulse.right} down=${impulse.down}`)
    Object.assign(this.impulse, impulse)
    if (impulse.up === true && this.impulse.down) {
      this.impulse.down = false
    } else if (impulse.left === true && this.impulse.right) {
      this.impulse.right = false
    } else if (impulse.right === true && this.impulse.left) {
      this.impulse.left = false
    } else if (impulse.down === true && this.impulse.up) {
      this.impulse.up = false
    }
    if (this.impulse.left) {
      this.setDirection(PlayerDirection.left)
    } else if (this.impulse.right) {
      this.setDirection(PlayerDirection.right)
    } else if (this.impulse.up) {
      this.setDirection(PlayerDirection.up)
    } else if (this.impulse.down) {
      this.setDirection(PlayerDirection.down)
    }
    if (this.impulse.up || this.impulse.left || this.impulse.right || this.impulse.down) {
      this.playAnimation()
      this.isMoving = true
    } else {
      this.stopAllAnimations()
      this.isMoving = false
    }

    logPlayerImpulse(`(Moving=${this.isMoving} up=${this.impulse.up} left=${this.impulse.left} right=${this.impulse.right} down=${this.impulse.down}`)
    /* eslint-enable @typescript-eslint/restrict-template-expressions */
  }

  addUpImpulse (): void {
    this.setImpulse({ up: true })
  }

  subUpImpulse (): void {
    this.setImpulse({ up: false })
  }

  addLeftImpulse (): void {
    this.setImpulse({ left: true })
  }

  subLeftImpulse (): void {
    this.setImpulse({ left: false })
  }

  addRightImpulse (): void {
    this.setImpulse({ right: true })
  }

  subRightImpulse (): void {
    this.setImpulse({ right: false })
  }

  addDownImpulse (): void {
    this.setImpulse({ down: true })
  }

  subDownImpulse (): void {
    this.setImpulse({ down: false })
  }

  releaseAllImpulse (): void {
    this.setImpulse({ up: false, left: false, right: false, down: false })
  }

  getVerticalImpulse (): number {
    return this.impulse.up ? -this.velocity : this.impulse.down ? this.velocity : 0
  }

  getHorizontalImpulse (): number {
    return this.impulse.left ? -this.velocity : this.impulse.right ? this.velocity : 0
  }
}
