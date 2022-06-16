import SpeecheloAPI from './SpeecheloAPI'
import fs from 'fs'
import VoiceName from './DTO/Voice/VoiceName'
import getVoiceFromVoiceName from './getVoiceFromVoiceName'
import APICaptchaResolver from './APICaptchaResolver'
import CaptchaResolver from './CaptchaResolver'

const args = process.argv
const argsLength = args.length

if (argsLength < 6) {
    console.log('Use like this : node dist/cli.js <login> <password> <filePath> <voice> [captchaResolverUrl] [captchaResolverToken]')
    process.exit()
}

const login = args[2]
const password = args[3]
const filePath = args[4]
const fileContent = fs.readFileSync(filePath).toString()
const voice = args[5] as VoiceName

const availableVoices = Object.values(VoiceName)

if (! availableVoices.includes(voice)) {
    console.log('Bad voice name : Please use on the following : ' + availableVoices.join(', '))
    process.exit()
}

const captchaResolverUrl = argsLength >= 7 ? args[6] : null
const captchaResolverToken = argsLength >= 8 ? args[7] : null

const captchaResolver: CaptchaResolver|undefined = captchaResolverUrl && captchaResolverToken ? new APICaptchaResolver(
    captchaResolverUrl,
    captchaResolverToken
).getResolver() : undefined

const speecheloAPI = new SpeecheloAPI(login, password, captchaResolver);

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink(fileContent, getVoiceFromVoiceName(voice))
    console.log(owenOutputLink)
})().catch(e => {
    console.log(e)
    process.exitCode = 255
})
