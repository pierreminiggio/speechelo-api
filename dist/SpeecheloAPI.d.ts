import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
import Voice from './DTO/Voice/Voice';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
interface AfterCreationWaitingStrategy {
    waitingTimeInMiliseconds: number;
    tries: number;
}
declare type AudioFileUrl = string;
declare type CaptchaResolver = (captchaUrl: string) => Promise<string | null>;
export default class SpeecheloAPI {
    private login;
    private password;
    private captchaResolver;
    puppeteerOptions: PuppeteerOptions;
    afterCreationWaitingStrategy: AfterCreationWaitingStrategy;
    private static lineSelector;
    constructor(login: string, password: string, captchaResolver?: CaptchaResolver | undefined);
    getSoundLink(text: string, voice: Voice): Promise<AudioFileUrl>;
    private loginToPlatform;
    private closeTipsModalIfPresent;
    private isElementPresent;
    private generateVoice;
    private typeText;
    private selectLang;
    private selectVoice;
    private selectEngine;
    private submitVoiceGeneration;
    private getlastVoiceId;
    private getLastVoiceLink;
}
export { PuppeteerOptions, AfterCreationWaitingStrategy };
