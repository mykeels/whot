module.exports = (name) => {
    return (message) => {
        const error = new Error(message)
        error.name = name
        return error
    }
}

module.exports.createTypeError = (name) => {
    return (message, type) => {
        const error = new TypeError(message)
        error.type = type
        error.name = name
        return error
    }
}