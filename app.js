// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function()
{
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector
({ appId: '17dd717a-3e45-45d3-8e10-4f5f6671c25b', appPassword: 'i2Eb0AH1fSjzRaeqqJmyvKA' });
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


// Root dialog for entry point in application
bot.dialog('/', [
    function (session,args, next) {
        session.send("Hi");
    }

]);

