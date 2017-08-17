// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var o = require('odata');

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


bot.on('error', function(message) {
    console.log('[error] called'+message);
});

bot.on('conversationUpdate', function (message) {
    console.log("Called Conversation updated");
    if (message.membersAdded && message.membersAdded.length > 0) {
        var isSelf = false;
        var membersAdded = message.membersAdded
            .map(function (m) {
                isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');
        if (!isSelf) {
            console.log("not self");
            bot.send(new builder.Message()
                .address(message.address)
                .text('Welcome ' + membersAdded + "! How can I help you?"));
            bot.beginDialog(message.address,'/');
        }
    }
});

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};



// Root dialog for entry point in application
bot.dialog('/', [
    function (session,args, next) {
        result = args || {};
        if (result == undefined || result.response == undefined) {
            userAddress = session.message.address;
            builder.Prompts.text(session, "Hi " + session.message.user.name + " How can i help you?");
        }
        else if (result.response == "NU") {
            builder.Prompts.text(session, "You can say : 'Analytics'");
        }
    },
    function (session, results) {

        RootMenu(session,results);
    },
    function (session,results) {
        console.log("root final : " + results.response);
        RootMenu(session,results);
    }
]);

function RootMenu(session,results) {

    if (results.response.toUpperCase().indexOf("ANALYTICS") !== -1) {
        session.beginDialog('/Analytics');
    }
    else if (results.response.toUpperCase().indexOf("NO") != -1) {
        session.send("Ok then " + session.message.user.name + ", Goodbye :)");
        session.endDialog();
    }
    else if (results.response.toUpperCase().indexOf("YES") != -1) {
        session.beginDialog('/Analytics');
    } else {
        session.send("Not Trained...");
        session.beginDialog('/', {response: 'NU'});
    }
}


