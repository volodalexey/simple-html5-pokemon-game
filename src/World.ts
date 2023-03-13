import { type Application } from 'pixi.js'
import gsap from 'gsap'

import { type TTileLayer, type GameLoader } from './GameLoader'
import { MapScreen } from './MapScreen'
import { BattleScreen } from './BattleScreen'
import { SplashScreen } from './SplashScreen'
import { logWorld } from './logger'

enum WorldScreen {
  map,
  battle,
}

export class World {
  public static SCREENS = WorldScreen

  public app: Application<HTMLCanvasElement>
  public gameLoader: GameLoader
  public resizeTimeoutId!: NodeJS.Timeout
  public resizeTimeout = 300
  public totalWidth = 1024
  public totalHeight = 576

  public activeScreen!: WorldScreen
  public mapScreen!: MapScreen
  public battleScreen!: BattleScreen
  public splashScreen!: SplashScreen

  constructor ({ app, gameLoader }: { app: Application, gameLoader: GameLoader }) {
    this.app = app as Application<HTMLCanvasElement>
    this.gameLoader = gameLoader
    this.setup()

    this.setScreen(WorldScreen.battle, true)

    this.resizeHandler()

    if (logWorld.enabled) {
      logWorld('window.world initialized!');
      (window as unknown as any).world = this
    }
  }

  setup (): void {
    this.setupCanvas()
    this.setupScreens()
    this.setupEventLesteners()
  }

  setupEventLesteners (): void {
    window.addEventListener('resize', this.resizeDeBounce)
    this.app.ticker.add(this.handleAppTick)
  }

  findTileLayer (name: string): TTileLayer {
    const layer = this.gameLoader.settings.layers.find((l): l is TTileLayer => l.type === 'tilelayer' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" layer`)
    }
    return layer
  }

  setupCanvas (): void {
    document.body.appendChild(this.app.view)
  }

  setupScreens (): void {
    const {
      app: { view: { width, height } },
      gameLoader: {
        worldBackgroundTexture,
        worldForegroundTexture,
        battleBackgroundTexture,
        spritesheet: { animations }
      }
    } = this
    this.mapScreen = new MapScreen({
      viewWidth: width,
      viewHeight: height,
      collisionsLayer: this.findTileLayer('Collisions'),
      battleZonesLayer: this.findTileLayer('Battle Zones'),
      playerSprites: {
        up: animations['Player-Up'],
        left: animations['Player-Left'],
        right: animations['Player-Right'],
        down: animations['Player-Down']
      },
      mapSprites: {
        background: worldBackgroundTexture,
        foreground: worldForegroundTexture
      },
      onBattleStart: this.handleBattleStart
    })
    this.battleScreen = new BattleScreen({
      viewWidth: width,
      viewHeight: height,
      sprites: {
        draggle: animations['Draggle-Idle'],
        emby: animations['Emby-Idle'],
        background: battleBackgroundTexture
      }
    })
    this.splashScreen = new SplashScreen({
      viewWidth: width,
      viewHeight: height
    })

    this.app.stage.addChild(this.mapScreen)
    this.app.stage.addChild(this.battleScreen)
    this.app.stage.addChild(this.splashScreen)
  }

  resizeDeBounce = (): void => {
    this.cancelScheduledResizeHandler()
    this.scheduleResizeHandler()
  }

  cancelScheduledResizeHandler (): void {
    clearTimeout(this.resizeTimeoutId)
  }

  scheduleResizeHandler (): void {
    this.resizeTimeoutId = setTimeout(() => {
      this.cancelScheduledResizeHandler()
      this.resizeHandler()
    }, this.resizeTimeout)
  }

  resizeHandler = (): void => {
    const params = { viewWidth: this.app.view.width, viewHeight: this.app.view.height }
    switch (this.activeScreen) {
      case WorldScreen.map:
        this.mapScreen.handleScreenResize(params)
        break
      case WorldScreen.battle:
        this.battleScreen.handleScreenResize(params)
        break
    }
    this.splashScreen.handleScreenResize(params)
  }

  setScreen (screen: WorldScreen, force = false): void {
    switch (screen) {
      case WorldScreen.map:
        this.battleScreen.deactivate()
        if (force) {
          this.battleScreen.visible = false
          this.mapScreen.visible = true
          this.mapScreen.activate()
        } else {
          this.splashScreen.alpha = 0
          gsap.to(this.splashScreen, {
            alpha: 1,
            onComplete: () => {
              this.battleScreen.visible = false
              this.mapScreen.visible = true
              this.mapScreen.activate()

              gsap.to(this.splashScreen, {
                alpha: 0,
                duration: 0.4
              })
            }
          })
        }
        break
      case WorldScreen.battle:
        this.mapScreen.deactivate()
        if (force) {
          this.mapScreen.visible = false
          this.battleScreen.visible = true
          this.battleScreen.activate()
        } else {
          this.splashScreen.alpha = 0
          gsap.to(this.splashScreen, {
            alpha: 1,
            repeat: 3,
            yoyo: true,
            duration: 0.4,
            onComplete: () => {
              gsap.to(this.splashScreen, {
                alpha: 1,
                duration: 0.4,
                onComplete: () => {
                  this.mapScreen.visible = false
                  this.battleScreen.visible = true
                  this.battleScreen.activate()
                  gsap.to(this.splashScreen, {
                    alpha: 0,
                    duration: 0.4
                  })
                }
              })
            }
          })
        }
        break
    }
    this.activeScreen = screen
    this.resizeHandler()
  }

  handleAppTick = (): void => {
    switch (this.activeScreen) {
      case WorldScreen.map:
        this.mapScreen.handleScreenTick()
        break
      case WorldScreen.battle:
        this.battleScreen.handleScreenTick()
        break
    }
  }

  handleBattleStart = (): void => {
    this.setScreen(WorldScreen.battle)
  }
}
