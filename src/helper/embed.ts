
import { limitString } from "./common";
import { RichEmbedField } from "@/discord/rest/types.gen";

export const createEmbedFieldList = (
  title: string,
  data: string[],
  inline = false
): RichEmbedField[] => {
  const fields: RichEmbedField[] = [];
  let fieldValue = "";

  for (const line of data) {
    if (fieldValue.length + line.length + 1 > 1024) {
      fields.push({
        name: title,
        value: fieldValue,
        inline
      });
      fieldValue = "";
    }
    fieldValue += `${line}\n`;
  }

  fields.push({
    name: title,
    value: fieldValue,
    inline: false
  });

  return fields;
};

export const createEmbedField = (
  title: string,
  data: string,
  inline = false
): RichEmbedField => ({
  name: limitString(title, 256),
  value: limitString(data, 1024),
  inline
});

export const createDescription = (description: string): string => {
  return limitString(description, 4096);
};

export const createTitle = (title: string): string => {
  return limitString(title, 256);
};

export const createAuthorName = (name: string): string => {
  return limitString(name, 256);
};

export const createFooter = (footer: string): string => {
  return limitString(footer, 2048);
};
