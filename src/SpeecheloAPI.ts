import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page, Product } from 'puppeteer'
import Engine from './DTO/Engine'
import Lang from './DTO/Lang'
import Voice from './DTO/Voice/Voice'
import VoiceName from './DTO/Voice/VoiceName'

export type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

interface BrowserAndPage {
    browser: Browser
    page: Page
}

export default class SpeecheloAPI {

    private login: string
    private password: string
    private puppeteerOptions: PuppeteerOptions = {
        args: ['--no-sandbox']
    }

    public constructor(login: string, password: string) {
        this.login = login
        this.password = password
    }

    public setPuppeteerOptions(puppeteerOptions: PuppeteerOptions) {
        this.puppeteerOptions = puppeteerOptions
    }

    public async getSoundLink(text: string, voice: Voice): Promise<string> {
        
        const {browser, page}: BrowserAndPage = await this.loginToPlatform()
        await this.closeTipsModalIfPresent(page)
        await this.typeText(page, browser, text)
        await this.selectLang(page, browser, voice.lang)
        await this.selectVoice(page, browser, voice.name)
        await this.selectEngine(page, browser, voice.engine)
        return ''
    }

    private async loginToPlatform(): Promise<BrowserAndPage> {
        let browser: Browser

        try {
            browser = await puppeteer.launch(this.puppeteerOptions)
        } catch (browserLaunchError: any) {
            throw browserLaunchError;
        }

        try {
            const pages = await browser.pages()
            const page = pages.length > 0 ? pages[0] : await browser.newPage()

            await page.goto('https://app.blasteronline.com/speechelo/')

            const emailInputSelector = '#loginemail'
            const passwordInputSelector = '#loginpassword'

            const delay = 50

            await page.waitForSelector(emailInputSelector)
            await page.type(emailInputSelector, this.login, {delay})

            await page.waitForSelector(passwordInputSelector)
            await page.type(passwordInputSelector, this.password, {delay})

            const signInButtonSelector = '#login_button'
            await page.click(signInButtonSelector)

            const navbarBrandLinkSelector = '.navbar-brand'
            await page.waitForSelector(navbarBrandLinkSelector)

            return {browser, page}
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError;
        }
    }

    private async closeTipsModalIfPresent(page: Page): Promise<void> {
        const modalCloseButtonSelector = '#modal_tips button[data-dismiss="modal"]'
        await page.waitForTimeout(3000)

        if (await this.isElementPresent(page, modalCloseButtonSelector)) {
            await page.click(modalCloseButtonSelector)

            return
        }

        await page.waitForTimeout(2000)

        if (! await this.isElementPresent(page, modalCloseButtonSelector)) {
            return
        }

        await page.click(modalCloseButtonSelector)
    }

    private async isElementPresent(page: Page, selectors: string): Promise<boolean> {
        return await page.evaluate(
            (selectors: string): boolean => {
                return document.querySelector(selectors) !== null
            },
            selectors
        )
    }

    private async typeText(page: Page, browser: Browser, text: string): Promise<void> {
        const textInputSelector = '#tts-tarea'
        try {
            await page.waitForSelector(textInputSelector)
            await page.type(textInputSelector, text, {delay: 50})
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }

    private async selectLang(page: Page, browser: Browser, lang: Lang): Promise<void> {
        const langSelectSelector = '#ttp-language'
        try {
            await page.waitForSelector(langSelectSelector)
            await page.evaluate(
                (langSelectSelector: string, lang: string): void => {
                    const langSelect: HTMLSelectElement|null = document.querySelector(langSelectSelector)

                    if (langSelect === null) {
                        return
                    }

                    langSelect.value = lang
                    langSelect.dispatchEvent(new Event('change'))
                },
                langSelectSelector,
                lang
            )
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }

    private async selectVoice(page: Page, browser: Browser, voiceName: VoiceName): Promise<void> {
        let voiceSelector: string
        
        if (voiceName === VoiceName.OwenKidMale) {
            voiceSelector = '#ttsVoiceJustin'
        } else {
            await browser.close()
            throw new Error('Voice ' + voiceName + ' not supported yet')
        }
        
        try {
            await page.click(voiceSelector)
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }

    private async selectEngine(page: Page, browser: Browser, engine: Engine): Promise<void> {
        let engineSelector: string
        
        if (engine === Engine.AIVoice) {
            engineSelector = '#ttsEngineNeural'
        } else {
            await browser.close()
            throw new Error('Engine ' + engine + ' not supported yet')
        }
        
        try {
            await page.click(engineSelector)
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }
}
