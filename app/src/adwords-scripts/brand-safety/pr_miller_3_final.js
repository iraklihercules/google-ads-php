function main()  {
    /* Change this */
    const SPREADSHEET_ID = '1jxCrsGemXA2p4Yj360qeIprJqGta8lvgd5OO5Ia0dHo';
    const API_KEY = '81fe8ec58339ff141a01d6016122a006fff7ee56c2b8818f50dbdf4f2bb4a747';

    /* Do not modify */
    const API_ENDPOINT = 'https://app.theviralab.com/api/brandsafety/spreadsheet';
    const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
    const POST_URL = `${API_ENDPOINT}?apikey=${API_KEY}`;

    /* Query */
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
    const report = AdsApp.report(`
        SELECT ${fields}
        FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT DURING YESTERDAY
        ORDER BY Impressions DESC
    `);

    /* Report */
    const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    report.exportToSheet(spreadsheet.getActiveSheet());
    SpreadsheetApp.flush();

    /* Logs */
    const account = AdsApp.currentAccount();
    Logger.log(`Account: ${account.getName()} - ${account.getCustomerId()}`);
    Logger.log(`Report available at ${spreadsheet.getUrl()}`);

    /* POST */
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
}
