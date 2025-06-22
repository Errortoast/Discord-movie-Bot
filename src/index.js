require('dotenv').config();
const file = require("fs");
const { MovieDb } = require('moviedb-promise');
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

storedMovies = [];
const moviedb = new MovieDb(process.env.TMDB_API_KEY);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessagePolls,
    ],
});

//#region Functions

async function getMovieTitle(movieID) {
    try {
        // Fetch movie details using the movieInfo endpoint
        const movie = await moviedb.movieInfo({ id: movieID });
        return movie.title;
    } catch (err) {
        console.error('Error fetching movie details:', err);
    }
}

async function formatMovie(movieID) {
    const movie = await moviedb.movieInfo({ id: movieID });

    const mainPageUrl = `https://www.themoviedb.org/movie/${movie.id}`;

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    const movieEmbed = new EmbedBuilder()
        .setTitle(`${movie.title} (${movie.release_date})`)
        .setURL(mainPageUrl)
        .setDescription(`Runtime (Minutes): ${movie.runtime}`)
        .setThumbnail(posterUrl);

    return movieEmbed;
}

function addMovie(id, interaction) {
    getMovieTitle(id).then(title => {
        if (title != undefined) {
            storedMovies.push(id);
            writeMoviesToFile();
            interaction.reply("OK! " + title + " has been added to the list!")
        }
        else {
            interaction.reply("Could not find requested movie. Check if you have entered the right ID")
        }
    });
}

async function voteRemoveMovie(id, interaction) {
    updateStoredMovies(interaction);
    const title = await getMovieTitle(id);

    if (storedMovies.indexOf(id) != -1) {

        await interaction.reply({
            poll: {
                question: { text: `${interaction.user.username} would like to remove ${title}` },
                answers: [
                    {
                        text: "Yes. Get it out of here",
                        emoji: '👍',
                    },
                    {
                        text: "No. Leave it",
                        emoji: '👎',
                    },
                ],
                allowMultiselect: false,
                duration: 12,
            }
        });

        const pollMessage = await interaction.fetchReply();

        setTimeout(async () => {
            const targetPoll = await interaction.channel.messages.fetch(pollMessage.id);
            targetPoll.poll.end();

            const answers = [];
            targetPoll.poll.answers.forEach(answer => {
                answers.push(answer.text, answer.voteCount);
            });

            if (answers[1] > answers[3]) {
                updateStoredMovies();
                const movieIndex = storedMovies.indexOf(id);
                if (movieIndex !== -1) {
                    storedMovies.splice(movieIndex, 1);
                    writeMoviesToFile();
                }
            } else if (answers[1] < answers[3]) {
                // Send a message to inform that the vote failed
            }
        }, 12 * 60 * 60 * 1000);
    } else {
        interaction.reply(`The movie ${title} was not found in the watch list. Please check if you entered the correct ID.`);
        return;
    }
}

function showMovieList(interaction) {
    updateStoredMovies(interaction);
    if (storedMovies == []) { interaction.reply('Movie list is empty. Please add a movie'); return; }

    const addMovie = new ButtonBuilder()
        .setLabel("Add Movie")
        .setCustomId('addMovieButton')
        .setStyle(ButtonStyle.Primary);
    const voteRemove = new ButtonBuilder()
        .setLabel("Remove Movie")
        .setCustomId('voteRemoveButton')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(addMovie)
        .addComponents(voteRemove);


    Promise.all(storedMovies.map(id => formatMovie(id)))
        .then(formattedMovies => {
            interaction.reply({ embeds: formattedMovies, components: [row] });
        });
}

function writeMoviesToFile() {
    file.writeFileSync("watchlist.txt", storedMovies.join("\n"), 'utf-8');
}

function updateStoredMovies(interaction) {
    if (file.readFileSync("watchlist.txt", 'utf-8').split("\n").map(Number) != 0) {
        storedMovies = file.readFileSync("watchlist.txt", 'utf-8').split("\n").map(Number);
        return storedMovies;
    } else {
        if (interaction != null && interaction != undefined) {
            interaction.reply("Watchlist is empty")
        }
    }
}

async function addMovieModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('addMovieModal')
        .setTitle('Add Movie');

    const idInput = new TextInputBuilder()
        .setCustomId('idInput')
        .setLabel('Enter TMBD ID of the movie you want to add')
        .setStyle(TextInputStyle.Short);

    const inputRow = new ActionRowBuilder().addComponents(idInput);
    modal.addComponents(inputRow);

    await interaction.showModal(modal);


    const filter = (interaction) => interaction.customId === 'addMovieModal';
    interaction
        .awaitModalSubmit({ filter, time: 300000 })
        .then((modalInteraction) => {
            const movieID = modalInteraction.fields.getTextInputValue('idInput');
            addMovie(movieID, modalInteraction);
        });
}

async function voteRemoveModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('voteRemoveModal')
        .setTitle('Remove Movie');

    const idInput = new TextInputBuilder()
        .setCustomId('idInput')
        .setLabel('Enter TMBD ID of the movie you want to remove')
        .setStyle(TextInputStyle.Short);

    const inputRow = new ActionRowBuilder().addComponents(idInput);
    modal.addComponents(inputRow);

    await interaction.showModal(modal);


    const filter = (interaction) => interaction.customId === 'voteRemoveModal';
    interaction
        .awaitModalSubmit({ filter, time: 300000 })
        .then((modalInteraction) => {
            const movieID = modalInteraction.fields.getTextInputValue('idInput');
            voteRemoveMovie(Number(movieID), modalInteraction);
        });
}

//#endregion

client.on('ready', (c) => {
    updateStoredMovies();
    console.log(`${c.user.username} is online`);
});

client.on('interactionCreate', (interaction) => {
    if (interaction.commandName === "add_movie") {
        addMovie(interaction.options.get('tmdb_id').value, interaction);
    }
    else if (interaction.commandName === "vote_remove_movie") {
        voteRemoveMovie(interaction.options.get('tmdb_id').value, interaction);
    }
    else if (interaction.commandName === "show_watch_list") {
        showMovieList(interaction);
    }
    else if (interaction.isButton()) {
        if (interaction.customId === 'addMovieButton') {
            addMovieModal(interaction);
        }
        if (interaction.customId === 'voteRemoveButton') {
            voteRemoveModal(interaction);
        }
    }
    
})

client.login(process.env.TOKEN);