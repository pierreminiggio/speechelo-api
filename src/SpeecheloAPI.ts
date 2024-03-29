import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page, Product } from 'puppeteer'
import CaptchaResolver from './CaptchaResolver'
import Engine from './DTO/Engine'
import Lang from './DTO/Lang'
import Voice from './DTO/Voice/Voice'
import VoiceName from './DTO/Voice/VoiceName'

type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

interface AfterCreationWaitingStrategy {
    waitingTimeInMiliseconds: number
    tries: number
}

interface BrowserAndPage {
    browser: Browser
    page: Page
}

type AudioFileUrl = string

export default class SpeecheloAPI {

    private login: string
    private password: string
    private captchaResolver: CaptchaResolver|undefined

    public puppeteerOptions: PuppeteerOptions = {
        args: ['--no-sandbox']
    }
    public afterCreationWaitingStrategy: AfterCreationWaitingStrategy = {
        waitingTimeInMiliseconds: 50,
        tries: 2400
    }

    private static lineSelector: string = '#blastered_datatable_wrapper tr'

    public constructor(login: string, password: string, captchaResolver: CaptchaResolver|undefined = undefined) {
        this.login = login
        this.password = password
        this.captchaResolver = captchaResolver
    }

    public async getSoundLink(text: string, voice: Voice): Promise<AudioFileUrl> {
        
        const {browser, page}: BrowserAndPage = await this.loginToPlatform()
        await this.closeTipsModalIfPresent(page)
        
        const previousVoiceId = await this.getlastVoiceId(page, browser)
        await this.generateVoice(page, browser, text, voice)

        let triesLeft = this.afterCreationWaitingStrategy.tries
        const waitingTime = this.afterCreationWaitingStrategy.waitingTimeInMiliseconds

        while (triesLeft > 0) {
            const newVoiceId = await this.getlastVoiceId(page, browser)
            
            if (newVoiceId === previousVoiceId) {
                await page.waitForTimeout(waitingTime)
                triesLeft--
                continue
            }

            const voiceLink = await this.getLastVoiceLink(page, browser)
            await browser.close()
            return voiceLink
        }

        const html = await page.evaluate(() => document.head.outerHTML + document.head.innerHTML)
        await browser.close()

        throw new Error(
            'Timed out after '
            + (waitingTime * this.afterCreationWaitingStrategy.tries / 1000)
            + ' seconds, HTML : \n'
            + html
        )
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
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45')

            await page.goto('https://app.blasteronline.com/speechelo/')

            const emailInputSelector = '#loginemail'
            const passwordInputSelector = '#loginpassword'

            const delay = 50

            await page.waitForSelector(emailInputSelector)
            await page.type(emailInputSelector, this.login, {delay})

            await page.waitForSelector(passwordInputSelector)
            await page.type(passwordInputSelector, this.password, {delay})

            const captchaImageSelector = '[src^="https://app.blasteronline.com/assets/captcha/"]'
            const captchaImageSrc: string|null = await page.evaluate(
                captchaImageSelector => {
                    const captchaImageElement = document.querySelector(captchaImageSelector)

                    if (! captchaImageElement) {
                        return null
                    }

                    if (captchaImageElement.offsetParent === null) {
                        return null
                    }

                    return captchaImageElement.src || null
                },
                captchaImageSelector
            )

            let captcha: string|null = null

            if (captchaImageSrc) {
                
                const captchaResolver = this.captchaResolver

                if (! captchaResolver) {
                    throw new Error('A Captcha is displayed, you need to set up a captchaResolver to solve it')
                }

                captcha = await captchaResolver(captchaImageSrc.split('?')[0])

                if (captcha === null) {
                    throw new Error('Solving Captcha failed')
                }

                const captchaInputSelector = '#captcha'
                await page.waitForSelector(captchaInputSelector)

                await page.type(captchaInputSelector, captcha, {delay})
            }

            const signInButtonSelector = '#login_button'
            await page.click(signInButtonSelector)

            const navbarBrandLinkSelector = '.navbar-brand'
            try {
                await page.waitForSelector(navbarBrandLinkSelector)
            } catch (e) {
                const errorMessage = await page.evaluate(() => (document.querySelector('.alert_login') as HTMLElement)?.innerText)

                if (errorMessage === 'Failed to login.') {
                    throw new Error('Failed to login')
                }

                if (errorMessage) {
                    throw new Error(errorMessage)
                }

                throw new Error('Waiting for Navbar failed.' + (
                    captchaImageSrc ? (' Maybe Captcha solving error ? Url : ' + captchaImageSrc + ' Captcha : ' + captcha) : ''
                ))
            }

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

    private async generateVoice(page: Page, browser: Browser, text: string, voice: Voice): Promise<void> {
        await this.typeText(page, browser, text)
        await this.selectLang(page, browser, voice.lang)
        await this.selectVoice(page, browser, voice.name)
        await this.selectEngine(page, browser, voice.engine)
        await this.submitVoiceGeneration(page, browser)
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

    private async submitVoiceGeneration(page: Page, browser: Browser): Promise<void> {
        const submitButtonSelector = '#ttsGenerateBtn'
        const notEnoughPunctuationSelector = '.swal2-confirm.btn-danger'
        const confirmButtonSelector = '.swal2-confirm:not([disabled])'
        
        try {
            await page.waitForSelector(submitButtonSelector)
            await page.click(submitButtonSelector)

            const timeOutBeforeDying = 60000
            const hasNotEnoughPunctuation = await Promise.race([
                new Promise<boolean>(async (resolve, reject) => {
                    try {
                        await page.waitForSelector(notEnoughPunctuationSelector, {timeout: timeOutBeforeDying})
                    } catch (error) {
                        reject(error)

                        return
                    }

                    resolve(true)
                }),
                new Promise<boolean>(async (resolve, reject) => {
                    try {
                        await page.waitForSelector(confirmButtonSelector, {timeout: timeOutBeforeDying})
                    } catch (error) {
                        reject(error)

                        return
                    }

                    resolve(false)
                })
            ])

            if (hasNotEnoughPunctuation) {
                await page.click(notEnoughPunctuationSelector)
            }

            await page.waitForSelector(confirmButtonSelector)

            const hasExceededLimit = await page.evaluate(() => (document.querySelector('#swal2-title') as HTMLElement)?.innerText === 'Character Limit Exceeded!')

            if (hasExceededLimit) {
                const errorText = await page.evaluate(() => (document.querySelector('#swal2-content') as HTMLElement)?.innerText)
                await browser.close()
                throw new Error('Limit Exceeded : ' + errorText)
            }
            
            await page.click(confirmButtonSelector)
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }

    private async getlastVoiceId(page: Page, browser: Browser): Promise<number|null> {

        try {
            const lines = await page.$$<HTMLElement>(SpeecheloAPI.lineSelector)

            const lastLine = lines[1]

            if (lines.length === 2) {
                const isEmpty = await lastLine.evaluate((element: HTMLElement): boolean => {
                    return element.innerText.trim() === 'No data available in table'
                })

                if (isEmpty) {
                    return null
                }
            }

            return parseInt(await lastLine.evaluate((element: HTMLElement): string => {
                const idColumn = element.querySelector<HTMLElement>('td+td')

                if (idColumn === null) {
                    throw new Error('No id column')
                }

                return idColumn.innerText
            }))
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }

    private async getLastVoiceLink(page: Page, browser: Browser): Promise<string> {
        try {
            return await page.evaluate(
                (playButtonSelector: string): string => {
                    const playButton = document.querySelector<HTMLButtonElement>(playButtonSelector)

                    if (playButton === null) {
                        throw new Error('Missing play button')
                    }

                    const dataset = playButton.dataset

                    if (! dataset) {
                        throw new Error('Play button lacks dataset')
                    }

                    const link = dataset.link

                    if (! link) {
                        throw new Error('Play button lacks dataset.link')
                    }

                    return link
                },
                SpeecheloAPI.lineSelector + ' button'
            )
        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError
        }
    }
}

export {PuppeteerOptions, AfterCreationWaitingStrategy}
