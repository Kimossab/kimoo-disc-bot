# KIMOO DISCORD BOT

### Requirements

- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/en/docs/install#windows-stable) or [npm](https://www.npmjs.com/)
- [Discord application bot token](https://discordapp.com/developers/applications/)
- [node-gyp](https://github.com/nodejs/node-gyp)
- [node-pre-gyp](https://www.npmjs.com/package/node-pre-gyp)

---

### Running

- Rename **.example.env** to **.env**
- Insert your bot token in **TOKEN** field in the **.env** file
- (Optional) Insert your discord account ID in the **OWNER** field
- Install dependencies with `yarn install` or `npm i` in the command line
- For the first time or when you update the bot you should run either `yarn prod` or `npm run prod`
- Following times you just need to run `yarn start` or `npm run start`
- If you just want to compile the code run `yarn build` or `npm run build`
