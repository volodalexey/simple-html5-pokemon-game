import { Graphics } from 'pixi.js'
import { type IPosition } from './classes'

export class Boundary extends Graphics {
  static width = 48
  static height = 48
  public fillColor!: number
  public _position!: IPosition
  public _width!: number
  public _height!: number
  constructor ({
    position,
    width = Boundary.width,
    height = Boundary.height,
    fillColor = 0xff0000
  }: {
    position: IPosition
    width?: number
    height?: number
    fillColor?: number
  }) {
    super()
    this._position = position
    this._width = width
    this._height = height
    this.fillColor = fillColor
  }

  draw (): void {
    this.clear()
    this.beginFill(this.fillColor)
    this.drawRect(this._position.x, this._position.y, this._width, this._height)
    this.endFill()
  }
}
