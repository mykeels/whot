const logger = require('../src/logger')('logger.test.js')

describe('Logger', () => {
    it('should log', () => {
        logger.log('hello')
    })

    it('should log error', () => {
        logger.error('error')
    })

    it('should warn', () => {
        logger.warn('warning')
    })
})