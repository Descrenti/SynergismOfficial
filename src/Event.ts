import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateAdditiveLuckMult, calculateAmbrosiaGenerationSpeed, calculateAmbrosiaLuck } from './Calculate'
import { activeConsumables, type PseudoCoinConsumableNames } from './Login'
import { getTimePinnedToLoadDate, player } from './Synergism'
import { revealStuff } from './UpdateHTML'
import { timeReminingHours } from './Utility'
import { Globals as G } from './Variables'

export enum BuffType {
  Quark = 0,
  GoldenQuark = 1,
  Cubes = 2,
  PowderConversion = 3,
  AscensionSpeed = 4,
  GlobalSpeed = 5,
  AscensionScore = 6,
  AntSacrifice = 7,
  Offering = 8,
  Obtainium = 9,
  Octeract = 10,
  BlueberryTime = 11,
  AmbrosiaLuck = 12,
  OneMind = 13
}

interface GameEvent {
  name: string[]
  url: string[]
  start: number
  end: number
  quark: number
  goldenQuark: number
  cubes: number
  powderConversion: number
  ascensionSpeed: number
  globalSpeed: number
  ascensionScore: number
  antSacrifice: number
  offering: number
  obtainium: number
  octeract: number
  blueberryTime: number
  ambrosiaLuck: number
  oneMind: number
  color: string[]
}

let nowEvent: GameEvent | null = null
export const getEvent = () => nowEvent

export const eventCheck = async () => {
  if (!player.dayCheck) {
    return
  }

  const response = await fetch('https://synergism.cc/api/v2/events/get')

  if (!response.ok) {
    throw new Error('God fucking dammit')
  }

  const apiEvents = await response.json() as GameEvent

  nowEvent = null

  const now = new Date(getTimePinnedToLoadDate()).getTime()
  if (now >= apiEvents.start && now <= apiEvents.end && apiEvents.name.length) {
    nowEvent = apiEvents
  }

  const eventNowEndDate = new Date(nowEvent?.end ?? 0)
  DOMCacheGetOrSet('globalEventTimer').textContent = timeReminingHours(eventNowEndDate)

  const updateIsEventCheck = G.isEvent

  updateGlobalsIsEvent()

  if (G.isEvent !== updateIsEventCheck) {
    revealStuff()
    G.ambrosiaCurrStats.ambrosiaAdditiveLuckMult = calculateAdditiveLuckMult().value
    G.ambrosiaCurrStats.ambrosiaLuck = calculateAmbrosiaLuck().value
    G.ambrosiaCurrStats.ambrosiaGenerationSpeed = calculateAmbrosiaGenerationSpeed().value
  }
}

export const eventBuffType: (keyof typeof BuffType)[] = [
  'Quark',
  'GoldenQuark',
  'Cubes',
  'PowderConversion',
  'AscensionSpeed',
  'GlobalSpeed',
  'AscensionScore',
  'AntSacrifice',
  'Offering',
  'Obtainium',
  'Octeract',
  'BlueberryTime',
  'AmbrosiaLuck',
  'OneMind'
]

export const calculateEventSourceBuff = (buff: BuffType): number => {
  const event = getEvent()

  if (event === null) {
    return 0
  }

  switch (buff) {
    case BuffType.Quark:
      return event.quark + consumableEventBuff(buff)
    case BuffType.GoldenQuark:
      return event.goldenQuark + consumableEventBuff(buff)
    case BuffType.Cubes:
      return event.cubes + consumableEventBuff(buff)
    case BuffType.PowderConversion:
      return event.powderConversion + consumableEventBuff(buff)
    case BuffType.AscensionSpeed:
      return event.ascensionSpeed + consumableEventBuff(buff)
    case BuffType.GlobalSpeed:
      return event.globalSpeed + consumableEventBuff(buff)
    case BuffType.AscensionScore:
      return event.ascensionScore + consumableEventBuff(buff)
    case BuffType.AntSacrifice:
      return event.antSacrifice + consumableEventBuff(buff)
    case BuffType.Offering:
      return event.offering + consumableEventBuff(buff)
    case BuffType.Obtainium:
      return event.obtainium + consumableEventBuff(buff)
    case BuffType.Octeract:
      return event.octeract + consumableEventBuff(buff)
    case BuffType.OneMind:
      return player.singularityUpgrades.oneMind.level > 0 ? event.oneMind + consumableEventBuff(buff) : 0
    case BuffType.BlueberryTime:
      return event.blueberryTime + consumableEventBuff(buff)
    case BuffType.AmbrosiaLuck:
      return event.ambrosiaLuck + consumableEventBuff(buff)
  }
}

const consumableEventBuff = (buff: BuffType) => {
  const { HAPPY_HOUR } = activeConsumables
  // The interval is the number of events queued excluding the first.
  const happyHourInterval = HAPPY_HOUR - 1

  // If no consumable is active, early return
  if (HAPPY_HOUR === 0) {
    return 0
  }

  switch (buff) {
    case BuffType.Quark:
      return HAPPY_HOUR ? 0.25 + 0.025 * happyHourInterval : 0
    case BuffType.GoldenQuark:
      return 0
    case BuffType.Cubes:
      return HAPPY_HOUR ? 0.5 + 0.05 * happyHourInterval : 0
    case BuffType.PowderConversion:
      return 0
    case BuffType.AscensionSpeed:
      return 0
    case BuffType.GlobalSpeed:
      return 0
    case BuffType.AscensionScore:
      return 0
    case BuffType.AntSacrifice:
      return 0
    case BuffType.Offering:
      return HAPPY_HOUR ? 0.5 + 0.05 * happyHourInterval : 0
    case BuffType.Obtainium:
      return HAPPY_HOUR ? 0.5 + 0.05 * happyHourInterval : 0
    case BuffType.Octeract:
      return 0
    case BuffType.OneMind:
      return 0
    case BuffType.BlueberryTime:
      return HAPPY_HOUR ? 0.1 + 0.01 * happyHourInterval : 0
    case BuffType.AmbrosiaLuck:
      return HAPPY_HOUR ? 0.1 + 0.01 * happyHourInterval : 0
  }
}

const isConsumableActive = (name?: PseudoCoinConsumableNames) => {
  if (typeof name === 'string') {
    return activeConsumables[name] > 0
  }

  return activeConsumables.HAPPY_HOUR !== 0
}

export const updateGlobalsIsEvent = () => {
  return G.isEvent = getEvent() !== null || isConsumableActive()
}
