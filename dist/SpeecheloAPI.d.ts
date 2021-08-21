import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
import Voice from './DTO/Voice/Voice';
export declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export default class SpeecheloAPI {
    private login;
    private password;
    private puppeteerOptions;
    constructor(login: string, password: string);
    setPuppeteerOptions(puppeteerOptions: PuppeteerOptions): void;
    getSoundLink(text: string, voice: Voice): Promise<string>;
    private loginToPlatform;
    private closeTipsModalIfPresent;
    private isElementPresent;
    private typeText;
    private selectLang;
    private selectVoice;
    private selectEngine;
}
