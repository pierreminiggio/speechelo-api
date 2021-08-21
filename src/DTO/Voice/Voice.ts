import Engine from '../Engine'
import Lang from '../Lang'
import VoiceName from './VoiceName'

export default interface Voice {
    lang: Lang
    name: VoiceName
    engine: Engine
}
