import { Howl } from 'howler'
import mapAudio from './assets/audio/map.wav'
import initBattleAudio from './assets/audio/initBattle.wav'
import battleAudio from './assets/audio/battle.mp3'
import tackleHitAudio from './assets/audio/tackleHit.wav'
import fireballHitAudio from './assets/audio/fireballHit.wav'
import initFireballAudio from './assets/audio/initFireball.wav'
import victoryAudio from './assets/audio/victory.wav'

export const AUDIO = {
  Map: new Howl({
    src: mapAudio,
    html5: true,
    volume: 0.1,
    loop: true
  }),
  initBattle: new Howl({
    src: initBattleAudio,
    html5: true,
    volume: 0.05
  }),
  battle: new Howl({
    src: battleAudio,
    html5: true,
    volume: 0.1,
    loop: true
  }),
  tackleHit: new Howl({
    src: tackleHitAudio,
    html5: true,
    volume: 0.1
  }),
  fireballHit: new Howl({
    src: fireballHitAudio,
    html5: true,
    volume: 0.1
  }),
  initFireball: new Howl({
    src: initFireballAudio,
    html5: true,
    volume: 0.1
  }),
  victory: new Howl({
    src: victoryAudio,
    html5: true,
    volume: 0.1
  })
}
