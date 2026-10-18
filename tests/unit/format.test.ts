import { describe, expect, it } from "vitest";
import { formatNota } from "@/lib/format";

describe("formatNota", () => {
  it("usa uma casa decimal com vírgula", () => {
    expect(formatNota(7.1)).toBe("7,1");
    expect(formatNota(0)).toBe("0,0");
    expect(formatNota(10)).toBe("10,0");
  });

  it("arredonda para uma casa", () => {
    expect(formatNota(3.44)).toBe("3,4");
    expect(formatNota(6.95)).toBe("7,0");
  });
});
