document.documentElement.dataset.ratesAddon = '1';
document.addEventListener('tradingdesk-read-rates', async () => {
  let data;
  try {
    data = await chrome.runtime.sendMessage({action: 'read'});
  } catch {
    data = {error: 'Erweiterung neu laden und Tradingdesk aktualisieren.'};
  }
  document.dispatchEvent(new CustomEvent('tradingdesk-rates-result', {detail: JSON.stringify(data)}));
});
