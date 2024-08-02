<?php

require __DIR__ . '/../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V16\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\V16\Services\GoogleAdsRow;
use Google\Ads\GoogleAds\V16\Services\GoogleAdsServiceClient;


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

/**
 * Single ad-group
 * 914-444-0156
 * WARNERBROS_DUNE2_NONSK_PR_FEB-MARZ_ARCO PUBLICIDAD_W18-34_3
 */
//$customerId = 9144440156;
//$campaignId = 21011509875;


$query = '
SELECT
    campaign.id,
    campaign.name,

    ad_group.id,
    ad_group.name,

    ad_group_ad.ad.id,
    ad_group_ad.ad.name

FROM ad_group_ad
WHERE campaign.id = '.$campaignId;

$response = $googleAdsServiceClient->search($customerId, $query);


/** @var GoogleAdsRow $googleAdsRow */
$campaign = null;
foreach ($response->iterateAllElements() as $googleAdsRow) {
    $row = json_decode($googleAdsRow->serializeToJsonString(), true);

    if (null === $campaign) {
        $campaign = [
            'id' => $row['campaign']['id'],
            'name' => $row['campaign']['name'],
            'adGroups' => [],
        ];
    }

    $adGroup = $row['adGroup'];
    $adGroupKey = $adGroup['id'];
    if (!isset($campaign['adGroups'][$adGroupKey])) {
        $campaign['adGroups'][$adGroupKey] = [
            'id' => $adGroup['id'],
            'name' => $adGroup['name'],
            'ads' => [],
        ];
    }

    $ad = $row['adGroupAd']['ad'];
    $adKey = $ad['id'];
    $campaign['adGroups'][$adGroupKey]['ads'][$adKey] = [
        'id' => $ad['id'],
        'name' => $ad['name'] ?? null,
    ];
}

print_r([
    '$campaign' => $campaign,
]);
