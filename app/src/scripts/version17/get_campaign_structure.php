<?php

// https://developers.google.com/google-ads/api/docs/client-libs/php/gapic

require 'base.php';

use Google\Ads\GoogleAds\V17\Services\SearchGoogleAdsRequest;


/**
 * Multi ad-group
 * 184-366-6419
 * TVL_TEST_SEARCH_PR_DICIEMBRE
 */
$customerId = 1843666419;
$campaignId = 20833209032;


$query = '
SELECT
    campaign.id,
    campaign.name,
    campaign.status,

    ad_group.id,
    ad_group.name,
    ad_group.status,

    ad_group_ad.status,

    ad_group_ad.ad.id,
    ad_group_ad.ad.name,
    ad_group_ad.ad.type,
    ad_group_ad.ad.display_url,

    ad_group_ad.ad.image_ad.name,
    ad_group_ad.ad.image_ad.image_url,

    ad_group_ad.policy_summary.approval_status

FROM ad_group_ad
WHERE campaign.id = '.$campaignId;


$request = SearchGoogleAdsRequest::build($customerId, $query);
// $request->setSummaryRowSetting(0);


$service = getGoogleClient()->getGoogleAdsServiceClient();
$response = $service->search($request);
$service->close();

$normalized = normalizePagedListResponse($response);
echo json_encode($normalized, JSON_PRETTY_PRINT)."\n";
