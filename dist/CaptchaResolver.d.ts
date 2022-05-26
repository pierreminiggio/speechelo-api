declare type CaptchaResolver = (captchaUrl: string) => Promise<string | null>;
export default CaptchaResolver;
