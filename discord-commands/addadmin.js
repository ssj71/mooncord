const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const admin = false
const master = true
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var database = discordDatabase.getGuildDatabase(guild)
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" <RoleAsTag/UserAsTag>")
        return;
    }
    if(args[0].startsWith("<@&")){
        var roleid = args[0].replace("<@&","").replace(">","")
        if(typeof guild.roles.cache.get(roleid) == "undefined"){
            channel.send("<@"+user.id+"> Invalid Role!")
            return
        }
        if(database.adminroles.includes(roleid)){
            channel.send("<@"+user.id+"> the Role "+args[0]+" is already a Admin Role!")
            return;
        }
        database.adminroles.push(roleid);
        discordDatabase.updateDatabase(database,guild)
        channel.send("<@"+user.id+"> added the Role "+args[0]+" to the Admin Roles!")
        
        return;
    }
    if(args[0].startsWith("<@")||args[0].startsWith("<@!")){
        var memberid = args[0].replace("<@!","").replace("<@","").replace(">","")
        if(typeof guild.members.cache.get(memberid) == "undefined"){
            channel.send("<@"+user.id+"> Invalid Member!")
            return
        }
        if(database.adminusers.includes(memberid)){
            channel.send("<@"+user.id+"> the Member "+args[0]+" is already a Admin!")
            return;
        }
        database.adminusers.push(memberid);
        discordDatabase.updateDatabase(database,guild)
        channel.send("<@"+user.id+"> the Member "+args[0]+" is now a Admin!")
        
        return;
    }
    channel.send("<@"+user.id+"> Invalid Arguments! Usage:\n> "+config.prefix+command+" <RoleAsTag/UserAsTag>")
    
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}