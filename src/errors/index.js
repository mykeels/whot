module.exports = (name) => {
    return (message) => {
        const error = new Error(message)
        error.name = name
        return error
    }
}