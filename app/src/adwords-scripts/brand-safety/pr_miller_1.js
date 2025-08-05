function main() {
    const account = AdsApp.currentAccount();

    /* Create */
    // var timeString = (new Date()).toLocaleString();
    // var reportName = "Report output: " + account.getName() + " - " + account.getCustomerId() + " - " + timeString;
    // var spreadsheet = SpreadsheetApp.create(reportName);

    /* Update */
    var url = "https://docs.google.com/spreadsheets/d/1jxCrsGemXA2p4Yj360qeIprJqGta8lvgd5OO5Ia0dHo/edit";
    var spreadsheet = SpreadsheetApp.openByUrl(url);

    var fields = [
        "Domain", "DisplayName", "CampaignId", "CampaignName", "Impressions", "Clicks", "VideoViews", "Cost",
        "ExternalCustomerId", "AccountCurrencyCode", "Date"
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

/**
 * POST Request
 */

const POST_URL = 'https://jsonplaceholder.typicode.com/posts';
const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify({
        'url': '1234',
    })
};
const response = UrlFetchApp.fetch(POST_URL, options);
const content = response.getContentText();
console.log(JSON.parse(content));
