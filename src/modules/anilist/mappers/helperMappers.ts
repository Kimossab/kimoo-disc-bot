import { Date, Trailer } from "../types/graphql";

export const cleanUpDescription = (description: string): string => {
  return description
    .replace(/<br>/g, "")
    .replace(/<i>/g, "*")
    .replace(/<\/i>/g, "*");
};

export const dateToString = (date: Date): string => {
  if (!date.year) {
    return "";
  }
  if (!date.month) {
    return `${date.year}`;
  }
  if (!date.day) {
    return `${date.year}-${date.month}`;
  }
  return `${date.year}-${date.month}-${date.day}`;
};

export const formatReleasingDate = (start: Date, end: Date): string | null => {
  if (!start.year) {
    return null;
  }

  if (!end.year) {
    return dateToString(start);
  }

  return `${dateToString(start)} - ${dateToString(end)}`;
};

export const formatTrailerLink = (trailer: Trailer): string => {
  if (trailer.site === "youtube") {
    return `https://youtu.be/${trailer.id}`;
  }
  return `${trailer.site} - ${trailer.id}`;
};
