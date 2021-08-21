import OwenKidMale from './DTO/Voice/OwenKidMale'
import Voice from './DTO/Voice/Voice'
import VoiceName from './DTO/Voice/VoiceName'

export default function getVoiceFromVoiceName(voiceName: VoiceName): Voice {
    if (voiceName === VoiceName.OwenKidMale) {
        return new OwenKidMale()
    }

    throw new Error('Voice not found')
}
