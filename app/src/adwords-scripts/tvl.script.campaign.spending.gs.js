// https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp_videocampaignselector

var SUBJECT = 'AdWords campaign spending';
var FINANCIAL_API_URL = 'http://data.fixer.io/api/latest';
var DEBUG_TEXT_COLOR = '#b7b7b7';
var DEV_TEST_ACCOUNTS = [
    '903-693-9682',
    '184-366-6419',
    '711-200-1528', // Unknown account "Speedy" with paused campaigns inside, ignore the account.
    '528-559-3783'  // Unknown account "Webs Glu" with paused campaigns inside, ignore the account.
];

var PROD_CONFIG = {
    'ALERT_EMAIL': 'clientservices@glucompany.com',
    'ALERT_EMAIL_CC': 'devteam@theviralab.com',
    'FINANCIAL_API_ACCESS_KEY': 'b0bd8286b09fa09a66074c8c91708d10',
    'DEBUG_DATA_ALLOWED': false  // With this mode we print the original bidding data without conversion (false)
};
var DEV_CONFIG = {
    'ALERT_EMAIL': 'irakli.alaverdashvili@theviralab.com',
    // 'ALERT_EMAIL': 'alvaro.rivas@theviralab.com',
    'ALERT_EMAIL_CC': '',
    'FINANCIAL_API_ACCESS_KEY': 'f7dc2f7c405305a5cfca03d61d6e4072',
    'DEBUG_DATA_ALLOWED': false
};

var CONFIG = PROD_CONFIG;


/**
 * The main function
 */
function main() {
    var accounts = MccApp.accounts().get();
    var exchangeRates = getCurrencyExchangeRates();

    var data = [];
    while (accounts.hasNext()) {
        var account = accounts.next();
        /**
         * Avoid dev-test accounts
         */
        if (isDevAccount(account.getCustomerId())) {
            continue;
        }
        var accountData = getAccountData(account, exchangeRates);
        if (accountData) {
            data.push(accountData);
        }
    }

    var body = renderHtml(data);
    sendEmail(body);
}

/**
 * If the account is for development
 * @param accountId
 * @returns {boolean}
 */
function isDevAccount(accountId) {
    return (DEV_TEST_ACCOUNTS.indexOf(accountId) !== -1);
}

/**
 * Send email
 */
function sendEmail(body) {
    MailApp.sendEmail({
        to: CONFIG['ALERT_EMAIL'],
        cc: CONFIG['ALERT_EMAIL_CC'],
        subject: SUBJECT,
        htmlBody: body
    });
}

/**
 * Get all accounts data
 */
function getAccountData(account, exchangeRates) {
    MccApp.select(account);

    var videoCampaigns = getVideoCampaigns();
    if (!videoCampaigns.hasNext()) {
        return false;
    }

    var biddingCurrency = account.getCurrencyCode();
    var displayCurrency = getAccountDisplayCurrency(account.getCustomerId());
    var exchangeRate = getExchangeRate(biddingCurrency, displayCurrency, exchangeRates);
    var finalCurrency = (exchangeRate > 0) ? displayCurrency : biddingCurrency;

    var campaignsData = [];
    var totals = {
        budget: 0,
        spent: 0
    };

    /**
     * Iterate on campaigns
     */
    while (videoCampaigns.hasNext()) {
        var campaign = videoCampaigns.next();
        var campaignStats = campaign.getStatsFor('ALL_TIME');
        var remainingDays = calculateRemainingDays(campaign.getEndDate());
        if (!remainingDays) {
            continue;
        }

        var biddingBudget = campaign.getBudget();
        var displayBudget = (exchangeRate > 0) ? biddingBudget / exchangeRate : biddingBudget;
        var biddingSpent = campaignStats.getCost();
        var displaySpent = (exchangeRate > 0) ? biddingSpent / exchangeRate : biddingSpent;

        var current = {
            name: campaign.getName(),
            dailyBudget: displayBudget,
            spent: displaySpent,
            remainingDays: remainingDays,
            debug: {
                biddingBudget: biddingBudget,
                biddingSpent: biddingSpent
            }
        };
        campaignsData.push(current);
        totals['budget'] += current['dailyBudget'];
        totals['spent'] += current['spent'];

        Logger.log(
            'Campaign: ' + current['name'] + ' - ' +
            'Daily budget: ' + current['dailyBudget'] + ' ' + finalCurrency + ' - ' +
            'Spent: ' + current['spent'] + ' ' + finalCurrency + ' - ' +
            'Remaining: ' + current['remainingDays'] + ' days'
        );
    }

    var otherCampaignsData = getOtherCampaignsData();

    return {
        account: {
            name: account.getName(),
            id: account.getCustomerId(),
            currency: finalCurrency,
            totalBudget: totals['budget'],
            totalSpent: totals['spent'],
            debug: {
                biddingCurrency: biddingCurrency,
                displayCurrency: displayCurrency,
                exchangeRate: exchangeRate
            }
        },
        videoCampaigns: campaignsData,
        otherCampaigns: otherCampaignsData
    };
}

/**
 * Get current date as string
 */
function getTodayString() {
    var format = 'yyyyMMdd';
    var timeZone = AdWordsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), timeZone, format);
    return today;
}

/**
 * Get non-video campaigns
 * @returns {Array}
 */
function getOtherCampaignsData() {
    var today = getTodayString();
    var campaigns = [];

    var campaignSelector = AdsApp
        .campaigns()
        .withCondition('Status = ENABLED')
        .withCondition('StartDate <= ' + today)
        .withCondition('EndDate >= ' + today)
        .orderBy('Name DESC');
    var campaignIterator = campaignSelector.get();
    if (campaignIterator.hasNext()) {
        while (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            campaigns.push({name: campaign.getName()});
        }
    }

    var shoppingCampaignsSeletor = AdsApp
        .shoppingCampaigns()
        .withCondition('Status = ENABLED')
        .withCondition('StartDate <= ' + today)
        .withCondition('EndDate >= ' + today)
        .orderBy('Name DESC');
    var shoppingCampaignIterator = shoppingCampaignsSeletor.get();
    if (shoppingCampaignIterator.hasNext()) {
        while (shoppingCampaignIterator.hasNext()) {
            var campaign = shoppingCampaignIterator.next();
            campaigns.push({name: campaign.getName()});
        }
    }

    return campaigns;
}

/**
 * Get account campaigns that match requirements
 */
function getVideoCampaigns() {
    var today = getTodayString();
    var campaignInterator = AdWordsApp
        .videoCampaigns()
        .withCondition('Status IN [ENABLED, PAUSED]')
        .withCondition('StartDate <= ' + today)
        .withCondition('EndDate >= ' + today)
        .orderBy('Budget DESC');

    return campaignInterator.get();
}

/**
 * Get campaign remaining days
 */
function calculateRemainingDays(endDate) {
    if (!endDate) {
        // Some of paused old campaigns don't have end dates. Don't know how they were created.
        return 0;
    }

    /**
     * Today
     */
    var today = new Date();
    var offset = today.getTimezoneOffset();
    var hoursOffset = ((offset > 0) ? offset / 60 : 0) * -1; // Discard AdWords account's timezone offset
    var todayZeroHour = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hoursOffset, 0, 0);

    /**
     * Campaign's end date
     */
    var endDateYear = parseInt(endDate['year']);
    var endDataMonth = parseInt(endDate['month']) - 1; // Adwords counts months from 1 instead of 0
    var endDateDay = parseInt(endDate['day']);
    var endDateZeroHour = new Date(endDateYear, endDataMonth, endDateDay, hoursOffset, 0, 0);

    /**
     * Remaining days
     */
    var millisecondsInDays = 3600 * 24 * 1000;
    var todayDays = Math.floor(todayZeroHour.getTime() / millisecondsInDays); // days as integer
    var endDateDays = Math.floor(endDateZeroHour.getTime() / millisecondsInDays); // days as integer
    var daysDiff = endDateDays - todayDays + 1;

    return daysDiff;
}

/**
 * Render full data as html for body
 */
function renderHtml(accountData) {

    var body = '<div style="margin-top:20px;padding:10px;background-color:#f7f7f7">' +
        'This is a spending summary report generated by Google Ads with all active campaigns.<br>' +
        '<span style="color:#777;display:block;margin-top:7px">' +
        '- Daily budget and spent values displayed are an estimation and might not match theviralab.com values due to currency rates used.<br>' +
        '- Remaining days displays the number of days remaining until the campaignâ€™s end date. This value does not take into account specific schedules agreed upon for certain campaigns.' +
        '</span>' +
        '</div>';

    body += '<table border="0" style="border-collapse:collapse;margin-top:10px">' +
        '<thead>' +
        '<tr>' +
        '<th></th>' + // name
        '<th></th>' + // budget
        '<th></th>' + // spent
        '<th></th>' + // remaining
        '</tr>' +
        '</thead>' +
        '<tbody>';

    /**
     * Iterate on accounts
     */
    for (var i = 0; i < accountData.length; i++) {
        var data = accountData[i];
        var otherCampaignsCount = 0;
        if (data.hasOwnProperty('otherCampaigns') && data['otherCampaigns'].length > 0) {
            otherCampaignsCount = data['otherCampaigns'].length;
        }

        if (!data['videoCampaigns'].length && !otherCampaignsCount) {
            continue;
        }

        /**
         * Account row
         */
        var accountHtml = '<tr>' +
            '<td colspan="4">' +
            '<h3 style="background-color: #f0f8ff;padding: 10px;">' +
            'Account ' + data['account']['name'] + ' (' + data['account']['id'] + ')' +
            '</h3>' +
            '</td>' +
            '</tr>';
        if (CONFIG['DEBUG_DATA_ALLOWED']) {
            accountHtml += '<tr>' +
                '<td colspan="4" style="padding:0 10px;color: ' + DEBUG_TEXT_COLOR + '">' +
                'BiddingCurrency "<strong>' + data['account']['debug']['biddingCurrency'] + '</strong>", ' +
                'displayCurrency "<strong>' + data['account']['debug']['displayCurrency'] + '</strong>", ' +
                'exchangeRate <strong>' + data['account']['debug']['exchangeRate'] + '</strong>' +
                '</td>' +
                '</tr>';
        }

        if (data['videoCampaigns'].length > 0) {
            /**
             * Campaigns header
             */
            accountHtml += '<tr>' +
                '<td style="padding:5px 10px;text-align:left"><strong>Campaign</strong></td>' +       // name
                '<td style="padding:5px 10px;text-align:center"><strong>Daily Budget</strong></td>' + // budget
                '<td style="padding:5px 10px;text-align:center"><strong>Total Spent</strong></td>' +  // spent
                '<td style="padding:5px 10px;text-align:center"><strong>Remaining</strong></td>' +    // remaining
                '</tr>';

            /**
             * Campaigns list
             */
            for (var x = 0; x < data['videoCampaigns'].length; x++) {
                var row = data['videoCampaigns'][x];
                accountHtml += '<tr>' +
                    '<td style="padding:5px 10px">' + row['name'] + '</td>' +                                                                                         // name
                    '<td style="padding:5px 10px;text-align:right"><strong>' + row['dailyBudget'].toFixed(2) + '</strong> ' + data['account']['currency'] + '</td>' + // budget
                    '<td style="padding:5px 10px;text-align:right"><strong>' + row['spent'].toFixed(2) + '</strong> ' + data['account']['currency'] + '</td>' +       // spend
                    '<td style="padding:5px 10px;text-align:right"><strong>' + row['remainingDays'] + '</strong> days' + '</td>' +                                    // remaining
                    '</tr>';
                if (CONFIG['DEBUG_DATA_ALLOWED']) {
                    accountHtml += '<tr>' +
                        '<td></td>' +
                        '<td style="padding:5px 10px;text-align:right;color:' + DEBUG_TEXT_COLOR + '"><strong>' + row['debug']['biddingBudget'].toFixed(2) + '</strong> ' + data['account']['debug']['biddingCurrency'] + '</td>' +
                        '<td style="padding:5px 10px;text-align:right;color:' + DEBUG_TEXT_COLOR + '"><strong>' + row['debug']['biddingSpent'].toFixed(2) + '</strong> ' + data['account']['debug']['biddingCurrency'] + '</td>' +
                        '<td></td>' +
                        '</tr>';
                }
            }

            /**
             * Totals row
             */
            accountHtml += '<tr>' +
                '<td style="padding:5px 10px;text-align:left">Totals</td>' +                                                                                                                           // name
                '<td style="padding:5px 10px;text-align:right;background-color:#f7f7f7"><strong>' + data['account']['totalBudget'].toFixed(2) + '</strong> ' + data['account']['currency'] + '</td>' + // budget
                '<td style="padding:5px 10px;text-align:right;background-color:#f7f7f7"><strong>' + data['account']['totalSpent'].toFixed(2) + '</strong> ' + data['account']['currency'] + '</td>' +  // spend
                '<td style="padding:5px 10px"></td>' +                                                                                                                                                 // remaining
                '</tr>';
        }

        /**
         * Non-video campaigns
         */
        if (otherCampaignsCount) {
            accountHtml += '<tr>' +
                '<td style="text-align:left;color:#f00" colspan="4">' +
                '<div style="background-color:#fdeff4;margin-top:15px;padding:15px 10px 1px">' +
                '<strong>Other type campaigns detected (not video):</strong>' +
                '<ul>';
            for (var j = 0; j <data['otherCampaigns'].length; j++) {
                accountHtml += '<li>' + data['otherCampaigns'][j]['name'] + '</li>';
            }
            accountHtml += '</ul>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }

        body += accountHtml;
    }

    body += '</tbody>' +
        '</table>';

    return body;
}

/**
 * Get currency exchanges
 *
 * We are using a free plan of the "FIXER.IO" financial api
 * with query limit of 1000 queries and base currency in EURO
 */
function getCurrencyExchangeRates() {
    /**
     * They only currencies we need for now are: "EUR,USD,MXN,COP,ARS"
     */
    var financialApiUrl = FINANCIAL_API_URL + '?access_key=' + CONFIG['FINANCIAL_API_ACCESS_KEY'] + '&base=EUR&symbols=USD,MXN,COP,ARS';
    var response = UrlFetchApp.fetch(financialApiUrl);
    var parsed = JSON.parse(response);
    if (parsed.hasOwnProperty('success') && parsed['success'] === true) {
        var result = parsed['rates'];
        result['EUR'] = 1;
        return result;
    }
    return false;
}

/**
 * Get exchange rate for given currencies
 */
function getExchangeRate(biddingCurrency, displayCurrency, exchangeRates) {
    /**
     * If the api call fails, we will have false in this case
     */
    if (!exchangeRates) {
        return 0;
    }
    if (exchangeRates.hasOwnProperty(biddingCurrency) && exchangeRates.hasOwnProperty(displayCurrency)) {
        if (biddingCurrency === displayCurrency) {
            return 1;
        }
        var biddingRate = exchangeRates[biddingCurrency];
        var displayRate = exchangeRates[displayCurrency];
        if (biddingRate > 0 && displayRate > 0) {
            return biddingRate / displayRate;
        }
    }
    return 0;
}

/**
 * Map accounts real and display currencies
 */
function getAccountDisplayCurrency(accountId) {
    var displayCurrencies = {
        '155-026-0035': 'EUR',
        '179-409-9425': 'USD',
        '179-658-2833': 'USD',
        '184-366-6419': 'EUR', // dev tests 2
        '192-097-0823': 'USD',
        '192-500-3290': 'USD',
        '217-187-0841': 'USD',
        '240-700-9841': 'USD',
        '264-365-0560': 'USD',
        '265-019-1966': 'ARS',
        '279-560-8554': 'USD',
        '312-691-9591': 'USD',
        '313-686-9299': 'EUR',
        '327-307-5705': 'EUR',
        '339-750-4364': 'ARS',
        '344-029-9205': 'MXN',
        '346-627-5709': 'USD',
        '356-941-6643': 'USD',
        '358-787-0097': 'USD',
        '364-929-2399': 'USD',
        '366-154-3949': 'USD',
        '377-239-7068': 'USD',
        '391-080-9793': 'USD',
        '400-452-3988': 'USD',
        '416-867-4931': 'COP',
        '424-128-6729': 'USD',
        '424-480-1895': 'USD',
        '438-870-4415': 'USD',
        '439-727-7190': 'USD',
        '457-024-6758': 'USD',
        '457-299-7800': 'USD',
        '536-279-2011': 'USD',
        '570-286-9693': 'USD',
        '575-697-9839': 'MXN',
        '600-752-9937': 'COP',
        '627-239-1344': 'USD',
        '631-348-4868': 'USD',
        '664-730-4849': 'USD',
        '695-097-3066': 'USD',
        '728-791-3862': 'USD',
        '731-491-8337': 'USD',
        '766-646-1696': 'USD',
        '767-885-1319': 'USD',
        '811-911-1786': 'USD',
        '827-589-7580': 'USD',
        '839-777-0948': 'USD',
        '903-693-9682': 'EUR', // dev tests
        '932-942-1182': 'USD',
        '977-754-3258': 'USD',
        '986-485-3192': 'MXN'
    };
    if (displayCurrencies.hasOwnProperty(accountId)) {
        return displayCurrencies[accountId];
    }
    return null;
}
