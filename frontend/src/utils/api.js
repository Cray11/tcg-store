export function getPayload(responseOrData) {
  const body = responseOrData?.data ?? responseOrData;
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
}

export function getPagination(responseOrData) {
  const body = responseOrData?.data ?? responseOrData;
  return body?.pagination ?? null;
}

export function getMessage(responseOrData) {
  const body = responseOrData?.data ?? responseOrData;
  return body?.message ?? "";
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const payload = error?.response?.data;
  const errors = payload?.errors;

  if (typeof errors === "string") {
    return errors;
  }

  if (errors && typeof errors === "object") {
    const firstValue = Object.values(errors)[0];
    if (Array.isArray(firstValue)) {
      return firstValue[0];
    }
    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return payload?.message || fallback;
}

export function buildPagination(current, total) {
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}
