/**
 * Device Identifier Management
 * 设备标识符管理工具（前端）
 */

const DEVICE_ID_KEY = 'navihive_device_id';
const DEVICE_ID_PREFIX = 'guest_';

/**
 * Generate a new device identifier
 * 生成新的设备标识符
 */
export function generateDeviceIdentifier(): string {
  return `${DEVICE_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Get device identifier from localStorage
 * 从 localStorage 获取设备标识符
 */
export function getDeviceIdentifier(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId || !isValidDeviceIdentifier(deviceId)) {
    deviceId = generateDeviceIdentifier();
    setDeviceIdentifier(deviceId);
  }

  return deviceId;
}

/**
 * Save device identifier to localStorage
 * 保存设备标识符到 localStorage
 */
export function setDeviceIdentifier(deviceId: string): void {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

/**
 * Clear device identifier from localStorage
 * 清除 localStorage 中的设备标识符
 */
export function clearDeviceIdentifier(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
}

/**
 * Validate device identifier format
 * 验证设备标识符格式
 */
export function isValidDeviceIdentifier(deviceId: string): boolean {
  if (!deviceId || typeof deviceId !== 'string') {
    return false;
  }

  // Must start with 'guest_' and be followed by a UUID
  if (!deviceId.startsWith(DEVICE_ID_PREFIX)) {
    return false;
  }

  const uuid = deviceId.substring(DEVICE_ID_PREFIX.length);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(uuid);
}
