const config = require('../config.json');
const discordDatabase = require('../discorddatabase')
var wsConnection
var dcClient
var enableEvent = (function(discordClient,websocketConnection){
    wsConnection=websocketConnection
    dcClient=discordClient
    discordClient.on('messageReactionAdd', handler)
    
})
function handler(messageReaction){
    if(messageReaction.me){
        return
    }
    var message = messageReaction.message
    if(message.author.id!=dcClient.user.id){
        return
    }
    var user = messageReaction.users.cache.array()[1]
    var guild = message.guild
    if(message.embeds.length==0){
      return
    }
    messageReaction.users.remove(user)
    var id = message.embeds[0].title.toLowerCase().replace(" ","")
    const reactionModule = require("../discord-reactions/"+id)
    if(reactionModule.needMaster()){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
            return;
        }
    }
    if(reactionModule.needAdmin()){
        if(!isAdmin(user,guild)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
            return;
        }
    }
    if(!isAllowed(user,guild)){
        channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
        return;
    }
    reactionModule(message,user,guild,messageReaction.emoji,dcClient,wsConnection);
}

function isAdmin(user,guild){
    var database = discordDatabase.getGuildDatabase(guild)
    var member = guild.member(user)
    if(user.id==config.masterid){
        return true
    }
    if(database.adminusers.includes(user.id)){
        return true
    }
    for(var memberole in member.roles.cache){
        if(database.adminroles.includes(memberole)){
            return true
        }
    }
    return false
}
function isAllowed(user,guild){
    var database = discordDatabase.getGuildDatabase(guild)
    var member = guild.member(user)
    if(database.accesseveryone==true){
        return true;
    }
    if(isAdmin(user,guild)){
        return true;
    }
    if(database.accessusers.includes(user.id)){
        return true
    }
    for(var memberole in member.roles.cache){
        if(database.accessroles.includes(memberole)){
            return true
        }
    }
    return false
}
module.exports = enableEvent;