const config = require('../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
const fs = require("fs");
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var messageChannel
var requester
var file
var dcClient
var executeCommand = (async function(command,channel,user,guild,discordClient,websocketConnection){
    requester=user
    messageChannel=channel
    wsConnection=websocketConnection
    dcClient=discordClient
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" PrintFile")
        return;
    }
    var printfile = args[0]
    if(!printfile.endsWith(".gcode")){
        printfile=printfile+".gcode"
    }
    file = printfile
    websocketConnection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
    websocketConnection.on('message', handler);
})

async function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    if(typeof(messageJson.error)!="undefined"){
        wsConnection.removeListener('message', handler)
        messageChannel.send("<@"+requester.id+"> The File "+file+" couldn't be found!")
        return;
    }
    wsConnection.removeListener('message', handler)
    var thumbnail = ""
    var description = ""
    description = description.concat("Print Time: "+formatDateTime(messageJson.result.estimated_time*1000)+"\n")
    description = description.concat("Slicer: "+messageJson.result.slicer+"\n")
    description = description.concat("Slicer Version: "+messageJson.result.slicer_version+"\n")
    description = description.concat("Height: "+messageJson.result.object_height+"mm")
    if(typeof(messageJson.result.thumbnails)!="undefined"){
        thumbnail=messageJson.result.thumbnails[1].data
        fs.writeFile(__dirname+"/../temp/thumbnail"+file+".png",thumbnail,"base64",function(err){
            if(err){
                console.log(err)
                
                messageChannel.send("<@"+config.masterid+"> An error has occurred, Please Check the Console!")
                return;
            }
        })
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('File Informations')
        .setAuthor(file)
        .setDescription(description)
        .attachFiles(__dirname+"/../temp/thumbnail"+file+".png")
        .setThumbnail(url="attachment://thumbnail"+file+".png")
        .setTimestamp()
        .setFooter(requester.tag, requester.avatarURL());
    
        messageChannel.send(exampleEmbed);

        setTimeout(()=>{
            fs.unlink(__dirname+"/../temp/thumbnail"+file+".png", (err) => {
                if (err) {
                    console.error(err)
                    
                    messageChannel.send("<@"+config.masterid+"> An error has occurred, Please Check the Console!")
                    return
                }
            })
        },500)
        return
    }
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('File Informations')
	.setAuthor(file)
	.setDescription(description)
	.setThumbnail()
	.setTimestamp()
	.setFooter(requester.tag, requester.avatarURL());

    messageChannel.send(exampleEmbed);

}



function formatDateTime(msec) {
    const date = new Date(msec)
    var hours = date.getHours()
    hours=hours-1
    const h = hours >= 10 ? hours : "0"+hours
    const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
    return h+":"+m
}

module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}