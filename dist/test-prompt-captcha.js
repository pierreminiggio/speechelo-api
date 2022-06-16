"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpeecheloAPI_1 = __importDefault(require("./SpeecheloAPI"));
const fs_1 = __importDefault(require("fs"));
const OwenKidMale_1 = __importDefault(require("./DTO/Voice/OwenKidMale"));
const readline_1 = __importDefault(require("readline"));
const inputReader = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const ids = JSON.parse(fs_1.default.readFileSync('./ids.json').toString());
const speecheloAPI = new SpeecheloAPI_1.default(ids.login, ids.password, (captchaUrl) => {
    return new Promise(resolve => {
        inputReader.question('Captcha ? ' + captchaUrl + '\n', userInputtedCaptcha => {
            resolve(userInputtedCaptcha);
            inputReader.close();
        });
    });
});
speecheloAPI.puppeteerOptions = { headless: false };
(async () => {
    const owenOutputLink = await speecheloAPI.getSoundLink('Tesla fans and owners have been waiting months for the major full self-driving.', new OwenKidMale_1.default());
    console.log(owenOutputLink);
})().catch(e => {
    console.log(e);
    process.exitCode = 255;
});
