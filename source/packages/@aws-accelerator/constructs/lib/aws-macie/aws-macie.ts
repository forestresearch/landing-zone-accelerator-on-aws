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
import { v4 as uuidv4 } from 'uuid';

const path = require('path');

/**
 * Initialized AwsMacieProps properties
 */
export interface AwsMacieProps {
  readonly region: string;
  readonly findingPublishingFrequency: string;
  readonly isSensitiveSh: boolean;
}

/**
 * Aws Macie class
 */
export class AwsMacie extends cdk.Construct {
  public readonly id: string = '';

  constructor(scope: cdk.Construct, id: string, props: AwsMacieProps) {
    super(scope, id);

    const macieEnableMacieSessionFunction = cdk.CustomResourceProvider.getOrCreateProvider(
      this,
      'Custom::MacieEnableMacieSession',
      {
        codeDirectory: path.join(__dirname, 'enable-macie/dist'),
        runtime: cdk.CustomResourceProviderRuntime.NODEJS_14_X,
        policyStatements: [
          {
            Sid: 'MacieEnableMacieTaskMacieActions',
            Effect: 'Allow',
            Action: [
              'macie2:DisableMacie',
              'macie2:EnableMacie',
              'macie2:GetMacieSession',
              'macie2:PutFindingsPublicationConfiguration',
              'macie2:UpdateMacieSession',
            ],
            Resource: '*',
          },
          {
            Sid: 'MacieEnableMacieTaskIamAction',
            Effect: 'Allow',
            Action: ['iam:CreateServiceLinkedRole'],
            Resource: '*',
            Condition: {
              StringLikeIfExists: {
                'iam:CreateServiceLinkedRole': ['macie.amazonaws.com'],
              },
            },
          },
        ],
      },
    );

    const resource = new cdk.CustomResource(this, 'Resource', {
      resourceType: 'Custom::EnableMacieSession',
      serviceToken: macieEnableMacieSessionFunction.serviceToken,
      properties: {
        region: props.region,
        findingPublishingFrequency: props.findingPublishingFrequency,
        isSensitiveSh: props.isSensitiveSh,
        uuid: uuidv4(), // Generates a new UUID to force the resource to update
      },
    });

    this.id = resource.ref;
  }
}
