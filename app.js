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
        builder.Prompts.choice(session,"Please select a dashboard","FTM and YTD Analysis|Headcount and Spend Overview|Headcount Details|Headcount Overview|Top N Analysis",
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
            if (option.toUpperCase().indexOf("FTM AND YTD ANALYSIS") !== -1) {
                cards = CreateCPOCards();
            }
            else if (option.toUpperCase().indexOf("HEADCOUNT AND SPEND OVERVIEW") !== -1) {
                cards = CreateSupplierVisibilityCards();
            }
            else if (option.toUpperCase().indexOf("HEADCOUNT DETAILS") !== -1) {
                cards = CreateManagerDashboardCards();
            }
            else if (option.toUpperCase().indexOf("HEADCOUNT OVERVIEW") !== -1) {
                cards = CreateSupplierComplianceCards();
            }
            else if (option.toUpperCase().indexOf("TOP N ANALYSIS") !== -1) {
                cards = CreateNAnalysisCards();
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
        CreateCard(session, 'Headcount: Actual vs Budgeted  FTM ','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Ftm+and+YTD+analysis/actual+vs+budgeted+headcount+FTM+Mar+2016-1.png'),
        CreateCard(session,'Headcount: Actual vs Budgeted  YTD','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Ftm+and+YTD+analysis/actual+vs+budgeted+headcount+YTD-2.png'),
        CreateCard(session,'Spend: Actual vs Budgeted  FTM Mar 2016','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Ftm+and+YTD+analysis/actual+vs+budgeted+Spend+FTM+Mar+2016-+3.png'),
        CreateCard(session,'Spend: Actual vs Budgeted  YTD Details','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Ftm+and+YTD+analysis/actual+vs+budgeted+Spend+YTD+Details+4.png')
    ];
}

function CreateSupplierVisibilityCards(session) {
    return[
        CreateCard(session, 'Monthly Trend: Consolidated Spend and Headcount ','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+and+spend+overview/Consolidated+Spend+and+headcount+Monthly+trend-1.png'),
        CreateCard(session,'Spend and Headcounts by Employee Function','sample subtitle','Sample Text for demo','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+and+spend+overview/Spend+and+Headcounts+by+employee+Function.png')
       ];
}

function CreateManagerDashboardCards(session) {
    return[
        CreateCard(session,'Spend: Period Analysis- Actual vs Budgeted vs Previous Year','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+Details/Actual+vs+budget+vs+previous+yr-1.png'),
        CreateCard(session,'Headcount:Period Analysis- Actual vs Budgeted vs Previous Year','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+Details/Actual+vs+budget+vs+previous+y+yr-2.png'),
        CreateCard(session,'Spend: Business Wise Allocation  % Details','Sample Text for demo','sample subtitle','https://cuianalytics.blob.core.windows.net/c1analytics/OFF_CONTRACT_PROFILING.PNG')
            ];
}

function CreateSupplierComplianceCards(session) {
    return[
        CreateCard(session,'Headcount Office Wise: Actual vs Budgeted','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+overview/Actual+vs+Budgeted+Headcou+1.png'),
        CreateCard(session,'Headcount Period Wise: Actual vs Budgeted','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+overview/Actual+vs+Budgeted+Headcount+by+period+2.png'),
        CreateCard(session,'Spend Share By Site, Business and Employee Function','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Headcount+overview/Spend+Share+by+SIte%2C+Business+and+Employee+-3.png')
            ];
}

function CreateNAnalysisCards(session){
    return[
        CreateCard(session,'Top 10 Spend by site','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Top+NAnalysis/Top+10+Spend+by+site-1.png'),
        CreateCard(session,'Top 10 Spend by Business','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Top+NAnalysis/Top+10+Spend+by+Business+-2.png'),
        CreateCard(session,'Top 10 Spend by Employee, Business and Employee Function','Sample Text for demo','sample subtitle','https://s3.ap-south-1.amazonaws.com/piramalchatbot/Top+NAnalysis/Top+10+Spend+by+Employee+-3.png')
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

