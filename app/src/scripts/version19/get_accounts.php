<?php

require 'v19_service_builder.php';

use Google\Ads\GoogleAds\V19\Resources\Customer;
use Google\Ads\GoogleAds\V19\Resources\CustomerClient;
use Google\Ads\GoogleAds\V19\Services\Client\GoogleAdsServiceClient;
use Google\Ads\GoogleAds\V19\Services\GoogleAdsRow;
use Google\Ads\GoogleAds\V19\Services\SearchGoogleAdsRequest;
use Google\Ads\GoogleAds\V19\Services\SearchSettings;
use Google\ApiCore\PagedListResponse;



class V19Client
{
    public const TVL_CLIENT_ID = '932-519-8887';

    public function __construct(
        private readonly V19ServiceBuilder $adWordsServiceBuilder,
    ) {
    }

    public function getCustomerAccounts(): array
    {
        $queryCustomer = 'SELECT
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status

                FROM customer';

        $queryCustomerClient = 'SELECT
                    customer_client.id,
                    customer_client.descriptive_name,
                    customer_client.currency_code,
                    customer_client.time_zone,
                    customer_client.status

                FROM customer_client
                WHERE customer_client.manager = false';

        /* Glu Company 9325198887 */
        $dataCustomer = $this->getReport(self::TVL_CLIENT_ID, $queryCustomer);
        $normalizedCustomerData = $this->normalizeCustomerAccounts($dataCustomer);

        /* Sub Accounts */
        $dataCustomerClient = $this->getReport(self::TVL_CLIENT_ID, $queryCustomerClient);
        $normalizedCustomerClientData = $this->normalizeCustomerClientAccounts($dataCustomerClient);

        return [
            'customer' => $normalizedCustomerData,
            'clients' => $normalizedCustomerClientData,
        ];
    }

    private function getReport(string $clientId, string $query, bool $summaryRow = false): ?PagedListResponse
    {
        $customerId = str_replace('-', '', $clientId);

        $request = new SearchGoogleAdsRequest([
            'customer_id' => $customerId,
            'query' => $query,
            'search_settings' => new SearchSettings([
                'return_summary_row' => $summaryRow,
                'return_total_results_count' => true,
                'omit_results' => false,
            ]),
        ]);

        $args = [
            'retrySettings' => [
                'totalTimeoutMillis' => 600000,
            ],
            'pageSize' => 1000, // Limit page size to 1000 to avoid large responses and reduce risk of connection drops
        ];

        return $this->getService()->search($request, $args);
    }

    private function getService(): GoogleAdsServiceClient
    {
        return $this->adWordsServiceBuilder
            ->getGoogleAdsClient()
            ->getGoogleAdsServiceClient();
    }

    private function normalizeCustomerAccounts(?PagedListResponse $data): array
    {
        if (null === $data) {
            return [];
        }

        $result = [];

        $iterator = $data->iterateAllElements();

        /** @var GoogleAdsRow $row */
        foreach ($iterator as $row) {
            /** @var Customer $customer */
            $customer = $row->getCustomer();

            $result[] = [
                'name' => $customer->getDescriptiveName(),
                'accountId' => $customer->getId(),
                'network' => 'ADWORDS',
                'currency' => $customer->getCurrencyCode(),
                'timezone' => $customer->getTimeZone(),
                'status' => $customer->getStatus(),
            ];
        }

        return $result;
    }

    private function normalizeCustomerClientAccounts(?PagedListResponse $data): array
    {
        if (null === $data) {
            return [];
        }

        $result = [];

        $iterator = $data->iterateAllElements();

        /** @var GoogleAdsRow $row */
        foreach ($iterator as $row) {
            /** @var CustomerClient $customerClient */
            $customerClient = $row->getCustomerClient();

            $result[] = [
                'name' => $customerClient->getDescriptiveName(),
                'accountId' => $customerClient->getId(),
                'network' => 'ADWORDS',
                'currency' => $customerClient->getCurrencyCode(),
                'timezone' => $customerClient->getTimeZone(),
                'status' => $customerClient->getStatus(),
            ];
        }

        return $result;
    }
}

$googleCredentialsFile = '/var/www/html/google_ads_php.ini';
$serviceBuilder = new V19ServiceBuilder($googleCredentialsFile);

$client = new V19Client($serviceBuilder);

$customerAccounts = $client->getCustomerAccounts();
print_r($customerAccounts);
