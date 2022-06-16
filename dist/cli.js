"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpeecheloAPI_1 = __importDefault(require("./SpeecheloAPI"));
const fs_1 = __importDefault(require("fs"));
const VoiceName_1 = __importDefault(require("./DTO/Voice/VoiceName"));
const getVoiceFromVoiceName_1 = __importDefault(require("./getVoiceFromVoiceName"));
const APICaptchaResolver_1 = __importDefault(require("./APICaptchaResolver"));
const args = process.argv;
const argsLength = args.length;
if (argsLength < 6) {
    console.log('Use like this : node dist/cli.js <login> <password> <filePath> <voice> [captchaResolverUrl] [captchaResolverToken]');
    process.exit();
}
const login = args[2];
const password = args[3];
const filePath = args[4];
const fileContent = fs_1.default.readFileSync(filePath).toString();
const voice = args[5];
const availableVoices = Object.values(VoiceName_1.default);
if (!availableVoices.includes(voice)) {
    console.log('Bad voice name : Please use on the following : ' + availableVoices.join(', '));
    process.exit();
}
const captchaResolverUrl = argsLength >= 7 ? args[6] : null;
const captchaResolverToken = argsLength >= 8 ? args[7] : null;
const captchaResolver = captchaResolverUrl && captchaResolverToken ? new APICaptchaResolver_1.default(captchaResolverUrl, captchaResolverToken).getResolver() : undefined;
const speecheloAPI = new SpeecheloAPI_1.default(login, password, captchaResolver);
(async () => {
    const owenOutputLink = await speecheloAPI.getSoundLink(fileContent, getVoiceFromVoiceName_1.default(voice));
    console.log(owenOutputLink);
})();
