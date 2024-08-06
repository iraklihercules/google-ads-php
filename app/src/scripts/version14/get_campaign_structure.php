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

$response = $googleAdsServiceClient->search($customerId, $query);


/** @var GoogleAdsRow $googleAdsRow */
$campaign = null;
foreach ($response->iterateAllElements() as $googleAdsRow) {
    $row = json_decode($googleAdsRow->serializeToJsonString(), true);

    if (null === $campaign) {
        $campaign = $row['campaign'];
        $campaign['adGroups'] = [];
    }

    $adGroup = $row['adGroup'];
    $adGroupKey = $adGroup['resourceName'];
    if (!isset($campaign['adGroups'][$adGroupKey])) {
        $adGroup['adGroupAds'] = [];
        $campaign['adGroups'][$adGroupKey] = $adGroup;
    }

    $ad = $row['adGroupAd'];
    $adKey = $ad['resourceName'];
    $campaign['adGroups'][$adGroupKey]['adGroupAds'][$adKey] = $ad;
}

foreach ($campaign['adGroups'] as $groupKey => $adGroup) {
    $campaign['adGroups'][$groupKey]['adGroupAds'] = array_values($campaign['adGroups'][$groupKey]['adGroupAds']);
}
$campaign['adGroups'] = array_values($campaign['adGroups']);

print_r([
    '$campaign' => $campaign,
]);
