import { Container, Graphics } from 'pixi.js'
import { logMoveInterface, logPointerEvent } from './logger'

export interface IMoveInterfaceOptions {
  viewWidth: number
  viewHeight: number
  playerWidth: number
  playerHeight: number
  upFillColor?: number
  upRightFillColor?: number
  rightFillColor?: number
  downRightFillColor?: number
  downFillColor?: number
  downLeftFillColor?: number
  leftFillColor?: number
  upLeftFillColor?: number
  onDirectionPressedChange: () => void
}

enum EnumDirection {
  up = 'up',
  right = 'right',
  down = 'down',
  left = 'left',
}

export class MoveInterface extends Container {
  public playerWidth!: number
  public playerHeight!: number
  public onDirectionPressedChange!: IMoveInterfaceOptions['onDirectionPressedChange']
  public polygon!: Graphics
  public isPressed = false

  public directionPressed: Record<EnumDirection, boolean> = {
    up: false,
    right: false,
    down: false,
    left: false
  }

  constructor (options: IMoveInterfaceOptions) {
    super()
    this.interactive = true
    this.playerWidth = options.playerWidth
    this.playerHeight = options.playerHeight
    this.onDirectionPressedChange = options.onDirectionPressedChange
    this.setup()
    this.draw(options)
  }

  setup (): void {
    const polygon = new Graphics()
    polygon.alpha = logMoveInterface.enabled ? 0.5 : 0
    this.addChild(polygon)
    this.polygon = polygon

    this.setupEventLesteners()
  }

  draw ({
    viewWidth,
    viewHeight,
    upFillColor = 0xff0000,
    upRightFillColor = 0xffff00,
    rightFillColor = 0x0000ff,
    downRightFillColor = 0xffffff,
    downFillColor = 0x00ff00,
    downLeftFillColor = 0x00ffff,
    leftFillColor = 0xff00ff,
    upLeftFillColor = 0x000000
  }: IMoveInterfaceOptions): void {
    const halfWidth = viewWidth / 2
    const halfLeft = halfWidth - this.playerWidth / 2
    const halfRight = halfWidth + this.playerWidth / 2
    const halfHeight = viewHeight / 2
    const halfTop = halfHeight - this.playerHeight / 2
    const halfBottom = halfHeight + this.playerHeight / 2

    this.polygon.beginFill(upFillColor)
    this.polygon.drawPolygon([
      { x: halfLeft, y: 0 }, { x: halfRight, y: 0 },
      { x: halfRight, y: halfTop }, { x: halfLeft, y: halfTop }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(upRightFillColor)
    this.polygon.drawPolygon([
      { x: halfRight, y: 0 }, { x: viewWidth, y: 0 },
      { x: viewWidth, y: halfTop }, { x: halfRight, y: halfTop }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(rightFillColor)
    this.polygon.drawPolygon([
      { x: halfRight, y: halfTop }, { x: viewWidth, y: halfTop },
      { x: viewWidth, y: halfBottom }, { x: halfRight, y: halfBottom }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(downRightFillColor)
    this.polygon.drawPolygon([
      { x: halfRight, y: halfBottom }, { x: viewWidth, y: halfBottom },
      { x: viewWidth, y: viewHeight }, { x: halfRight, y: viewHeight }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(downFillColor)
    this.polygon.drawPolygon([
      { x: halfLeft, y: halfBottom }, { x: halfRight, y: halfBottom },
      { x: halfRight, y: viewHeight }, { x: halfLeft, y: viewHeight }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(downLeftFillColor)
    this.polygon.drawPolygon([
      { x: 0, y: halfBottom }, { x: halfLeft, y: halfBottom },
      { x: halfLeft, y: viewHeight }, { x: 0, y: viewHeight }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(leftFillColor)
    this.polygon.drawPolygon([
      { x: 0, y: halfTop }, { x: halfLeft, y: halfTop },
      { x: halfLeft, y: halfBottom }, { x: 0, y: halfBottom }
    ])
    this.polygon.endFill()

    this.polygon.beginFill(upLeftFillColor)
    this.polygon.drawPolygon([
      { x: 0, y: 0 }, { x: halfLeft, y: 0 },
      { x: halfLeft, y: halfTop }, { x: 0, y: halfTop }
    ])
    this.polygon.endFill()
  }

  setupEventLesteners (): void {
    this.on('pointerdown', (e) => {
      this.setDirectionPressed(true, e.clientX, e.clientY)
    })
    this.on('pointermove', (e) => {
      this.setDirectionPressed(undefined, e.clientX, e.clientY)
    })
    this.on('pointerup', (e) => {
      this.setDirectionPressed(false, e.clientX, e.clientY)
    })
  }

  setDirectionPressed (pressed: boolean | undefined, x: number, y: number): void {
    if (typeof pressed === 'boolean') {
      this.isPressed = pressed
    }
    Object.keys(this.directionPressed).forEach(key => {
      this.directionPressed[key as EnumDirection] = false
    })
    if (this.isPressed) {
      const halfWidth = this.width / 2
      const halfHeight = this.height / 2
      const halfLeft = halfWidth - this.playerWidth / 2
      const halfRight = halfWidth + this.playerWidth / 2
      const halfTop = halfHeight - this.playerHeight / 2
      const halfBottom = halfHeight + this.playerHeight / 2
      if (x >= halfRight) {
        this.directionPressed.right = true
      } else if (x <= halfLeft) {
        this.directionPressed.left = true
      }

      if (y >= halfBottom) {
        this.directionPressed.down = true
      } else if (y <= halfTop) {
        this.directionPressed.up = true
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      logPointerEvent(`pressed=${pressed} x=${x} y=${y} hw=${halfWidth} hh=${halfHeight}`)
    }
    this.onDirectionPressedChange()
  }
}
