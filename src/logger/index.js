const colors = require('./colors')

module.exports = (name) => {
    return {
        log: (message, ...args) => console.log(colors.FgCyan, `${name}:`, message, ...args, colors.Reset),
        warn: (message, ...args) => console.warn(colors.FgYellow, `${name} (warn):`, message, ...args, colors.Reset),
        error: (message, ...args) => console.error(colors.FgRed, `${name} (error):`, message, ...args, colors.Reset)
    }
}