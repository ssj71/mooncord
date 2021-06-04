const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const colors = require('colors')

const config = require('../config.json')

colors.setTheme({
  database: 'grey',
  error: 'brightRed'
})

execute()

async function execute() {
    await migrateDatabase()
    migrateConfig()
}

function migrateConfig() {
    if (typeof (config.prefix) !== 'undefined') {
        console.log(logSymbols.info, 'Migrate 0.0.1 Config to 0.0.2 Config'.database)
        config.prefix = undefined
        config.botapplicationkey = ""
        config.botapplicationid = ""
        saveData(config, '../config.json')
    }
}
async function migrateDatabase() {
    const firstDatabasePath = path.resolve(__dirname, '../discorddatabase.json')
    try {
        if (fs.existsSync(firstDatabasePath)) {
            console.log(logSymbols.info, 'Migrate 0.0.1 Database to 0.0.2 Database'.database)
            const firstDatabase = require('../discorddatabase.json')
            let newDatabase = {
                "version": "0.0.2",
                "guilds": firstDatabase
            }

            const stringNewDatabase = JSON.stringify(newDatabase)
                .replace(/(statuschannels)/g, 'broadcastchannels')
            
            newDatabase = JSON.parse(stringNewDatabase)

            for (const guildid in newDatabase.guilds) {
                newDatabase.guilds[guildid].accessrole = undefined
                newDatabase.guilds[guildid].accessusers = undefined
                newDatabase.guilds[guildid].accesseveryone = undefined
            }
            
            saveData(newDatabase, '../database.json')

            await fs.unlinkSync(firstDatabasePath)
        }
    } catch (error) {
        console.error((error).error)
    }
}

function saveData(datadata, datapath) {
    if (!fs.existsSync(path.resolve(__dirname, datapath))) {
        const newFileStream = fs.createWriteStream(path.resolve(__dirname, datapath))
        newFileStream.once('open', () => {
            newFileStream.write('{}')
            newFileStream.end()
        })
    }
    fs.writeFile(path.resolve(__dirname, datapath), JSON.stringify(datadata, null, 4), (err) => {
    if (err) { throw err }
        console.log(logSymbols.info, `The Data for ${datapath} has been migrated!`.database)
        if (datapath === '../config.json') {
            console.log(logSymbols.warning, `Please Read the Update Notes, you need to reconfigure the Bot!`.database)
            process.exit(5)
        }
    })
}