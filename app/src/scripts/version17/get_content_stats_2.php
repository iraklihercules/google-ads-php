<?php
/**
 * Miller PR
 * 946-824-3046
 */

require 'MyClient.php';
require 'base.php';

use Google\Ads\GoogleAds\V17\Services\SearchGoogleAdsRequest;

//$customerId = '946-824-3046';
$customerId = 9468243046;

$query = "SELECT CampaignId, CampaignName, DisplayName, Impressions, Clicks, VideoViews, Cost, AverageCpm" +
    " FROM AUTOMATIC_PLACEMENTS_PERFORMANCE_REPORT" +
    " WHERE Impressions > 20" +
    " DURING THIS_MONTH" +
    " ORDER BY Impressions DESC" +
    " LIMIT 0, 10";



$request = SearchGoogleAdsRequest::build($customerId, $query);
// $request->setSummaryRowSetting(0);

$response = null;

$service = getGoogleClient()->getGoogleAdsServiceClient();
for ($i = 0; $i < 3; $i++) {
    try {
        $response = $service->search($request);
        echo "SUCCESS\n";
        break;
    } catch (\Exception $e) {
        echo 'ERR '.$e->getMessage()."\n";
    }
}
$service->close();

if ($response) {
    $normalized = normalizePagedListResponse($response);
    echo json_encode($normalized, JSON_PRETTY_PRINT)."\n";
} else {
    echo "Failed to get response.\n";
}
