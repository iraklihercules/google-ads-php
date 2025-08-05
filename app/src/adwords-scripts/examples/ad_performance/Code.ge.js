const RECIPIENT_EMAILS = CONFIG.recipient_emails;
const SPREADSHEET_URL = CONFIG.spreadsheet_url;
const FIELDS = CONFIG.advanced_options.fields;

/**
 * This script computes an Ad performance report
 * and outputs it to a Google spreadsheet.
 */
function main() {
    console.log(`Using template spreadsheet - ${SPREADSHEET_URL}.`);
    const spreadsheet = copySpreadsheet(SPREADSHEET_URL);
    console.log(`Generated new reporting spreadsheet ${spreadsheet.getUrl()} ` +
        `based on the template spreadsheet. ` +
        `The reporting data will be populated here.`);

    const headlineSheet = spreadsheet.getSheetByName('Headline');
    headlineSheet.getRange(1, 2, 1, 1).setValue('Date');
    headlineSheet.getRange(1, 3, 1, 1).setValue(new Date());
    const finalUrlSheet = spreadsheet.getSheetByName('Final Url');
    finalUrlSheet.getRange(1, 2, 1, 1).setValue('Date');
    finalUrlSheet.getRange(1, 3, 1, 1).setValue(new Date());
    spreadsheet.getRangeByName('account_id_headline').setValue(
        AdsApp.currentAccount().getCustomerId());
    spreadsheet.getRangeByName('account_id_final_url').setValue(
        AdsApp.currentAccount().getCustomerId());

    // Only include ad types on the headline sheet for which the concept of a
    // headline makes sense.
    outputSegmentation(headlineSheet, 'Headline', (adGroupAd) => {
        switch (adGroupAd.ad.type) {
            case 'TEXT_AD':
                return adGroupAd.ad.textAd.headline;
            case 'EXPANDED_TEXT_AD':
                return adGroupAd.ad.expandedTextAd.headlinePart1 + ' - ' +
                    adGroupAd.ad.expandedTextAd.headlinePart2;
            case 'RESPONSIVE_DISPLAY_AD':
                return adGroupAd.ad.responsiveDisplayAd.longHeadline.text;
            case 'VIDEO_RESPONSIVE_AD':
                return adGroupAd.ad.videoResponsiveAd.longHeadlines.map(
                    asset => asset.text);
            case 'RESPONSIVE_SEARCH_AD':
                return adGroupAd.ad.responsiveSearchAd.headlines.map(
                    asset => asset.text);
            case 'APP_ENGAGEMENT_AD':
                return adGroupAd.ad.appEngagementAd.headlines.map(asset => asset.text);
            case 'APP_AD':
                return adGroupAd.ad.appAd.headlines.map(asset => asset.text);
            case 'CALL_AD':
                return adGroupAd.ad.callAd.headline1 + ' - ' +
                    adGroupAd.ad.callAd.headline2;
            case 'LEGACY_RESPONSIVE_DISPLAY_AD':
                return adGroupAd.ad.legacyResponsiveDisplayAd.longHeadline;
            case 'LOCAL_AD':
                return adGroupAd.ad.localAd.headlines.map(asset => asset.text);
            case 'SHOPPING_COMPARISON_LISTING_AD':
                return adGroupAd.ad.shoppingComparisonListingAd.headline;
            case 'SMART_CAMPAIGN_AD':
                return adGroupAd.ad.smartCampaignAd.headlines.map(asset => asset.text);
            case 'VIDEO_AD':
                return adGroupAd.ad.videoAd.inFeed.headline;
            case 'DISCOVERY_CAROUSEL_AD':
                return adGroupAd.ad.discoveryCarouselAd.headline.text;
            case 'DISCOVERY_MULTI_ASSET_AD':
                return adGroupAd.ad.discoveryMultiAssetAd.headlines.map(asset => asset.text);
            default:
                return;
        }
    });
    outputSegmentation(
        finalUrlSheet, 'Final Url', (adGroupAd) => adGroupAd.ad.finalUrls);
    console.log(`Ad performance report available at\n${spreadsheet.getUrl()}`);
    validateEmailAddresses(RECIPIENT_EMAILS);
    MailApp.sendEmail(
        RECIPIENT_EMAILS.join(','), 'Ad Performance Report is ready',
        spreadsheet.getUrl());
}

/**
 * Retrieves the spreadsheet identified by the URL.
 *
 * @param {string} spreadsheetUrl The URL of the spreadsheet.
 * @return {SpreadSheet} The spreadsheet.
 */
function copySpreadsheet(spreadsheetUrl) {
    const spreadsheet = validateAndGetSpreadsheet(spreadsheetUrl).copy(
        'Ad Performance Report - ' +
        getDateStringInTimeZone('MMM dd, yyyy HH:mm:ss z'));

    // Make sure the spreadsheet is using the account's timezone.
    spreadsheet.setSpreadsheetTimeZone(AdsApp.currentAccount().getTimeZone());
    return spreadsheet;
}

/**
 * Generates statistical data for this segment.
 *
 * @param {Sheet} sheet Sheet to write to.
 * @param {string} segmentName The Name of this segment for the header row.
 * @param {function(AdsApp.Ad): string} segmentFunc Function that returns
 *        a string used to segment the results by.
 */
function outputSegmentation(sheet, segmentName, segmentFunc) {
    // Output header row.
    const rows = [];
    const header = [
        segmentName,
        'Num Ads',
        'Impressions',
        'Clicks',
        'CTR (%)',
        'Cost'
    ];
    rows.push(header);

    const segmentMap = {};

    // Compute data.
    const fields = FIELDS.join(",");
    const results = AdsApp.search(`SELECT ${fields} FROM ad_group_ad ` +
        `WHERE metrics.impressions > 0 AND ` +
        `segments.date DURING LAST_7_DAYS`);
    let skipped = 0;
    for (const row of results) {
        let rawSegments = segmentFunc(row.adGroupAd);
        // In the case of the headline segmentation segmentFunc will return null
        // where there is no headline e.g. an HTML5 ad or other non-text ad, for
        // which metrics are therefore not aggregated.
        if (!rawSegments) {
            skipped += 1;
            continue;
        }

        let segments = [];
        if (typeof (rawSegments) == 'string') {
            segments[0] = rawSegments;
        }
        else {
            segments = rawSegments;
        }

        for (const segment of segments) {
            if (!segmentMap[segment]) {
                segmentMap[segment] =
                    {numAds: 0, totalImpressions: 0, totalClicks: 0, totalCost: 0.0};
            }
            const data = segmentMap[segment];
            data.numAds++;
            data.totalImpressions += parseFloat(row.metrics.impressions);
            data.totalClicks += parseFloat(row.metrics.clicks);
            data.totalCost += parseFloat((row.metrics.costMicros)/1000000);
        }
    }

    // Write data to our rows.
    for (const key in segmentMap) {
        if (segmentMap.hasOwnProperty(key)) {
            let ctr = 0;
            if (segmentMap[key].numAds > 0) {
                ctr = (segmentMap[key].totalClicks /
                    segmentMap[key].totalImpressions) * 100;
            }
            const row = [
                key,
                segmentMap[key].numAds,
                segmentMap[key].totalImpressions,
                segmentMap[key].totalClicks,
                ctr.toFixed(2),
                segmentMap[key].totalCost];
            rows.push(row);
        }
    }

    // Write a warning if we skipped ads that were missing segmentation info
    if (skipped) {
        rows.push(['SKIPPED', skipped, '', '', '', '']);
    }
    sheet.getRange(3, 2, rows.length, 6).setValues(rows);
}

/**
 * Produces a formatted string representing a given date in a given time zone.
 *
 * @param {string} format A format specifier for the string to be produced.
 * @param {date} date A date object. Defaults to the current date.
 * @param {string} timeZone A time zone. Defaults to the account's time zone.
 * @return {string} A formatted string of the given date in the given time zone.
 */
function getDateStringInTimeZone(format, date, timeZone) {
    date = date || new Date();
    timeZone = timeZone || AdsApp.currentAccount().getTimeZone();
    return Utilities.formatDate(date, timeZone, format);
}

/**
 * Validates the provided email addresses to make sure it's not the default.
 * Throws a descriptive error message if validation fails.
 *
 * @param {Array.<string>} recipientEmails The list of email addresses.
 * @throws {Error} If the list of email addresses is still the default
 */
function validateEmailAddresses(recipientEmails) {
    if (recipientEmails && recipientEmails[0] == 'YOUR_EMAIL_HERE') {
        throw new Error(
            'Please either specify a valid email address or clear' +
            ' the recipient_emails field in Config.');
    }
}

/**
 * Validates the provided spreadsheet URL
 * to make sure that it's set up properly. Throws a descriptive error message
 * if validation fails.
 *
 * @param {string} spreadsheeturl The URL of the spreadsheet to open.
 * @return {Spreadsheet} The spreadsheet object itself, fetched from the URL.
 * @throws {Error} If the spreadsheet URL hasn't been set
 */
function validateAndGetSpreadsheet(spreadsheeturl) {
    if (spreadsheeturl == 'YOUR_SPREADSHEET_URL') {
        throw new Error('Please specify a valid Spreadsheet URL. You can find' +
            ' a link to a template in the associated guide for this script.');
    }
    return spreadsheet = SpreadsheetApp.openByUrl(spreadsheeturl);
}
