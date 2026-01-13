import { load } from "cheerio";

export function extractContentFromH1(
  htmlContent: string,
  startH1Id: string
): string {
  const $ = load(`<body>${htmlContent}</body>`);
  let capture = false;
  let content = "";

  $("body > *").each(function () {
    const element = $(this);

    if (element.is("h1")) {
      if (element.attr("id") === startH1Id) {
        capture = true;
        content += $.html(this); // Include the <h1> tag itself
      } else if (capture) {
        // Stop capturing when the next <h1> is found
        capture = false;
        return false; // Break out of the loop
      }
    } else if (capture) {
      content += $.html(this);
    }
  });

  return content.trim(); // Trim any extraneous whitespace
}
