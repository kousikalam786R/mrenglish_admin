/**
 * Utility for typed confirmations
 * In a real app, this would use a proper dialog system
 */

export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

export function confirmDangerAction(
  message: string,
  resourceName: string
): Promise<boolean> {
  const fullMessage = `${message}\n\nType "${resourceName}" to confirm:`;
  const input = window.prompt(fullMessage);
  return Promise.resolve(input === resourceName);
}

