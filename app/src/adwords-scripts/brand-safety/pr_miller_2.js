/**
 * INIT
 */
function main() {
    const account = AdsApp.currentAccount();

    /* Create */
    const timeString = (new Date()).toLocaleString();
    const reportName = "Report output: " + account.getName() + " - " + account.getCustomerId() + " - " + timeString;
    const spreadsheet = SpreadsheetApp.create(reportName);

    const report = AdsApp.report(
        "SELECT Domain " +
        "FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " +
        "DURING YESTERDAY " +
        "ORDER BY Impressions DESC"
    );
    report.exportToSheet(spreadsheet.getActiveSheet());

    Logger.log("Account:", account.getName(), "-", account.getCustomerId());
    Logger.log("Report available at " + spreadsheet.getUrl());
}

/* Working example */
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
        "Domain", "DisplayName", "CampaignId", "CampaignName",
        "Impressions", "Clicks", "VideoViews", "Cost",
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

    // Post
    // http://dev.theviralab.local/api/brandsafety/spreadsheet?apikey=81fe8ec58339ff141a01d6016122a006fff7ee56c2b8818f50dbdf4f2bb4a747
}


/**
 * UPDATE
 */
function main() {
    const SPREADSHEET_ID = '1jxCrsGemXA2p4Yj360qeIprJqGta8lvgd5OO5Ia0dHo';

    /* Do not modify */
    const API_KEY = '81fe8ec58339ff141a01d6016122a006fff7ee56c2b8818f50dbdf4f2bb4a747';
    const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
    const POST_URL = `https://app.theviralab.com/api/brandsafety/spreadsheet?apikey=${API_KEY}`;

    const account = AdsApp.currentAccount();
    const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);

    const fields= [
        "Domain",
        "DisplayName",
        "CampaignId",
        "CampaignName",
        "Impressions",
        "Clicks",
        "VideoViews",
        "Cost",
        "ExternalCustomerId",
        "AccountCurrencyCode",
        "Date"
    ].join(", ");
    // const report1 = AdsApp.report(
    //     "SELECT " + fields + " " +
    //     "FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT " +
    //     "DURING YESTERDAY " +
    //     "ORDER BY Impressions DESC"
    // );
    const report = AdsApp.report(`
        SELECT ${fields}
        FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT DURING YESTERDAY
        ORDER BY Impressions DESC
    `);
    report.exportToSheet(spreadsheet.getActiveSheet());

    //Logger.log("Account:", account.getName(), "-", account.getCustomerId());
    //Logger.log("Report available at " + spreadsheet.getUrl());
    Logger.log(`Account: ${account.getName()} - ${account.getCustomerId()}`);
    Logger.log(`Report available at ${spreadsheet.getUrl()}`);

    const options = {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify({
            'spreadsheet_url': spreadsheet.getUrl(),
        })
    };
    Logger.log(options);
    const response = UrlFetchApp.fetch(POST_URL, options);
    const content = response.getContentText();
    Logger.log(JSON.parse(content));

    // UrlFetchApp.fetch('https://app.theviralab.com/api/brandsafety/spreadsheet', {
    //     'method' : 'post',
    //     'payload' : {apikey: API_KEY}
    // });
}
