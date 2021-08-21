"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const Engine_1 = __importDefault(require("./DTO/Engine"));
const VoiceName_1 = __importDefault(require("./DTO/Voice/VoiceName"));
class SpeecheloAPI {
    constructor(login, password) {
        this.puppeteerOptions = {
            args: ['--no-sandbox']
        };
        this.login = login;
        this.password = password;
    }
    setPuppeteerOptions(puppeteerOptions) {
        this.puppeteerOptions = puppeteerOptions;
    }
    async getSoundLink(text, voice) {
        const { browser, page } = await this.loginToPlatform();
        await this.closeTipsModalIfPresent(page);
        await this.typeText(page, browser, text);
        await this.selectLang(page, browser, voice.lang);
        await this.selectVoice(page, browser, voice.name);
        await this.selectEngine(page, browser, voice.engine);
        return '';
    }
    async loginToPlatform() {
        let browser;
        try {
            browser = await puppeteer_1.default.launch(this.puppeteerOptions);
        }
        catch (browserLaunchError) {
            throw browserLaunchError;
        }
        try {
            const pages = await browser.pages();
            const page = pages.length > 0 ? pages[0] : await browser.newPage();
            await page.goto('https://app.blasteronline.com/speechelo/');
            const emailInputSelector = '#loginemail';
            const passwordInputSelector = '#loginpassword';
            const delay = 50;
            await page.waitForSelector(emailInputSelector);
            await page.type(emailInputSelector, this.login, { delay });
            await page.waitForSelector(passwordInputSelector);
            await page.type(passwordInputSelector, this.password, { delay });
            const signInButtonSelector = '#login_button';
            await page.click(signInButtonSelector);
            const navbarBrandLinkSelector = '.navbar-brand';
            await page.waitForSelector(navbarBrandLinkSelector);
            return { browser, page };
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async closeTipsModalIfPresent(page) {
        const modalCloseButtonSelector = '#modal_tips button[data-dismiss="modal"]';
        await page.waitForTimeout(3000);
        if (await this.isElementPresent(page, modalCloseButtonSelector)) {
            await page.click(modalCloseButtonSelector);
            return;
        }
        await page.waitForTimeout(2000);
        if (!await this.isElementPresent(page, modalCloseButtonSelector)) {
            return;
        }
        await page.click(modalCloseButtonSelector);
    }
    async isElementPresent(page, selectors) {
        return await page.evaluate((selectors) => {
            return document.querySelector(selectors) !== null;
        }, selectors);
    }
    async typeText(page, browser, text) {
        const textInputSelector = '#tts-tarea';
        try {
            await page.waitForSelector(textInputSelector);
            await page.type(textInputSelector, text, { delay: 50 });
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async selectLang(page, browser, lang) {
        const langSelectSelector = '#ttp-language';
        try {
            await page.waitForSelector(langSelectSelector);
            await page.evaluate((langSelectSelector, lang) => {
                const langSelect = document.querySelector(langSelectSelector);
                if (langSelect === null) {
                    return;
                }
                langSelect.value = lang;
                langSelect.dispatchEvent(new Event('change'));
            }, langSelectSelector, lang);
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async selectVoice(page, browser, voiceName) {
        let voiceSelector;
        if (voiceName === VoiceName_1.default.OwenKidMale) {
            voiceSelector = '#ttsVoiceJustin';
        }
        else {
            await browser.close();
            throw new Error('Voice ' + voiceName + ' not supported yet');
        }
        try {
            await page.click(voiceSelector);
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async selectEngine(page, browser, engine) {
        let engineSelector;
        if (engine === Engine_1.default.AIVoice) {
            engineSelector = '#ttsEngineNeural';
        }
        else {
            await browser.close();
            throw new Error('Engine ' + engine + ' not supported yet');
        }
        try {
            await page.click(engineSelector);
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = SpeecheloAPI;
