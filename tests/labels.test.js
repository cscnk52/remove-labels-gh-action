import * as core from "@actions/core";
import { getLabelsToRemove } from "./../index";
import { describe, test, expect, vi } from "vitest";

const labelsInputsCases = [
  ["duplicate", ["duplicate"]],
  ["duplicate\nneeds review", ["duplicate", "needs review"]],

  // trim
  ["bar \n foo   ", ["bar", "foo"]],
  ["   bar\n     foo", ["bar", "foo"]],

  // ignore empty lines
  ["   \n\n     bar", ["bar"]],
  ["\n \n     \n  \n\n \n", []],

  // sort
  ["foo\nbar", ["bar", "foo"]],
  ["c\nb\n\r\ta", ["a", "b", "c"]],
];

vi.mock("@actions/core", { spy: true });

describe("Get labels to remove", () => {
  test.each(labelsInputsCases)("%s ⇢ %p", (input, output) => {
    vi.spyOn(core, "getInput").mockReturnValue(input);

    expect(getLabelsToRemove()).toEqual(output);

    vi.restoreAllMocks();
  });
});
