<?php

require __DIR__ . '/../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V14\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\V14\Services\GoogleAdsRow;
use Google\Ads\GoogleAds\V14\Services\GoogleAdsServiceClient;


$googleCredentialsFile = '/var/www/html/google_ads_php.ini';

$oAuth2Credential = (new OAuth2TokenBuilder())
    ->fromFile($googleCredentialsFile)
    ->build();

$googleAdsClient = (new GoogleAdsClientBuilder())
    ->fromFile($googleCredentialsFile)
    ->withOAuth2Credential($oAuth2Credential)
    ->build();

/** @var GoogleAdsServiceClient $googleAdsServiceClient */
$googleAdsServiceClient = $googleAdsClient->getGoogleAdsServiceClient();


/**
 * Multi ad-group
 * 184-366-6419
 * TVL_TEST_SEARCH_PR_DICIEMBRE
 */
$customerId = 1843666419;
$campaignId = 20833209032;


$query = '
SELECT
    ad_group_ad.status,

    ad_group_ad.ad.id,
    ad_group_ad.ad.name,
    ad_group_ad.ad.type,
    ad_group_ad.ad.display_url,

    ad_group_ad.ad.image_ad.name,
    ad_group_ad.ad.image_ad.image_url,

    ad_group_ad.policy_summary.approval_status,

    campaign.id,
    campaign.name,
    campaign.status,

    ad_group.id,
    ad_group.name,
    ad_group.status

FROM ad_group_ad
WHERE campaign.id = '.$campaignId;

$response = $googleAdsServiceClient->search($customerId, $query);


/** @var GoogleAdsRow $googleAdsRow */
$data = [];
foreach ($response->iterateAllElements() as $googleAdsRow) {
    $data[] = json_decode($googleAdsRow->serializeToJsonString(), true);
}

print_r([
    '$data' => $data,
]);
