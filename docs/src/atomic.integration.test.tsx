import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { Button } from "./ds/Button";

describe("docs atomic CSS", () => {
  it("renders every instance with the complete atomic class set", () => {
    const html = renderToStaticMarkup(
      <main>
        <Button>First</Button>
        <Button>Second</Button>
      </main>,
    );
    const classes = [...html.matchAll(/<button class="([^"]+)"/g)].map((match) =>
      match[1]!.split(" ").filter((className) => className.startsWith("s-")),
    );

    expect(classes).toHaveLength(2);
    expect(classes[0]!.length).toBeGreaterThan(0);
    expect(classes[1]).toEqual(classes[0]);
  });
});
