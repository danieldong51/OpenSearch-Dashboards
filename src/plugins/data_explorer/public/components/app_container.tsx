/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useRef, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiResizableContainer,
  useIsWithinBreakpoints,
} from '@elastic/eui';
import { Suspense } from 'react';
import classNames from 'classnames';
import { AppMountParameters } from '../../../../core/public';
import { Sidebar } from './sidebar';
import { NoView } from './no_view';
import { View } from '../services/view_service/view';
import { shallowEqual } from '../utils/use/shallow_equal';
import './app_container.scss';
import { useOpenSearchDashboards } from '../../../opensearch_dashboards_react/public';
import { IDataPluginServices } from '../../../data/public';
import { QUERY_ENHANCEMENT_ENABLED_SETTING } from './constants';

export const AppContainer = React.memo(
  ({ view, params }: { view?: View; params: AppMountParameters }) => {
    const isMobile = useIsWithinBreakpoints(['xs', 's', 'm']);

    const opensearchDashboards = useOpenSearchDashboards<IDataPluginServices>();
    const { uiSettings } = opensearchDashboards.services;
    const isEnhancementsEnabled = uiSettings?.get(QUERY_ENHANCEMENT_ENABLED_SETTING);
    const showActionsInGroup = uiSettings?.get('home:useNewHomePage');

    const topLinkRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const collapseFn = useRef(() => {});
    const [isExpanded, setIsExpanded] = useState(true);

    const onCollapse = () => {
      setIsExpanded(!isExpanded);
    };

    const onChange = () => {
      onCollapse();
      collapseFn.current();
    };

    if (!view) {
      return <NoView />;
    }

    const { Canvas, Panel, Context } = view;

    const MemoizedPanel = memo(Panel);
    const MemoizedCanvas = memo(Canvas);

    params.optionalRef = {
      topLinkRef,
      datePickerRef,
    };
    // Render the application DOM.
    return (
      <div className="mainPage">
        {isEnhancementsEnabled && (
          <EuiFlexGroup
            direction="row"
            className={showActionsInGroup ? '' : 'mainPage navBar'}
            gutterSize="none"
            alignItems="center"
            justifyContent="spaceBetween"
          >
            {!showActionsInGroup && (
              <EuiFlexItem grow={false}>
                <div ref={topLinkRef} />
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <div ref={datePickerRef} />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}

        <EuiPage
          className={classNames('deLayout', isEnhancementsEnabled && 'dsc--next')}
          paddingSize="none"
          grow={false}
        >
          {/* TODO: improve fallback state */}
          <Suspense fallback={<div>Loading...</div>}>
            <Context {...params}>
              <EuiResizableContainer direction={isMobile ? 'vertical' : 'horizontal'}>
                {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => {
                  if (togglePanel) {
                    collapseFn.current = () => togglePanel('sidebar', { direction: 'left' });
                  }
                  return (
                    <>
                      <EuiResizablePanel
                        id="sidebar"
                        initialSize={20}
                        minSize="260px"
                        mode={['collapsible', { position: 'top' }]}
                        paddingSize="none"
                      >
                        <Sidebar>
                          <MemoizedPanel {...params} element={minimizeButton} />
                        </Sidebar>
                      </EuiResizablePanel>
                      <EuiResizableButton />

                      <EuiResizablePanel
                        initialSize={80}
                        minSize="65%"
                        mode="main"
                        paddingSize="none"
                      >
                        <EuiPageBody className="deLayout__canvas">
                          <MemoizedCanvas {...params} />
                        </EuiPageBody>
                      </EuiResizablePanel>
                    </>
                  );
                }}
              </EuiResizableContainer>
            </Context>
          </Suspense>
        </EuiPage>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.view === nextProps.view &&
      shallowEqual(prevProps.params, nextProps.params, ['history'])
    );
  }
);
