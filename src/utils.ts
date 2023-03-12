import { logRectCollision } from './logger'

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export function rectangularCollision ({ rect1, rect2 }: { rect1: IRect, rect2: IRect }): boolean {
  logRectCollision(`r1x=${rect1.x} r1y=${rect1.y} r1w=${rect1.width} r1h=${rect1.height} <> r2x=${rect2.x} r2y=${rect2.y} r2w=${rect2.width} r2h=${rect2.height}`)
  return (
    rect1.x + rect1.width >= rect2.x &&
    rect1.x <= rect2.x + rect2.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect1.y + rect1.height >= rect2.y
  )
}
