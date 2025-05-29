const Discord = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState,AudioPlayerPausedState } = require('@discordjs/voice');

const client = new Discord.Client({
  // Make sure you have 'GuildVoiceStates' intent enabled
  intents: [Discord.GatewayIntentBits.Guilds,
  Discord.GatewayIntentBits.GuildVoiceStates,
  Discord.GatewayIntentBits.GuildMembers],
});
client.login(process.env.discord)

const player = createAudioPlayer();

var currentGuild;
async function findChannelOfUser(name) {
  await client.guilds.fetch({});

  for (const [guildId, guild] of client.guilds.cache) {
    try {
      const members = await guild.members.fetch();

      const member = members.find(m => m.user.username.toLowerCase() === name.toLowerCase());

      if (member && member.voice.channel) {
        currentGuild = member.guild;
        return member;
      }
    } catch (err) {
      console.error(`Erreur avec le serveur ${guild.name}:`, err);
    }
  }
}

var volume = 0.25;
var lastFile;
var lastName;
// Define the execute function for the play command
async function playSong(name, file) {
  var user = await findChannelOfUser(name);
  if(!user)
    return false;
  const connection = joinVoiceChannel({
    channelId: user.voice.channel.id,
    guildId: user.guild.id,
    adapterCreator: user.guild.voiceAdapterCreator,
  });
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
    const resource = createAudioResource(file,{inlineVolume:true});
    resource.volume.setVolume(volume);
    player.play(resource);
    connection.subscribe(player);
    lastFile=file;
    lastName=name;
    return true;
  } catch (err) {
    console.error('Error playing audio:', err);
    connection.destroy();
  }
}
player.on(AudioPlayerStatus.Idle, () => {
  if(lastFile !=undefined)
    playSong(lastName,lastFile);
});
function pause() {
  if(player.state.status==AudioPlayerStatus.Paused)
    player.unpause()
  else
    player.pause()
}
function setVolume(vol) {
  volume = (vol)*0.01;
  if(player.state.resource?.volume !=undefined)
  player.state.resource.volume.setVolume(volume)
}
module.exports = { playSong, pause, setVolume }