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

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { SeriesEditor } from '../series_editor';
import { IndexPattern } from '../index_pattern';
import 'brace/mode/less';
import { createSelectHandler } from '../lib/create_select_handler';
import { ColorPicker } from '../color_picker';
import { YesNo } from '../yes_no';
import { MarkdownEditor } from '../markdown_editor';
import less from 'less/lib/less-browser';
import {
  htmlIdGenerator,
  EuiCompressedComboBox,
  EuiTabs,
  EuiTab,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiFormLabel,
  EuiSpacer,
  EuiTitle,
  EuiHorizontalRule,
  EuiCodeEditor,
} from '@elastic/eui';
const lessC = less(window, { env: 'production' });
import { injectI18n, FormattedMessage } from '@osd/i18n/react';
import { QueryBarWrapper } from '../query_bar_wrapper';
import { getDefaultQueryLanguage } from '../lib/get_default_query_language';
import { VisDataContext } from './../../contexts/vis_data_context';

class MarkdownPanelConfigUi extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedTab: 'markdown' };
    this.handleCSSChange = this.handleCSSChange.bind(this);
  }

  switchTab(selectedTab) {
    this.setState({ selectedTab });
  }

  handleCSSChange(value) {
    const { model } = this.props;
    const lessSrc = `#markdown-${model.id} {
  ${value}
}`;
    lessC.render(lessSrc, { compress: true, javascriptEnabled: false }, (e, output) => {
      const parts = { markdown_less: value };
      if (output) {
        parts.markdown_css = output.css;
      }
      this.props.onChange(parts);
    });
  }

  render() {
    const defaults = { filter: { query: '', language: getDefaultQueryLanguage() } };
    const model = { ...defaults, ...this.props.model };
    const { selectedTab } = this.state;
    const handleSelectChange = createSelectHandler(this.props.onChange);
    const { intl } = this.props;

    const htmlId = htmlIdGenerator();

    const alignOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.markdown.alignOptions.topLabel',
          defaultMessage: 'Top',
        }),
        value: 'top',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.markdown.alignOptions.middleLabel',
          defaultMessage: 'Middle',
        }),
        value: 'middle',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.markdown.alignOptions.bottomLabel',
          defaultMessage: 'Bottom',
        }),
        value: 'bottom',
      },
    ];
    const selectedAlignOption = alignOptions.find((option) => {
      return model.markdown_vertical_align === option.value;
    });
    let view;
    if (selectedTab === 'markdown') {
      view = (
        <VisDataContext.Consumer>
          {(visData) => <MarkdownEditor visData={visData} {...this.props} />}
        </VisDataContext.Consumer>
      );
    } else if (selectedTab === 'data') {
      view = (
        <SeriesEditor
          colorPicker={false}
          fields={this.props.fields}
          model={this.props.model}
          name={this.props.name}
          onChange={this.props.onChange}
        />
      );
    } else {
      view = (
        <div className="tvbPanelConfig__container">
          <EuiPanel>
            <EuiTitle size="s">
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.markdown.optionsTab.dataLabel"
                  defaultMessage="Data"
                />
              </span>
            </EuiTitle>
            <EuiSpacer size="m" />

            <IndexPattern
              fields={this.props.fields}
              model={this.props.model}
              onChange={this.props.onChange}
            />

            <EuiHorizontalRule />

            <EuiFlexGroup responsive={false} wrap={true}>
              <EuiFlexItem>
                <EuiCompressedFormRow
                  id={htmlId('panelFilter')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.markdown.optionsTab.panelFilterLabel"
                      defaultMessage="Panel filter"
                    />
                  }
                  fullWidth
                >
                  <QueryBarWrapper
                    query={{
                      language: model.filter.language
                        ? model.filter.language
                        : getDefaultQueryLanguage(),
                      query: model.filter.query || '',
                    }}
                    onChange={(filter) => this.props.onChange({ filter })}
                    indexPatterns={[model.index_pattern || model.default_index_pattern]}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.markdown.optionsTab.ignoreGlobalFilterLabel"
                    defaultMessage="Ignore global filter?"
                  />
                </EuiFormLabel>
                <EuiSpacer size="m" />
                <YesNo
                  value={model.ignore_global_filter}
                  name="ignore_global_filter"
                  onChange={this.props.onChange}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>

          <EuiSpacer />

          <EuiPanel>
            <EuiTitle size="s">
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.markdown.optionsTab.styleLabel"
                  defaultMessage="Style"
                />
              </span>
            </EuiTitle>
            <EuiSpacer size="m" />

            <EuiFlexGroup responsive={false} wrap={true} alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.markdown.optionsTab.backgroundColorLabel"
                    defaultMessage="Background color:"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <ColorPicker
                  onChange={this.props.onChange}
                  name="background_color"
                  value={model.background_color}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.markdown.optionsTab.showScrollbarsLabel"
                    defaultMessage="Show scrollbars?"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <YesNo
                  value={model.markdown_scrollbars}
                  name="markdown_scrollbars"
                  onChange={this.props.onChange}
                />
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.markdown.optionsTab.openLinksInNewTab"
                    defaultMessage="Open links in new tab?"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <YesNo
                  value={model.markdown_openLinksInNewTab}
                  name="markdown_openLinksInNewTab"
                  onChange={this.props.onChange}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel htmlFor={htmlId('valign')}>
                  <FormattedMessage
                    id="visTypeTimeseries.markdown.optionsTab.verticalAlignmentLabel"
                    defaultMessage="Vertical alignment:"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCompressedComboBox
                  id={htmlId('valign')}
                  isClearable={false}
                  options={alignOptions}
                  selectedOptions={selectedAlignOption ? [selectedAlignOption] : []}
                  onChange={handleSelectChange('markdown_vertical_align')}
                  singleSelection={{ asPlainText: true }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiHorizontalRule />

            <EuiTitle size="xxs">
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.markdown.optionsTab.customCSSLabel"
                  defaultMessage="Custom CSS (supports Less)"
                  description="CSS and Less are names of technologies and should not be translated."
                />
              </span>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiCodeEditor
              mode="less"
              theme="textmate"
              width="100%"
              name={`ace-css-${model.id}`}
              setOptions={{ fontSize: '14px' }}
              value={model.markdown_less}
              onChange={this.handleCSSChange}
            />
          </EuiPanel>
        </div>
      );
    }
    return (
      <>
        <EuiTabs size="s">
          <EuiTab
            isSelected={selectedTab === 'markdown'}
            onClick={() => this.switchTab('markdown')}
            data-test-subj="markdown-subtab"
          >
            Markdown
          </EuiTab>
          <EuiTab
            data-test-subj="data-subtab"
            isSelected={selectedTab === 'data'}
            onClick={() => this.switchTab('data')}
          >
            <FormattedMessage
              id="visTypeTimeseries.markdown.dataTab.dataButtonLabel"
              defaultMessage="Data"
            />
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === 'options'}
            onClick={() => this.switchTab('options')}
            data-test-subj="options-subtab"
          >
            <FormattedMessage
              id="visTypeTimeseries.markdown.optionsTab.panelOptionsButtonLabel"
              defaultMessage="Panel options"
            />
          </EuiTab>
        </EuiTabs>
        {view}
      </>
    );
  }
}

MarkdownPanelConfigUi.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
  dateFormat: PropTypes.string,
};

export const MarkdownPanelConfig = injectI18n(MarkdownPanelConfigUi);
