import CaptchaResolver from './CaptchaResolver';
export default class APICaptchaResolver {
    private captchaResolverUrl;
    private captchaResolverToken;
    constructor(captchaResolverUrl: string, captchaResolverToken: string);
    getResolver(): CaptchaResolver;
}
