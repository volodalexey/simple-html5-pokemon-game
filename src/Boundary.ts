import { Graphics } from 'pixi.js'
import { logBoundary } from './logger'
import { type IRect } from './utils'

export class Boundary extends Graphics {
  public fillColor!: number
  public _rect!: IRect
  constructor ({
    rect,
    fillColor = 0xff0000
  }: {
    rect: IRect
    fillColor?: number
  }) {
    super()
    this._rect = rect
    this.x = rect.x
    this.y = rect.y
    this.fillColor = fillColor
    this.draw()
    if (logBoundary.enabled) {
      this.visible = true
      this.alpha = 0.3
    } else {
      this.visible = false
    }
  }

  draw (): void {
    this.clear()
    this.beginFill(this.fillColor)
    this.drawRect(0, 0, this._rect.width, this._rect.height)
    this.endFill()
  }
}
