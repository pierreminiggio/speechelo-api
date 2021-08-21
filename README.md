# speechelo-api

Use as a package :

```console
npm i pierreminiggio/speechelo-api
```


```javascript
import SpeecheloAPI from '@pierreminiggio/speechelo-api'
import OwenKidMale from '@pierreminiggio/speechelo-api/DTO/Voice/OwenKidMale'

const speecheloAPI = new SpeecheloAPI('speecheloLogin', 'speecheloPassword')
//speecheloAPI.puppeteerOptions = {headless: false}; // If you wanna see what's going on

(async() => {
    const owenOutputLink = await speecheloAPI.getSoundLink('Hello I\'m Owen', new OwenKidMale())
    console.log(owenOutputLink)
})()
```


Use as cli :
```console
git clone https://github.com/pierreminiggio/speechelo-api
node dist/cli.js speecheloLogin speecheloPassword inputFile owen-kid-male
```

You can also fork the project and use it as a Github Action
