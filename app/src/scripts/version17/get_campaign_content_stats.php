<?php

require 'MyClient.php';

function printCampaignContentStats(string $clientId, int $campaignId, \DateTime $from, \DateTime $to): void
{
    $now = (new \DateTime())->setTime(0, 0);
    if ($to->getTimestamp() > $now->getTimestamp()) {
        $to = clone $now;
    }

    $query = sprintf('
    SELECT
        ad_group_criterion.youtube_channel.channel_id,
        segments.date,
        campaign.id,
        metrics.clicks,
        metrics.ctr,
        metrics.impressions,
        metrics.cost_micros,
        metrics.video_views,
        metrics.video_view_rate,
        metrics.average_cpv,
        metrics.average_cost,
        metrics.average_cpc,
        metrics.average_cpe,
        metrics.average_cpm, 
        metrics.engagements,
        metrics.engagement_rate
    FROM managed_placement_view
    WHERE ad_group_criterion.type = \'YOUTUBE_CHANNEL\'
    AND segments.date BETWEEN %s AND %s
    AND campaign.id = %d
    LIMIT 2',
        $from->format('Ymd'),
        $to->format('Ymd'),
        $campaignId
    );

    $client = new MyClient();
    $response = $client->getReport($clientId, $query);
    if ($response) {
        $data = $client->normalizePagedListResponse($response);
        echo json_encode($data)."\n\n";
    } else {
        echo "Failed to get response.\n";
    }
}


$single = false;
if ($single) {
    $clientId = '412-386-5680';
    $campaignId = 21105403113;
    $from = new \DateTime('2024-03-18');
    $to = new \DateTime('2024-05-15');
    printCampaignContentStats($clientId, $campaignId, $from, $to);
    exit;
}


$campaigns = [
    ['412-386-5680', 21105403113, '2024-03-18', '2024-05-15'], // yes
    ['197-284-4254', 21697240696, '2024-09-12', '2024-09-25'],
    ['108-917-5676', 21698420549, '2024-09-12', '2024-09-30'],
    ['423-310-5899', 21698482264, '2024-09-11', '2024-09-30'],
    ['338-115-0035', 21693421369, '2024-09-10', '2024-09-21'],
    ['356-924-9097', 21683227321, '2024-09-08', '2024-10-07'],
    ['803-369-5093', 21665085588, '2024-09-05', '2024-09-30'],
];
foreach ($campaigns as $row) {
    $clientId = $row[0];
    $campaignId = $row[1];
    $from = new \DateTime($row[2]);
    $to = new \DateTime($row[3]);
    printCampaignContentStats($clientId, $campaignId, $from, $to);
}
