require('dotenv').config();
const Discord = require('discord.js');
const Perspective = require('perspective-api-client');
const perspective = new Perspective({
    apiKey: process.env.PERSPECTIVE_API
});


const treshhold = 0.75;
const spamThreshhold = 0.70;

async function evaluateMessage(message) {
    try {
        const result = await perspective.analyze({
            "comment": {
                "text": message
            },
            "requestedAttributes": {
                "TOXICITY": {},
                "INSULT": {},
                "SPAM": {}
            },
            "doNotStore": true,
        });
        if (result.attributeScores.TOXICITY.summaryScore.value > treshhold ||
            result.attributeScores.INSULT.summaryScore.value > treshhold ||
            result.attributeScores.SPAM.summaryScore.value > spamThreshhold
        ) {
            return true;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});


client.on('message', async (message) => {
    if (!message.guild || message.author.bot) return;

    let detected = false;
    try {
        detected = await evaluateMessage(message.content);
    } catch (err) {
        console.log(err);
    }

    if (detected) {
        message.delete();
        message.reply('This is a christian server. Don\'t be stupid.')
            .then(msg => {
                msg.delete({
                    timeout: 8000
                });
            });
        return;
    }


})

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author.bot) return;
    let detected = false;
    try {
        detected = await evaluateMessage(newMessage.content);
    } catch (err) {
        console.log(err);
    }

    if (detected) {
        newMessage.delete();
        newMessage.reply('This is a christian server. Don\'t be stupid.')
            .then(msg => {
                msg.delete({
                    timeout: 8000
                });
            });
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);