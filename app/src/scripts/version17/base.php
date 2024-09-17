<?php

require __DIR__ . '/../../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V17\GoogleAdsClient;
use Google\Ads\GoogleAds\Lib\V17\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\V17\Services\GoogleAdsRow;
use Google\ApiCore\PagedListResponse;

function getGoogleClient(): GoogleAdsClient
{
    $googleCredentialsFile = '/var/www/html/google_ads_php.ini';

    $oAuth2CredentialForGoogleAds = (new OAuth2TokenBuilder())
        ->fromFile($googleCredentialsFile)
        ->build();

    // Construct a Google Ads client configured from a properties file and the
    // OAuth2 credentials above.
    return (new GoogleAdsClientBuilder())
        ->fromFile($googleCredentialsFile)
        ->withOAuth2Credential($oAuth2CredentialForGoogleAds)
        ->build();
}

function normalizePagedListResponse(PagedListResponse $response): array
{
    $result = [];

    /** @var GoogleAdsRow $row */
    foreach ($response as $row) {
        $json = $row->serializeToJsonString();
        $result[] = json_decode($json, true);
    }

    return $result;
}
