<?php

require 'base.php';

use Google\Ads\GoogleAds\V16\Services\SearchGoogleAdsRequest;

$customerId = 1843666419;
$adGroupId = 154928416286;
$from = new \DateTime('2023-12-04');
$to = new \DateTime('2024-07-31');

$query = '
SELECT
    ad_group_audience_view.resource_name,
    ad_group_criterion.user_interest.user_interest_category,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.average_cost,
    metrics.average_cpc,
    metrics.average_cpe,
    metrics.average_cpm,
    metrics.average_cpv,
    metrics.ctr,
    metrics.video_views
FROM ad_group_audience_view
WHERE segments.date BETWEEN '.$from->format('Ymd').' AND '.$to->format('Ymd').'
AND ad_group.id = '.$adGroupId;


$request = SearchGoogleAdsRequest::build($customerId, $query);


$service = getGoogleClient()->getGoogleAdsServiceClient();
$response = $service->search($request);
$service->close();


$normalized = normalizePagedListResponse($response);
echo json_encode($normalized, JSON_PRETTY_PRINT)."\n";
