/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as cdk from '@aws-cdk/core';
import { SecurityConfig } from '@aws-accelerator/config';
import { AwsMacie, AwsMacieExportConfigClassification } from '@aws-accelerator/constructs';

/**
 * SecurityStackProps
 */
export interface SecurityStackProps extends cdk.StackProps {
  stage: string;
  securityConfig: SecurityConfig;
}

/**
 * Organizational Security Stack, depends on Organizations and Security-Audit Stack
 */
export class SecurityStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: SecurityStackProps) {
    super(scope, id, props);

    if (props.securityConfig['central-security-services'].macie.enable) {
      const macieSession = new AwsMacie(this, 'AwsMacieSession', {
        region: cdk.Stack.of(this).region,
        findingPublishingFrequency:
          props.securityConfig['central-security-services'].macie['policy-findings-publishing-frequency'],
        isSensitiveSh: props.securityConfig['central-security-services'].macie['publish-sensitive-data-findings'],
      });
      new AwsMacieExportConfigClassification(this, 'AwsMacieUpdateExportConfigClassification', {
        region: cdk.Stack.of(this).region,
        S3keyPrefix: 'aws-macie-export-config',
      }).node.addDependency(macieSession);
    }
  }
}
