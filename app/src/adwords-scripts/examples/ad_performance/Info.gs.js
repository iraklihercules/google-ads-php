// Copyright 2015, Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @name Ad Performance Report
 *
 * @overview The Ad Performance Report generates a Google Spreadsheet that
 *     contains ad performance stats like Impressions, Cost, Click Through Rate,
 *     etc. as several distribution charts for an advertiser account. See
 *     https://developers.google.com/google-ads/scripts/docs/solutions/ad-performance
 *     for more details.
 *
 * @author Google Ads Scripts Team [adwords-scripts@googlegroups.com]
 *
 * @version 2.3
 *
 * @changelog
 * - version 2.3
 *   - Added discovery_carousel_ad and discovery_multi_asset_ad support
 * - version 2.2
 *   - Removed deprecated ad_group_ad.ad.gmail_ad.marketing_image_headline field.
 * - version 2.1
 *   - Split into info, config, and code.
 * - version 2.0
 *   - Updated to use new Google Ads scripts features.
 * - version 1.1
 *   - Updated to use expanded text ads.
 * - version 1.0.1
 *   - Improvements to time zone handling.
 * - version 1.0
 *   - Released initial version.
 */
