// Accept the app's plain-array endpoints and paginated { data, pagination } endpoints.
export function listPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
