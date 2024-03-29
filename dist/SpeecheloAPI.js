"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const Engine_1 = __importDefault(require("./DTO/Engine"));
const VoiceName_1 = __importDefault(require("./DTO/Voice/VoiceName"));
class SpeecheloAPI {
    constructor(login, password, captchaResolver = undefined) {
        this.puppeteerOptions = {
            args: ['--no-sandbox']
        };
        this.afterCreationWaitingStrategy = {
            waitingTimeInMiliseconds: 50,
            tries: 2400
        };
        this.login = login;
        this.password = password;
        this.captchaResolver = captchaResolver;
    }
    async getSoundLink(text, voice) {
        const { browser, page } = await this.loginToPlatform();
        await this.closeTipsModalIfPresent(page);
        const previousVoiceId = await this.getlastVoiceId(page, browser);
        await this.generateVoice(page, browser, text, voice);
        let triesLeft = this.afterCreationWaitingStrategy.tries;
        const waitingTime = this.afterCreationWaitingStrategy.waitingTimeInMiliseconds;
        while (triesLeft > 0) {
            const newVoiceId = await this.getlastVoiceId(page, browser);
            if (newVoiceId === previousVoiceId) {
                await page.waitForTimeout(waitingTime);
                triesLeft--;
                continue;
            }
            const voiceLink = await this.getLastVoiceLink(page, browser);
            await browser.close();
            return voiceLink;
        }
        const html = await page.evaluate(() => document.head.outerHTML + document.head.innerHTML);
        await browser.close();
        throw new Error('Timed out after '
            + (waitingTime * this.afterCreationWaitingStrategy.tries / 1000)
            + ' seconds, HTML : \n'
            + html);
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
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45');
            await page.goto('https://app.blasteronline.com/speechelo/');
            const emailInputSelector = '#loginemail';
            const passwordInputSelector = '#loginpassword';
            const delay = 50;
            await page.waitForSelector(emailInputSelector);
            await page.type(emailInputSelector, this.login, { delay });
            await page.waitForSelector(passwordInputSelector);
            await page.type(passwordInputSelector, this.password, { delay });
            const captchaImageSelector = '[src^="https://app.blasteronline.com/assets/captcha/"]';
            const captchaImageSrc = await page.evaluate(captchaImageSelector => {
                const captchaImageElement = document.querySelector(captchaImageSelector);
                if (!captchaImageElement) {
                    return null;
                }
                if (captchaImageElement.offsetParent === null) {
                    return null;
                }
                return captchaImageElement.src || null;
            }, captchaImageSelector);
            let captcha = null;
            if (captchaImageSrc) {
                const captchaResolver = this.captchaResolver;
                if (!captchaResolver) {
                    throw new Error('A Captcha is displayed, you need to set up a captchaResolver to solve it');
                }
                captcha = await captchaResolver(captchaImageSrc.split('?')[0]);
                if (captcha === null) {
                    throw new Error('Solving Captcha failed');
                }
                const captchaInputSelector = '#captcha';
                await page.waitForSelector(captchaInputSelector);
                await page.type(captchaInputSelector, captcha, { delay });
            }
            const signInButtonSelector = '#login_button';
            await page.click(signInButtonSelector);
            const navbarBrandLinkSelector = '.navbar-brand';
            try {
                await page.waitForSelector(navbarBrandLinkSelector);
            }
            catch (e) {
                const errorMessage = await page.evaluate(() => { var _a; return (_a = document.querySelector('.alert_login')) === null || _a === void 0 ? void 0 : _a.innerText; });
                if (errorMessage === 'Failed to login.') {
                    throw new Error('Failed to login');
                }
                if (errorMessage) {
                    throw new Error(errorMessage);
                }
                throw new Error('Waiting for Navbar failed.' + (captchaImageSrc ? (' Maybe Captcha solving error ? Url : ' + captchaImageSrc + ' Captcha : ' + captcha) : ''));
            }
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
    async generateVoice(page, browser, text, voice) {
        await this.typeText(page, browser, text);
        await this.selectLang(page, browser, voice.lang);
        await this.selectVoice(page, browser, voice.name);
        await this.selectEngine(page, browser, voice.engine);
        await this.submitVoiceGeneration(page, browser);
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
    async submitVoiceGeneration(page, browser) {
        const submitButtonSelector = '#ttsGenerateBtn';
        const notEnoughPunctuationSelector = '.swal2-confirm.btn-danger';
        const confirmButtonSelector = '.swal2-confirm:not([disabled])';
        try {
            await page.waitForSelector(submitButtonSelector);
            await page.click(submitButtonSelector);
            const timeOutBeforeDying = 60000;
            const hasNotEnoughPunctuation = await Promise.race([
                new Promise(async (resolve, reject) => {
                    try {
                        await page.waitForSelector(notEnoughPunctuationSelector, { timeout: timeOutBeforeDying });
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }
                    resolve(true);
                }),
                new Promise(async (resolve, reject) => {
                    try {
                        await page.waitForSelector(confirmButtonSelector, { timeout: timeOutBeforeDying });
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }
                    resolve(false);
                })
            ]);
            if (hasNotEnoughPunctuation) {
                await page.click(notEnoughPunctuationSelector);
            }
            await page.waitForSelector(confirmButtonSelector);
            const hasExceededLimit = await page.evaluate(() => { var _a; return ((_a = document.querySelector('#swal2-title')) === null || _a === void 0 ? void 0 : _a.innerText) === 'Character Limit Exceeded!'; });
            if (hasExceededLimit) {
                const errorText = await page.evaluate(() => { var _a; return (_a = document.querySelector('#swal2-content')) === null || _a === void 0 ? void 0 : _a.innerText; });
                await browser.close();
                throw new Error('Limit Exceeded : ' + errorText);
            }
            await page.click(confirmButtonSelector);
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async getlastVoiceId(page, browser) {
        try {
            const lines = await page.$$(SpeecheloAPI.lineSelector);
            const lastLine = lines[1];
            if (lines.length === 2) {
                const isEmpty = await lastLine.evaluate((element) => {
                    return element.innerText.trim() === 'No data available in table';
                });
                if (isEmpty) {
                    return null;
                }
            }
            return parseInt(await lastLine.evaluate((element) => {
                const idColumn = element.querySelector('td+td');
                if (idColumn === null) {
                    throw new Error('No id column');
                }
                return idColumn.innerText;
            }));
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
    async getLastVoiceLink(page, browser) {
        try {
            return await page.evaluate((playButtonSelector) => {
                const playButton = document.querySelector(playButtonSelector);
                if (playButton === null) {
                    throw new Error('Missing play button');
                }
                const dataset = playButton.dataset;
                if (!dataset) {
                    throw new Error('Play button lacks dataset');
                }
                const link = dataset.link;
                if (!link) {
                    throw new Error('Play button lacks dataset.link');
                }
                return link;
            }, SpeecheloAPI.lineSelector + ' button');
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = SpeecheloAPI;
SpeecheloAPI.lineSelector = '#blastered_datatable_wrapper tr';
