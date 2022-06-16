import SpeecheloAPI from './SpeecheloAPI'
import fs from 'fs'
import OwenKidMale from './DTO/Voice/OwenKidMale'
import APICaptchaResolver from './APICaptchaResolver'
 
const ids = JSON.parse(fs.readFileSync('./ids.json').toString())

const speecheloAPI = new SpeecheloAPI(
    ids.login,
    ids.password,
    new APICaptchaResolver(ids.captchaResolverUrl, ids.captchaResolverToken).getResolver()
)
speecheloAPI.puppeteerOptions = {headless: false};

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink('Tesla fans and owners have been waiting months for the major full self-driving.', new OwenKidMale())
    console.log(owenOutputLink)
})().catch(e => {
    console.log(e)
    process.exit(255)
})
