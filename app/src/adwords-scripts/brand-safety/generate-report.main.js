function main() {
    const account = AdsApp.currentAccount();

    /* Create */
    //var timeString = (new Date()).toLocaleString();
    //var reportName = "Report output: " + account.getName() + " - " + account.getCustomerId() + " - " + timeString;
    //var spreadsheet = SpreadsheetApp.create(reportName);

    /* Update */
    var url = "https://docs.google.com/spreadsheets/d/19gLokwY1WrgtD3dNF6k6vrqLV7qJcwTi8T0s0wIua9A/edit";
    var spreadsheet = SpreadsheetApp.openByUrl(url);

    var fields = [
        "Domain", "DisplayName", "CampaignId", "CampaignName", "AdGroupName", "AccountCurrencyCode",
        "Impressions", "Clicks", "VideoViews", "Cost",
        "AccountDescriptiveName", "CustomerDescriptiveName", "Date", "ExternalCustomerId",
    ].join(", ");
    var report = AdsApp.report(
        "SELECT " + fields + " " +
        "FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " +
        "DURING YESTERDAY " +
        "ORDER BY Impressions DESC"
    );
    report.exportToSheet(spreadsheet.getActiveSheet());

    Logger.log("Account:", account.getName(), "-", account.getCustomerId());
    Logger.log("Report available at " + spreadsheet.getUrl());
}


/*
Placement => DisplayName
Placement URL => Domain
Campaign => CampaignName
Currency code => AccountCurrencyCode
Type => --
Impr. => Impressions,
Views => VideoViews,
Clicks => Clicks,
Cost => Cost,

Account name => AccountDescriptiveName, CustomerDescriptiveName
Account id => ExternalCustomerId,

$indexes = [
    'channel' => array_search('Placement', $titles),
    'channel_url' => array_search('Placement URL', $titles),
    'campaign' => array_search('Campaign', $titles),
    'currency' => array_search('Currency code', $titles),
    'type' => array_search('Type', $titles),
    'impressions' => array_search('Impr.', $titles),
    'views' => array_search('Views', $titles),
    'clicks' => array_search('Clicks', $titles),
    'cost' => array_search('Cost', $titles),
];
*/
