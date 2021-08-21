"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OwenKidMale_1 = __importDefault(require("./DTO/Voice/OwenKidMale"));
const VoiceName_1 = __importDefault(require("./DTO/Voice/VoiceName"));
function getVoiceFromVoiceName(voiceName) {
    if (voiceName === VoiceName_1.default.OwenKidMale) {
        return new OwenKidMale_1.default();
    }
    throw new Error('Voice not found');
}
exports.default = getVoiceFromVoiceName;
