// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
const appV1 = "https://app.pontomaisweb.com.br/#/meu_ponto";
const appV2 = "https://app2.pontomais.com.br/meu-ponto";
const urls = [appV1, appV2];

// Set up rules for when the extension icon should be enabled
chrome.runtime.onInstalled.addListener(() => {
  // In MV3, we need to use the new declarativeContent API structure
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'pontomaisweb.com.br' }
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'pontomais.com.br' }
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()]
    }]);
  });
});

// In MV3, browserAction becomes action
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on one of our target URLs
  let onTargetPage = urls.some(url => tab.url.includes(url));

  if (onTargetPage) {
    const version = tab.url.includes(appV1) ? 'v1' : 'v2';

    chrome.tabs.sendMessage(tab.id, { command: 'performFullAction', version: version }, function(response) {
      if (response?.result === 'recalculate') {
        // Wait 1 second and then evaluate again
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { command: 'evaluateOnly', version: version });
        }, 1000);
      }
    });
  }
});