SELECT CampaignName, DisplayName, Impressions, Cost
FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT
WHERE CampaignName CONTAINS 'Miller Lite_AO_Views_Trueview_MOBILE_Equity_Diciembre_2024 30 SS' AND Impressions > 5
DURING YESTERDAY
LIMIT 0, 5
