import api from "./api";

const LOCATION_CACHE_KEY = "ccts:last-location:v1";
const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;
const DEBOUNCE_DELAY_MS = 450;
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";

let debounceTimer = null;
let pendingReject = null;

function toCoordKey(value) {
  return Number(value).toFixed(4);
}

function readCache() {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(latitude, longitude, data) {
  const payload = {
    latitudeKey: toCoordKey(latitude),
    longitudeKey: toCoordKey(longitude),
    data,
    expiresAt: Date.now() + LOCATION_CACHE_TTL_MS,
  };
  localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(payload));
}

function getCachedByCoordinates(latitude, longitude) {
  const cache = readCache();
  if (!cache) return null;
  if (
    cache.latitudeKey === toCoordKey(latitude) &&
    cache.longitudeKey === toCoordKey(longitude)
  ) {
    return cache.data;
  }
  return null;
}

export async function reverseGeocode(latitude, longitude) {
  const cached = getCachedByCoordinates(latitude, longitude);
  if (cached) {
    return cached;
  }

  try {
    const response = await api.post(
      "/location/reverse",
      { latitude, longitude },
      {
        headers: {
          "X-Skip-Auth-Redirect": "true",
        },
      }
    );
    writeCache(latitude, longitude, response.data);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      const fallback = await reverseGeocodeDirect(latitude, longitude);
      writeCache(latitude, longitude, fallback);
      return fallback;
    }
    throw error;
  }
}

async function reverseGeocodeDirect(latitude, longitude) {
  const url = `${NOMINATIM_BASE_URL}?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Location service is unavailable. Please try again.");
  }

  const payload = await response.json();
  const address = payload?.address || {};

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "";
  const area =
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.hamlet ||
    "";

  return {
    status: 200,
    message: "Location resolved successfully",
    data: {
      latitude,
      longitude,
      city,
      area,
      state: address.state || "",
      pincode: address.postcode || "",
      displayAddress: payload?.display_name || "",
    },
  };
}

export function reverseGeocodeDebounced(latitude, longitude, delay = DEBOUNCE_DELAY_MS) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  if (pendingReject) {
    pendingReject(new Error("Previous location request superseded by a newer request."));
    pendingReject = null;
  }

  return new Promise((resolve, reject) => {
    pendingReject = reject;
    debounceTimer = setTimeout(async () => {
      try {
        pendingReject = null;
        const data = await reverseGeocode(latitude, longitude);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

export function getCurrentPosition(options = {}) {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocation is not supported by your browser."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Please allow GPS access and try again."));
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Location unavailable right now. Please check GPS/network and retry."));
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error("Location request timed out. Please retry."));
          return;
        }
        reject(new Error("Failed to fetch your current location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}
