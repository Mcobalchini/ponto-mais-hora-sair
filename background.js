// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
const appV1 = "https://app.pontomaisweb.com.br/#/meu_ponto";
const appV2 = "https://app2.pontomais.com.br/meu-ponto";
const urls = [appV1, appV2];

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({pageUrl: { urlMatches: appV1 }}),
        new chrome.declarativeContent.PageStateMatcher({pageUrl: { urlMatches: appV2 }}),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.browserAction.onClicked.addListener(function (tab) {
  if (urls.includes(tab.url)) {
    const version = tab.url === appV1 ? 'v1' : 'v2';
    chrome.tabs.sendMessage(tab.id, { command: 'performFullAction', "version": version }, function (response) {

      if (response?.result === 'recalculate') {

        var now = new Date().getTime();
        while (new Date().getTime() < now + 1000) { }
        chrome.tabs.sendMessage(tab.id, { command: 'evaluateOnly', "version": version });
      }
    });
  }
});