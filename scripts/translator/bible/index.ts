import { Bible, Bibles } from './Bibles'

export const bibles = new Bibles()

export const bible = await new Bible('ri-bbd').init()

bibles.set('bg', await new Bible('ri-bbd').init())
bibles.set('еn', await new Bible('akjv').init())
