<?php

require __DIR__ . '/../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V14\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\Lib\V14\GoogleAdsServerStreamDecorator;
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


// 184-366-6419
$customerId = 1843666419;

$query = 'SELECT campaign.id, campaign.name FROM campaign ORDER BY campaign.id';

/** @var GoogleAdsServerStreamDecorator $stream */
$stream = $googleAdsServiceClient->searchStream($customerId, $query);

foreach ($stream->iterateAllElements() as $googleAdsRow) {
    /** @var GoogleAdsRow $googleAdsRow */
    printf(
        "Campaign with ID %d and name '%s' was found.%s",
        $googleAdsRow->getCampaign()->getId(),
        $googleAdsRow->getCampaign()->getName(),
        PHP_EOL
    );
}
