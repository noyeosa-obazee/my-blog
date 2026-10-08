export const readApiResponse = async (
  response,
  fallbackMessage = "The request could not be completed.",
) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

export const getErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  if (error instanceof TypeError) {
    return "Unable to connect. Check your connection and try again.";
  }

  return error?.message || fallbackMessage;
};
