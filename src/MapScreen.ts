import { Container, Sprite, type Texture } from 'pixi.js'
import { Boundary } from './Boundary'
import { type TTileLayer } from './GameLoader'
import { Player, type IPlayerOptions } from './Player'

interface IMapScreenOptions {
  plWidth: number
  plHeight: number
  collisionsLayer: TTileLayer
  battleZonesLayer: TTileLayer
  playerSprites: IPlayerOptions['sprites']
  mapSprites: {
    background: Texture
    foreground: Texture
  }
}

export class MapScreen extends Container {
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
    this.setupLayers(options)
    this.setupBackground(options)
    this.setupPlayer(options)
    this.setupForeground(options)
  }

  setupLayers ({ collisionsLayer, battleZonesLayer }: IMapScreenOptions): void {
    const { tilesPerRow } = this
    const offset = {
      x: -735,
      y: -650
    }
    for (let i = 0; i < collisionsLayer.data.length; i += tilesPerRow) {
      const row = collisionsLayer.data.slice(i, tilesPerRow + i)
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          this.boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
              }
            })
          )
        }
      })
    }

    for (let i = 0; i < battleZonesLayer.data.length; i += tilesPerRow) {
      const row = battleZonesLayer.data.slice(i, tilesPerRow + i)
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          this.battleZones.push(
            new Boundary({
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
              }
            })
          )
        }
      })
    }
  }

  setupBackground ({ mapSprites: { background } }: IMapScreenOptions): void {
    const bgSpr = new Sprite(background)
    this.addChild(bgSpr)
    this.background = bgSpr
  }

  setupPlayer ({ plWidth, plHeight, playerSprites: { up, left, right, down } }: IMapScreenOptions): void {
    this.player = new Player({
      position: {
        x: plWidth / 2 - 192 / 4 / 2,
        y: plHeight / 2 - 68 / 2
      },
      sprites: {
        up,
        left,
        right,
        down
      }
    })

    this.addChild(this.player)
  }

  setupForeground ({ mapSprites: { foreground } }: IMapScreenOptions): void {
    const fgSpr = new Sprite(foreground)
    this.addChild(fgSpr)
    this.foreground = fgSpr
  }
}
