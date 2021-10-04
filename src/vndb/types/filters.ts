import { lowercase_char, operators } from "./vndb";

export type id = { field: "id" } & (
  | {
      operator:
        | operators.equal
        | operators.not_equal
        | operators.greater
        | operators.greater_or_equal
        | operators.less
        | operators.less_or_equal;
      value: number;
    }
  | {
      operator: operators.equal | operators.not_equal;
      value: number[];
    }
);

export type title = {
  field: "title";
  operator:
    | operators.equal
    | operators.not_equal
    | operators.like;
  value: string;
};

export type original = {
  field: "original";
} & (
  | {
      operator: operators.equal | operators.not_equal;
      value: null;
    }
  | {
      operator:
        | operators.equal
        | operators.not_equal
        | operators.like;
      value: string;
    }
);

export type first_char = {
  field: "firstchar";
  operator: operators.equal | operators.not_equal;
  value: null | lowercase_char;
};

export type released = {
  field: "released";
} & (
  | {
      operator: operators.equal | operators.not_equal;
      value: null;
    }
  | {
      operator:
        | operators.equal
        | operators.not_equal
        | operators.greater
        | operators.greater_or_equal
        | operators.less
        | operators.less_or_equal;
      value: string;
    }
);

export type platforms = {
  field: "platforms";
  operator: operators.equal | operators.not_equal;
  value: null | string | string[];
};

export type languages = {
  field: "languages";
  operator: operators.equal | operators.not_equal;
  value: null | string | string[];
};

export type orig_lang = {
  field: "orig_lang";
  operator: operators.equal | operators.not_equal;
  value: string | string[];
};

export type search = {
  field: "search";
  operator: operators.like;
  value: string;
};

export type tags = {
  field: "tags";
  operator: operators.equal | operators.not_equal;
  value: number | number[];
};
