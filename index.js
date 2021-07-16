const Discord = require('discord.js')
const client = new Discord.Client()
const GDServerID = '746000425643147365'
require('dotenv').config()
const Tenor = require("tenorjs").client({
    "Key": process.env.TENOR_API_KEY,
    "Filter": "off", // "off", "low", "medium", "high", not case sensitive
    "Locale": "en_US", // Your locale here, case-sensitivity depends on input
    "MediaFilter": "minimal", // either minimal or basic, not case sensitive
    "DateFormat": "DD/MM/YYYY - H:mm:ss A" // Change this accordingly
})


client.on('ready', async () => {

    await getApp(GDServerID).commands.post({
        data: {
            name: 'headpat',
            description: 'Give someone headpats',
            options: [
                {
                    name: 'user',
                    description: 'The user to headpat',
                    required: true,
                    type: 6
                }
            ]
        }
    })

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const { name, options } = interaction.data
        const command = name.toLowerCase()
        let userID = ''

        if (options) {
            for (const option of options) {
                const { name, value, type } = option
                if (name === 'user' && type === 6) {
                    userID = value
                    break
                }
            }
        }

        const searchTerm = 'headpat'
        const limit = 20

        const imageResults = await Tenor.Search.Query(searchTerm, limit)
        const selectedImage = imageResults[Math.floor(Math.random()*limit)]
        const imageLink = selectedImage.media[0]['gif'].url

        let username = interaction.member.nick

        if (!username) {
            username = interaction.member.user.username
        }


        if (command === 'headpat') {
            const embed = new Discord.MessageEmbed()
                .setTitle('Headpat')
                .setDescription(`${interaction.member.nick||interaction.member.user.username} headpats <@${userID}>`)
                .setColor('#f2b1ee')
                .setImage(imageLink)

            await reply(interaction, embed)
        }
    })
})

const getApp = (guildID) => {
    const app = client.api.applications(client.user.id)
    if (guildID) {
        app.guilds(guildID)
    }
    return app
}

const reply = async (interaction, response) => {
    let data = {
        content: response
    }

    if (typeof response === 'object') {
        data = await createAPIMessage(interaction, response)
    }

    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data
        }
    })
}

const createAPIMessage = async (interaction, content) => {
    const { data, files } = await Discord.APIMessage.create(
        client.channels.resolve(interaction.channel_id),
        content
    )
        .resolveData()
        .resolveFiles()

    return { ...data, files }
}

client.login(process.env.DISCORD_BOT_TOKEN).then();