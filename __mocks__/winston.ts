const winston = {
    createLogger: jest.fn().mockImplementation(function(args) {
        return {
            debug: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn()
        }
    }),
    format: {
        combine: jest.fn(),
        printf: jest.fn(),
        timestamp: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        MongoDB: jest.fn()
    }
}

module.exports = winston;