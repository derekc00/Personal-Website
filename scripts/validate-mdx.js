// scripts/validate-mdx.js
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const glob = require("glob");

const REQUIRED_FIELDS = ["title", "date", "tags"];

function validateMdxFiles() {
  const mdxFiles = glob.sync("content/**/*.mdx");
  let hasErrors = false;

  mdxFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const { data } = matter(content);
    const errors = [];

    REQUIRED_FIELDS.forEach((field) => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (errors.length > 0) {
      console.error(`\nValidation errors in ${file}:`);
      errors.forEach((err) => console.error(`- ${err}`));
      hasErrors = true;
    }
  });

  if (hasErrors) {
    process.exit(1); // Fail the build
  } else {
    console.log("All MDX files validated successfully");
  }
}

validateMdxFiles();
