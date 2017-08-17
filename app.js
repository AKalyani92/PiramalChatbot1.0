// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
//var o = require('odata');

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

bot.dialog('/Analytics',[
    function (session,args) {
        builder.Prompts.choice(session,"Please select a dashboard","CPO Dashboard|Supplier Visibility|Manager Dashboard|Supplier Compliance",
        {
            listStyle: builder.ListStyle.button,
            maxRetries: 2,
            retryPrompt: 'Please Provide analytics dashboard'
        });
    },
    function (session,results) {
        if (results.response == undefined) {
            session.endDialog();
            session.replaceDialog('/');
        }
        else {
            var option = results.response.entity;
            var cards = {};
            if (option.toUpperCase().indexOf("CPO") !== -1) {
                cards = CreateCPOCards();
            }
            else if (option.toUpperCase().indexOf("VISIBILITY") !== -1) {
                cards = CreateSupplierVisibilityCards();
            }
            else if (option.toUpperCase().indexOf("MANAGER") !== -1) {
                cards = CreateManagerDashboardCards();
            }
            else if (option.toUpperCase().indexOf("COMPLIANCE") !== -1) {
                cards = CreateSupplierComplianceCards();
            }

            var reply =
                new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(cards);

            session.send(reply);

            session.beginDialog('/ConversationEnd');
        }
    },
    function (session,results) {
        session.endDialogWithResult(results);
    }
])


bot.dialog('/ConversationEnd',[
    function (session) {
        session.conversationData  = {};
        builder.Prompts.text(session, 'Would you like to see another dashboard?');
    }
]);

//check if reset/exit
bot.dialog('/Reset', [
    function (session,response) {
        session.beginDialog('/');
    }
])

// To Clear user Data cache
bot.dialog('/ClearData', [
    function (session) {
        session.userData.isVerified = false;
        session.beginDialog('/ConversationEnd');
    }
]);

function CreateCPOCards(session) {
    return[
        CreateCard(session, 'SpendAnalytics','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/SpendTrend.PNG'),
        CreateCard(session,'Top 10 Companies','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10Companies.PNG'),
        CreateCard(session,'Top 10 Suppliers','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10Suppliers.PNG'),
        CreateCard(session,'Top 10 Spend Analytics','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10SpendCategories.PNG')
    ];
}

function CreateSupplierVisibilityCards(session) {
    return[
        CreateCard(session,'Top 10 Materials','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10Materials.PNG'),
        CreateCard(session,'Top 10 Plants','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10Plant.PNG'),
        CreateCard(session,'Top 10 Suppliers','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/T10Suppliers2.PNG')
    ];
}

function CreateManagerDashboardCards(session) {
    return[
        CreateCard(session,'Direct vs Indirect','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/DIRECTvsINDIRECT.PNG'),
        CreateCard(session,'Non Po Profiling','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/NON_PO_PROFILING.PNG'),
        CreateCard(session,'Off Contract Profiling','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/OFF_CONTRACT_PROFILING.PNG'),
        CreateCard(session,'Payment Term Inconsistencies','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/PAYMENT_TERM_INCONSISTENCIES.PNG'),
        CreateCard(session,'After The Fact Spend','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/AFTER_THE_FACT_SPEND.PNG')
    ];
}

function CreateSupplierComplianceCards(session) {
    return[
        CreateCard(session,'Actual vs Budgeted','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/ACTUALvsBUDGETED.PNG'),
        CreateCard(session,'Direct vs Indirect','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/DIRECTvsINDIRECT2.PNG'),
        CreateCard(session,'Send Category Analysis','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/SENDCATEGORY_ANALYSIS.PNG')
    ];
}

function CreateCard(session,title,text,subtitle,imageURL) {
    return new builder.HeroCard(session)
        .title(title)
        /*.subtitle(subtitle)
         .text(text)*/
        .images([
            builder.CardImage.create(session, imageURL)
        ])
        .buttons([
            builder.CardAction.openUrl(session, imageURL, 'See More')
            /*,builder.CardAction.openUrl(session, 'http://neo.bcone.com/sense/app/edc8d0e8-ce10-4160-9ba7-25b63904c653/sheet/JkmJaP/state/analysis', 'Go To')*/
        ])
}

