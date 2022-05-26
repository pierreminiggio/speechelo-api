import SpeecheloAPI from './SpeecheloAPI'
import fetch from 'node-fetch'
import fs from 'fs'
import OwenKidMale from './DTO/Voice/OwenKidMale'
 
const ids = JSON.parse(fs.readFileSync('./ids.json').toString())

const speecheloAPI = new SpeecheloAPI(ids.login, ids.password, async (captchaUrl) => {
    const response = await fetch(ids.captchaResolverUrl + '/' + captchaUrl, {
        headers: {
            'Authorization': 'Bearer ' + ids.captchaResolverToken
        }
    })

    if (! response.ok) {
        return null
    }

    const responseText = await response.text()
    console.log(responseText)

    if (responseText.length !== 8) {
        return null
    }

    return responseText
})
speecheloAPI.puppeteerOptions = {headless: false};

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink('tesla fans and owners have been waiting months for the major full self-driving update to come to cars via over-the-air-software updates. and, interestingly, though they\'ve been asking musk constantly when the features might launch, they\'ve been seemingly patient. this is likely due in part to the fact that tesla removed the ', new OwenKidMale())
    console.log(owenOutputLink)
})()
