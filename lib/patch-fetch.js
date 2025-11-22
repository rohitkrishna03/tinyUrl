// lib/patch-fetch.js
if (typeof global !== "undefined" && !global.__FETCH_PATCHED__) {
  global.__FETCH_PATCHED__ = true;

  const originalFetch = global.fetch;

  global.fetch = async (...args) => {
    try {
      // Log only server-side fetches
      console.log("🔎 SERVER FETCH:", args[0]);
    } catch (_) {}

    return originalFetch(...args);
  };
}
