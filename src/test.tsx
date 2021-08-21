import SpeecheloAPI from './SpeecheloAPI'
import fs from 'fs'
import OwenKidMale from './DTO/Voice/OwenKidMale'

 
const ids = JSON.parse(fs.readFileSync('./ids.json').toString())

const speecheloAPI = new SpeecheloAPI(ids.login, ids.password)
speecheloAPI.puppeteerOptions = {headless: false};

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink('Hello I\'m Owen', new OwenKidMale())
    console.log(owenOutputLink)
})()
