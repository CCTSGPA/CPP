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

/**
 * Get current position with basic settings
 * For higher accuracy, use getHighAccuracyPosition instead
 */
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
        timeout: 30000, // Increased timeout for better GPS lock
        maximumAge: 0,
        ...options,
      }
    );
  });
}

/**
 * Get high accuracy position by watching location updates
 * Waits for accuracy to be within threshold (default 50 meters) or timeout
 * @param {Object} options - Configuration options
 * @param {number} options.targetAccuracy - Desired accuracy in meters (default: 50)
 * @param {number} options.timeout - Max time to wait in ms (default: 30000)
 * @param {function} options.onProgress - Callback for accuracy updates
 */
export function getHighAccuracyPosition(options = {}) {
  const {
    targetAccuracy = 50, // 50 meters target accuracy
    timeout = 30000,     // 30 seconds max wait
    onProgress = null,   // Callback: (accuracy, coords) => void
  } = options;

  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocation is not supported by your browser."));
  }

  return new Promise((resolve, reject) => {
    let bestPosition = null;
    let bestAccuracy = Infinity;
    let watchId = null;
    let timeoutId = null;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleSuccess = (position) => {
      const accuracy = position.coords.accuracy;
      
      // Update progress callback
      if (onProgress) {
        onProgress(accuracy, position.coords);
      }

      // Track best position
      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;
      }

      // If we've achieved target accuracy, resolve immediately
      if (accuracy <= targetAccuracy) {
        cleanup();
        resolve(position);
      }
    };

    const handleError = (error) => {
      cleanup();
      
      // If we have any position, return the best one
      if (bestPosition) {
        resolve(bestPosition);
        return;
      }

      if (error.code === error.PERMISSION_DENIED) {
        reject(new Error("Location permission denied. Please allow GPS access and try again."));
        return;
      }
      if (error.code === error.POSITION_UNAVAILABLE) {
        reject(new Error("Location unavailable right now. Please check GPS/network and retry."));
        return;
      }
      reject(new Error("Failed to fetch your current location."));
    };

    // Start watching position
    watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0,
      }
    );

    // Set timeout - return best position we got if not accurate enough
    timeoutId = setTimeout(() => {
      cleanup();
      if (bestPosition) {
        resolve(bestPosition);
      } else {
        reject(new Error("Location request timed out. Please retry."));
      }
    }, timeout);
  });
}

/**
 * Validate if location is within India
 * @param {Object} locationData - Location data with latitude, longitude, and state
 * @returns {Object} - { isValid: boolean, message: string }
 */
export function isLocationInMaharashtra(locationData) {
  if (!locationData) {
    return { isValid: false, message: "Location data is required." };
  }

  // Get coordinates for India boundary check
  const { latitude, longitude } = locationData;
  
  // India approximate bounds: Lat 8°N to 37°N, Lon 68°E to 97°E
  if (latitude && longitude) {
    const isWithinIndia =
      latitude >= 8 &&
      latitude <= 37 &&
      longitude >= 68 &&
      longitude <= 97;

    if (isWithinIndia) {
      return { isValid: true, message: "Location verified in India." };
    } else {
      return {
        isValid: false,
        message: "Your location is outside India. Complaints can only be filed from within India.",
      };
    }
  }

  // Fallback: Check state field from reverse geocoding
  if (locationData.state) {
    const state = locationData.state.toLowerCase();
    const indianStates = [
      "maharashtra", "karnataka", "tamil nadu", "telangana", "andhra pradesh",
      "uttar pradesh", "madhya pradesh", "rajasthan", "punjab", "haryana",
      "kerala", "west bengal", "assam", "bihar", "jharkhand", "chhattisgarh",
      "odisha", "gujarat", "himachal pradesh", "uttarakhand", "jammu & kashmir",
      "ladakh", "delhi", "noida", "chandigarh", "puducherry", "goa",
      "tripura", "manipur", "mizoram", "nagaland", "arunachal pradesh",
      "meghalaya", "sikkim"
    ];
    
    const isIndianState = indianStates.some(s => state.includes(s));
    if (isIndianState) {
      return { isValid: true, message: "Location verified in India." };
    } else {
      return {
        isValid: false,
        message: "Your location appears to be outside India. Complaints can only be filed from within India.",
      };
    }
  }

  return { isValid: false, message: "Unable to verify location. Please ensure location data is available." };
}
