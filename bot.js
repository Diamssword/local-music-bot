const { Player,useMainPlayer, QueryType,useTimeline, QueueRepeatMode } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const Discord = require('discord.js')
const client = new Discord.Client({
  // Make sure you have 'GuildVoiceStates' intent enabled
  intents: [ Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMembers],
});
 client.login(process.env.discord)
// this is the entrypoint for discord-player based application
const player = new Player(client);
 
// Now, lets load all the default extractors
player.extractors.loadMulti(DefaultExtractors).then(()=>{
    player.events.on('playerStart', (queue, track) => {
        // we will later define queue.metadata object while creating the queue
       // queue.metadata.channel.send(`Started playing **${track.title}**!`);
      });
})
var currentGuild;
async function findChannelOfUser(name)
{
  await client.guilds.fetch({});
  
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      const members = await guild.members.fetch();

      const member = members.find(m => m.user.username.toLowerCase() === name.toLowerCase());

      if (member && member.voice.channel) {
        currentGuild=member.guild;
       return member;
      }
    } catch (err) {
      console.error(`Erreur avec le serveur ${guild.name}:`, err);
    }
  }
}
// Define the execute function for the play command
async function playSong(name,file) {
  var user=await findChannelOfUser(name);
  // Get the player instance
  const player = useMainPlayer();
  try {
    console.log(file)
    // Play the song in the voice channel
    const queue = player.nodes.get(currentGuild.id);
    
    const result = await player.play(user.voice.channel, file, {
      searchEngine: QueryType.FILE,
      nodeOptions: {
        volume,
        metadata: { channel: user.voice.channel }, // Store text channel as metadata on the queue
      },
    });
    queue?.setRepeatMode(QueueRepeatMode.OFF)
    queue?.node.skip()
    setTimeout(()=>queue?.setRepeatMode(QueueRepeatMode.TRACK),5000)
    
    return result;
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
  }
}
function pause() {
  if(!currentGuild)
    return;
  
  const queue = player.nodes.get(currentGuild.id);
  var time=useTimeline({node:queue});
  if(time.paused)
    time.resume()
  else
    time.pause()
}
var volume=10;
function setVolume(vol)
{
  volume=vol;
  if(!currentGuild)
    return;
  
  const queue = player.nodes.get(currentGuild.id);
  var time=useTimeline({node:queue});
  time?.setVolume(vol);
}
module.exports={playSong,pause,setVolume}