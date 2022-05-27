import SpeecheloAPI from './SpeecheloAPI'
import fs from 'fs'
import OwenKidMale from './DTO/Voice/OwenKidMale'
import readline from 'readline'

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
 
const ids = JSON.parse(fs.readFileSync('./ids.json').toString())

const speecheloAPI = new SpeecheloAPI(
    ids.login,
    ids.password,
    (captchaUrl: string): Promise<string|null> => {
        return new Promise(resolve => {
            inputReader.question('Captcha ? ' + captchaUrl + '\n', userInputtedCaptcha => {
                resolve(userInputtedCaptcha)
                inputReader.close();
            })
        })
    }
)
speecheloAPI.puppeteerOptions = {headless: false};

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink('Tesla fans and owners have been waiting months for the major full self-driving.', new OwenKidMale())
    console.log(owenOutputLink)
})()
