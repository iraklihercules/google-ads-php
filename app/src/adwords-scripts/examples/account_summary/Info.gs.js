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
 * @name Account Summary Report
 *
 * @overview The Account Summary Report script generates an at-a-glance report
 *     showing the performance of an entire Google Ads account. See
 *     https://developers.google.com/google-ads/scripts/docs/solutions/account-summary
 *     for more details.
 *
 * @author Google Ads Scripts Team [adwords-scripts@googlegroups.com]
 *
 * @version 2.1
 *
 * @changelog
 * - version 2.1
 *   - Split into info, config, and code.
 * - version 2.0
 *   - Updated to use new Google Ads Scripts features.
 * - version 1.1
 *   - Add user-updateable fields, and ensure report row ordering.
 * - version 1.0.4
 *   - Improved code readability and comments.
 * - version 1.0.3
 *   - Added validation for external spreadsheet setup.
 * - version 1.0.2
 *   - Fixes date formatting bug in certain timezones.
 * - version 1.0.1
 *   - Improvements to time zone handling.
 * - version 1.0
 *   - Released initial version.
 */
