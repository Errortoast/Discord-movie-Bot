require('dotenv').config();
const { REST, Routes, Application, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'add_movie',
        description: 'Adds a movie to the watch list',
        options: [
            {
                name: 'tmdb_id',
                description: 'TMDB ID of the movie you want to add',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
    {
        name: 'vote_remove_movie',
        description: 'Vote to remove movie from list',
        options: [
            {
                name: 'tmdb_id',
                description: 'TMDB ID of the movie you want to remove',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
    {
        name: 'show_watch_list',
        description: 'Displays watch list',
    },
    {
        name: 'help',
        description: 'Lists how to use the bot',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering commands')

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        )

        console.log('Commands registered successfully')
    } catch (error) {
        console.log(error);
    }
})();