import Engine from '../Engine'
import Lang from '../Lang'
import Voice from './Voice'
import VoiceName from './VoiceName'

export default class OwenKidMale implements Voice {
    lang = Lang.EN_US
    name = VoiceName.OwenKidMale
    engine = Engine.AIVoice
}
