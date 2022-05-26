import CaptchaResolver from './CaptchaResolver'
import fetch from 'node-fetch'

export default class APICaptchaResolver {

    private captchaResolverUrl: string
    private captchaResolverToken: string

    public constructor(captchaResolverUrl: string, captchaResolverToken: string) {
        this.captchaResolverUrl = captchaResolverUrl
        this.captchaResolverToken = captchaResolverToken
    }

    public getResolver(): CaptchaResolver {
        return async (captchaUrl) => {
            const response = await fetch(this.captchaResolverUrl + '/' + captchaUrl, {
                headers: {
                    'Authorization': 'Bearer ' + this.captchaResolverToken
                }
            })
        
            if (! response.ok) {
                return null
            }
        
            const responseText = await response.text()
        
            if (responseText.length !== 8) {
                return null
            }
        
            return responseText
        }
    }
}
