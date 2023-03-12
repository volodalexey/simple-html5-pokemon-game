import { Container, Graphics } from 'pixi.js'
import { logMoveInterface, logMoveInterfacePressed, logPointerEvent } from './logger'

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

enum MoveInterfaceDirection {
  up = 'up',
  upRight = 'up-right',
  right = 'right',
  downRight = 'down-right',
  down = 'down',
  downLeft = 'down-left',
  left = 'left',
  upLeft = 'up-left'
}

interface IInteractiveGraphicsOptions {
  direction: MoveInterfaceDirection
  directionPressed: MoveInterface['directionPressed']
  onPressedChange: (item: InteractiveGraphics) => void
}

class InteractiveGraphics extends Graphics {
  public direction!: IInteractiveGraphicsOptions['direction']
  public onPressedChange!: IInteractiveGraphicsOptions['onPressedChange']
  private _isPressed = false
  private readonly _directionPressed!: MoveInterface['directionPressed']
  constructor (options: IInteractiveGraphicsOptions) {
    super()
    this.interactive = true
    this.direction = options.direction
    this.onPressedChange = options.onPressedChange
    this._directionPressed = options.directionPressed
    this.setupEventLesteners()
  }

  get isPressed (): boolean {
    return this._isPressed
  }

  setIsPressed (pressed: boolean): void {
    const toTrigger = pressed !== this._isPressed
    this._isPressed = pressed
    if (toTrigger) {
      this.onPressedChange(this)
    }
  }

  setupEventLesteners (): void {
    this.on('pointerdown', (e) => {
      this.setIsPressed(true)
      logPointerEvent(e.type, e.pointerType)
    })
    this.on('pointermove', (e) => {
      if (this.isPressed || e.pointerType === 'touch') {
        this.setIsPressed(true)
      } else if (e.pointerType === 'mouse') {
        // try to detect pressed state if user came from another pressed polygon
      }
      logPointerEvent(e.type, e.pointerType)
    })
    this.on('pointerup', (e) => {
      this.setIsPressed(false)
      logPointerEvent(e.type, e.pointerType)
    })
    this.on('pointerleave', (e) => {
      this.setIsPressed(false)
      logPointerEvent(e.type, e.pointerType)
    })
  }
}

export class MoveInterface extends Container {
  public playerWidth!: number
  public playerHeight!: number
  public onDirectionPressedChange!: IMoveInterfaceOptions['onDirectionPressedChange']
  public upPolygon!: InteractiveGraphics
  public upRightPolygon!: InteractiveGraphics
  public rightPolygon!: InteractiveGraphics
  public downRightPolygon!: InteractiveGraphics
  public downPolygon!: InteractiveGraphics
  public downLeftPolygon!: InteractiveGraphics
  public leftPolygon!: InteractiveGraphics
  public upLeftPolygon!: InteractiveGraphics

  public directionPressed = {
    up: false,
    upRight: false,
    right: false,
    downRight: false,
    down: false,
    downLeft: false,
    left: false,
    upLeft: false
  }

  constructor (options: IMoveInterfaceOptions) {
    super()
    this.playerWidth = options.playerWidth
    this.playerHeight = options.playerHeight
    this.onDirectionPressedChange = options.onDirectionPressedChange
    this.setup()
    this.draw(options)
  }

  setup (): void {
    const upPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.up,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(upPolygon)
    this.upPolygon = upPolygon

    const upRightPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.upRight,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(upRightPolygon)
    this.upRightPolygon = upRightPolygon

    const rightPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.right,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(rightPolygon)
    this.rightPolygon = rightPolygon

    const downRightPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.downRight,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(downRightPolygon)
    this.downRightPolygon = downRightPolygon

    const downPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.down,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(downPolygon)
    this.downPolygon = downPolygon

    const downLeftPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.downLeft,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(downLeftPolygon)
    this.downLeftPolygon = downLeftPolygon

    const leftPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.left,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(leftPolygon)
    this.leftPolygon = leftPolygon

    const upLeftPolygon = new InteractiveGraphics({
      direction: MoveInterfaceDirection.upLeft,
      directionPressed: this.directionPressed,
      onPressedChange: this.handlePressedChange
    })
    this.addChild(upLeftPolygon)
    this.upLeftPolygon = upLeftPolygon;

    [upPolygon, upRightPolygon, rightPolygon, downRightPolygon, downPolygon, downLeftPolygon, leftPolygon, upLeftPolygon].forEach(spr => {
      spr.alpha = logMoveInterface.enabled ? 0.5 : 0
    })
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

    this.upPolygon.beginFill(upFillColor)
    this.upPolygon.drawPolygon([
      { x: halfLeft, y: 0 }, { x: halfRight, y: 0 },
      { x: halfRight, y: halfTop }, { x: halfWidth, y: halfHeight },
      { x: halfLeft, y: halfTop }
    ])
    this.upPolygon.endFill()

    this.upRightPolygon.beginFill(upRightFillColor)
    this.upRightPolygon.drawPolygon([
      { x: halfRight, y: 0 }, { x: viewWidth, y: 0 },
      { x: viewWidth, y: halfTop }, { x: halfRight, y: halfTop }
    ])
    this.upRightPolygon.endFill()

    this.rightPolygon.beginFill(rightFillColor)
    this.rightPolygon.drawPolygon([
      { x: halfRight, y: halfTop }, { x: viewWidth, y: halfTop },
      { x: viewWidth, y: halfBottom }, { x: halfRight, y: halfBottom },
      { x: halfWidth, y: halfHeight }
    ])
    this.rightPolygon.endFill()

    this.downRightPolygon.beginFill(downRightFillColor)
    this.downRightPolygon.drawPolygon([
      { x: halfRight, y: halfBottom }, { x: viewWidth, y: halfBottom },
      { x: viewWidth, y: viewHeight }, { x: halfRight, y: viewHeight }
    ])
    this.downRightPolygon.endFill()

    this.downPolygon.beginFill(downFillColor)
    this.downPolygon.drawPolygon([
      { x: halfLeft, y: halfBottom }, { x: viewWidth, y: viewHeight },
      { x: halfRight, y: halfBottom }, { x: halfRight, y: viewHeight },
      { x: halfLeft, y: viewHeight }
    ])
    this.downPolygon.endFill()

    this.downLeftPolygon.beginFill(downLeftFillColor)
    this.downLeftPolygon.drawPolygon([
      { x: 0, y: halfBottom }, { x: halfLeft, y: halfBottom },
      { x: halfLeft, y: viewHeight }, { x: 0, y: viewHeight }
    ])
    this.downLeftPolygon.endFill()

    this.leftPolygon.beginFill(leftFillColor)
    this.leftPolygon.drawPolygon([
      { x: 0, y: halfTop }, { x: halfLeft, y: halfTop },
      { x: halfWidth, y: halfHeight }, { x: halfLeft, y: halfBottom },
      { x: 0, y: halfBottom }
    ])
    this.leftPolygon.endFill()

    this.upLeftPolygon.beginFill(upLeftFillColor)
    this.upLeftPolygon.drawPolygon([
      { x: 0, y: 0 }, { x: halfLeft, y: 0 },
      { x: halfLeft, y: halfTop }, { x: 0, y: halfTop }
    ])
    this.upLeftPolygon.endFill()
  }

  handlePressedChange = (item: InteractiveGraphics): void => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logMoveInterfacePressed(`dir=${item.direction} pressed=${item.isPressed}`)
    if (item === this.upPolygon) {
      this.directionPressed.up = item.isPressed
    } else if (item === this.upRightPolygon) {
      this.directionPressed.upRight = item.isPressed
    } else if (item === this.rightPolygon) {
      this.directionPressed.right = item.isPressed
    } else if (item === this.downRightPolygon) {
      this.directionPressed.downRight = item.isPressed
    } else if (item === this.downPolygon) {
      this.directionPressed.down = item.isPressed
    } else if (item === this.downLeftPolygon) {
      this.directionPressed.downLeft = item.isPressed
    } else if (item === this.leftPolygon) {
      this.directionPressed.left = item.isPressed
    } else if (item === this.upLeftPolygon) {
      this.directionPressed.upLeft = item.isPressed
    }
    this.onDirectionPressedChange()
  }
}
