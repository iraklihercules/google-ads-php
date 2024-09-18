<?php

require __DIR__ . '/../../bootstrap.php';

use Google\Ads\GoogleAds\Lib\OAuth2TokenBuilder;
use Google\Ads\GoogleAds\Lib\V17\GoogleAdsClient;
use Google\Ads\GoogleAds\Lib\V17\GoogleAdsClientBuilder;
use Google\Ads\GoogleAds\V17\Enums\ResponseContentTypeEnum\ResponseContentType;
use Google\Ads\GoogleAds\V17\Enums\SummaryRowSettingEnum\SummaryRowSetting;
use Google\Ads\GoogleAds\V17\Services\Client\AdGroupAdServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\AdGroupCriterionServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\AdGroupServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\AssetServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\CampaignBudgetServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\CampaignCriterionServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\CampaignServiceClient;
use Google\Ads\GoogleAds\V17\Services\Client\GoogleAdsServiceClient;
use Google\Ads\GoogleAds\V17\Services\GoogleAdsRow;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupAdsRequest;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupAdsResponse;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupCriteriaRequest;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupCriteriaResponse;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupsRequest;
use Google\Ads\GoogleAds\V17\Services\MutateAdGroupsResponse;
use Google\Ads\GoogleAds\V17\Services\MutateAssetsRequest;
use Google\Ads\GoogleAds\V17\Services\MutateAssetsResponse;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignBudgetsRequest;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignBudgetsResponse;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignCriteriaRequest;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignCriteriaResponse;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignsRequest;
use Google\Ads\GoogleAds\V17\Services\MutateCampaignsResponse;
use Google\Ads\GoogleAds\V17\Services\SearchGoogleAdsRequest;
use Google\ApiCore\ApiException;
use Google\ApiCore\PagedListResponse;
use YoutubeAdvertisingPlatform\ApiBundle\Exception\GoogleAdsClientServiceNotImplementedException;
use YoutubeAdvertisingPlatform\ProgrammaticBundle\Manager\GoogleAdsApiErrorManager;


class MyClient
{
    public const AD_GROUP_SERVICE_CLIENT_TYPE = 'ad_group';
    public const CAMPAIGN_SERVICE_CLIENT_TYPE = 'campaign';
    public const CAMPAIGN_BUDGET_SERVICE_CLIENT_TYPE = 'budget';
    public const CAMPAIGN_CRITERION_SERVICE_CLIENT_TYPE = 'campaign_targeting';
    public const AD_GROUP_CRITERION_SERVICE_CLIENT_TYPE = 'ad_group_targeting';
    public const ASSET_SERVICE_CLIENT_TYPE = 'media_file';
    public const AD_GROUP_AD_SERVICE_CLIENT_TYPE = 'ad_group_ad';
    public const GOOGLE_ADS_SERVICE_CLIENT_TYPE = 'google_ads_service';

    public function __construct(
        private ?GoogleAdsClient $client = null
    ) {}

    public function getReport(int|string $clientId, string $query): PagedListResponse|null
    {
        // We persist clients ids as string "nnn-nnn-nnnn" and Google Ads API fails.
        $clientId = (int) str_replace('-', '', $clientId);

        $serviceType = self::GOOGLE_ADS_SERVICE_CLIENT_TYPE;
        $service = $this->getService($serviceType);

        $response = $this->getServiceResponse(
            $service,
            $serviceType,
            $clientId,
            [$query],
            true
        );

        $service->close();

        return $response;
    }

    private function getService(string $type): mixed
    {
        $client = $this->getGoogleClient();

        return match ($type) {
            self::AD_GROUP_SERVICE_CLIENT_TYPE => $client->getAdGroupServiceClient(),
            self::CAMPAIGN_SERVICE_CLIENT_TYPE => $client->getCampaignServiceClient(),
            self::CAMPAIGN_BUDGET_SERVICE_CLIENT_TYPE => $client->getCampaignBudgetServiceClient(),
            self::CAMPAIGN_CRITERION_SERVICE_CLIENT_TYPE => $client->getCampaignCriterionServiceClient(),
            self::AD_GROUP_CRITERION_SERVICE_CLIENT_TYPE => $client->getAdGroupCriterionServiceClient(),
            self::AD_GROUP_AD_SERVICE_CLIENT_TYPE => $client->getAdGroupAdServiceClient(),
            self::GOOGLE_ADS_SERVICE_CLIENT_TYPE => $client->getGoogleAdsServiceClient(),
            self::ASSET_SERVICE_CLIENT_TYPE => $client->getAssetServiceClient(),
            default => throw new \Exception('Service type not implemented: '.$type),
        };
    }

    private function getGoogleClient(): GoogleAdsClient
    {
        if (null === $this->client) {
            $googleCredentialsFile = '/var/www/html/google_ads_php.ini';

            $oAuth2CredentialForGoogleAds = (new OAuth2TokenBuilder())
                ->fromFile($googleCredentialsFile)
                ->build();

            // Construct a Google Ads client configured from a properties file and the
            // OAuth2 credentials above.
            $this->client = (new GoogleAdsClientBuilder())
                ->fromFile($googleCredentialsFile)
                ->withOAuth2Credential($oAuth2CredentialForGoogleAds)
                ->build();
        }

        return $this->client;
    }

    /**
     * @throws ApiException
     */
    private function getServiceResponse(
        mixed $service,
        string $serviceType,
        string $customerId,
        array $operations,
        bool $mutableResourceResponse = false,
        bool $includeSummaryRow = false
    ): MutateAdGroupCriteriaResponse|MutateCampaignsResponse|PagedListResponse|MutateAssetsResponse|MutateAdGroupAdsResponse|MutateAdGroupsResponse|MutateCampaignCriteriaResponse|MutateCampaignBudgetsResponse|null {
        $response = null;

        for ($i = 0; $i < 3; $i++) {
            try {
                $response = $this->runGoogleAdsOperationOnService(
                    $service,
                    $serviceType,
                    $customerId,
                    $operations,
                    $mutableResourceResponse,
                    $includeSummaryRow
                );
                break;
            } catch (\Exception $e) {
                echo 'ERR '.$e->getMessage()."\n";
            }
        }

        return $response;
    }

    /**
     * @param AdGroupServiceClient|CampaignServiceClient|CampaignBudgetServiceClient|CampaignCriterionServiceClient|AdGroupCriterionServiceClient|AssetServiceClient|AdGroupAdServiceClient|GoogleAdsServiceClient $service
     *
     * @throws ApiException
     */
    private function runGoogleAdsOperationOnService(
        mixed $service,
        string $serviceType,
        string $customerId,
        array $operations,
        bool $mutableResourceResponse = false,
        bool $summaryRow = false
    ): MutateAdGroupCriteriaResponse|MutateCampaignsResponse|MutateAssetsResponse|PagedListResponse|MutateAdGroupAdsResponse|MutateAdGroupsResponse|MutateCampaignCriteriaResponse|MutateCampaignBudgetsResponse {
        $responseContentType = $mutableResourceResponse
            ? ResponseContentType::MUTABLE_RESOURCE
            : ResponseContentType::UNSPECIFIED;

        $summaryRowSetting = $summaryRow
            ? SummaryRowSetting::SUMMARY_ROW_WITH_RESULTS
            : SummaryRowSetting::UNSPECIFIED;

        return match ($serviceType) {
            self::AD_GROUP_SERVICE_CLIENT_TYPE => $service->mutateAdGroups(
                MutateAdGroupsRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::CAMPAIGN_SERVICE_CLIENT_TYPE => $service->mutateCampaigns(
                MutateCampaignsRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::CAMPAIGN_BUDGET_SERVICE_CLIENT_TYPE => $service->mutateCampaignBudgets(
                MutateCampaignBudgetsRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::CAMPAIGN_CRITERION_SERVICE_CLIENT_TYPE => $service->mutateCampaignCriteria(
                MutateCampaignCriteriaRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::AD_GROUP_CRITERION_SERVICE_CLIENT_TYPE => $service->mutateAdGroupCriteria(
                MutateAdGroupCriteriaRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::AD_GROUP_AD_SERVICE_CLIENT_TYPE => $service->mutateAdGroupAds(
                MutateAdGroupAdsRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            self::GOOGLE_ADS_SERVICE_CLIENT_TYPE => $service->search(
                SearchGoogleAdsRequest::build($customerId, \array_shift($operations))->setSummaryRowSetting(
                    $summaryRowSetting
                )
            ),
            self::ASSET_SERVICE_CLIENT_TYPE => $service->mutateAssets(
                MutateAssetsRequest::build($customerId, $operations)->setResponseContentType(
                    $responseContentType
                )
            ),
            default => throw new \Exception($serviceType),
        };
    }

    public function normalizePagedListResponse(PagedListResponse $response): array
    {
        $result = [];

        /** @var GoogleAdsRow $row */
        foreach ($response as $row) {
            $json = $row->serializeToJsonString();
            $result[] = \json_decode($json, true);
        }

        return $result;
    }
}

