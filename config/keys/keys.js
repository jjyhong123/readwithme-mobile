module.exports = {
    google: {
        clientID: process.env.google_clientID,
        clientSecret: process.env.google_clientSecret,
        config: process.env.google_config,
        applicationCredentials: process.env.google_applicationCredentials

    },
    amazon: {
        accessKeyId: process.env.amazon_accessKeyId,
        region: process.env.amazon_region,
        secretAccessKey: process.env.amazon_secretAccessKey
    },
    session: {
        cookieKey: process.env.session_cookieKey
    }
}
