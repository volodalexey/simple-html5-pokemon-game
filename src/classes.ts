export type DeepPartial<T> = {
  [P in keyof T]?: T[P];
}

export interface IPosition {
  x: number
  y: number
}

export interface IScreen {
  isActive: boolean
  activate: () => void
  deactivate: () => void
  handleScreenTick: () => void
  handleScreenResize: ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }) => void
}
