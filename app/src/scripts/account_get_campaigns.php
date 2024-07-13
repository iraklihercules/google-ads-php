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

/* Disabled account */
//$customerId = 1550260035;
$customerId = 1843666419;


$query = '
SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.serving_status,
    campaign.campaign_budget,
    campaign.start_date,
    
    customer.descriptive_name,    
    customer.currency_code, 
    
    campaign_budget.amount_micros,
    
    metrics.average_cost,
    metrics.average_cpc,
    metrics.average_cpe,
    metrics.average_cpm,
    metrics.average_cpv,
    metrics.clicks,
    metrics.cost_micros,
    metrics.impressions,
    metrics.video_views

FROM campaign 
WHERE campaign.end_date > \'2024-02-26\'
';

$response = $googleAdsServiceClient->search($customerId, $query);


$campaigns = [];

/** @var GoogleAdsRow $googleAdsRow */
foreach ($response->iterateAllElements() as $googleAdsRow) {

    /** @var Campaign $campaign */
    $campaign = $googleAdsRow->getCampaign();

    /** @var CampaignBudget $campaignBudget */
    $campaignBudget = $googleAdsRow->getCampaignBudget();

    $campaigns[] = [
        'name' => $campaign->getName(),
        'campaignId' => $campaign->getId(),
        'type' => AdvertisingChannelType::name($campaign->getAdvertisingChannelType()),
        'clientId' => $customerId,
        'budgetId' => $campaignBudget->getId(),
        'startDate' => $campaign->getStartDate(),
        'endDate' => $campaign->getEndDate(),
        'biddingStrategyType' => BiddingStrategyType::name($campaign->getBiddingStrategyType()),
        'serialized' => json_decode($googleAdsRow->serializeToJsonString(), true),
    ];
}

print_r($campaigns);
