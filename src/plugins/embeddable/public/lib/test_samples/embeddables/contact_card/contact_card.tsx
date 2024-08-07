/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { EuiCard, EuiFlexItem, EuiFlexGroup, EuiCompressedFormRow } from '@elastic/eui';

import { Subscription } from 'rxjs';
import { EuiSmallButton } from '@elastic/eui';
import * as Rx from 'rxjs';
import { UiActionsStart } from '../../../../../../ui_actions/public';
import { ContactCardEmbeddable, CONTACT_USER_TRIGGER } from './contact_card_embeddable';
import { EmbeddableContext } from '../../../triggers';

declare module '../../../../../../ui_actions/public' {
  export interface TriggerContextMapping {
    [CONTACT_USER_TRIGGER]: EmbeddableContext;
  }
}

interface Props {
  embeddable: ContactCardEmbeddable;
  execTrigger: UiActionsStart['executeTriggerActions'];
}

interface State {
  fullName: string;
  firstName: string;
}

export class ContactCardEmbeddableComponent extends React.Component<Props, State> {
  private subscription?: Subscription;
  private mounted: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      fullName: this.props.embeddable.getOutput().fullName,
      firstName: this.props.embeddable.getInput().firstName,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.subscription = Rx.merge(
      this.props.embeddable.getOutput$(),
      this.props.embeddable.getInput$()
    ).subscribe(() => {
      if (this.mounted) {
        this.setState({
          fullName: this.props.embeddable.getOutput().fullName,
          firstName: this.props.embeddable.getInput().firstName,
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.mounted = false;
  }

  emitContactTrigger = () => {
    this.props.execTrigger(CONTACT_USER_TRIGGER, {
      embeddable: this.props.embeddable,
    });
  };

  getCardFooterContent = () => (
    <EuiFlexGroup justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiCompressedFormRow label="">
          <EuiSmallButton
            onClick={this.emitContactTrigger}
          >{`Contact ${this.state.firstName}`}</EuiSmallButton>
        </EuiCompressedFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  render() {
    return (
      <EuiCard
        textAlign="left"
        title={this.state.fullName}
        footer={this.getCardFooterContent()}
        description=""
      />
    );
  }
}
