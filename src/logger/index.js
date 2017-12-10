const colors = require('./colors')

module.exports = (name) => {
    return {
        log: (message, ...args) => console.log(`${name}:`, colors.FgCyan, message, ...args, colors.Reset),
        warn: (message, ...args) => console.warn(`${name} (warn):`, colors.FgYellow, message, ...args, colors.Reset),
        error: (message, ...args) => console.error(`${name} (error):`, colors.FgRed, message, ...args, colors.Reset)
    }
}