function main() {
// You have to paste in campaignsList a json with the accounts and campaigns that you want to pause like this:
//
//  var campaignsList = {
//  	'903-693-9682': ["Prueba Colhogar", "Luis update improvement ES yEWdfgN3j4c BMP 20191001 20191002", "201810241758 - Diego ES PCicKydX5GE BMP 20181024 20181024"],
//  	'903-693-9681': ["Prueba Colhogar 1", "Luis update improvement ES yEWdfgN3j4c BMP 20191001 20191002", "201810241758 - Diego ES PCicKydX5GE BMP 20181024 20181024 1"]
//  };

    var campaignsList = {};

    for (var accountId in campaignsList) {
        accountIterator = AdsManagerApp.accounts()
            .withIds([accountId]).get();

        // Iterate through the list of accounts
        while (accountIterator.hasNext()) {
            var account = accountIterator.next();

            Logger.log('Processing account: '+ account.getName());

            // Select the client account.
            AdsManagerApp.select(account);

            var campaignList = '';
            for (var [key, campaignName] in campaignsList[accountId]) {
                if (!campaignList) {
                    campaignList += '"' + campaignName + '"';
                } else {
                    campaignList += ', "' + campaignName + '"';
                }
            }

            Logger.log('Campaign lists: ' + campaignList);

            // Select campaigns under the client account
            var campaignIterator = AdWordsApp.videoCampaigns()
                .withCondition('Name IN [' + campaignList + ']')
                .get();

            while (campaignIterator.hasNext()) {
                var campaign = campaignIterator.next();
                Logger.log('Processing campaign: ' + campaign.getName());
                campaign.pause();
            }
        }
    }
}
