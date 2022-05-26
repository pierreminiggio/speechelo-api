"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
class APICaptchaResolver {
    constructor(captchaResolverUrl, captchaResolverToken) {
        this.captchaResolverUrl = captchaResolverUrl;
        this.captchaResolverToken = captchaResolverToken;
    }
    getResolver() {
        return async (captchaUrl) => {
            const response = await node_fetch_1.default(this.captchaResolverUrl + '/' + captchaUrl, {
                headers: {
                    'Authorization': 'Bearer ' + this.captchaResolverToken
                }
            });
            if (!response.ok) {
                return null;
            }
            const responseText = await response.text();
            if (responseText.length !== 8) {
                return null;
            }
            return responseText;
        };
    }
}
exports.default = APICaptchaResolver;
