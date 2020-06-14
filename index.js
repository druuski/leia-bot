const fs = require(`fs`);
const Discord = require(`discord.js`);
const config = require(`./config.json`);
const {
    Client,
    RichEmbed,
    Emoji,
    MessageReaction,
    Util
} = require(`discord.js`);


const LisID = `150056005487689728`;
const LithID = `189079074054995969`;
const setupCMD = `-rolesetup`;
const initialMessage = `**Pick a reaction to get a color role.**`;
const embedMessage = `Pick one or many~ Each role is a unique color!`;
const roles = [`He/Him`, `She/Her`, `They/Them`, `Peachy`, `Pink`, `Cream`, `Burgundy`, `Rose`, `Spring Green`, `Lime`, `Lavender`, `Ocean`, `Steam`, `Breeze`, `Pastel Blue`, `Ice`];
const reactions = [`🕶`, `🎀`, `🥞`, `🍑`, `💗`, `☕`, `🍷`, `🌸`, `💚`, `💛`, `💜`, `🌊`, `☁`, `🌨`, `💙`, `🧊`];
const embed = true;
const embedColor = `#000000`;

if (roles.length !== reactions.length) throw "Roles list and reactions list are not the same length!";

// Function to generate the role messages, based on your settings
function generateMessages() {

  let messages = [];
  for (const role of roles) messages.push({
    role,
    message: `React below to get the **"${role}"** role!`
  }); //DONT CHANGE THIS
  return messages;

}

// Function to generate the embed fields, based on your settings and if you set "const embed = true;"
function generateEmbedFields() {

  return roles.map((r, e) => {
    return {
      emoji: reactions[e],
      role: r
    };
  });
}

// Checks if a role exists or not
function checkRole(guild, role) { 
  const checkRole = guild.roles.cache.find(r => r.name === role);
  if (checkRole) return true;
  else return false;

}


const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(`.js`));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.login(config.token);

// Ready - Prints to console that the bot is online.
client.on(`ready`, () => {
    console.log(`I'm online! My name is ${client.user.username}.`);
    client.user.setActivity(`v1.0.0`);
});

client.on(`message`, async message => {
    const prefix = `-`;
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

// Ping - Responds with Bot and API Latency.
    if (cmd === `ping`) {
        const msg = await message.channel.send(`Pinging...`);
        msg.edit(`Pong!\nBot Latency is ${Math.floor(msg.createdAt - message.createdAt)}ms.\nAPI Latency ${Math.round(client.ws.ping)}ms.`);
        } 

// Say - Repeats the user's message after deleting it.
    if (cmd === `say`) {
        const sayMessage = args.slice(0).join(` `)
        if (!sayMessage)    // Checks if argument contains any content.
            message.reply(`Nothing to say?`).then(message => message.delete(7000)); // If the argument contains no content, the  bot says so and ends the process.
        if (sayMessage) // Does the thing.
            return message.channel.send(`${sayMessage}`);
        }

// Kick - Kicks a mentioned user from the server and sends the user a DM with a reason.
    if (cmd === `kick`) {
        if (!message.member.roles.cache.some(r => `Mod`.includes(r.name) || `Admin`.includes(r.name)))  //Checks for permission.
            return message.reply(`This command is for moderators only.`);

        var taggedUser = message.mentions.users.first();
        let reason = args.slice(0).join(' ');   // Assembles the reason scentence from the argument array.

        if (!taggedUser.kickable)
            return message.reply(`I'm unable to kick ${taggedUser.Username}. Maybe they out rank me?`);

        if (!taggedUser)    // If there is no user tagged, the bot returns an error.
            return message.reply(`You forgot to tag a user!`);
        
        if (!reason) reason = `No reason.`;    //If no reason is provided, the reason is set to "No reason."

        if (reason)
            taggedUser.send(`Hello there, ${taggedUser.username}.\nYou've been kicked from the server for the following reason: ${reason}`);
        
        await taggedUser.kick(reason)   // Does the thing.
            .catch(error => message.reply(`I couldn't kick ${taggedUser.username} because of : ${error}.`));
            message.reply(`${taggedUser.username} has been kicked from the server for the following reason: ${reason}.`);
        }

// Ban - Bans a mentioned user from the server and send the user a DM with a reason.
    if (cmd === `ban`) {
        if (!message.member.roles.cache.some(r => `Mod`.includes(r.name) || `Admin`.includes(r.name)))  // Checks for permission.
            return message.reply(`This command is for moderators only.`);

        var taggedUser = message.mentions.users.first();
        let reason = args.slice(0).join(' ');   // Assembles the reason scentence from the argument array.

        if (!taggedUser.bannable)
            return message.reply(`I'm unable to ban ${taggedUser.Username}. Maybe they out rank me?`);

        if (!taggedUser)    // If there is no user tagged, the bot returns an error.
            return message.reply(`You forgot to tag a user!`);
    
        if (!reason) reason = `No reason.`;    // If no reason is provided, the reason is set to "No reason."

        if (reason)
            taggedUser.send(`Hello there, ${taggedUser.username}.\nYou've been banned from the server for the following reason: ${reason}.`);
    
        await message.guild.members.ban(taggedUser, ``) // Does the thing.
            .catch(error => message.reply(`I couldn't ban ${taggedUser.username} because of : ${error}.`));
            message.reply(`${taggedUser.username} has been banned from the server for the following reason: ${reason}`);
        }

// DICE - DND dice rolling using dice notation.
    if (cmd === `d` || cmd === `roll` || cmd === `dice` || cmd === `r`) {
        if (args.length !== 1 || !args) // stops the code if there is no argument.
            return message.reply(`Proper command syntax is as follows: -d 2d10 will roll a 10 sided die twice.`);
        if (args.length == 1)
            var dice = args[0].split(`d`);  // splits the arguments into the numbers of rolls and number of sides on the die being rolled.
            var rolls = dice[0];    // number of rolls.
            var sides = Math.floor(dice[1]);    // numbers of sides to the die being rolled.
        if (rolls >= 20)    // maximum number of rolls is 20, to prevent bot crashing.
                return message.reply(`you are rolling too many dice.`);
        if (rolls < 20) // if the number of rolls is below the max, the loop begins.
            for (let i = 0; i < rolls; i++) {
                var results = [];
                const rannum = await Math.floor(Math.random() * (sides - 1 + 1)) + 1; // random number generation based on maxmimum being the sides of the dice.
                results.push(rannum);
            }
            var sum = results.reduce(function(a, b) {
                return a + b;
            }, 0);
            var allresults = results.join(`,`);
            return message.channel.send(`${message.author.username} rolled ${allresults}, for a total ${sum}.`)
        }

// Cutie - Tags a user and reminds them they are cute.
    if (cmd === `qt`) {
        var taggedUser = message.mentions.users.first();
        if (args.length < 1)
            return message.reply(`Don't forget to tag a cutie~!`);
        if (taggedUser)
            return message.channel.send(`${taggedUser} is a cutie~`);
        }

// Pat - Headpats.
    if (cmd === `pat`) {
        var taggedUser = message.mentions.users.first();
        if (args.length < 1)
            return message.reply(`Don't forget to tag someone!`);
        if (taggedUser)
            return message.channel.send(`Pats ${taggedUser} gently... <3`);
        }

// Reaction roles
    if ((message.author.id == LisID || message.author.id == LithID) && message.content.toLowerCase() == setupCMD) {

        if (!embed) {

            if (!initialMessage) throw "The 'initialMessage' property is not set. Please do this!";

            message.channel.send(initialMessage);

            const messages = generateMessages();
            messages.forEach((obj, react) => {
            
                if (!checkRole(message.guild, obj.role)) throw `The role '${obj.role}' does not exist!`;

                message.channel.send(obj.message).then(async m => {
                const emoji = reactions[react];
                const customEmote = client.emojis.cache.find(e => e.name === emoji);

            if (!customEmote) await m.react(emoji);
            else await m.react(customEmote.id);
        });
    });
    } else {
        if (!embedMessage) throw "The 'embedMessage' property is not set. Please set it!";
        const roleEmbed = new Discord.MessageEmbed()
        .setDescription(embedMessage)

        if (embedColor) roleEmbed.setColor(embedColor);

        const fields = generateEmbedFields();
        if (fields.length >= 25) throw "That maximum roles that can be set for an embed is 25!";

        for (const f of fields) {
            if (!checkRole(message.guild, f.role)) throw `The role '${f.role}' doesn't exist!`;

            const emoji = f.emoji;
            const customEmote = client.emojis.cache.find(e => e.name === emoji);

            if (!customEmote) roleEmbed.addField(emoji, f.role, true);
            else roleEmbed.addField(customEmote, f.role, true);
        }

        message.channel.send(roleEmbed).then(async m => {
            for (const r of reactions) {
                const emoji = r;
                const customEmote = client.emojis.cache.find(e => e.name === emoji);

                if (!customEmote) await m.react(emoji);
                else await m.react(customEmote.id);
            }
        });
        }
    }
});

const events = {

    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  
};
  
// Roles - This event handles adding/removing users from the role(s) they choose.
client.on('raw', async event => {
  
    if (!events.hasOwnProperty(event.t)) return;
  
    const {
         d: data
    } = event;
    const user = client.users.cache.get(data.user_id);
    const channel = client.channels.cache.get(data.channel_id);
  
    const message = await channel.messages.fetch(data.message_id);
    const member = message.guild.members.cache.get(user.id);
  
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.cache.get(emojiKey);
  
    if (!reaction) {
  
        // Create an object that can be passed through the event like normal
          const emoji = new Emoji(client.guilds.cache.get(data.guild_id), data.emoji);
          reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }
  
    if (message.author.id === client.user.id && (message.content !== initialMessage || (message.embeds[0]))) {
  
      if (!embed) {
        const re = `\\*\\*"(.+)?(?="\\*\\*)`;
        const role = message.content.match(re)[1];
  
            if (member.id !== client.user.id) {
                const roleObj = message.guild.roles.cache.find(r => r.name === role);

                if (event.t === "MESSAGE_REACTION_ADD") {
                    member.roles.add(roleObj.id);
                } else {
                    member.roles.remove(roleObj.id);
                }
            }

        } else {

            const fields = message.embeds[0].fields;

            for (let i = 0; i < fields.length; i++) {

                if (member.id !== client.user.id) {

                    const role = message.guild.roles.cache.find(r => r.name === fields[i].value);

                    if ((fields[i].name === reaction.emoji.name) || (fields[i].name === reaction.emoji.toString())) {

                        if (event.t === "MESSAGE_REACTION_ADD") {
                            try {
                                member.roles.add(role.id);
                            } catch (reason) {
                                return;
                            }
                                break;
                            } else {
                            try {
                                member.roles.remove(role.id);
                            } catch (reason) {
                                return;
                            }
                               break;
                        }
                    }
                }
            }
        }
    }
});