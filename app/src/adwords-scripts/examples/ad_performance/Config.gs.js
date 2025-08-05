/**
 * Configuration to be used for the Ad Performance Report.
 */

CONFIG = {
    // Array of recipient emails. Comment out to not send any emails.
    'recipient_emails': ['irakli.alaverdashvili@theviralab.com'],
    // URL of the default spreadsheet template. This should be a copy of
    // https://goo.gl/aN49Nk
    'spreadsheet_url': 'https://docs.google.com/spreadsheets/d/1x_9l5RPPaK8AwL3fGf7tQKLSujgOffZmI9fpLNlv-ik/edit?gid=12#gid=12',

    'advanced_options': {
        /**
         * Adding new metrics to the list will not get them automatically included
         * unless corresponding changes are made in the spreadsheet and the code
         * section.
         * Removing fields in the list will result in the corresponding
         * field not being rendered in the report.
         */
        'fields': [
            'ad_group_ad.ad.id',
            'ad_group_ad.ad.type',
            'ad_group_ad.ad.text_ad.headline',
            'ad_group_ad.ad.expanded_text_ad.headline_part1',
            'ad_group_ad.ad.expanded_text_ad.headline_part2',
            'ad_group_ad.ad.responsive_display_ad.long_headline',
            'ad_group_ad.ad.video_responsive_ad.long_headlines',
            'ad_group_ad.ad.responsive_search_ad.headlines',
            'ad_group_ad.ad.app_engagement_ad.headlines',
            'ad_group_ad.ad.app_ad.headlines',
            'ad_group_ad.ad.call_ad.headline1',
            'ad_group_ad.ad.call_ad.headline2',
            'ad_group_ad.ad.local_ad.headlines',
            'ad_group_ad.ad.legacy_responsive_display_ad.long_headline',
            'ad_group_ad.ad.shopping_comparison_listing_ad.headline',
            'ad_group_ad.ad.smart_campaign_ad.headlines',
            'ad_group_ad.ad.video_ad.in_feed.headline',
            'ad_group_ad.ad.final_urls',
            'metrics.clicks',
            'metrics.cost_micros',
            'metrics.impressions',
        ]
    }
};
