import { Container, Sprite, type Texture } from 'pixi.js'
import { Boundary } from './Boundary'
import { type IScreen } from './classes'
import { type TTileLayer } from './GameLoader'
import { logKeydown, logKeyup, logPlayerCollision } from './logger'
import { Player, type IPlayerOptions } from './Player'
import { rectangularCollision } from './utils'

interface IMapScreenOptions {
  viewWidth: number
  viewHeight: number
  collisionsLayer: TTileLayer
  battleZonesLayer: TTileLayer
  playerSprites: IPlayerOptions['sprites']
  mapSprites: {
    background: Texture
    foreground: Texture
  }
}

export class MapScreen extends Container implements IScreen {
  public cellWidth = 48
  public cellHeight = 48
  public isActive = false
  public tilesPerRow = 70

  public player!: Player
  public boundaries: Boundary[] = []
  public battleZones: Boundary[] = []
  public background!: Sprite
  public foreground!: Sprite

  constructor (options: IMapScreenOptions) {
    super()
    this.setup(options)
  }

  setup (options: IMapScreenOptions): void {
    this.setupBackground(options)
    this.setupLayers(options)
    this.setupPlayer(options)
    this.setupForeground(options)
    this.centerCamera(options)
  }

  setupLayers ({ collisionsLayer, battleZonesLayer }: IMapScreenOptions): void {
    const { tilesPerRow } = this
    for (let i = 0; i < collisionsLayer.data.length; i += tilesPerRow) {
      const row = collisionsLayer.data.slice(i, tilesPerRow + i)
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          const boundary = new Boundary({
            rect: {
              x: j * this.cellWidth,
              y: i / tilesPerRow * this.cellHeight,
              width: this.cellWidth,
              height: this.cellHeight
            }
          })
          this.boundaries.push(boundary)
          this.addChild(boundary)
        }
      })
    }

    for (let i = 0; i < battleZonesLayer.data.length; i += tilesPerRow) {
      const row = battleZonesLayer.data.slice(i, tilesPerRow + i)
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          const boundary = new Boundary({
            rect: {
              x: j * this.cellWidth,
              y: i / tilesPerRow * this.cellHeight,
              width: this.cellWidth,
              height: this.cellHeight
            },
            fillColor: 0x0000ff
          })
          this.battleZones.push(boundary)
          this.addChild(boundary)
        }
      })
    }
  }

  setupBackground ({ mapSprites: { background } }: IMapScreenOptions): void {
    const bgSpr = new Sprite(background)
    this.addChild(bgSpr)
    this.background = bgSpr
  }

  setupPlayer ({ playerSprites: { up, left, right, down } }: IMapScreenOptions): void {
    this.player = new Player({
      position: {
        x: 1225,
        y: 880
      },
      sprites: {
        up,
        left,
        right,
        down
      }
    })

    this.addChild(this.player);

    (window as unknown as any).player = this.player // TODO
  }

  setupForeground ({ mapSprites: { foreground } }: IMapScreenOptions): void {
    const fgSpr = new Sprite(foreground)
    this.addChild(fgSpr)
    this.foreground = fgSpr
  }

  activate (): void {
    this.isActive = true
    this.addEventLesteners()
  }

  deactivate (): void {
    this.isActive = false
    this.removeEventLesteners()
  }

  handleScreenTick (): void {
    if (!this.isActive) {
      return
    }

    if (this.player.isMoving) {
      // console.log(this.background.x, this.background.y)
      const pRect = {
        x: this.player.x + this.player.getLeftRightImpulse(),
        y: this.player.y + this.player.getUpDownImpulse(),
        width: this.player.width,
        height: this.player.height
      }
      for (let i = 0; i < this.boundaries.length; i++) {
        const boundary = this.boundaries[i]
        if (
          rectangularCollision({
            rect1: pRect,
            rect2: boundary
          })
        ) {
          logPlayerCollision('Collision detected! Player stopped')
          this.player.isMoving = false
          break
        }
      }
    }
    if (this.player.isMoving) {
      this.player.x += this.player.getLeftRightImpulse()
      this.player.y += this.player.getUpDownImpulse()

      this.x -= this.player.getLeftRightImpulse()
      this.y -= this.player.getUpDownImpulse()
    }
  }

  addEventLesteners (): void {
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
  }

  removeEventLesteners (): void {
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
  }

  handleKeydown = (e: KeyboardEvent): void => {
    const { player } = this
    logKeydown(e.key)
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        player.addUpImpulse()
        break
      case 'a':
      case 'ArrowLeft':
        player.addLeftImpulse()
        break
      case 's':
      case 'ArrowDown':
        player.addDownImpulse()
        break
      case 'd':
      case 'ArrowRight':
        player.addRightImpulse()
        break
    }
  }

  handleKeyup = (e: KeyboardEvent): void => {
    const { player } = this
    logKeyup(e.key)
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        player.subUpImpulse()
        break
      case 'a':
      case 'ArrowLeft':
        player.subLeftImpulse()
        break
      case 's':
      case 'ArrowDown':
        player.subDownImpulse()
        break
      case 'd':
      case 'ArrowRight':
        player.subRightImpulse()
        break
    }
  }

  centerCamera ({ viewWidth, viewHeight }: IMapScreenOptions): void {
    this.x = -this.player.x + viewWidth / 2
    this.y = -this.player.y + viewHeight / 2
  }
}
