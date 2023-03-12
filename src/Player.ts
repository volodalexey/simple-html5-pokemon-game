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
  up: number
  left: number
  right: number
  down: number
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

  private readonly impulse: IImpulse = {
    up: 0,
    left: 0,
    right: 0,
    down: 0
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
    if (typeof impulse.up === 'number' && impulse.up > 0 && this.impulse.down > 0) {
      this.impulse.down = 0
    } else if (typeof impulse.left === 'number' && impulse.left > 0 && this.impulse.right > 0) {
      this.impulse.right = 0
    } else if (typeof impulse.right === 'number' && impulse.right > 0 && this.impulse.left > 0) {
      this.impulse.left = 0
    } else if (typeof impulse.down === 'number' && impulse.down > 0 && this.impulse.up > 0) {
      this.impulse.up = 0
    }
    if (this.impulse.left > 0) {
      this.setDirection(PlayerDirection.left)
    } else if (this.impulse.right > 0) {
      this.setDirection(PlayerDirection.right)
    } else if (this.impulse.up > 0) {
      this.setDirection(PlayerDirection.up)
    } else if (this.impulse.down > 0) {
      this.setDirection(PlayerDirection.down)
    }
    if (this.impulse.left > 0 || this.impulse.right > 0 || this.impulse.up > 0 || this.impulse.down > 0) {
      this.playAnimation()
    } else {
      this.stopAllAnimations()
    }

    logPlayerImpulse(`up=${this.impulse.up} left=${this.impulse.left} right=${this.impulse.right} down=${this.impulse.down}`)
    /* eslint-enable @typescript-eslint/restrict-template-expressions */
  }

  addUpImpulse (): void {
    this.setImpulse({ up: 1 })
  }

  subUpImpulse (): void {
    this.setImpulse({ up: 0 })
  }

  addLeftImpulse (): void {
    this.setImpulse({ left: 1 })
  }

  subLeftImpulse (): void {
    this.setImpulse({ left: 0 })
  }

  addRightImpulse (): void {
    this.setImpulse({ right: 1 })
  }

  subRightImpulse (): void {
    this.setImpulse({ right: 0 })
  }

  addDownImpulse (): void {
    this.setImpulse({ down: 1 })
  }

  subDownImpulse (): void {
    this.setImpulse({ down: 0 })
  }

  releaseAllImpulse (): void {
    this.setImpulse({ up: 0, left: 0, right: 0, down: 0 })
  }

  getVerticalImpulse (): number {
    return this.impulse.up > 0 ? -this.velocity * this.impulse.up : this.impulse.down > 0 ? this.velocity * this.impulse.down : 0
  }

  getHorizontalImpulse (): number {
    return this.impulse.left > 0 ? -this.velocity * this.impulse.left : this.impulse.right > 0 ? this.velocity * this.impulse.right : 0
  }
}
