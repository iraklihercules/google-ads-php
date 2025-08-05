/**
 * Configuration to be used for the Account Summary Report.
 */

CONFIG = {
    // URL of the report spreadsheet. This should be a copy of
    // https://docs.google.com/spreadsheets/d/1gYLXtDK93lWoTe3OBKvTlfcc7L_qHJFgWU9N6HwhZtU/copy
    'spreadsheet_url': 'https://docs.google.com/spreadsheets/d/1LWiZlM65mRWPrdNSfVzXLvfwMKgAxhDNoMaIKBK4D9M/edit?gid=3#gid=3',
    // More reporting options can be found at
    // https://developers.google.com/google-ads/scripts/docs/reference/adsapp/adsapp#report_2
    'reporting_options': {
        // Comment out the following line to default to the latest reporting
        // version.
        // 'apiVersion': 'v10'
    },
    /**
     * To add additional fields to the report, follow the instructions at
     * https://developers.google.com/google-ads/scripts/docs/solutions/account-summary#extending_the_report_optional
     */
    'report_fields': [
        {'columnName': 'metrics.cost_micros', 'displayName': 'Cost'},
        {'columnName': 'metrics.average_cpc', 'displayName': 'Avg. CPC'},
        {'columnName': 'metrics.ctr', 'displayName': 'CTR'},
        {'columnName': 'metrics.search_impression_share', 'displayName': 'Search Impr. share'},
        {'columnName': 'metrics.impressions', 'displayName': 'Impressions'},
        {'columnName': 'metrics.clicks', 'displayName': 'Clicks'}
    ]
};
