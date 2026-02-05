// utils/checkOnboarding.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://safe-school-ride.duckdns.org';

/**
 * Check driver onboarding status
 * First checks local storage cache, then verifies with API
 * Returns onboarding completion status and auth requirements
 * 
 * @param forceRefresh - If true, skip cache and fetch directly from API (used on login)
 */
export const checkDriverOnboarding = async (forceRefresh = false) => {
  try {
    // ✅ OPTIMIZED: Get token (check both possible key names for compatibility)
    let token = await AsyncStorage.getItem('token');
    if (!token) {
      token = await AsyncStorage.getItem('userToken');
    }

    if (!token) {
      console.log('[ONBOARDING] No token found - user needs authentication');
      return { completed: false, needsAuth: true };
    }

    // ✅ NEW: Skip cache if forceRefresh is true (used on login to get fresh data)
    if (!forceRefresh) {
      // ✅ OPTIMIZED: Try to get cached onboarding status first (faster)
      const cachedOnboarding = await AsyncStorage.getItem('onboardingCompleted');
      if (cachedOnboarding !== null) {
        const completed = JSON.parse(cachedOnboarding);
        const role = await AsyncStorage.getItem('role');
        console.log('[ONBOARDING] Using cached status:', completed);
        return {
          completed: completed || false,
          isDriver: role === 'driver',
          needsAuth: false
        };
      }
    } else {
      console.log('[ONBOARDING] Force refresh enabled - skipping cache, fetching from API');
    }

    console.log('[ONBOARDING] No cached status or force refresh - fetching from API...');

    // Fetch current profile from API to verify onboarding status
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Check for authorization errors
    if (response.status === 401) {
      console.warn('[ONBOARDING] Unauthorized - token expired or invalid');
      // Clear stored auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('onboardingCompleted');
      return { completed: false, needsAuth: true };
    }

    // Handle other non-OK responses
    if (!response.ok) {
      console.warn('[ONBOARDING] Profile fetch failed:', response.status);
      // Return false but don't require re-auth (server issue, not auth issue)
      return { completed: false, needsAuth: false };
    }

    const data = await response.json();

    if (data.user) {
      const onboardingStatus = data.user.onboardingCompleted || false;
      const userRole = data.user.role;

      console.log('[ONBOARDING] API response - onboardingCompleted:', onboardingStatus);
      console.log('[ONBOARDING] API response - role:', userRole);

      // ✅ IMPROVED: Update cached onboarding status with fresh data
      await AsyncStorage.setItem(
        'onboardingCompleted',
        JSON.stringify(onboardingStatus)
      );

      // ✅ IMPROVED: Also update role cache if it changed
      if (userRole) {
        await AsyncStorage.setItem('role', userRole);
      }

      return {
        completed: onboardingStatus,
        isDriver: userRole === 'driver',
        needsAuth: false,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: userRole
        }
      };
    }

    console.warn('[ONBOARDING] Invalid response structure from API');
    return { completed: false, needsAuth: false };

  } catch (error) {
    console.error('[ONBOARDING] Error checking onboarding:', error);
    // On network error, try to use cached value as fallback
    try {
      const cachedOnboarding = await AsyncStorage.getItem('onboardingCompleted');
      if (cachedOnboarding !== null) {
        const completed = JSON.parse(cachedOnboarding);
        console.log('[ONBOARDING] Using cached status due to error:', completed);
        return {
          completed: completed || false,
          isDriver: true,
          needsAuth: false
        };
      }
    } catch (cacheError) {
      console.error('[ONBOARDING] Error reading cache:', cacheError);
    }

    return { completed: false, needsAuth: false };
  }
};

/**
 * Clear onboarding status from cache (used on logout)
 */
export const clearOnboardingCache = async () => {
  try {
    await AsyncStorage.removeItem('onboardingCompleted');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userToken');
    console.log('[ONBOARDING] Cache cleared');
  } catch (error) {
    console.error('[ONBOARDING] Error clearing cache:', error);
  }
};

/**
 * Force refresh onboarding status from API (skip cache)
 * Used when onboarding status might have changed
 */
export const refreshOnboardingStatus = async () => {
  try {
    console.log('[ONBOARDING] Manual refresh requested - fetching fresh status from API');
    // Call checkDriverOnboarding with forceRefresh=true
    return await checkDriverOnboarding(true);
  } catch (error) {
    console.error('[ONBOARDING] Error refreshing status:', error);
    return { completed: false, needsAuth: false };
  }
};
