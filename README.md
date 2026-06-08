# Discord Movie Bot

A Discord bot that helps communities manage a shared movie watchlist with voting features for adding and removing movies.

## Features

- **Add Movies**: Add movies to the watchlist using their TMDB ID
- **Vote to Remove**: Create polls for the community to vote on removing movies from the list
- **View Watchlist**: Display all movies currently on the watchlist
- **Movie Details**: Shows movie information including release date, runtime, and poster image
- **Persistent Storage**: Watchlist is saved to a local file and persists between bot restarts

## Requirements

- Node.js (v18 or higher)
- Discord Bot Token
- Discord Server ID (Guild ID)
- TMDB API Key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Discord-movie-Bot.git
cd Discord-movie-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with your configuration (see [Configuration](#configuration))

4. Register the bot commands:
```bash
node src/register-commands.js
```

5. Start the bot:
```bash
node src/index.js
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id
TMDB_API_KEY=your_tmdb_api_key
```

### How to Get Your Credentials

#### Discord Bot Token & Application ID
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the TOKEN section, click "Copy" to get your bot token
5. Copy your Application ID from the General Information tab

#### Discord Server ID (Guild ID)
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your server and select "Copy Server ID"

#### TMDB API Key
1. Visit [TMDB](https://www.themoviedb.org/) and create an account
2. Go to your Account Settings → API
3. Request an API key (v3 auth) and copy the API Key

## Commands

### `/add_movie <tmdb_id>`
Adds a movie to the watchlist by its TMDB ID.

**Example:** `/add_movie 550` (adds Fight Club)

### `/vote_remove_movie <tmdb_id>`
Initiates a community vote to remove a movie from the watchlist. The vote runs for 12 seconds.

**Example:** `/vote_remove_movie 550`

### `/show_watch_list`
Displays all movies currently on the watchlist with details (title, release date, runtime, poster).

### `/help`
Shows instructions on how to use the bot.

## Finding TMDB IDs

To find the TMDB ID for a movie:
1. Visit [TMDB](https://www.themoviedb.org/)
2. Search for the movie you want to add
3. The ID is shown in the URL: `https://www.themoviedb.org/movie/550` (ID: 550)

Alternatively, you can search through the TMDB API directly using their documentation.

## Project Structure

```
Discord-movie-Bot/
├── src/
│   ├── index.js              # Main bot logic
│   ├── register-commands.js  # Command registration script
│   └── .env                  # Environment variables (not committed)
├── watchlist.txt             # Persistent storage for movie IDs
├── package.json              # Dependencies
└── README.md                 # This file
```

## How It Works

1. **Adding Movies**: Users add movies by providing the TMDB ID. The bot validates the movie exists and adds it to the watchlist.

2. **Voting System**: When removing a movie, the bot creates a poll where community members vote. After 12 seconds, if more people vote "Yes", the movie is removed.

3. **Persistence**: Movies are stored in `watchlist.txt` and reloaded when the bot restarts.

## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
