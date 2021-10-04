import axios from "axios";

export const requestFandom = async (
  fandom: string,
  query: string
): Promise<string[] | null> => {
  const r = await axios.get<string[][]>(
    `https://${fandom}.fandom.com/api.php?action=opensearch&search=${encodeURIComponent(
      query
    )}`
  );

  if (r.data.length > 1) {
    return r.data[r.data.length - 1];
  }
  return null;
};
