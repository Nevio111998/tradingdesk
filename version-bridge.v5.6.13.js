/* v5.6.13 startup compatibility bridge.
   data.base.v5.6.13.js reuses unchanged data definitions from the prior core,
   so its embedded version marker is still 5.6.10. Normalize the runtime marker
   before app.base.v5.6.13.js performs its version handshake. */
'use strict';
window.FX_COMPANION_DATA_VERSION='5.6.13';
