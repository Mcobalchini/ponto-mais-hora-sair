// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: "https://app.pontomaisweb.com.br/#/meu_ponto" }
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.browserAction.onClicked.addListener(function (tab) {
  if (tab.url === 'https://app.pontomaisweb.com.br/#/meu_ponto') {
    chrome.tabs.sendMessage(tab.id, { command: 'calcularSaida' }, function (response) {
  
      if (response.result === 'recalculate') {
        
        var now = new Date().getTime();
        while (new Date().getTime() < now + 1500) { }
        chrome.tabs.sendMessage(tab.id, { command: 'calculateOnly' });
      }
    });
  }
});