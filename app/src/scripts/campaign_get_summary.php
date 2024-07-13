<?php

require __DIR__ . '/../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V14\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\V14\Enums\AdvertisingChannelTypeEnum\AdvertisingChannelType;
use Google\Ads\GoogleAds\V14\Enums\BiddingStrategyTypeEnum\BiddingStrategyType;
use Google\Ads\GoogleAds\V14\Resources\Campaign;
use Google\Ads\GoogleAds\V14\Resources\CampaignBudget;
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
    campaign.advertising_channel_type,
    campaign.campaign_budget,
    campaign.start_date,
    campaign.end_date,
    campaign.bidding_strategy_type,
    campaign_budget.id,
    customer.time_zone
FROM campaign
WHERE campaign.id = '.$campaignId;

$response = $googleAdsServiceClient->search($customerId, $query);


/** @var GoogleAdsRow $googleAdsRow */
foreach ($response->iterateAllElements() as $googleAdsRow) {

    /** @var Campaign $campaign */
    $campaign = $googleAdsRow->getCampaign();

    /** @var CampaignBudget $campaignBudget */
    $campaignBudget = $googleAdsRow->getCampaignBudget();

    print_r([
        'name' => $campaign->getName(),
        'campaignId' => $campaign->getId(),
        'type' => AdvertisingChannelType::name($campaign->getAdvertisingChannelType()),
        'clientId' => $customerId,
        'budgetId' => $campaignBudget->getId(),
        'startDate' => $campaign->getStartDate(),
        'endDate' => $campaign->getEndDate(),
        'biddingStrategyType' => BiddingStrategyType::name($campaign->getBiddingStrategyType()),
        'serialized' => json_decode($googleAdsRow->serializeToJsonString(), true),
    ]);
}
