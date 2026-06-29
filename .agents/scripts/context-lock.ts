import fs from "fs";
import path from "path";

const action = process.argv[2]; // 'acquire' or 'release'
const lockDir = path.join(process.cwd(), ".git", "locks");
const lockFile = path.join(lockDir, "tophat.lock");

// Ensure the locks directory exists cross-platform (replaces 'mkdir -p')
if (!fs.existsSync(lockDir)) {
  fs.mkdirSync(lockDir, { recursive: true });
}

if (action === "acquire") {
  try {
    // 'wx' flag throws an error if the file already exists. This is an atomic operation.
    fs.writeFileSync(lockFile, process.pid.toString(), { flag: "wx" });
    console.log(
      JSON.stringify({
        decision: "allow",
        reason: "File system lock verified",
      }),
    );
  } catch (err: any) {
    if (err.code === "EEXIST") {
      console.log(
        JSON.stringify({
          decision: "deny",
          reason: "File system locked by another agent",
        }),
      );
    } else {
      // Fail-open for other FS errors to prevent permanent blocking
      console.log(
        JSON.stringify({
          decision: "allow",
          reason: "Lock check bypassed due to FS error",
        }),
      );
    }
  }
} else if (action === "release") {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }
    console.log(JSON.stringify({}));
  } catch (err) {
    // Fail silently on release error
    console.log(JSON.stringify({}));
  }
} else {
  console.log(JSON.stringify({ decision: "allow" }));
}
