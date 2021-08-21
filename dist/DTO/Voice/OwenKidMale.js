"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Engine_1 = __importDefault(require("../Engine"));
const Lang_1 = __importDefault(require("../Lang"));
const VoiceName_1 = __importDefault(require("./VoiceName"));
class OwenKidMale {
    constructor() {
        this.lang = Lang_1.default.EN_US;
        this.name = VoiceName_1.default.OwenKidMale;
        this.engine = Engine_1.default.AIVoice;
    }
}
exports.default = OwenKidMale;
