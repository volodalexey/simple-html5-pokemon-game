import { Container, Sprite, type Texture } from 'pixi.js'
import { AUDIO } from './audio'
import { Boundary } from './Boundary'
import { type IScreen } from './classes'
import { type TTileLayer } from './GameLoader'
import { logKeydown, logKeyup, logPlayerCollision } from './logger'
import { MoveInterface } from './MoveInterface'
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
  onBattleStart: () => void
}

export class MapScreen extends Container implements IScreen {
  public cellWidth = 48
  public cellHeight = 48
  public isActive = false
  public tilesPerRow = 70
  public playerMoveInitialized = false

  public player!: Player
  public boundaries: Boundary[] = []
  public battleZones: Boundary[] = []
  public background!: Sprite
  public foreground!: Sprite
  public moveInterface!: MoveInterface
  public overlappingBattleTrigger = 0.5
  public overlappingBattleChance = 0.05
  public onBattleStart!: IMapScreenOptions['onBattleStart']

  constructor (options: IMapScreenOptions) {
    super()
    this.onBattleStart = options.onBattleStart
    this.setup(options)
  }

  setup (options: IMapScreenOptions): void {
    this.setupBackground(options)
    this.setupLayers(options)
    this.setupPlayer(options)
    this.setupForeground(options)
    this.setupMoveInterface(options)
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

    this.addChild(this.player)
  }

  setupForeground ({ mapSprites: { foreground } }: IMapScreenOptions): void {
    const fgSpr = new Sprite(foreground)
    this.addChild(fgSpr)
    this.foreground = fgSpr
  }

  activate (): void {
    this.isActive = true
    this.addEventLesteners()
    AUDIO.Map.play()
  }

  deactivate (): void {
    this.isActive = false
    this.removeEventLesteners()
    this.player.releaseAllImpulse()
    AUDIO.Map.stop()
  }

  handleScreenTick (): void {
    if (!this.isActive) {
      return
    }

    let isMovingHorizontal = false
    const horizontalPlayerImpulse = this.player.getHorizontalImpulse()
    if (horizontalPlayerImpulse !== 0) {
      isMovingHorizontal = true
      const pRectHor = {
        x: this.player.x + horizontalPlayerImpulse,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height
      }
      for (let i = 0; i < this.boundaries.length; i++) {
        const boundary = this.boundaries[i]
        if (
          rectangularCollision({
            rect1: pRectHor,
            rect2: boundary
          })
        ) {
          logPlayerCollision('Horizontal collision detected! Player stopped')
          isMovingHorizontal = false
          break
        }
      }
    }

    let isMovingVertical = false
    const verticalPlayerImpulse = this.player.getVerticalImpulse()
    if (verticalPlayerImpulse !== 0) {
      isMovingVertical = true
      const pRectVer = {
        x: this.player.x,
        y: this.player.y + verticalPlayerImpulse,
        width: this.player.width,
        height: this.player.height
      }
      for (let i = 0; i < this.boundaries.length; i++) {
        const boundary = this.boundaries[i]
        if (
          rectangularCollision({
            rect1: pRectVer,
            rect2: boundary
          })
        ) {
          logPlayerCollision('Vertical collision detected! Player stopped')
          isMovingVertical = false
          break
        }
      }
    }

    if (horizontalPlayerImpulse > 0 || verticalPlayerImpulse > 0) {
      if (!this.playerMoveInitialized) {
        if (!AUDIO.Map.playing()) {
          AUDIO.Map.play()
        }
      }
      this.playerMoveInitialized = true
      for (let i = 0; i < this.battleZones.length; i++) {
        const battleZone = this.battleZones[i]
        const overlappingArea =
        (Math.min(
          this.player.x + this.player.width,
          battleZone.x + battleZone.width
        ) -
          Math.max(this.player.x, battleZone.x)) *
        (Math.min(
          this.player.y + this.player.height,
          battleZone.y + battleZone.height
        ) -
          Math.max(this.player.y, battleZone.y))
        if (
          rectangularCollision({
            rect1: this.player,
            rect2: battleZone
          }) &&
            overlappingArea > (this.player.width * this.player.height) * this.overlappingBattleTrigger &&
            Math.random() <= this.overlappingBattleChance
        ) {
          logPlayerCollision('Battle zone triggered')
          this.onBattleStart()
        }
      }
    }

    if (isMovingHorizontal) {
      this.player.x += horizontalPlayerImpulse

      this.x -= horizontalPlayerImpulse

      this.moveInterface.x += horizontalPlayerImpulse
    }

    if (isMovingVertical) {
      this.player.y += verticalPlayerImpulse

      this.y -= verticalPlayerImpulse

      this.moveInterface.y += verticalPlayerImpulse
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
    logKeydown(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        player.addUpImpulse()
        break
      case 'KeyA':
      case 'ArrowLeft':
        player.addLeftImpulse()
        break
      case 'KeyS':
      case 'ArrowDown':
        player.addDownImpulse()
        break
      case 'KeyD':
      case 'ArrowRight':
        player.addRightImpulse()
        break
    }
  }

  handleKeyup = (e: KeyboardEvent): void => {
    const { player } = this
    logKeyup(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        player.subUpImpulse()
        break
      case 'KeyA':
      case 'ArrowLeft':
        player.subLeftImpulse()
        break
      case 'KeyS':
      case 'ArrowDown':
        player.subDownImpulse()
        break
      case 'KeyD':
      case 'ArrowRight':
        player.subRightImpulse()
        break
    }
  }

  setupMoveInterface ({ viewWidth, viewHeight }: IMapScreenOptions): void {
    const moveInterface = new MoveInterface({
      viewWidth,
      viewHeight,
      playerWidth: this.player.width,
      playerHeight: this.player.height,
      onDirectionPressedChange: this.handleDirectionPressedChange
    })
    this.addChild(moveInterface)
    this.moveInterface = moveInterface
  }

  resizeMoveInterface ({ viewWidth, viewHeight }: Parameters<IScreen['handleScreenResize']>[0]): void {
    this.moveInterface.x = (this.player.x + this.player.width / 2) - viewWidth / 2
    this.moveInterface.y = (this.player.y + this.player.height / 2) - viewHeight / 2

    this.moveInterface.width = viewWidth
    this.moveInterface.height = viewHeight
  }

  centerCamera ({ viewWidth, viewHeight }: Parameters<IScreen['handleScreenResize']>[0]): void {
    this.x = -(this.player.x + this.player.width / 2) + viewWidth / 2
    this.y = -(this.player.y + this.player.height / 2) + viewHeight / 2
  }

  handleScreenResize (options: Parameters<IScreen['handleScreenResize']>[0]): void {
    this.centerCamera(options)
    this.resizeMoveInterface(options)
  }

  handleDirectionPressedChange = (): void => {
    const { up, right, down, left } = this.moveInterface.directionPressed
    this.player.setImpulse({
      up,
      right,
      down,
      left
    })
  }
}
