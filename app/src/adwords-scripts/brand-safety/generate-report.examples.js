/**
 * Miller PR
 * 946-824-3046
 */

/**
 * Get account info.
 */
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());
}

/**
 * Generate report data.
 */
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());

    var report = AdsApp.report(
        "SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, segments.hour " +
        "FROM customer " +
        "WHERE segments.date DURING LAST_MONTH");
    for (var row of report.rows()) {
        console.log(row);
    }
}
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());

    var report = AdsApp.report(
        "SELECT CampaignName, DisplayName, Impressions" +
        " FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT" +
        " WHERE CampaignName CONTAINS 'Miller Lite_AO_Views_Trueview_MOBILE_Equity_Diciembre_2024 30 SS'" +
        " DURING YESTERDAY"
    );
    for (var row of report.rows()) {
        console.log(row);
    }
}


/**
 * Export report to a spreadsheet.
 */
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());

    var timeString = (new Date()).toLocaleString();
    var reportName = "Report output: " + account.getName() + " - " + account.getCustomerId() + " - " + timeString;
    var spreadsheet = SpreadsheetApp.create(reportName);
    var report = AdsApp.report(
        "SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, segments.hour " +
        "FROM customer " +
        "WHERE segments.date DURING LAST_MONTH");
    report.exportToSheet(spreadsheet.getActiveSheet());
    Logger.log("Report available at " + spreadsheet.getUrl());
}

/**
 * List account campaigns.
 */
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());

    var campaigns = AdsApp.campaigns().get();
    var counter = 0;
    while (campaigns.hasNext()) {
        var campaign = campaigns.next();
        console.log(campaign.getId(), "-", campaign.getName());
        counter++;
        if (counter > 5) {
            break;
        }
    }
}

/**
 * List audiences.
 */
function main() {
    var audienceSelector = AdsApp.display()
        .audiences()
        .withCondition("metrics.impressions > 1")
        .forDateRange("LAST_MONTH")
        .orderBy("metrics.clicks DESC");

    var audienceIterator = audienceSelector.get();
    console.log("total audiences:", audienceIterator.totalNumEntities());

    while (audienceIterator.hasNext()) {
        var audience = audienceIterator.next();
        console.log(audience.getId());
    }
}

/**
 * List placements.
 */
function main() {
    var placementSelector = AdsApp.display()
        .placements()
        .withCondition("metrics.impressions > 1")
        .forDateRange("LAST_MONTH")
        .orderBy("metrics.clicks DESC");

    var placementIterator = placementSelector.get();
    console.log("total placements:", placementIterator.totalNumEntities());

    while (placementIterator.hasNext()) {
        var placement = placementIterator.next();
        console.log(placement.getId());
    }
}

/**
 * List channels.
 */
function main() {
    var youTubeChannelSelector = AdsApp.display()
        .youTubeChannels()
        .withCondition("metrics.impressions > 100")
        .forDateRange("LAST_MONTH")
        .orderBy("metrics.clicks DESC");

    var youTubeChannelIterator = youTubeChannelSelector.get();
    console.log("total channels:", youTubeChannelIterator.totalNumEntities());

    while (youTubeChannelIterator.hasNext()) {
        var youTubeChannel = youTubeChannelIterator.next();
        console.log(youTubeChannel.getId());
    }
}

/**
 * Video placements
 */
function main() {
    var placementSelector = AdsApp.videoTargeting()
        .placements()
        .withCondition("metrics.impressions > 100")
        .forDateRange("LAST_MONTH")
        .orderBy("metrics.clicks DESC");

    var placementIterator = placementSelector.get();
    console.log("total placements:", placementIterator.totalNumEntities());

    while (placementIterator.hasNext()) {
        var placement = placementIterator.next();
        console.log(placement.getId());
    }
}

/**
 * Video campaigns.
 */
function main() {
    var videoCampaignSelector = AdsApp
        .videoCampaigns()
        .withCondition("metrics.impressions > 100")
        .forDateRange("THIS_MONTH")
        .orderBy("metrics.clicks DESC");

    var videoCampaignIterator = videoCampaignSelector.get();
    console.log("Total campaigns:", videoCampaignIterator.totalNumEntities());

    while (videoCampaignIterator.hasNext()) {
        var videoCampaign = videoCampaignIterator.next();
        console.log("campaign:", videoCampaign.getId(), "-", videoCampaign.getName());

        var videoPlacementIterator = videoCampaign.videoTargeting().placements().get();
        console.log("Total videoPlacements:", videoPlacementIterator.totalNumEntities());

        while (videoPlacementIterator.hasNext()) {
            var videoPlacement = videoPlacementIterator.next();
            console.log("videoPlacement:", videoPlacement.getId());
        }
        break;
    }
}

/**
 * Final results
 */
function main() {
    const account = AdsApp.currentAccount();
    console.log("Account:", account.getName(), "-", account.getCustomerId());

    var report = AdsApp.report(
        "SELECT CampaignId, CampaignName, AdGroupName, DisplayName, Impressions, Clicks, Cost, Date, AverageCpm" +
        " FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT" +
        " WHERE CampaignName CONTAINS 'Miller Lite_AO_Views_Trueview_MOBILE_Equity_Diciembre_2024 30 SS' AND Impressions > 5" +
        " DURING YESTERDAY" +
        " ORDER BY Impressions DESC" +
        " LIMIT 0, 5"
    );
    for (var row of report.rows()) {
        console.log(row);
    }
}
function main() {
    var report = AdsApp.report(
        "SELECT CampaignId, CampaignName, DisplayName, Impressions, Clicks, VideoViews, Cost, AverageCpm, AccountDescriptiveName, Domain" +
        " FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT" +
        " WHERE Impressions > 5 AND CampaignName CONTAINS 'RICOH_TV_PR_DIC-ENE_2024_Horizontal'" +
        " DURING YESTERDAY" +
        " ORDER BY Impressions DESC" +
        " LIMIT 0, 10"
    );
    for (var row of report.rows()) {
        console.log(row);
    }
}

/* Totals */
function main() {
    var total = 0;
    var impressions = 0;

    var report = AdsApp.report(
        "SELECT CampaignId, CampaignName, Domain, DisplayName, Impressions, Clicks, VideoViews, Cost, AverageCpm, AccountDescriptiveName " +
        "FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " +
        "DURING YESTERDAY " +
        "ORDER BY Impressions DESC"
    );
    for (var row of report.rows()) {
        total++;
        impressions += parseInt(row['Impressions']);
    }

    console.log("Total", total);
    console.log("Impressions", impressions);
}

function main() {
    const account = AdsApp.currentAccount();

    var timeString = (new Date()).toLocaleString();
    var reportName = "Report output: " + account.getName() + " - " + account.getCustomerId() + " - " + timeString;
    var spreadsheet = SpreadsheetApp.create(reportName);
    var report = AdsApp.report(
        "SELECT CampaignId, CampaignName, Domain, DisplayName, Impressions, Clicks, VideoViews, Cost, AverageCpm, AccountDescriptiveName " +
        "FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " +
        "DURING YESTERDAY " +
        "ORDER BY Impressions DESC"
    );
    report.exportToSheet(spreadsheet.getActiveSheet());

    Logger.log("Account:", account.getName(), "-", account.getCustomerId());
    Logger.log("Report available at " + spreadsheet.getUrl());
}


/* GET REQUEST */
var data = JSON.parse(UrlFetchApp.fetch('https://jsonplaceholder.typicode.com/posts').getContentText('UTF-8'));
console.log(data);

/* POST REQUEST */
var options = {
    'method' : 'post',
    'payload' : {key: 'value'}
};
UrlFetchApp.fetch('https://jsonplaceholder.typicode.com/posts', options);

/* List files from drive */
var files = DriveApp.getFiles();
while(files.hasNext()) {
    var file = files.next();
    console.log(file.getName(), file.getUrl(), file.getDownloadUrl(), file.getDescription());
}

