<?php

require 'base.php';

use Google\Ads\GoogleAds\V16\Services\SearchGoogleAdsRequest;


/**
 * Multi ad-group
 * 184-366-6419
 * TVL_TEST_SEARCH_PR_DICIEMBRE
 */
$customerId = 1843666419;

$query = "
SELECT
  campaign.name,
  ad_group_criterion.keyword.text,
  ad_group.name,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc
FROM keyword_view
WHERE segments.date DURING LAST_30_DAYS
LIMIT 5
";


$request = SearchGoogleAdsRequest::build($customerId, $query);


$service = getGoogleClient()->getGoogleAdsServiceClient();
$response = $service->search($request);
$service->close();


$normalized = normalizePagedListResponse($response);
echo json_encode($normalized, JSON_PRETTY_PRINT)."\n";
