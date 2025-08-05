const SPREADSHEET_URL = CONFIG.spreadsheet_url;
const REPORTING_OPTIONS = CONFIG.reporting_options;
const REPORT_FIELDS = CONFIG.report_fields;

/** The spreadsheet is updated to showcase the performance of the account.
 *  An email is sent to the email ID mentioned in the spreadsheet
 */
function main() {
    Logger.log('Using spreadsheet - %s.', SPREADSHEET_URL);
    const spreadsheet = validateAndGetSpreadsheet();
    spreadsheet.setSpreadsheetTimeZone(AdsApp.currentAccount().getTimeZone());
    spreadsheet.getRangeByName('account_id_report').setValue(AdsApp.currentAccount().getCustomerId());
    const yesterday = getYesterday();
    const date = getFirstDayToCheck(spreadsheet, yesterday);
    const rows = [];
    const existingDates = getExistingDates();
    while (date.getTime() <= yesterday.getTime()) {
        if (!existingDates[date]) {
            let row = getReportRowForDate(date);
            rows.push([new Date(date)].concat(REPORT_FIELDS.map(function(field) {
                row[field.columnName] = format(field.columnName, row[field.columnName]);
                return row[field.columnName];
            })));
            spreadsheet.getRangeByName('last_check').setValue(date);
        }
        date.setDate(date.getDate() + 1);
    }
    if (rows.length > 0) {
        writeToSpreadsheet(rows);
        const email = spreadsheet.getRangeByName('email').getValue();
        if (email) {
            sendEmail(email);
        }
    }
}

/**Converts the metrics.cost_micros by dividing it by a million to match the
 * output with version v1.1.1 of the file.
 *
 * @param {string} value that needs to be converted.
 * @return {string} A value that is of type float.
 */
function formatMicros(value) {
    const micros = parseFloat(value / 1000000).toFixed(2);
    return `${micros}`;
}

/**
 * Formats decimal number into a percentage.
 *
 * @param {string} value The decimal number to format.
 * @return {string} The decimal number formatted as a percentage.
 */
function formatPercentage(value) {
    value=parseFloat(value*100).toFixed(2)+'%';
    return value;
}

/**
 * Formats Impression Share values.
 *
 * @param {string} value The Impression Share in Google Ads API format.
 * @return {string} The Impression Share formatted for the spreadsheet.
 */
function formatImpressionShare(value) {
    if (value <= 0.0999) {
        value='<10%';
    }
    else if (value>0.0999) {
        value=parseFloat(value*100)+'%';
    }
    else {
        value='--';
    }
    return value;
}

/**
 *  Formats clicks, impressions, ctr, average_cpc, cost_micros field values.
 *
 * @param {string} column The name of the field.
 * @param {string} value The value of the field.
 * @return {string} The formatted value of the field.
 */
function format(column, value) {
    switch (column) {
        case 'metrics.clicks':
        case 'metrics.impressions':
            return value;
        case 'metrics.ctr':
            return formatPercentage(value);
        case 'metrics.average_cpc':
        case 'metrics.cost_micros':
            return formatMicros(value);
        case 'metrics.search_impression_share':
            return formatImpressionShare(value);
        default:
            throw new Error(`Unknown field ${column}`);
    }
}

/**
 * Retrieves a lookup of dates for which rows already exist in the spreadsheet.
 *
 * @return {!Object} A lookup of existing dates.
 */
function getExistingDates() {
    const spreadsheet = validateAndGetSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Report');
    const data = sheet.getDataRange().getValues();
    const existingDates = {};
    data.slice(5).forEach(function(row) {
        existingDates[row[1]] = true;
    });
    return existingDates;
}

/**
 * Sorts the data in the spreadsheet into ascending date order.
 */
function sortReportRows() {
    const spreadsheet = validateAndGetSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Report');
    const data = sheet.getDataRange().getValues();
    const reportRows = data.slice(5);
    if (reportRows.length) {
        reportRows.sort(function(rowA, rowB) {
            if (!rowA || !rowA.length) {
                return -1;
            } else if (!rowB || !rowB.length) {
                return 1;
            } else if (rowA[1] < rowB[1]) {
                return -1;
            } else if (rowA[1] > rowB[1]) {
                return 1;
            }
            return 0;
        });
        sheet.getRange(6, 1, reportRows.length, reportRows[0].length)
            .setValues(reportRows);
    }
}

/**
 * Append the data rows to the spreadsheet.
 *
 * @param {!Array<!Array<string>>} rows The data rows.
 */
function writeToSpreadsheet(rows) {
    const access = new SpreadsheetAccess(SPREADSHEET_URL, 'Report');
    let emptyRow = access.findEmptyRow(6, 2);
    if (emptyRow < 0) {
        access.addRows(rows.length);
        emptyRow = access.findEmptyRow(6, 2);
    }
    access.writeRows(rows, emptyRow, 2);
    sortReportRows();
}
/**
 * Sends mail to specified email address in spreadsheet
 *
 * @param {string} email address
 */
function sendEmail(email) {
    const day = getYesterday();
    const yesterdayRow = getReportRowForDate(day);
    day.setDate(day.getDate() - 1);
    const twoDaysAgoRow = getReportRowForDate(day);
    day.setDate(day.getDate() - 5);
    const weekAgoRow = getReportRowForDate(day);
    const html = [];
    html.push(
        '<html>',
        '<body>',
        '<table width=800 cellpadding=0 border=0 cellspacing=0>',
        '<tr>',
        '<td colspan=2 align=right>',
        "<div style='font: italic normal 10pt Times New Roman, serif; " +
        "margin: 0; color: #666; padding-right: 5px;'>" +
        'Powered by Google Ads Scripts</div>',
        '</td>',
        '</tr>',
        "<tr bgcolor='#3c78d8'>",
        '<td width=500>',
        "<div style='font: normal 18pt verdana, sans-serif; " +
        "padding: 3px 10px; color: white'>Account Summary report</div>",
        '</td>',
        '<td align=right>',
        "<div style='font: normal 18pt verdana, sans-serif; " +
        "padding: 3px 10px; color: white'>",
        AdsApp.currentAccount().getCustomerId(), '</h1>',
        '</td>',
        '</tr>',
        '</table>',
        '<table width=800 cellpadding=0 border=0 cellspacing=0>',
        "<tr bgcolor='#ddd'>",
        '<td></td>',
        "<td style='font: 12pt verdana, sans-serif; " +
        'padding: 5px 0px 5px 5px; background-color: #ddd; ' +
        "text-align: left'>Yesterday</td>",
        "<td style='font: 12pt verdana, sans-serif; " +
        'padding: 5px 0px 5px 5px; background-color: #ddd; ' +
        "text-align: left'>Two Days Ago</td>",
        "<td style='font: 12pt verdana, sans-serif; " +
        'padding: 5px 0px 5x 5px; background-color: #ddd; ' +
        "text-align: left'>A week ago</td>",
        '</tr>');
    REPORT_FIELDS.forEach(function(field) {
        html.push(emailRow(
            field.displayName,field.columnName, yesterdayRow, twoDaysAgoRow,
            weekAgoRow));
    });
    html.push('</table>', '</body>', '</html>');
    MailApp.sendEmail(email, 'Google Ads Account ' +
        AdsApp.currentAccount().getCustomerId() + ' Summary Report', '',
        {htmlBody: html.join('\n')});
}

/**
 * Generates html summary report with the column names todays ,twodays ago, week ago
 *
 * @param {string} title of the report
 * @param {string} column field names
 * @param {!Object} yesterdayRow holds Object containing fields yesterday data
 * @param {!Object} twoDaysAgoRow holds Object containing fields twodays ago data
 * @param {!Object} weekAgoRow holds Object containing fields week ago data
 * @return {!html} html format
 */
function emailRow(title, column, yesterdayRow, twoDaysAgoRow, weekAgoRow) {
    yesterdayRow[column] = format(column,yesterdayRow[column]);
    twoDaysAgoRow[column] = format(column,twoDaysAgoRow[column]);
    weekAgoRow[column] = format(column,weekAgoRow[column]);
    const html = [];
    html.push('<tr>',
        "<td style='padding: 5px 10px'>" + title + '</td>',
        "<td style='padding: 0px 10px'>" +  yesterdayRow[column]+ '</td>',
        "<td style='padding: 0px 10px'>" + twoDaysAgoRow[column] +
        formatChangeString(yesterdayRow[column], twoDaysAgoRow[column]) +
        '</td>',
        "<td style='padding: 0px 10px'>" + weekAgoRow[column] +
        formatChangeString(yesterdayRow[column], weekAgoRow[column]) +
        '</td>',
        '</tr>');
    return html.join('\n');
}

/**
 * Retrieves Dates in the format yyyyMMdd
 *
 * @param {!Date} date value
 * @return {!Object} dateStrings
 */
function getReportRowForDate(date) {
    const timeZone = AdsApp.currentAccount().getTimeZone();
    const dateString = Utilities.formatDate(date, timeZone, 'yyyyMMdd');
    return getReportRowForDuring(dateString + ' AND ' + dateString);
}
/** Retrieves data from the select query
 *
 * @param {string} during on which dates to get the reports
 * @return {!Object} rows returns field values as an object
 */
function getReportRowForDuring(during) {
    const fields = REPORT_FIELDS.map(function(field) {return field.columnName;}).join(', ');
    const query = `SELECT ${fields} FROM customer WHERE segments.date BETWEEN ${during}`;
    const report = AdsApp.report(query,REPORTING_OPTIONS);
    return report.rows().next();
}

/**
 * Extracts the percentage value from a percentage string. E.g. given "12.3%" returns 12.3.
 *
 * @param {string} value A field value containing a percentage sign at the end.
 * @return {string} The percentage value.
 */
function extractPercentageValue(value){
    const index = value.indexOf('%');
    value = value.substring(0, index);
    return value;
}

/**
 * Formats a change between two values.
 *
 * @param {string} newValue The new value of a field.
 * @param {string} oldValue The old value of a field.
 * @return {string} A string representing the change in the field.
 */
function formatChangeString(newValue,oldValue) {
    const isPercentage = newValue.indexOf('%') >= 0;
    if(isPercentage){
        newValue = extractPercentageValue(newValue);
        oldValue = extractPercentageValue(oldValue);
    }
    const change = parseFloat(newValue - oldValue).toFixed(2);
    let changeString = change;
    if (isPercentage) {
        changeString = change + '%';
    }
    if (change >= 0) {
        return "<span style='color: #38761d; font-size: 8pt'> (+" +
            changeString + ')</span>';
    } else {
        return "<span style='color: #cc0000; font-size: 8pt'> (" +
            changeString + ')</span>';
    }
}

/**
 * The spreadsheet is accessed and updated.
 *
 * @param {string} spreadsheetUrl takes spreadsheets url
 * @param {string} sheetName is a sheet name
 */
function SpreadsheetAccess(spreadsheetUrl, sheetName) {
    this.spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    this.sheet = this.spreadsheet.getSheetByName(sheetName);

    // what column should we be looking at to check whether the row is empty?
    this.findEmptyRow = function(minRow, column) {
        const values = this.sheet.getRange(minRow, column,
            this.sheet.getMaxRows(), 1).getValues();
        for (let i = 0; i < values.length; i++) {
            if (!values[i][0]) {
                return i + minRow;
            }
        }
        return -1;
    };
    this.addRows = function(howMany) {
        this.sheet.insertRowsAfter(this.sheet.getMaxRows(), howMany);
    };
    this.writeRows = function(rows, startRow, startColumn) {
        this.sheet.getRange(startRow, startColumn, rows.length, rows[0].length).
        setValues(rows);
    };
}

/**
 * Gets a date object that is 00:00 yesterday.
 *
 * @return {!Date} A date object that is equivalent to 00:00 yesterday in the
 *     account's time zone.
 */
function getYesterday() {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    return new Date(getDateStringInTimeZone('MMM dd, yyyy 00:00:00 Z',
        yesterday));
}

/**
 * Returned the last checked date + 1 day, or yesterday if there isn't
 * a specified last checked date.
 *
 * @param {!Spreadsheet} spreadsheet The export spreadsheet.
 * @param {!Date} yesterday The yesterday date.
 * @return {!Date} The date corresponding to the first day to check.
 */
function getFirstDayToCheck(spreadsheet, yesterday) {
    const last_check = spreadsheet.getRangeByName('last_check').getValue();
    let date;
    if (last_check.length == 0) {
        date = new Date(yesterday);
    } else {
        date = new Date(last_check);
        date.setDate(date.getDate() + 1);
    }
    return date;
}

/**
 * Produces a formatted string representing a given date in a given time zone.
 *
 * @param {string} format A format specifier for the string to be produced.
 * @param {!Date} date A date object. Defaults to the current date.
 * @param {string} timeZone A time zone. Defaults to the account's time zone.
 * @return {string} A formatted string of the given date in the given time zone.
 */
function getDateStringInTimeZone(format, date, timeZone) {
    date = date || new Date();
    timeZone = timeZone || AdsApp.currentAccount().getTimeZone();
    return Utilities.formatDate(date, timeZone, format);
}

/**
 * Validates the provided spreadsheet URL to make sure that it's set up
 * properly. Throws a descriptive error message if validation fails.
 *
 * @return {!Spreadsheet} The spreadsheet object itself, fetched from the URL.
 */
function validateAndGetSpreadsheet() {
    if ('YOUR_SPREADSHEET_URL' == SPREADSHEET_URL) {
        throw new Error('Please specify a valid Spreadsheet URL. You can find' +
            ' a link to a template in the associated guide for this script.');
    }
    const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    const email = spreadsheet.getRangeByName('email').getValue();
    if ('foo@example.com' == email) {
        throw new Error('Please either set a custom email address in the' +
            ' spreadsheet, or set the email field in the spreadsheet to blank' +
            ' to send no email.');
    }
    return spreadsheet;
}
