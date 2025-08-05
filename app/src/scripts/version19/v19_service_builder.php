<?php

require '../../vendor/autoload.php';

use Google\Ads\GoogleAds\Lib\V19\GoogleAdsClient;
use Google\Ads\GoogleAds\Lib\V19\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;

class V19ServiceBuilder
{
    private mixed $oAuth2CredentialForGoogleAds;

    /**
     * AdWordsService constructor.
     */
    public function __construct(
        private readonly string $googleAdsAuthIniFilename
    ) {
        $this->oAuth2CredentialForGoogleAds = (new OAuth2TokenBuilder())
            ->fromFile($this->googleAdsAuthIniFilename)
            ->build();
    }

    public function getGoogleAdsClient(): GoogleAdsClient
    {
        // Construct a Google Ads client configured from a properties file and the
        // OAuth2 credentials above.
        return (new GoogleAdsClientBuilder())
            ->fromFile($this->googleAdsAuthIniFilename)
            ->withOAuth2Credential($this->oAuth2CredentialForGoogleAds)
            //->withLoginCustomerId('different customer id')
            ->build();
    }
}
